from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from schemas import RawTextRequest, ProposalDataResponse, PDFRequest
from processor import extract_proposal_data, create_pdf

load_dotenv()

app = FastAPI(title="Proposal Generator API")

# Add CORS middleware to allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://9f64-2401-4900-be81-d366-11cb-352-46cd-1537.ngrok-free.app",
        "*"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/parse", response_model=ProposalDataResponse)
async def parse_raw_text(request: RawTextRequest):
    """
    Parses raw text and extracts relevant fields for the proposal template.
    """
    try:
        data = extract_proposal_data(request.raw_text)
        return data
    except ValueError as ve:
        raise HTTPException(status_code=500, detail=f"Configuration Error: {str(ve)}")
    except RuntimeError as re:
        raise HTTPException(status_code=500, detail=f"Environment Error: {str(re)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process text: {str(e)}")

@app.post("/api/generate-pdf")
async def generate_pdf(request: PDFRequest):
    """
    Generates a PDF using WeasyPrint for perfect 1:1 copies of the HTML.
    """
    try:
        pdf_bytes = create_pdf(request.html_content, base_url=request.base_url)
        return Response(
            content=pdf_bytes, 
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=AgentIO_Proposal.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Generation failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
