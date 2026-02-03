# ai_service.py
from flask import Flask, request, jsonify
from severity_prediction import SeverityPredictor
from hotspot_detection import HotspotDetector
from alert_engine import AlertEngine
from exif_gps_extractor import ExifGPSExtractor
from time_series_forecasting import AccidentForecaster
from advanced_risk_engine import AdvancedRiskEngine
import pandas as pd
import os
from datetime import datetime, timedelta

app = Flask(__name__)

# Initialize components
severity_predictor = SeverityPredictor()
hotspot_detector = HotspotDetector()
exif_extractor = ExifGPSExtractor()
forecaster = AccidentForecaster()
risk_engine = AdvancedRiskEngine()

@app.route('/predict-severity', methods=['POST'])
def predict_severity():
    data = request.json
    try:
        prediction = severity_predictor.predict(data)
        return jsonify(prediction)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/detect-hotspots', methods=['POST'])
def detect_hotspots():
    data = request.json
    df = pd.DataFrame(data)
    try:
        hotspots = hotspot_detector.detect_hotspots(df)
        return jsonify(hotspots)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/check-alerts', methods=['POST'])
def check_alerts():
    data = request.json
    user_lat = data.get('latitude')
    user_lng = data.get('longitude')
    hotspots = data.get('hotspots')
    weather = data.get('weather')
    
    engine = AlertEngine(hotspots, weather)
    alerts = engine.check_user_location(user_lat, user_lng)
    
    return jsonify({'alerts': alerts})

@app.route('/extract-exif', methods=['POST'])
def extract_exif():
    """Extract GPS and metadata from image EXIF data"""
    try:
        data = request.json
        image_path = data.get('image_path')
        filename = data.get('filename')
        
        if not image_path or not os.path.exists(image_path):
            return jsonify({'error': 'Image file not found'}), 400
        
        # Extract EXIF GPS data
        gps_data = exif_extractor.extract_gps(image_path)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'gps_data': gps_data,
            'message': 'EXIF data extracted successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 400

@app.route('/forecast-accidents', methods=['POST'])
def forecast_accidents():
    """Forecast accident trends for next 7-30 days"""
    try:
        data = request.json
        periods = data.get('periods', 7)
        accidents_data = data.get('accidents', [])
        
        if not accidents_data:
            return jsonify({'error': 'No accident data provided'}), 400
        
        # Convert to DataFrame
        df = pd.DataFrame(accidents_data)
        df['ds'] = pd.to_datetime(df['accident_time'])
        df = df.groupby('ds').size().reset_index(name='y')
        
        # Fit and predict
        forecaster.fit(df)
        forecast = forecaster.predict(periods=min(periods, 30))
        
        return jsonify({
            'success': True,
            'forecast': forecast[['ds', 'yhat']].to_dict('records'),
            'periods': periods,
            'message': f'Forecast generated for next {periods} days'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 400

@app.route('/analyze-patterns', methods=['POST'])
def analyze_patterns():
    """Analyze temporal and spatial patterns in accident data"""
    try:
        data = request.json
        accidents_data = data.get('accidents', [])
        
        if not accidents_data:
            return jsonify({'error': 'No accident data provided'}), 400
        
        df = pd.DataFrame(accidents_data)
        df['accident_time'] = pd.to_datetime(df['accident_time'])
        
        # Temporal patterns
        df['hour'] = df['accident_time'].dt.hour
        df['day_of_week'] = df['accident_time'].dt.dayofweek
        df['month'] = df['accident_time'].dt.month
        
        hourly_pattern = df['hour'].value_counts().sort_index().to_dict()
        daily_pattern = df['day_of_week'].value_counts().sort_index().to_dict()
        monthly_pattern = df['month'].value_counts().sort_index().to_dict()
        
        # Severity patterns
        severity_pattern = df['severity'].value_counts().to_dict() if 'severity' in df.columns else {}
        
        # Location clustering
        if 'latitude' in df.columns and 'longitude' in df.columns:
            from sklearn.cluster import DBSCAN
            import numpy as np
            coords = np.radians(df[['latitude', 'longitude']].values)
            dbscan = DBSCAN(eps=0.01, min_samples=3, metric='haversine')
            df['cluster'] = dbscan.fit_predict(coords)
            cluster_counts = df['cluster'].value_counts().to_dict()
        else:
            cluster_counts = {}
        
        return jsonify({
            'success': True,
            'patterns': {
                'hourly': hourly_pattern,
                'daily': daily_pattern,
                'monthly': monthly_pattern,
                'severity': severity_pattern,
                'location_clusters': cluster_counts,
                'total_accidents': len(df),
                'peak_hour': int(max(hourly_pattern, key=hourly_pattern.get)) if hourly_pattern else None,
                'peak_day': int(max(daily_pattern, key=daily_pattern.get)) if daily_pattern else None
            },
            'message': 'Pattern analysis completed'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 400

@app.route('/predict-risk', methods=['POST'])
def predict_risk():
    """Predict accident risk for specific location and time"""
    try:
        data = request.json
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        weather = data.get('weather_condition', 'clear')
        traffic_level = data.get('traffic_level', 0.5)
        hour = data.get('hour')
        
        if latitude is None or longitude is None:
            return jsonify({'error': 'Latitude and longitude required'}), 400
        
        # Calculate risk components
        historical_rate = data.get('historical_rate', 0.3)
        
        # Weather impact
        weather_severity = 0.0
        if 'rain' in weather.lower():
            weather_severity = 0.6
        elif 'storm' in weather.lower():
            weather_severity = 0.9
        elif 'fog' in weather.lower():
            weather_severity = 0.5
        
        # Night-time multiplier
        if hour and (hour < 6 or hour > 18):
            traffic_level = min(1.0, traffic_level + 0.2)
        
        # Compute composite risk
        risk_inputs = {
            'historical_rate': historical_rate,
            'traffic_level': traffic_level,
            'weather_severity': weather_severity,
            'infrastructure_score': 0.7
        }
        
        risk_result = risk_engine.compute_risk(risk_inputs)
        
        # Determine risk level
        score = risk_result['score']
        if score >= 70:
            risk_level = 'CRITICAL'
        elif score >= 50:
            risk_level = 'HIGH'
        elif score >= 30:
            risk_level = 'MEDIUM'
        else:
            risk_level = 'LOW'
        
        return jsonify({
            'success': True,
            'location': {'latitude': latitude, 'longitude': longitude},
            'risk_score': score,
            'risk_level': risk_level,
            'breakdown': risk_result['breakdown'],
            'recommendations': [
                'Reduce speed in this area' if score > 50 else None,
                'Use caution during rainy conditions' if weather_severity > 0.5 else None,
                'Be extra alert during night hours' if hour and (hour < 6 or hour > 18) else None
            ],
            'message': f'Risk prediction: {risk_level} ({score}/100)'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 400

@app.route('/heatmap-data', methods=['POST'])
def heatmap_data():
    """Generate heatmap data for visualization"""
    try:
        data = request.json
        accidents_data = data.get('accidents', [])
        grid_size = data.get('grid_size', 0.01)  # Grid cell size in degrees
        
        if not accidents_data:
            return jsonify({'error': 'No accident data provided'}), 400
        
        df = pd.DataFrame(accidents_data)
        
        # Create grid cells
        df['lat_bin'] = (df['latitude'] // grid_size * grid_size).astype(float)
        df['lng_bin'] = (df['longitude'] // grid_size * grid_size).astype(float)
        
        # Aggregate by grid cell
        heatmap_cells = df.groupby(['lat_bin', 'lng_bin']).agg({
            'id': 'count',
            'severity': lambda x: (x == 'dangerous').sum()
        }).reset_index()
        
        heatmap_cells.columns = ['latitude', 'longitude', 'incident_count', 'dangerous_count']
        heatmap_cells['intensity'] = (heatmap_cells['incident_count'] / df.shape[0] * 100).round(2)
        heatmap_cells['danger_percentage'] = (heatmap_cells['dangerous_count'] / heatmap_cells['incident_count'] * 100).round(2)
        
        return jsonify({
            'success': True,
            'heatmap_cells': heatmap_cells.to_dict('records'),
            'total_cells': len(heatmap_cells),
            'total_incidents': len(df),
            'message': 'Heatmap data generated'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 400

if __name__ == '__main__':
    # In a real scenario, we would load the model here
    # severity_predictor.load_model()
    app.run(host='0.0.0.0', port=5000)
