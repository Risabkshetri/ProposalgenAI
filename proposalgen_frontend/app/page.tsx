'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProposalData } from './components/types';
import PasteScreen from './components/PasteScreen';
import ExtractingState from './components/ExtractingState';
import Sidebar from './components/Sidebar';
import EditForm from './components/EditForm';
import LivePreview from './components/LivePreview';
import SuccessScreen from './components/SuccessScreen';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [step, setStep] = useState(0); 
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [rawText, setRawText] = useState('');
  const [formData, setFormData] = useState<ProposalData | null>(null);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load local storage on mount
  useEffect(() => {
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
    setIsInitialized(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (!isInitialized) return;
    const draft = { step, rawText, formData };
    localStorage.setItem('appspine_draft', JSON.stringify(draft));
  }, [step, rawText, formData, isInitialized]);

  const handleReset = () => {
    if (confirm("Are you sure you want to start over and clear this proposal?")) {
      setStep(0);
      setRawText('');
      setFormData(null);
      localStorage.removeItem('appspine_draft');
    }
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
      
      setFormData(data);
      setDirection(1);
      setStep(1);
    } catch (error) {
      console.error(error);
      alert('Failed to process text. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProposalData, value: string | string[]) => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, [field]: value }));
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
      a.download = `Proposal_${formData?.client_name?.replace(/\\s+/g, '_') || 'Appspine'}.pdf`;
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
      {step === 4 ? (
        <SuccessScreen 
          formData={formData} 
          downloadPDF={downloadPDF} 
          shareWhatsApp={shareWhatsApp} 
          reset={handleReset} 
          isDownloading={isDownloading}
          prevStep={prevStep}
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
      />
      
    </div>
  );
}
