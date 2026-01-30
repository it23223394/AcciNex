from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS


def _get_if_exist(data, key):
    return data.get(key)


def _convert_to_degrees(value):
    d = float(value[0][0]) / float(value[0][1])
    m = float(value[1][0]) / float(value[1][1])
    s = float(value[2][0]) / float(value[2][1])
    return d + (m / 60.0) + (s / 3600.0)


def extract_gps_from_image(path: str):
    """Extract GPS (lat, lon) from image EXIF if available.

    Returns dict {'lat': float, 'lon': float} or None if not present.
    """
    try:
        img = Image.open(path)
        exif = img._getexif()
        if not exif:
            return None

        gps_info = {}
        for (tag, value) in exif.items():
            decoded = TAGS.get(tag, tag)
            if decoded == 'GPSInfo':
                for t in value:
                    sub_decoded = GPSTAGS.get(t, t)
                    gps_info[sub_decoded] = value[t]

        if not gps_info:
            return None

        lat = None
        lon = None

        gps_latitude = _get_if_exist(gps_info, 'GPSLatitude')
        gps_latitude_ref = _get_if_exist(gps_info, 'GPSLatitudeRef')
        gps_longitude = _get_if_exist(gps_info, 'GPSLongitude')
        gps_longitude_ref = _get_if_exist(gps_info, 'GPSLongitudeRef')

        if gps_latitude and gps_latitude_ref and gps_longitude and gps_longitude_ref:
            lat = _convert_to_degrees(gps_latitude)
            if gps_latitude_ref != 'N':
                lat = -lat

            lon = _convert_to_degrees(gps_longitude)
            if gps_longitude_ref != 'E':
                lon = -lon

            return {'lat': lat, 'lon': lon}
    except Exception:
        return None


if __name__ == '__main__':
    print('EXIF GPS extractor ready')
