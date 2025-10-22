import os
import googlemaps

# Initialize Google Maps client (ensure GOOGLE_MAPS_API_KEY is set)
gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))

def find_nearby_clinics(location_data, keyword="clinic"):
    """
    Finds nearby clinics or hospitals using Google Maps.
    Accepts either a text address or a dict with 'latitude' and 'longitude'.
    """
    if not gmaps:
        return "⚠️ Google Maps API not configured properly."

    try:
        # Use coordinates if available, else geocode text
        if isinstance(location_data, dict) and "latitude" in location_data and "longitude" in location_data:
            lat, lng = location_data["latitude"], location_data["longitude"]
        else:
            geocode = gmaps.geocode(location_data)
            if not geocode:
                return "❌ Sorry, I couldn’t find that location."
            lat = geocode[0]["geometry"]["location"]["lat"]
            lng = geocode[0]["geometry"]["location"]["lng"]

        # Search nearby places
        places = gmaps.places_nearby(
            location=(lat, lng),
            radius=5000,
            keyword=keyword,
            type="hospital"
        )

        results = places.get("results", [])
        if not results:
            return "😕 No verified clinics found within 5 km."

        # Format results for WhatsApp
        reply_lines = ["🏥 *Nearby Clinics:*"]
        for place in results[:5]:
            name = place.get("name", "Unknown Clinic")
            address = place.get("vicinity", "No address listed")
            maps_url = f"https://www.google.com/maps/search/?api=1&query={place['geometry']['location']['lat']},{place['geometry']['location']['lng']}"
            reply_lines.append(f"\n• *{name}*\n📍 {address}\n🔗 {maps_url}")

        return "\n".join(reply_lines)

    except Exception as e:
        print(f"[ERROR] find_nearby_clinics: {e}")
        return "⚠️ Something went wrong while searching for clinics. Please try again later."
