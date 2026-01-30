import os
import googlemaps
from typing import Dict, Any


class GoogleMapsIntegration:
    def __init__(self, api_key: str = None):
        key = api_key or os.environ.get('GOOGLE_MAPS_API_KEY')
        if not key:
            raise RuntimeError('GOOGLE_MAPS_API_KEY is required')
        self.client = googlemaps.Client(key=key)

    def directions(self, origin: Dict[str, float], destination: Dict[str, float], alternatives: bool = True):
        """Get directions from Google Maps.

        origin/destination are dicts with `lat` and `lng`.
        """
        orig = f"{origin['lat']},{origin['lng']}"
        dest = f"{destination['lat']},{destination['lng']}"
        return self.client.directions(orig, dest, alternatives=alternatives)

    def nearby_emergency(self, location: Dict[str, float], radius_meters: int = 5000):
        """Search for nearby emergency services using Places API.

        Returns raw Places results.
        """
        loc = (location['lat'], location['lng'])
        return self.client.places_nearby(location=loc, radius=radius_meters, type='hospital')


if __name__ == '__main__':
    print('Google Maps integration ready (requires API key in env)')
