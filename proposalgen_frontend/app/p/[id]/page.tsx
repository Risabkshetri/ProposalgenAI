'use client';

import React, { useState, useEffect, useRef, use, useCallback } from 'react';
import { supabase } from '../../../utils/supabase';
import { ProposalData } from '../../components/types';
import Sidebar from '../../components/Sidebar';
import EditForm from '../../components/EditForm';
import LivePreview from '../../components/LivePreview';
import SuccessScreen from '../../components/SuccessScreen';
import { Toaster, toast } from 'react-hot-toast';

export default function SharedProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProposalData | null>(null);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [isSent, setIsSent] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [activeViewers, setActiveViewers] = useState(0);
  const [editWidth, setEditWidth] = useState(420);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isDragging = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const sessionViewerId = useRef<string>('');

  // Fetch Proposal on Load
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          setError("This proposal link has expired or doesn't exist.");
          return;
        }

        const expiresAt = new Date(data.expires_at);
        if (expiresAt < new Date()) {
          setError("This proposal link has expired.");
          return;
        }

        setFormData(data.data);
        setIsSent(data.is_sent);
        setLastSaved(data.last_saved ? new Date(data.last_saved) : null);
      } catch (err) {
        console.error(err);
        setError("Failed to load proposal.");
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id]);

  // Generate session viewer ID
  useEffect(() => {
    sessionViewerId.current = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  }, []);

  // Active Viewer Polling
  useEffect(() => {
    if (loading || error) return;

    const pingPresence = async () => {
      try {
        await supabase.from('viewers').upsert({
          id: sessionViewerId.current,
          proposal_id: id,
          last_seen: new Date().toISOString()
        });
      } catch (e) { }
    };

    const pollViewers = async () => {
      try {
        const thirtySecsAgo = new Date(Date.now() - 30000).toISOString();
        const { count, error } = await supabase
          .from('viewers')
          .select('*', { count: 'exact', head: true })
          .eq('proposal_id', id)
          .gt('last_seen', thirtySecsAgo)
          .neq('id', sessionViewerId.current);

        if (!error && count !== null) {
          setActiveViewers(count);
        }
      } catch (e) { }
    };

    pingPresence();
    pollViewers();

    const pingInterval = setInterval(pingPresence, 15000);
    const pollInterval = setInterval(pollViewers, 10000);

    const cleanup = () => {
      supabase.from('viewers').delete().eq('id', sessionViewerId.current).then(() => { });
    };

    window.addEventListener('beforeunload', cleanup);

    return () => {
      clearInterval(pingInterval);
      clearInterval(pollInterval);
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [id, loading, error]);

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

  const handleInputChange = (field: keyof ProposalData, value: unknown) => {
    if (!formData) return;
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    setSaveStatus('saving');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const now = new Date();
        const { error } = await supabase.from('proposals').update({
          data: newData,
          last_saved: now.toISOString()
        }).eq('id', id);

        if (error) throw error;

        setLastSaved(now);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        console.error(err);
        setSaveStatus('error');
      }
    }, 800);
  };

  const downloadPDF = async () => {
    if (!iframeRef.current || !formData) return;
    setIsDownloading(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ html_content: iframeRef.current.srcdoc, base_url: window.location.origin }),
      });
      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Proposal_${formData.client_name?.replace(/\s+/g, '_') || 'Appspine'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF Generated successfully!');

      // Mark as sent
      if (!isSent) {
        await supabase.from('proposals').update({ is_sent: true }).eq('id', id);
        setIsSent(true);
      }

    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const shareWhatsApp = async () => {
    if (!formData) return;
    const text = `Hi ${formData.client_name}, please find your proposal link attached: ${window.location.origin}/p/${id} Quotation No. ${formData.quotation_no}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');

    // Also mark as sent
    if (!isSent) {
      await supabase.from('proposals').update({ is_sent: true }).eq('id', id);
      setIsSent(true);
    }
  };

  if (loading) {
    return <div className="h-[100dvh] bg-[#f8faff] w-full flex items-center justify-center text-gray-500">Loading proposal...</div>;
  }

  if (error) {
    return (
      <div className="flex-1 h-[100dvh] w-full mx-auto flex flex-col items-center justify-center p-8 bg-[#f8faff] text-center">
        <div className="mb-6">
          {/* We don't have an appspine logo image physically, just using a styled div */}
          <div className="w-12 h-12 rounded-full bg-gray-200 mx-auto flex items-center justify-center font-bold text-gray-400">AP</div>
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">{error}</h2>
        <p className="text-sm text-gray-500">Contact Appspine to request a new copy.</p>
      </div>
    );
  }

  const getTimeAgo = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-white overflow-hidden">
      <Toaster position="top-center" />

      {/* Top Banner */}
      <div className={`w-full h-[44px] flex-shrink-0 px-6 flex justify-between items-center text-white text-sm shadow-sm z-[60] relative ${isSent ? 'bg-gray-600' : 'bg-[#0d2d6e]'}`}>
        <div className="font-medium truncate">
          {isSent ? (
            <span className="text-gray-200">This proposal has been sent</span>
          ) : (
            <span>Reviewing: <span className="font-bold">{formData?.client_name || 'Client'}</span> · {formData?.project_title || 'Project'}</span>
          )}
        </div>
        <div className="flex items-center gap-4 text-[12px] opacity-90 font-medium">
          {activeViewers > 0 && (
            <span className="text-emerald-300 animate-pulse hidden sm:inline">Someone else is also viewing</span>
          )}
          <div className="flex items-center">
            {saveStatus === 'saving' && <span className="text-blue-200">Saving...</span>}
              {saveStatus === 'saved' && <span className="text-emerald-400">Saved ✓</span>}
              {saveStatus === 'error' && <span className="text-red-400">Save failed — check connection</span>}
              {saveStatus === 'idle' && lastSaved && <span>Last saved {getTimeAgo(lastSaved)}</span>}
            </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Cover with disabled overlay if isSent */}
        {isSent && (
          <div className="absolute inset-0 z-50 pointer-events-none" />
        )}

        {/* 1. Left Sidebar */}
        <div>
          <Sidebar step={step} setStep={s => { setDirection(s > step ? 1 : -1); setStep(s); }} formData={formData} />
        </div>

        {/* 2. Center Panel */}
        <div
          style={{ width: `${editWidth}px` }}
          className="hidden md:flex flex-col relative flex-shrink-0 bg-white border-r border-gray-200"
        >
          {step === 4 ? (
            <SuccessScreen
              formData={formData}
              downloadPDF={downloadPDF}
              shareWhatsApp={shareWhatsApp}
              reset={() => { }}
              isDownloading={isDownloading}
              prevStep={() => { setDirection(-1); setStep(3); }}
              shareId={id}
            />
          ) : (
            <EditForm
              step={step}
              direction={direction}
              formData={formData}
              handleInputChange={handleInputChange}
              nextStep={() => { if (step < 4) { setDirection(1); setStep(step + 1); } }}
              prevStep={() => { if (step > 1) { setDirection(-1); setStep(step - 1); } }}
              setStep={setStep}
              downloadPDF={downloadPDF}
              shareWhatsApp={shareWhatsApp}
              iframeRef={iframeRef}
            />
          )}

          {/* Dragger Handle */}
          <div
            onMouseDown={handleDragStart}
            className="absolute right-[-4px] top-0 w-2 h-full cursor-col-resize hover:bg-[#1a56c4] z-50 transition-colors opacity-0 hover:opacity-100 pointer-events-auto"
          />
        </div>

        {/* Mobile Center Panel */}
        <div className="md:hidden flex-1 flex flex-col relative bg-white">
          {step === 4 ? (
            <SuccessScreen
              formData={formData}
              downloadPDF={downloadPDF}
              shareWhatsApp={shareWhatsApp}
              reset={() => { }}
              isDownloading={isDownloading}
              prevStep={() => { setDirection(-1); setStep(3); }}
              shareId={id}
            />
          ) : (
            <EditForm
              step={step}
              direction={direction}
              formData={formData}
              handleInputChange={handleInputChange}
              nextStep={() => { if (step < 4) { setDirection(1); setStep(step + 1); } }}
              prevStep={() => { if (step > 1) { setDirection(-1); setStep(step - 1); } }}
              setStep={setStep}
              downloadPDF={downloadPDF}
              shareWhatsApp={shareWhatsApp}
              iframeRef={iframeRef}
            />
          )}
        </div>

        {/* 3. Right Panel / Live Preview */}
        <LivePreview
          formData={formData}
          iframeRef={iframeRef}
          step={step}
          downloadPDF={downloadPDF}
          shareWhatsApp={shareWhatsApp}
          showMobileSheet={showMobileSheet}
          setShowMobileSheet={setShowMobileSheet}
          isDownloading={isDownloading}
          reset={() => { }}
        />
      </div>
    </div>
  );
}
