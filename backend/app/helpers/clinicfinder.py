# backend/app/helpers/clinicfinder.py
import os
import requests
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load env (preferably your app/__init__.py loads .env once; this is fine for now)
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")


def _clean_query(q: str) -> str:
    return (q or "").strip()


def _google_geocode(location_query: str):
    """
    Returns (lat, lng, formatted_address) or (None, None, None)
    """
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": location_query, "key": GOOGLE_API_KEY}

    r = requests.get(url, params=params, timeout=10)
    data = r.json()

    if data.get("status") != "OK" or not data.get("results"):
        return None, None, None

    best = data["results"][0]
    loc = best["geometry"]["location"]
    return loc.get("lat"), loc.get("lng"), best.get("formatted_address")


def _google_nearby_clinics(lat: float, lng: float, radius_m: int = 5000):
    """
    Uses Places Nearby Search for more accurate results than textsearch.
    Returns list of formatted strings.
    """
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

    # Note: "clinic" is not always a supported "type" everywhere.
    # Safer approach: type="hospital" + keyword="clinic" (or keyword="gynecologist", etc).
    params = {
        "location": f"{lat},{lng}",
        "radius": radius_m,
        "type": "hospital",
        "keyword": "clinic",
        "key": GOOGLE_API_KEY,
    }

    r = requests.get(url, params=params, timeout=10)
    data = r.json()

    status = data.get("status")
    if status not in ("OK", "ZERO_RESULTS"):
        # Useful statuses: REQUEST_DENIED, OVER_QUERY_LIMIT, INVALID_REQUEST
        raise RuntimeError(f"Google Places error: {status} - {data.get('error_message')}")

    clinics = []
    for place in data.get("results", []):
        name = place.get("name", "Unknown Clinic")
        vicinity = place.get("vicinity") or place.get("formatted_address") or "Address not available"
        place_id = place.get("place_id")

        # Best maps link (place_id-based if available)
        if place_id:
            maps_url = f"https://www.google.com/maps/search/?api=1&query_place_id={place_id}"
        else:
            maps_url = f"https://www.google.com/maps/search/?api=1&query={quote_plus(name + ' ' + vicinity)}"

        rating = place.get("rating")
        rating_line = f"⭐ {rating}\n" if rating is not None else ""

        clinics.append(f"🏥 {name}\n{rating_line}📍 {vicinity}\n🗺️ {maps_url}")

    return clinics


def _osm_fallback(location_query: str):
    """
    Your existing OSM flow, kept as a fallback.
    """
    clinics = []
    geocode_url = "https://nominatim.openstreetmap.org/search"
    headers = {"User-Agent": "SheCareBot/1.0 (contact: support@shecare.ai)"}
    geocode_params = {"q": location_query, "format": "json", "limit": 1}

    geo_response = requests.get(geocode_url, params=geocode_params, headers=headers, timeout=10)
    try:
        geo_data = geo_response.json()
    except ValueError:
        geo_data = []

    if not geo_data:
        return []

    lat = geo_data[0]["lat"]
    lon = geo_data[0]["lon"]

    overpass_url = "https://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json];
    (
      node["amenity"="clinic"](around:5000,{lat},{lon});
      node["amenity"="hospital"](around:5000,{lat},{lon});
    );
    out;
    """

    overpass_response = requests.get(
        overpass_url,
        params={"data": overpass_query},
        headers=headers,
        timeout=15
    )

    try:
        results = overpass_response.json()
    except ValueError:
        results = {"elements": []}

    for element in results.get("elements", []):
        name = element.get("tags", {}).get("name", "Unnamed Clinic")
        address = element.get("tags", {}).get("addr:full") or element.get("tags", {}).get("addr:street", "")
        clinics.append(f"🏥 {name}\n📍 {address}")

    return clinics


def find_nearby_clinics(location_query: str):
    """
    Google-first clinic search:
    1) Geocode the user's location text
    2) Places Nearby Search around that point
    3) Optional fallback to OSM if Google fails/unavailable
    """
    try:
        q = _clean_query(location_query)
        print(f"🔎 Searching for clinics near: {q}")

        if not q or len(q) < 2:
            return ["⚠️ Please provide a valid location name."]

        clinics = []

        # --- Google (recommended primary) ---
        if GOOGLE_API_KEY:
            lat, lng, formatted = _google_geocode(q)
            if lat is not None and lng is not None:
                clinics = _google_nearby_clinics(lat, lng, radius_m=5000)

                # Optional: prefix with the resolved area so user trusts the match
                if clinics and formatted:
                    clinics.insert(0, f"📍 Showing clinics near: {formatted}")

        # --- Fallback to OSM only if Google didn’t return anything ---
        if not clinics:
            try:
                clinics = _osm_fallback(q)
            except Exception as e:
                print("⚠️ OSM fallback failed:", e)

        if not clinics:
            return ["⚕️ Sorry, I couldn’t find any clinics near that location."]

        # If we inserted the "Showing clinics near..." line, allow 1 extra line
        return clinics[:6]

    except Exception as e:
        print("Error in find_nearby_clinics:", e)
        return ["⚠️ An error occurred while searching for clinics."]
