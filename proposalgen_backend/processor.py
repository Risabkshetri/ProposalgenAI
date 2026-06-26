import os
import json
from weasyprint import HTML
from schemas import ProposalDataResponse

try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

def extract_proposal_data(text: str) -> dict:
    """
    Extracts proposal data using Gemini AI.
    Raises exceptions if the library is missing, API key is not set, or the API call fails.
    """
    if not HAS_GENAI:
        raise RuntimeError("Google GenAI library is not installed.")
        
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in the environment.")
        
    client = genai.Client()
    prompt = (
        "You are an AI assistant that extracts structured proposal information from raw client notes. "
        "Extract all the fields required by the schema, including the project title, descriptions, client and company details, "
        "scope modules, total cost, and timelines. "
        "For 'project_type', pick one of: 'Mobile App', 'Web App', 'Mobile + Web', or 'Custom'. "
        "For 'key_features', extract a list of 5-10 core functionalities as short strings. "
        "For scope modules, break down the features logically into module 1, 2, and 3. "
        "Discard all irrelevant conversational text. "
        "If a field is not found, leave it as an empty string (or empty list for key_features).\n\n"
        f"Notes:\n{text}"
    )
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ProposalDataResponse,
            temperature=0.1,
        ),
    )
    
    return json.loads(response.text)

def create_pdf(html_content: str, base_url: str = None) -> bytes:
    """
    Generates a PDF using WeasyPrint.
    """
    return HTML(string=html_content, base_url=base_url).write_pdf()