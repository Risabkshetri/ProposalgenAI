import React, { useState } from 'react';
import Image from 'next/image';
import { ProposalData } from './types';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  step: number;
  setStep: (step: number) => void;
  formData: ProposalData | null;
}

const NavItem = ({ num, label, step, setStep }: { num: number, label: string, step: number, setStep: (step: number) => void }) => {
  const isCompleted = step > num;
  const isActive = step === num;
  
  return (
    <button 
      onClick={() => setStep(num)}
      className={`w-full flex items-center p-3 rounded-xl transition-all ${isActive ? 'bg-[#eff6ff] font-bold text-[#0d2d6e]' : 'cursor-pointer hover:bg-gray-50'}`}
    >
      <div className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center mr-3 text-[12px] font-bold border-2 ${
        isActive ? 'border-[#1a56c4] text-[#1a56c4]' : 
        isCompleted ? 'bg-[#1a56c4] border-[#1a56c4] text-white' : 
        'border-gray-300 text-gray-500'
      }`}>
        {isCompleted ? <Check className="w-3.5 h-3.5" /> : num}
      </div>
      <span className={`whitespace-nowrap ${isActive || isCompleted ? 'text-[#0d2d6e]' : 'text-gray-600'}`}>{label}</span>
    </button>
  );
};

export default function Sidebar({ step, setStep, formData }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <div 
        className={`h-full bg-[#f8faff] border-r border-[#e8edf5] flex flex-col hidden md:flex transition-all duration-300 ease-in-out relative ${isOpen ? 'w-[260px]' : 'w-0 border-r-0'}`}
      >
        <div className={`flex flex-col h-full w-[260px] p-6 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center mb-10 mt-4">
            <Image src="/appspine_logo.png" alt="Appspine Logo" width={140} height={40} className="object-contain" />
          </div>

          <nav className="space-y-1 mb-8">
            <NavItem num={1} label="Client Details" step={step} setStep={setStep} />
            <NavItem num={2} label="Project Scope" step={step} setStep={setStep} />
            <NavItem num={3} label="Investment" step={step} setStep={setStep} />
            <NavItem num={4} label="Review & Share" step={step} setStep={setStep} />
          </nav>

          <div className="h-[1px] w-full bg-[#e8edf5] mb-8"></div>

          {formData && (
            <div className="flex-1">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">AI Extracted Summary</h4>
              
              <div className="space-y-3">
                <div className="bg-white border border-[#e8edf5] p-3 rounded-xl shadow-sm">
                  <div className="text-[11px] text-gray-500 mb-1 font-semibold">CLIENT</div>
                  <div className="text-[13px] font-bold text-[#0d2d6e] truncate">{formData.client_name || 'N/A'}</div>
                </div>
                
                <div className="bg-white border border-[#e8edf5] p-3 rounded-xl shadow-sm">
                  <div className="text-[11px] text-gray-500 mb-1 font-semibold">TYPE</div>
                  <div className="text-[13px] font-bold text-[#1a56c4] truncate">{formData.project_type || 'Custom'}</div>
                </div>

                <div className="bg-white border border-[#e8edf5] p-3 rounded-xl shadow-sm">
                  <div className="text-[11px] text-gray-500 mb-1 font-semibold">BUDGET</div>
                  <div className="text-[14px] font-black text-[#e8a800] truncate">{formData.total_amount || 'TBD'}</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto text-[11px] font-medium text-gray-400">
            Proposal Generator v2.0
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex absolute top-6 z-50 bg-white border border-[#e8edf5] shadow-md text-[#1a56c4] hover:bg-[#eff6ff] rounded-r-xl p-1.5 items-center justify-center transition-all duration-300 ease-in-out cursor-pointer"
        style={{ left: isOpen ? '260px' : '0px' }}
        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </>
  );
}
