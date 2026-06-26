import React from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, PlusCircle } from 'lucide-react';
import { ProposalData } from './types';

interface SuccessScreenProps {
  formData: ProposalData | null;
  downloadPDF: () => void;
  shareWhatsApp: () => void;
  reset: () => void;
  isDownloading: boolean;
  prevStep: () => void;
}

export default function SuccessScreen({ formData, downloadPDF, shareWhatsApp, reset, isDownloading, prevStep }: SuccessScreenProps) {
  return (
    <div className="flex-1 w-full md:max-w-[420px] mx-auto flex flex-col items-center justify-center p-8 bg-white text-center">
      
      <div className="w-24 h-24 mb-8 relative">
        <div className="absolute inset-0 bg-blue-100 rounded-full scale-150 opacity-50"></div>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
          className="w-full h-full relative z-10"
        >
          <circle cx="26" cy="26" r="25" fill="none" className="stroke-[#1a56c4] stroke-[3]" />
          <motion.path
            fill="none"
            className="stroke-[#1a56c4] stroke-[4]"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut", delay: 0.2 }}
          />
        </motion.svg>
      </div>

      <h2 className="text-[28px] font-black tracking-tight text-[#0d2d6e] mb-2">Proposal Ready</h2>
      <p className="text-[#64748b] mb-6 text-[15px]">
        {formData?.client_name ? `For ${formData.client_name}` : 'Document generated successfully'}
        <br/>
        <span className="font-semibold text-[#0d2d6e]">{formData?.quotation_no}</span>
      </p>

      {/* Mini Summary Card */}
      <div className="w-full bg-[#f8faff] border border-[#e8edf5] rounded-xl p-4 mb-8 text-left">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Proposal Summary</div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-[13px] text-gray-500">Client</span>
          <span className="text-[13px] font-semibold text-[#0d2d6e] text-right">{formData?.client_name || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-[13px] text-gray-500">Project</span>
          <span className="text-[13px] font-semibold text-[#0d2d6e] text-right max-w-[180px] truncate">{formData?.project_title || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-[13px] text-gray-500">Amount</span>
          <span className="text-[13px] font-bold text-[#e8a800] text-right">{formData?.total_amount ? `₹${formData.total_amount}` : 'TBD'}</span>
        </div>
      </div>

      <div className="w-full space-y-3">
        <button 
          onClick={downloadPDF}
          disabled={isDownloading} 
          className={`w-full h-[52px] bg-[#1a56c4] text-white rounded-[12px] font-semibold flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all ${isDownloading ? 'opacity-80 cursor-not-allowed' : 'hover:bg-[#1546a0]'}`}
        >
          {isDownloading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Download className="w-5 h-5 mr-2" /> 
          )}
          {isDownloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
        
        <button 
          onClick={shareWhatsApp} 
          className="w-full h-[52px] bg-[#25D366] text-white rounded-[12px] font-semibold flex items-center justify-center shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all"
        >
          <Share2 className="w-5 h-5 mr-2" /> Send via WhatsApp
        </button>
      </div>

      <div className="mt-8 flex gap-4 w-full text-[14px] font-semibold text-[#64748b]">
        <button 
          onClick={prevStep}
          className="flex-1 hover:text-[#0d2d6e] flex items-center justify-center transition-colors"
        >
          ← Edit Proposal
        </button>
        <div className="w-[1px] bg-gray-200"></div>
        <button 
          onClick={reset}
          className="flex-1 hover:text-[#0d2d6e] flex items-center justify-center transition-colors"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" /> Start New
        </button>
      </div>

      <p className="mt-auto pt-10 text-[11px] text-gray-400 font-medium tracking-wide">
        PROPOSAL AUTO-SAVED TO THIS DEVICE
      </p>
    </div>
  );
}
