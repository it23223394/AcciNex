"""
EXIF GPS Extractor
Extracts GPS coordinates and metadata from image EXIF data
"""
import piexif
from PIL import Image
import os
from datetime import datetime


class ExifGPSExtractor:
    """Extract GPS and other metadata from images"""
    
    def __init__(self):
        self.supported_formats = ['.jpg', '.jpeg', '.png']
    
    def extract_gps(self, image_path):
        """
        Extract GPS coordinates from image EXIF data
        Returns: {
            'latitude': float,
            'longitude': float,
            'altitude': float or None,
            'timestamp': str,
            'has_gps': bool,
            'verified': bool
        }
        """
        try:
            # Check if file exists
            if not os.path.exists(image_path):
                return {
                    'error': 'File not found',
                    'has_gps': False,
                    'verified': False
                }
            
            # Try to extract EXIF data
            try:
                exif_dict = piexif.load(image_path)
            except:
                # Fallback for images without EXIF
                return {
                    'error': 'No EXIF data found',
                    'has_gps': False,
                    'verified': False
                }
            
            # Extract GPS data
            gps_ifd = exif_dict.get("GPS", {})
            
            if not gps_ifd:
                return {
                    'error': 'No GPS data in EXIF',
                    'has_gps': False,
                    'verified': False
                }
            
            # Extract GPS coordinates
            lat = self._get_decimal_from_dms(
                gps_ifd.get(piexif.GPSIFD.GPSLatitude),
                gps_ifd.get(piexif.GPSIFD.GPSLatitudeRef)
            )
            
            lng = self._get_decimal_from_dms(
                gps_ifd.get(piexif.GPSIFD.GPSLongitude),
                gps_ifd.get(piexif.GPSIFD.GPSLongitudeRef)
            )
            
            # Extract altitude if available
            altitude = None
            if piexif.GPSIFD.GPSAltitude in gps_ifd:
                alt_data = gps_ifd[piexif.GPSIFD.GPSAltitude][0]
                altitude = alt_data[0] / alt_data[1] if alt_data[1] != 0 else None
            
            # Validate coordinates
            is_valid = self._validate_coordinates(lat, lng)
            
            result = {
                'latitude': lat,
                'longitude': lng,
                'altitude': altitude,
                'has_gps': True,
                'verified': is_valid,
                'source': 'EXIF'
            }
            
            # Extract timestamp
            timestamp = self._extract_timestamp(exif_dict)
            if timestamp:
                result['timestamp'] = timestamp
            
            return result
            
        except Exception as e:
            return {
                'error': str(e),
                'has_gps': False,
                'verified': False
            }
    
    def _get_decimal_from_dms(self, dms_data, ref):
        """Convert DMS (Degrees, Minutes, Seconds) to decimal coordinates"""
        if not dms_data:
            return None
        
        try:
            degrees = dms_data[0][0] / dms_data[0][1]
            minutes = dms_data[1][0] / dms_data[1][1] / 60.0
            seconds = dms_data[2][0] / dms_data[2][1] / 3600.0
            
            decimal = degrees + minutes + seconds
            
            # Apply direction (N/S for latitude, E/W for longitude)
            if ref in ['S', 'W']:
                decimal = -decimal
            
            return round(decimal, 8)
        except:
            return None
    
    def _extract_timestamp(self, exif_dict):
        """Extract timestamp from EXIF data"""
        try:
            exif_ifd = exif_dict.get("Exif", {})
            if piexif.ExifIFD.DateTimeOriginal in exif_ifd:
                timestamp_bytes = exif_ifd[piexif.ExifIFD.DateTimeOriginal]
                timestamp_str = timestamp_bytes.decode() if isinstance(timestamp_bytes, bytes) else timestamp_bytes
                return timestamp_str
        except:
            pass
        
        # Fallback to file modification time
        try:
            mod_time = os.path.getmtime(exif_dict)
            return datetime.fromtimestamp(mod_time).isoformat()
        except:
            return None
    
    def _validate_coordinates(self, lat, lng):
        """Validate that coordinates are within valid ranges"""
        if lat is None or lng is None:
            return False
        
        # Check valid ranges
        lat_valid = -90 <= lat <= 90
        lng_valid = -180 <= lng <= 180
        
        return lat_valid and lng_valid
    
    def get_image_info(self, image_path):
        """Get general image information"""
        try:
            if not os.path.exists(image_path):
                return None
            
            img = Image.open(image_path)
            
            return {
                'filename': os.path.basename(image_path),
                'format': img.format,
                'size': img.size,  # (width, height)
                'file_size': os.path.getsize(image_path),  # bytes
                'mode': img.mode
            }
        except Exception as e:
            return {'error': str(e)}


# Legacy function support for backward compatibility
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
    extractor = ExifGPSExtractor()
    gps_data = extractor.extract_gps(path)
    
    if gps_data.get('has_gps') and gps_data.get('verified'):
        return {
            'lat': gps_data['latitude'],
            'lon': gps_data['longitude']
        }
    return None

            lon = _convert_to_degrees(gps_longitude)
            if gps_longitude_ref != 'E':
                lon = -lon

            return {'lat': lat, 'lon': lon}
    except Exception:
        return None


if __name__ == '__main__':
    print('EXIF GPS extractor ready')
