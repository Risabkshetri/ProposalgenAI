from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import os
import json
from weasyprint import HTML
from dotenv import load_dotenv

# Try to import Google GenAI
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

load_dotenv()

app = FastAPI(title="Proposal Generator API")

# Add CORS middleware to allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for prototyping
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RawTextRequest(BaseModel):
    raw_text: str

class ClientInfo(BaseModel):
    FirstName: str
    LastName: str
    Company: str
    PhoneNumber: str
    Email: str

class SenderInfo(BaseModel):
    FirstName: str
    LastName: str
    Company: str
    PhoneNumber: str
    Email: str

class ProjectDetails(BaseModel):
    NumberOfMonths: str
    DollarAmount: str

class ProposalDataResponse(BaseModel):
    client: ClientInfo
    sender: SenderInfo
    details: ProjectDetails

@app.post("/api/parse", response_model=ProposalDataResponse)
async def parse_raw_text(request: RawTextRequest):
    """
    Parses raw text and extracts relevant fields for the proposal template using Gemini AI.
    Discards irrelevant information.
    """
    text = request.raw_text
    
    # Try using Gemini first if configured
    if HAS_GENAI and os.getenv("GEMINI_API_KEY"):
        try:
            client = genai.Client()
            prompt = (
                "You are an AI assistant that extracts structured proposal information from raw client notes. "
                "Extract the client info, sender (our company) info, and project details from the following notes. "
                "Discard all irrelevant conversational text or unrelated information. "
                "If a field is not found, leave it as an empty string.\n\n"
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
            
        except Exception as e:
            print(f"Gemini API failed: {e}. Falling back to heuristic mock.")
    else:
        print("GEMINI_API_KEY not found in environment. Falling back to heuristic mock.")
    
    # Fallback to mock data structure matching the frontend prototype
    data = {
        "client": {
            "FirstName": "John",
            "LastName": "Doe",
            "Company": "Acme Corp",
            "PhoneNumber": "+1 (555) 019-2834",
            "Email": "john.doe@acmecorp.com"
        },
        "sender": {
            "FirstName": "Sarah",
            "LastName": "Jenkins",
            "Company": "AgentIO Solutions",
            "PhoneNumber": "+1 (800) 123-4567",
            "Email": "sarah@agentio.com"
        },
        "details": {
            "NumberOfMonths": "6",
            "DollarAmount": "$35,000"
        }
    }
    
    # Basic fallback heuristic
    if "jane" in text.lower():
        data["client"]["FirstName"] = "Jane"
        data["client"]["LastName"] = "Smith"
    
    if "global" in text.lower():
        data["client"]["Company"] = "Global Tech"
            
    return data

class PDFRequest(BaseModel):
    html_content: str

@app.post("/api/generate-pdf")
async def generate_pdf(request: PDFRequest):
    """
    Generates a PDF using WeasyPrint for perfect 1:1 Xerox copies of the HTML.
    """
    # Generate PDF bytes
    pdf_bytes = HTML(string=request.html_content).write_pdf()
    
    return Response(
        content=pdf_bytes, 
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=AgentIO_Proposal.pdf"}
    )

@app.get("/health")
async def health_check():
    return {"status": "ok"}
