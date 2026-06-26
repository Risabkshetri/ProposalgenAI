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
  scope_submodule_1_title: string;
  scope_submodule_2_title: string;
  scope_module_2_title: string;
  scope_module_3_title: string;
  total_amount: string;
  timeline_title: string;
  timeline_summary: string;
}

export type StepIndicator = 1 | 2 | 3 | 4;

export interface WizardProps {
  step: number;
  formData: ProposalData | null;
  handleInputChange: (field: keyof ProposalData, value: string | string[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  downloadPDF: () => void;
  shareWhatsApp: () => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}
