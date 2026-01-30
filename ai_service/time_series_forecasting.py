import os
import joblib
import pandas as pd
from datetime import timedelta

try:
    # Prophet has different package names depending on install
    from prophet import Prophet
    HAS_PROPHET = True
except Exception:
    HAS_PROPHET = False


class AccidentForecaster:
    """Simple wrapper around Prophet (if available) with a fallback.

    Methods expect a pandas DataFrame with columns `ds` (datetime) and `y` (numeric).
    """

    def __init__(self, model_path=None):
        self.model_path = model_path or os.path.join(os.getcwd(), 'ai_models', 'forecaster.joblib')
        self.model = None

    def fit(self, df: pd.DataFrame):
        if HAS_PROPHET:
            m = Prophet()
            m.fit(df)
            self.model = m
        else:
            # Fallback: store last-window average as a trivial model
            self.model = {'mean': float(df['y'].tail(30).mean())}

    def predict(self, periods=7, freq='D'):
        if self.model is None:
            raise RuntimeError('Model is not fitted')

        if HAS_PROPHET and hasattr(self.model, 'predict'):
            future = self.model.make_future_dataframe(periods=periods, freq=freq)
            forecast = self.model.predict(future)
            return forecast[['ds', 'yhat']].tail(periods)
        else:
            # naive constant forecast
            from datetime import datetime
            start = datetime.utcnow()
            rows = []
            for i in range(periods):
                rows.append({'ds': start + timedelta(days=i + 1), 'yhat': self.model['mean']})
            return pd.DataFrame(rows)

    def save(self, path=None):
        path = path or self.model_path
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self.model, path)

    def load(self, path=None):
        path = path or self.model_path
        if os.path.exists(path):
            self.model = joblib.load(path)
            return True
        return False


def example_usage():
    # Minimal example (not run automatically)
    df = pd.DataFrame({'ds': pd.date_range(end=pd.Timestamp.now(), periods=100), 'y': range(100)})
    f = AccidentForecaster()
    f.fit(df)
    print(f.predict(7))


if __name__ == '__main__':
    example_usage()
