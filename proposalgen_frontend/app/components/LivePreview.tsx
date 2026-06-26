import React, { useEffect, useState } from 'react';
import { ProposalData } from './types';
import { Eye, X, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LivePreviewProps {
  formData: ProposalData | null;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  step: number;
  downloadPDF: () => void;
  shareWhatsApp: () => void;
  showMobileSheet: boolean;
  setShowMobileSheet: (show: boolean) => void;
  isDownloading: boolean;
}

export default function LivePreview({
  formData,
  iframeRef,
  step,
  downloadPDF,
  shareWhatsApp,
  showMobileSheet,
  setShowMobileSheet,
  isDownloading
}: LivePreviewProps) {

  const [templateHTML, setTemplateHTML] = useState('');
  const [compiledHTML, setCompiledHTML] = useState('');

  // Load HTML template once
  useEffect(() => {
    fetch('/proposal.html')
      .then(res => res.text())
      .then(html => setTemplateHTML(html))
      .catch(err => console.error("Failed to load template", err));
  }, []);

  // Update Iframe with debouncing
  useEffect(() => {
    if (!templateHTML || !formData) return;

    const updateIframe = () => {
      let html = templateHTML;
      Object.entries(formData).forEach(([key, value]) => {
        // Handle array for key_features
        const stringValue = Array.isArray(value) ? value.join(', ') : (value as string);
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        html = html.replace(regex, stringValue || ' ');
      });
      setCompiledHTML(html);
      if (iframeRef.current) {
        iframeRef.current.srcdoc = html;
      }
    };

    const debounce = setTimeout(updateIframe, 400); // 400ms debounce
    return () => clearTimeout(debounce);
  }, [formData, templateHTML, iframeRef]);

  return (
    <>
      {/* DESKTOP: Right Panel rendering */}
      <div className="hidden md:flex flex-col flex-1 h-full bg-[#f0f4f8] p-6 relative">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
            <span className="font-bold text-[#0d2d6e] text-[15px]">Live Preview</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={downloadPDF} 
              disabled={isDownloading}
              className={`bg-white border border-gray-200 text-[#0d2d6e] px-4 py-2 rounded-lg text-[13px] font-bold shadow-sm transition-all flex items-center ${isDownloading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-[#0d2d6e] border-t-transparent rounded-full animate-spin mr-1.5" />
              ) : (
                <Download className="w-4 h-4 mr-1.5" /> 
              )}
              {isDownloading ? 'Generating...' : 'PDF'}
            </button>
            <button onClick={shareWhatsApp} className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 rounded-lg text-[13px] font-bold shadow-sm transition-all flex items-center">
              <Share2 className="w-4 h-4 mr-1.5" /> WhatsApp
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#e8edf5] overflow-hidden relative mx-2 mb-2">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
             <iframe 
              ref={iframeRef} 
              srcDoc={compiledHTML}
              className="absolute top-0 left-0 w-full h-full transform origin-top-left"
              style={{ transform: 'scale(0.8)', width: '125%', height: '125%' }}
            />
          </div>
        </div>
      </div>

      {/* MOBILE: Floating Button & Bottom Sheet */}
      <div className="md:hidden">
        {step > 0 && step <= 4 && (
          <button 
            onClick={() => setShowMobileSheet(true)}
            className="absolute bottom-24 right-4 w-14 h-14 bg-[#1a56c4] rounded-full shadow-xl shadow-blue-900/20 flex items-center justify-center text-white z-30 active:scale-95 transition-transform"
          >
            <Eye className="w-6 h-6" />
          </button>
        )}

        <AnimatePresence>
          {showMobileSheet && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileSheet(false)}
                className="absolute inset-0 bg-[#0d2d6e]/40 z-40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 w-full h-[85vh] bg-[#f8faff] rounded-t-[32px] shadow-2xl z-50 flex flex-col overflow-hidden"
              >
                <div className="flex justify-between items-center p-6 bg-white border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
                    <h3 className="font-bold text-[#0d2d6e] text-[16px]">Live Preview</h3>
                  </div>
                  <button onClick={() => setShowMobileSheet(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 active:bg-gray-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 relative bg-gray-100">
                  <iframe 
                    srcDoc={compiledHTML}
                    className="absolute top-0 left-0 w-full h-full transform origin-top-left"
                    style={{ transform: 'scale(0.45)', width: '222%', height: '222%' }}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
