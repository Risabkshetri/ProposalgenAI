import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import AIField from './ui/AIField';
import { WizardProps } from './types';

interface EditFormProps extends WizardProps {
  direction: number;
}

export default function EditForm({ 
  step, 
  direction, 
  formData, 
  handleInputChange,
  nextStep,
  prevStep
}: EditFormProps) {

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 300 : -300, opacity: 0 })
  };

  const totalString = String(formData?.total_amount || '');
  const digits = totalString.replace(/\D/g, '');
  const totalRaw = digits ? parseInt(digits, 10) : 0;
  const advance = totalRaw * 0.3;
  const uiux = totalRaw * 0.3;
  const preDeploy = totalRaw * 0.2;
  const postDeploy = totalRaw * 0.2;
  const formatCur = (num: number) => num ? `₹${num.toLocaleString('en-IN')}` : '₹0';

  return (
    <div className="flex-1 w-full md:max-w-[420px] mx-auto relative flex flex-col h-full bg-white">
      
      {/* Mobile Header */}
      <div className="md:hidden pt-8 px-6 pb-4 bg-white border-b border-gray-100 z-10">
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-[11px] font-bold tracking-wider text-[#3b82f6] uppercase">
            Step {step} of 4
          </h2>
          <span className="text-[13px] font-medium text-[#0d2d6e]">
            {step === 1 && "Client Details"}
            {step === 2 && "Project Scope"}
            {step === 3 && "Investment"}
            {step === 4 && "Final Preview"}
          </span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-[#3b82f6]' : 'bg-gray-100'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 p-6 md:p-8 overflow-y-auto pb-32 md:pb-24 scrollbar-hide"
          >
            {step === 1 && (
              <div className="space-y-2">
                <h3 className="text-[24px] font-black tracking-tight text-[#0d2d6e] mb-8">Who is the client?</h3>
                <AIField label="Client Name" field="client_name" formData={formData} handleInputChange={handleInputChange} />
                <AIField label="Client Location" field="client_address" formData={formData} handleInputChange={handleInputChange} />
                <AIField label="Quotation No" field="quotation_no" formData={formData} handleInputChange={handleInputChange} />
                <AIField label="Date" field="date" formData={formData} handleInputChange={handleInputChange} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <h3 className="text-[24px] font-black tracking-tight text-[#0d2d6e] mb-8">What are we building?</h3>
                
                <AIField label="Project Title" field="project_title" formData={formData} handleInputChange={handleInputChange} />
                
                <AIField 
                  label="Project Type" 
                  field="project_type" 
                  type="select"
                  options={["Mobile App", "Web App", "Mobile + Web", "Custom"]}
                  formData={formData} 
                  handleInputChange={handleInputChange} 
                />
                
                <AIField label="Scope Summary" field="project_overview" isTextArea={true} formData={formData} handleInputChange={handleInputChange} />
                
                <AIField 
                  label="Key Features" 
                  field="key_features" 
                  type="tags"
                  formData={formData} 
                  handleInputChange={handleInputChange} 
                />

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-6">Detailed Modules</h4>
                  <AIField label="Module 1" field="scope_module_1_title" formData={formData} handleInputChange={handleInputChange} />
                  <AIField label="Module 2" field="scope_module_2_title" formData={formData} handleInputChange={handleInputChange} />
                  <AIField label="Module 3" field="scope_module_3_title" formData={formData} handleInputChange={handleInputChange} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-2">
                <h3 className="text-[24px] font-black tracking-tight text-[#0d2d6e] mb-8">What&apos;s the budget?</h3>
                
                <AIField 
                  label="Total Amount" 
                  field="total_amount" 
                  type="text"
                  prefix="₹"
                  formData={formData} 
                  handleInputChange={handleInputChange} 
                />
                
                <div className="bg-[#f8faff] border border-[#e8edf5] rounded-2xl p-5 mb-8 mt-2">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Payment Milestones</div>
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                    <span className="text-[14px] text-gray-600 font-medium">Advance (30%)</span>
                    <span className="text-[15px] font-bold text-[#0d2d6e] transition-colors">{formatCur(advance)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                    <span className="text-[14px] text-gray-600 font-medium">UI/UX (30%)</span>
                    <span className="text-[15px] font-bold text-[#0d2d6e] transition-colors">{formatCur(uiux)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                    <span className="text-[14px] text-gray-600 font-medium">Pre-Deploy (20%)</span>
                    <span className="text-[15px] font-bold text-[#0d2d6e] transition-colors">{formatCur(preDeploy)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] text-gray-600 font-medium">Post-Deploy (20%)</span>
                    <span className="text-[15px] font-bold text-[#0d2d6e] transition-colors">{formatCur(postDeploy)}</span>
                  </div>
                </div>

                <AIField 
                  label="Timeline" 
                  field="timeline_title" 
                  type="text"
                  suffix="weeks"
                  formData={formData} 
                  handleInputChange={handleInputChange} 
                />
              </div>
            )}
            
            {/* Desktop Navigation inside center panel */}
            <div className="hidden md:flex gap-3 mt-10">
              <button 
                onClick={prevStep}
                className="flex-1 h-[48px] border-2 border-[#1a56c4] text-[#1a56c4] hover:bg-blue-50 rounded-[10px] font-bold flex items-center justify-center transition-colors"
              >
                ← Back
              </button>
              <button 
                onClick={nextStep}
                className="flex-[2] h-[48px] bg-[#1a56c4] hover:bg-[#1546a0] text-white rounded-[10px] font-bold flex items-center justify-center shadow-md transition-colors"
              >
                Next Step →
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="md:hidden absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-6 z-20 flex gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        {step > 1 && (
          <button 
            onClick={prevStep}
            className="flex-1 h-[52px] border-[1.5px] border-[#1a56c4] text-[#1a56c4] bg-white rounded-[12px] font-bold flex items-center justify-center active:bg-blue-50 transition-colors"
          >
            ← Back
          </button>
        )}
        <button 
          onClick={nextStep}
          className="flex-[2] h-[52px] bg-[#1a56c4] text-white rounded-[12px] font-bold flex items-center justify-center shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-transform"
        >
          {step === 3 ? 'Generate PDF' : 'Next Step'} <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>
      
    </div>
  );
}
