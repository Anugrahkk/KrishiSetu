"""
KrishiSetu - Crop Doctor Advice & Knowledge Base
Owned by Member 2 (Backend & Computer Vision)
"""

DEFAULT_DISCLAIMER = (
    "Preliminary heuristic screening based on leaf color and spot geometry. "
    "Confirm with your local Krishibhavan Agricultural Officer before applying chemical treatments."
)

DISEASE_ADVICE_MAP = {
    "healthy": {
        "title": "Healthy Crop Foliage",
        "severity": "Mild",
        "advice": [
            "Leaf demonstrates healthy pigmentation and normal chlorophyll distribution.",
            "Continue regular watering schedule at the root level.",
            "Maintain balanced organic compost application every 3-4 weeks.",
            "Periodically check lower foliage for early signs of pest colonization."
        ]
    },
    "leaf_spot": {
        "title": "Leaf Spot / Blight-like Condition",
        "severity": "Moderate",
        "advice": [
            "Prune and safely discard heavily spotted foliage to prevent fungal spore dispersion.",
            "Avoid overhead sprinkler watering; irrigate directly around the base in the early morning.",
            "Spray organic neem cake extract or Pseudomonas fluorescens solution (20g/litre).",
            "Consult Krishibhavan before considering copper-based certified fungicides."
        ]
    },
    "powdery": {
        "title": "Powdery Mildew-like Stress",
        "severity": "Moderate",
        "advice": [
            "Prune dense foliage to improve airflow and direct sunlight penetration.",
            "Avoid excessive synthetic nitrogen fertilizers which stimulate tender susceptible leaves.",
            "Spray diluted sour buttermilk or neem oil emulsion (5 ml/litre with mild soap) during evening hours.",
            "Show sample to your Krishibhavan for approved organic bio-fungicide options."
        ]
    },
    "yellowing": {
        "title": "Yellowing / Chlorosis / Nutrient Stress",
        "severity": "Moderate",
        "advice": [
            "Inspect soil drainage immediately to verify no root-zone waterlogging or standing water.",
            "Apply enriched vermicompost and balanced micronutrient mix (zinc, iron, magnesium).",
            "Test soil pH at your local Krishibhavan laboratory.",
            "If yellowing presents in a mosaic or curled pattern, isolate the plant to prevent viral spread."
        ]
    },
    "mixed": {
        "title": "Mixed Foliage Stress",
        "severity": "Severe",
        "advice": [
            "Inspect underside of leaves for sap-sucking pests such as mites, aphids, or whiteflies.",
            "Prune severely damaged foliage and aerate the surrounding soil.",
            "Bring a sealed sample leaf to your nearest Krishibhavan or veterinary clinic for diagnostic confirmation."
        ]
    },
    "unclear": {
        "title": "Indeterminate Foliage View",
        "severity": "Mild",
        "advice": [
            "Retake photo in bright natural daylight.",
            "Place a single leaf flat on a clean white sheet of paper or neutral background.",
            "Hold camera steady 15–20 cm away to prevent optical motion blur."
        ]
    }
}

def get_advice_for_condition(condition_code):
    """Returns title, severity, advice list, and disclaimer for a given disease code."""
    data = DISEASE_ADVICE_MAP.get(condition_code, DISEASE_ADVICE_MAP["unclear"])
    return {
        "title": data["title"],
        "severity": data["severity"],
        "advice": data["advice"],
        "disclaimer": DEFAULT_DISCLAIMER
    }

