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
        "For scope modules, break down the features logically into exactly 4 modules. "
        "Each module must have a title and a features list (5-8 specific features per module). "
        "Module 1 should be the main user-facing app/platform with scope_module_1_description as a brief summary. "
        "Module 2, 3, and 4 should cover other components like admin panel, delivery, operations, etc. "
        "CRITICAL: For 'timeline_summary', you MUST extract ONLY the exact time duration (e.g. '8 weeks', '10 weeks', '10-12 weeks'). DO NOT include any other words or sentences. "
        "For 'timeline_phases', extract 3-5 logical phases for the project timeline (e.g. Planning, Backend, Frontend, Testing). "
        "For 'tech_stack', extract 3-5 technologies that will be used (e.g. React, Node.js, AWS, MongoDB) and assign them to logical components. "
        "Discard all irrelevant conversational text. "
        "If a field is not found, leave it as an empty string (or empty list for list fields).\n\n"
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
    Pre-processes HTML to remove external resources that WeasyPrint can't handle.
    """
    import re
    import traceback
    import logging

    logger = logging.getLogger(__name__)

    # 1. Strip ALL external <link> tags (Google Fonts, stylesheets, etc.)
    html_content = re.sub(
        r'<link\b[^>]*href\s*=\s*["\']https?://[^"\']*["\'][^>]*/?>', 
        '', 
        html_content, 
        flags=re.IGNORECASE
    )

    # 2. Strip ALL external <script> tags
    html_content = re.sub(
        r'<script\b[^>]*src\s*=\s*["\']https?://[^"\']*["\'][^>]*>.*?</script>',
        '', 
        html_content, 
        flags=re.IGNORECASE | re.DOTALL
    )

    # 3. Strip any @import url(...) with external URLs inside <style> blocks
    html_content = re.sub(
        r'@import\s+url\(["\']?https?://[^)]*["\']?\)\s*;?',
        '',
        html_content,
        flags=re.IGNORECASE
    )

    # 4. Inject system font fallbacks (no external imports!)
    font_override = """
    <style>
      :root {
        --heading: 'Georgia', 'Times New Roman', serif;
        --body: 'Arial', 'Helvetica Neue', 'Helvetica', sans-serif;
      }
    </style>
    """
    html_content = html_content.replace('</head>', font_override + '</head>', 1)

    try:
        pdf_bytes = HTML(string=html_content, base_url=base_url).write_pdf()
        return pdf_bytes
    except Exception as e:
        logger.error(f"WeasyPrint PDF generation failed: {e}")
        logger.error(traceback.format_exc())
        raise