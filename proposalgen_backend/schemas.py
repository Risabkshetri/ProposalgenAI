from pydantic import BaseModel
from typing import Optional

class RawTextRequest(BaseModel):
    raw_text: str

class ProposalDataResponse(BaseModel):
    project_title: str
    project_type: str
    key_features: list[str]
    project_description: str
    client_name: str
    client_address: str
    company_name: str
    company_address: str
    date: str
    quotation_no: str
    project_overview: str
    scope_of_work: str
    scope_module_1_title: str
    scope_module_1_description: str
    scope_submodule_1_title: str
    scope_submodule_2_title: str
    scope_module_2_title: str
    scope_module_3_title: str
    total_amount: str
    timeline_title: str
    timeline_summary: str

class PDFRequest(BaseModel):
    html_content: str
    base_url: Optional[str] = None
