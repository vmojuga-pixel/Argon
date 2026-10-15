import json
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

class PIIRedactor:
    def __init__(self):
        self.analyzer = AnalyzerEngine()
        self.anonymizer = AnonymizerEngine()

    def redact_text(self, text: str) -> dict:
        # Detect PII
        analyzer_results = self.analyzer.analyze(
            text=text,
            entities=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "CREDIT_CARD"],
            language="en"
        )

        # Replace detected entities with placeholders
        anonymized_result = self.anonymizer.anonymize(
            text=text,
            analyzer_results=analyzer_results,
            operators={
                "PERSON": OperatorConfig("replace", {"new_value": "<NAMA>"}),
                "PHONE_NUMBER": OperatorConfig("replace", {"new_value": "<NO_TELEFON>"}),
                "EMAIL_ADDRESS": OperatorConfig("replace", {"new_value": "<EMAIL>"}),
                "CREDIT_CARD": OperatorConfig("replace", {"new_value": "<KAD_KREDIT>"})
            }
        )

        return {
            "original_text": text,
            "safe_text": anonymized_result.text,
            "detected_entities": [
                {
                    "entity": res.entity_type,
                    "value": text[res.start:res.end],
                    "score": res.score
                }
                for res in analyzer_results
            ]
        }

if __name__ == "__main__":
    redactor = PIIRedactor()
    sensitive = "Nama saya Ahmad bin Ali, email ialah ahmad@test.com."
    result = redactor.redact_text(sensitive)

    print("Safe Text for LLM:")
    print(result["safe_text"])
    print()
    print("Detected Entities:")
    print(json.dumps(result["detected_entities"], indent=2))
