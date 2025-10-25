import os
import requests
from dotenv import load_dotenv

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

def find_nearby_clinics(location_query):
    """
    Finds nearby clinics using OpenStreetMap (free) 
    and falls back to Google Places API if needed.
    """
    try:
        clinics = []
        print(f"🔎 Searching for clinics near: {location_query}")

        # --- Step 1️⃣ Clean and validate query ---
        if not location_query or len(location_query.strip()) < 2:
            return ["⚠️ Please provide a valid location name."]

        # --- Step 2️⃣ Try OpenStreetMap ---
        try:
            geocode_url = "https://nominatim.openstreetmap.org/search"
            headers = {"User-Agent": "SheCareBot/1.0 (contact: support@shecare.ai)"}
            geocode_params = {
                "q": location_query,
                "format": "json",
                "limit": 1
            }

            geo_response = requests.get(geocode_url, params=geocode_params, headers=headers, timeout=10)

            # ensure it’s valid JSON
            try:
                geo_data = geo_response.json()
            except ValueError:
                print("⚠️ OSM returned non-JSON response:", geo_response.text[:200])
                geo_data = []

            if geo_data:
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
                    print("⚠️ Overpass returned non-JSON:", overpass_response.text[:200])
                    results = {"elements": []}

                for element in results.get("elements", []):
                    name = element["tags"].get("name", "Unnamed Clinic")
                    address = element["tags"].get("addr:full") or element["tags"].get("addr:street", "")
                    clinics.append(f"🏥 {name}\n📍 {address}")

        except requests.RequestException as e:
            print("⚠️ OpenStreetMap request failed:", e)

        # --- Step 3️⃣ Fallback: Google Places ---
        if not clinics and GOOGLE_API_KEY:
            print("🌍 Falling back to Google Places API...")

            google_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
            google_params = {
                "query": f"clinics near {location_query}",
                "key": GOOGLE_API_KEY,
            }

            google_response = requests.get(google_url, params=google_params, timeout=10)
            google_data = google_response.json()

            for place in google_data.get("results", []):
                name = place.get("name", "Unknown Clinic")
                address = place.get("formatted_address", "Address not available")
                maps_url = f"https://www.google.com/maps/search/?api=1&query={name.replace(' ', '+')}"
                clinics.append(f"🏥 {name}\n📍 {address}\n🗺️ {maps_url}")

        # --- Step 4️⃣ Final Output ---
        if not clinics:
            return ["⚕️ Sorry, I couldn’t find any clinics near that location."]

        return clinics[:5]

    except Exception as e:
        print("Error in find_nearby_clinics:", e)
        return ["⚠️ An error occurred while searching for clinics."]
