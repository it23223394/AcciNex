from typing import Dict, Any
import math


class AdvancedRiskEngine:
    """Compute a composite risk score from multiple inputs.

    This module provides deterministic, explainable scoring useful for
    integration and testing. It is not a replace for a trained ML model.
    """

    def __init__(self, weights: Dict[str, float] = None):
        # default weights for components
        self.weights = weights or {
            'historical': 0.35,
            'traffic': 0.25,
            'weather': 0.2,
            'infrastructure': 0.2
        }

    def compute_risk(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Compute risk score (0-100) from inputs.

        Expected keys in inputs: historical_rate (0-1), traffic_level (0-1),
        weather_severity (0-1), infrastructure_score (0-1 where 1 is good).
        Returns score and breakdown.
        """
        historical = float(inputs.get('historical_rate', 0.0))
        traffic = float(inputs.get('traffic_level', 0.0))
        weather = float(inputs.get('weather_severity', 0.0))
        infra = 1.0 - float(inputs.get('infrastructure_score', 1.0))  # invert: lower infra -> higher risk

        weighted = (
            historical * self.weights['historical'] +
            traffic * self.weights['traffic'] +
            weather * self.weights['weather'] +
            infra * self.weights['infrastructure']
        )

        score = max(0.0, min(1.0, weighted)) * 100.0

        breakdown = {
            'historical_component': historical * self.weights['historical'] * 100.0,
            'traffic_component': traffic * self.weights['traffic'] * 100.0,
            'weather_component': weather * self.weights['weather'] * 100.0,
            'infrastructure_component': infra * self.weights['infrastructure'] * 100.0
        }

        return {'score': round(score, 2), 'breakdown': breakdown}

    def should_alert(self, score: float, threshold: float = 75.0) -> bool:
        return score >= threshold


def example():
    engine = AdvancedRiskEngine()
    r = engine.compute_risk({'historical_rate': 0.8, 'traffic_level': 0.7, 'weather_severity': 0.6, 'infrastructure_score': 0.4})
    print(r)


if __name__ == '__main__':
    example()
