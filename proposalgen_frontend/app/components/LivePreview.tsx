import React, { useEffect, useState } from 'react';
import { ProposalData } from './types';
import { Eye, X, Download, Share2, PlusCircle, ChevronDown, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
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
  reset: () => void;
  shareId?: string | null;
  onGenerateShare?: () => Promise<string | null>;
}

export default function LivePreview({
  formData,
  iframeRef,
  step,
  downloadPDF,
  shareWhatsApp,
  showMobileSheet,
  setShowMobileSheet,
  isDownloading,
  reset,
  shareId,
  onGenerateShare
}: LivePreviewProps) {

  const [templateHTML, setTemplateHTML] = useState('');
  const [compiledHTML, setCompiledHTML] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleCopyUrl = async () => {
    let idToCopy = shareId;
    if (!idToCopy && onGenerateShare) {
      idToCopy = await onGenerateShare();
    }
    if (idToCopy) {
      const url = `${window.location.origin}/p/${idToCopy}`;
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
    setShowShareMenu(false);
  };

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
      
      // Feature fields that need to be rendered as <li> items
      const featureFields = [
        'scope_module_1_features',
        'scope_module_2_features', 
        'scope_module_3_features',
        'scope_module_4_features',
      ];
      
      Object.entries(formData).forEach(([key, value]) => {
        let stringValue: string;
        if (Array.isArray(value)) {
          if (featureFields.includes(key)) {
            // Render as <li> items for template lists
            stringValue = value.map(f => `<li>${f}</li>`).join('\n        ');
          } else {
            stringValue = value.join(', ');
          }
        } else if (key === 'timeline_phases' || key === 'tech_stack') {
          // Skip these, we handle them below
          return;
        } else {
          stringValue = value as string;
        }
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        html = html.replace(regex, stringValue || ' ');
      });

      // Handle table rows
      let timelineHTML = '';
      if (formData.timeline_phases && formData.timeline_phases.length > 0) {
        timelineHTML = formData.timeline_phases.map(p => `
          <tr>
            <td>${p.phase || ''}</td>
            <td>${p.duration || ''}</td>
            <td>${p.description || ''}</td>
          </tr>
        `).join('');
      }
      html = html.replace(/\{\{timeline_rows\}\}/g, timelineHTML);

      let techStackHTML = '';
      if (formData.tech_stack && formData.tech_stack.length > 0) {
        techStackHTML = formData.tech_stack.map(t => `
          <tr>
            <td>${t.component || ''}</td>
            <td>${t.technology || ''}</td>
            <td>${t.description || ''}</td>
          </tr>
        `).join('');
      }
      html = html.replace(/\{\{tech_stack_rows\}\}/g, techStackHTML);

      // Add base url to fix relative assets when loaded from /p/[id]
      if (typeof window !== 'undefined') {
        html = html.replace('<head>', `<head>\n  <base href="${window.location.origin}/" />`);
      }

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
              onClick={reset} 
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-[13px] font-bold shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" /> Start New
            </button>
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
            <div className="relative">
              <button 
                onClick={() => setShowShareMenu(!showShareMenu)} 
                className="bg-[#1a56c4] hover:bg-[#1546a0] text-white px-4 py-2 rounded-lg text-[13px] font-bold shadow-sm transition-all flex items-center"
              >
                <Share2 className="w-4 h-4 mr-1.5" /> Share <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 flex flex-col"
                  >
                    <button 
                      onClick={handleCopyUrl}
                      className="w-full text-left px-4 py-3 text-[13px] font-semibold text-gray-700 hover:bg-[#f8faff] hover:text-[#1a56c4] flex items-center transition-colors border-b border-gray-50"
                    >
                      <LinkIcon className="w-4 h-4 mr-2" /> Copy Link
                    </button>
                    <button 
                      onClick={() => {
                        shareWhatsApp();
                        setShowShareMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-[13px] font-semibold text-gray-700 hover:bg-green-50 hover:text-green-600 flex items-center transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
