from typing import List, Dict
from collections import Counter
import re


class AccidentReportGenerator:
    """Lightweight NLP-style summarizer for accident reports.

    This is intentionally simple and rule-based so it works without heavy NLP
    dependencies. It extracts common keywords, counts frequencies, and produces
    a short structured summary.
    """

    STOPWORDS = {
        'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'by', 'for', 'to', 'of', 'is', 'was', 'were'
    }

    def _tokenize(self, text: str):
        words = re.findall(r"[A-Za-z]+", text.lower())
        return [w for w in words if w not in self.STOPWORDS]

    def summarize_reports(self, reports: List[Dict]) -> Dict:
        """Generate a small summary from a list of report dicts.

        Each report dict may contain keys: `description`, `severity`, `location`, `time`.
        Returns a dictionary with aggregated insights.
        """
        descriptions = [r.get('description', '') for r in reports]
        tokens = []
        for d in descriptions:
            tokens.extend(self._tokenize(d))

        most_common = [w for w, _ in Counter(tokens).most_common(10)]

        severity_counts = Counter([r.get('severity', 'unknown') for r in reports])

        summary = {
            'total_reports': len(reports),
            'common_terms': most_common,
            'severity_counts': dict(severity_counts)
        }

        # simple top report example
        if reports:
            summary['top_report'] = reports[0]

        return summary


def example():
    gen = AccidentReportGenerator()
    reports = [
        {'description': 'Minor collision near junction, two vehicles involved', 'severity': 'minor'},
        {'description': 'Major pileup on highway during rain', 'severity': 'major'}
    ]
    print(gen.summarize_reports(reports))


if __name__ == '__main__':
    example()
