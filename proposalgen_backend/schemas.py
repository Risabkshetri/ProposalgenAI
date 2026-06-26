from pydantic import BaseModel
from typing import Optional

class RawTextRequest(BaseModel):
    raw_text: str

class TimelinePhase(BaseModel):
    phase: str
    duration: str
    description: str

class TechStackItem(BaseModel):
    component: str
    technology: str
    description: str

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
    scope_module_1_features: list[str]
    scope_module_2_title: str
    scope_module_2_features: list[str]
    scope_module_3_title: str
    scope_module_3_features: list[str]
    scope_module_4_title: str
    scope_module_4_features: list[str]
    total_amount: str
    timeline_summary: str
    timeline_phases: list[TimelinePhase]
    tech_stack: list[TechStackItem]

class PDFRequest(BaseModel):
    html_content: str
    base_url: Optional[str] = None
