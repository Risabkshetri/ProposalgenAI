'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProposalData } from './components/types';
import PasteScreen from './components/PasteScreen';
import ExtractingState from './components/ExtractingState';
import Sidebar from './components/Sidebar';
import EditForm from './components/EditForm';
import LivePreview from './components/LivePreview';
import SuccessScreen from './components/SuccessScreen';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [step, setStep] = useState(0); 
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [rawText, setRawText] = useState('');
  const [formData, setFormData] = useState<ProposalData | null>(null);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [editWidth, setEditWidth] = useState(420);
  const isDragging = useRef(false);

  // Resizer logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setEditWidth((prev) => Math.min(Math.max(300, prev + e.movementX), 800));
    };
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleDragStart = () => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Load local storage on mount
  useEffect(() => {
    setIsInitialized(true);
    const savedId = localStorage.getItem('proposal_share_id');
    if (savedId) setShareId(savedId);
    try {
      const draftStr = localStorage.getItem('appspine_draft');
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (draft.step) setStep(draft.step);
        if (draft.rawText) setRawText(draft.rawText);
        if (draft.formData) setFormData(draft.formData);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (!isInitialized) return;
    const draft = { step, rawText, formData };
    localStorage.setItem('appspine_draft', JSON.stringify(draft));
  }, [step, rawText, formData, isInitialized]);

  const handleReset = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-semibold text-gray-800">Start new proposal?</span>
        <span className="text-sm text-gray-600">This will clear your current progress.</span>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-[13px] font-bold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              setStep(0);
              setRawText('');
              setFormData(null);
              setShareId(null);
              localStorage.removeItem('appspine_draft');
              localStorage.removeItem('proposal_share_id');
              toast.dismiss(t.id);
              toast.success('Proposal cleared successfully');
            }}
            className="px-4 py-2 text-[13px] font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Yes, Clear it
          </button>
        </div>
      </div>
    ), { duration: 6000, style: { maxWidth: '400px' } });
  };

  const handleGenerate = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ raw_text: rawText }),
      });
      if (!response.ok) throw new Error('API Request Failed');
      const data = await response.json();
      
      if (!data.quotation_no) data.quotation_no = `APP-${Math.floor(Math.random() * 10000)}`;
      if (!data.date) {
        const today = new Date();
        data.date = today.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
      }
      if (!data.project_type) data.project_type = 'Custom';
      if (!data.key_features) data.key_features = [];
      if (!data.scope_module_1_features) data.scope_module_1_features = [];
      if (!data.scope_module_2_features) data.scope_module_2_features = [];
      if (!data.scope_module_3_features) data.scope_module_3_features = [];
      if (!data.scope_module_4_features) data.scope_module_4_features = [];

      // Generate Supabase Share Link
      const { nanoid } = await import('nanoid');
      const newShareId = nanoid(6);
      
      try {
        const { supabase } = await import('../utils/supabase');
        const { error } = await supabase.from('proposals').insert({
          id: newShareId,
          data: data
        });
        if (error) throw error;
        setShareId(newShareId);
        localStorage.setItem('proposal_share_id', newShareId);
      } catch (e) {
        console.error("Failed to save to Supabase", e);
      }
      
      setFormData(data);
      setDirection(1);
      setStep(1);
    } catch (error) {
      console.error(error);
      toast.error('Failed to process text. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateShareLink = async () => {
    if (!formData) return null;
    const { nanoid } = await import('nanoid');
    const newShareId = nanoid(6);
    
    try {
      const { supabase } = await import('../utils/supabase');
      const { error } = await supabase.from('proposals').insert({
        id: newShareId,
        data: formData
      });
      if (error) throw error;
      setShareId(newShareId);
      localStorage.setItem('proposal_share_id', newShareId);
      toast.success('Share link generated!');
      return newShareId;
    } catch (e) {
      console.error("Failed to save to Supabase", e);
      toast.error('Failed to generate link');
      return null;
    }
  };

  const handleInputChange = async (field: keyof ProposalData, value: unknown) => {
    if (!formData) return;
    const newData = { ...formData, [field]: value };
    setFormData(newData as any);
    
    if (shareId) {
      try {
        const { supabase } = await import('../utils/supabase');
        supabase.from('proposals').update({ 
          data: newData, 
          last_saved: new Date().toISOString() 
        }).eq('id', shareId);
      } catch(e) {}
    }
  };

  const downloadPDF = async () => {
    if (!iframeRef.current) return;
    const htmlString = iframeRef.current.srcdoc;
    if (!htmlString) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ html_content: htmlString, base_url: window.location.origin })
      });
      if (!response.ok) throw new Error('PDF Generation failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Proposal_${formData?.client_name?.replace(/\s+/g, '_') || 'Appspine'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const shareWhatsApp = () => {
    if (!formData) return;
    const text = `Hi ${formData.client_name}, please find your proposal attached. Quotation No. ${formData.quotation_no}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const nextStep = () => {
    if (step < 4) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  if (!isInitialized) {
    return <div className="h-[100dvh] bg-[#f8faff] w-full" />;
  }

  if (loading) {
    return <ExtractingState />;
  }

  if (step === 0) {
    return (
      <PasteScreen 
        rawText={rawText} 
        setRawText={setRawText} 
        handleGenerate={handleGenerate} 
        loading={loading} 
      />
    );
  }

  return (
    <div className="flex h-[100dvh] w-full bg-white overflow-hidden">
      <Toaster position="top-center" />
      
      {/* 1. Left Sidebar (Desktop Only) */}
      <Sidebar 
        step={step} 
        setStep={(s) => {
          setDirection(s > step ? 1 : -1);
          setStep(s);
        }} 
        formData={formData} 
      />

      {/* 2. Center Panel (Edit Form or Success Screen) */}
      <div 
        style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${editWidth}px` : '100%' }}
        className="flex-1 md:flex-none flex flex-col relative bg-white border-r border-gray-200"
      >
        {step === 4 ? (
          <SuccessScreen 
            formData={formData} 
            downloadPDF={downloadPDF} 
            shareWhatsApp={shareWhatsApp} 
            reset={handleReset} 
            isDownloading={isDownloading}
            prevStep={prevStep}
            shareId={shareId}
            onGenerateShare={handleGenerateShareLink}
          />
        ) : (
          <EditForm 
            step={step} 
            direction={direction} 
            formData={formData} 
            handleInputChange={handleInputChange} 
            nextStep={nextStep} 
            prevStep={prevStep} 
            setStep={setStep}
            downloadPDF={downloadPDF}
            shareWhatsApp={shareWhatsApp}
            iframeRef={iframeRef}
          />
        )}
        
        {/* Dragger Handle (Desktop Only) */}
        <div
          onMouseDown={handleDragStart}
          className="hidden md:block absolute right-[-4px] top-0 w-2 h-full cursor-col-resize hover:bg-[#1a56c4] z-50 transition-colors opacity-0 hover:opacity-100 pointer-events-auto"
        />
      </div>

      {/* 3. Right Panel / Mobile Bottom Sheet (Live Preview) */}
      <LivePreview 
        formData={formData} 
        iframeRef={iframeRef} 
        step={step} 
        downloadPDF={downloadPDF} 
        shareWhatsApp={shareWhatsApp} 
        showMobileSheet={showMobileSheet} 
        setShowMobileSheet={setShowMobileSheet} 
        isDownloading={isDownloading}
        reset={handleReset}
        shareId={shareId}
        onGenerateShare={handleGenerateShareLink}
      />
      
    </div>
  );
}
