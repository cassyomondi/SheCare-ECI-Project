import os
import requests
from dotenv import load_dotenv

load_dotenv()

def find_nearby_clinics(location_name):
    opencage_key = os.getenv("OPENCAGE_API_KEY")
    google_key = os.getenv("GOOGLE_MAPS_API_KEY")

    if not opencage_key or not google_key:
        return ["⚠️ Missing API keys. Check your .env configuration."]

    # Step 1: Geocode location with OpenCage
    geo_url = f"https://api.opencagedata.com/geocode/v1/json?q={location_name}&key={opencage_key}"
    geo_data = requests.get(geo_url).json()

    if not geo_data.get("results"):
        return [f"⚠️ I did not find Location: {location_name}. Please try again."]

    lat = geo_data["results"][0]["geometry"]["lat"]
    lng = geo_data["results"][0]["geometry"]["lng"]

    # Step 2: Use the *new* Places API
    places_url = "https://places.googleapis.com/v1/places:searchNearby"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": google_key,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating",
    }

    payload = {
        "includedTypes": ["hospital", "doctor", "pharmacy", "health"],
        "maxResultCount": 5,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": 10000  # 10 km radius
            }
        }
    }

    places_res = requests.post(places_url, headers=headers, json=payload).json()
    print("🗺 Places API Response:", places_res)

    if "places" not in places_res:
        return [f"No clinic found near {location_name}."]

    clinics = []
    for place in places_res["places"]:
        name = place.get("displayName", {}).get("text", "Unnamed Clinic")
        address = place.get("formattedAddress", "Address not found")
        rating = place.get("rating", "N/A")
        clinics.append(f"🏥 {name}\n📍 {address}\n⭐ {rating}")

    return clinics or [f"No Clinics found near {location_name}."]
