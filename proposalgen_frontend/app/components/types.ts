export interface TimelinePhase {
  phase: string;
  duration: string;
  description: string;
}

export interface TechStackItem {
  component: string;
  technology: string;
  description: string;
}

export interface ProposalData {
  project_title: string;
  project_type: string;
  key_features: string[];
  project_description: string;
  client_name: string;
  client_address: string;
  company_name: string;
  company_address: string;
  date: string;
  quotation_no: string;
  project_overview: string;
  scope_of_work: string;
  scope_module_1_title: string;
  scope_module_1_description: string;
  scope_module_1_features: string[];
  scope_module_2_title: string;
  scope_module_2_features: string[];
  scope_module_3_title: string;
  scope_module_3_features: string[];
  scope_module_4_title: string;
  scope_module_4_features: string[];
  total_amount: string;
  timeline_summary: string;
  timeline_phases: TimelinePhase[];
  tech_stack: TechStackItem[];
}

export type StepIndicator = 1 | 2 | 3 | 4;

export interface WizardProps {
  step: number;
  formData: ProposalData | null;
  handleInputChange: (field: keyof ProposalData, value: unknown) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  downloadPDF: () => void;
  shareWhatsApp: () => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}
