'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

// Removed html2pdf import in favor of backend WeasyPrint generation

interface ProposalData {
  client: Record<string, string>;
  sender: Record<string, string>;
  details: Record<string, string>;
}

export default function Home() {
  const [view, setView] = useState<'upload' | 'editor'>('upload');
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState('');
  const [templateHTML, setTemplateHTML] = useState('');
  const [formData, setFormData] = useState<ProposalData | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Fetch the proposal.html template from public directory
    fetch('/proposal.html')
      .then(res => res.text())
      .then(html => setTemplateHTML(html))
      .catch(err => console.error("Failed to load proposal template:", err));
  }, []);

  const handleGenerate = async () => {
    if (!rawText.trim()) return;
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw_text: rawText }),
      });

      if (!response.ok) throw new Error('API Request Failed');

      const data = await response.json();
      setFormData(data);
      setView('editor');
    } catch (error) {
      console.error(error);
      alert('Failed to process text. Is the FastAPI backend running on port 8000?');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (category: keyof ProposalData, field: string, value: string) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      [category]: {
        ...prev![category],
        [field]: value
      }
    }));
  };

  // Update iframe preview whenever formData or template changes
  useEffect(() => {
    if (view === 'editor' && templateHTML && formData && iframeRef.current) {
      let html = templateHTML;

      // Replace placeholders
      const mappings: { cat: keyof ProposalData, prefix: string }[] = [
        { cat: 'client', prefix: 'Client' },
        { cat: 'sender', prefix: 'Sender' }
      ];

      mappings.forEach(({ cat, prefix }) => {
        Object.entries(formData[cat]).forEach(([field, value]) => {
          const regex = new RegExp(`\\[${prefix}\\.${field}\\]`, 'g');
          html = html.replace(regex, value as string || ' ');
        });
      });

      // Handle specific details
      html = html.replace(/\[Number\.Of\.Months\]/g, formData.details.NumberOfMonths || ' ');
      html = html.replace(/\[Dollar\.Amount\]/g, formData.details.DollarAmount || ' ');

      iframeRef.current.srcdoc = html;

      // Auto-scale iframe content to fit container roughly
      const wrapper = iframeRef.current.parentElement;
      if (wrapper) {
        const scale = Math.min(1, wrapper.clientWidth / 834);
        iframeRef.current.style.transform = `scale(${scale})`;
      }
    }
  }, [formData, templateHTML, view]);

  const downloadPDF = async () => {
    if (!iframeRef.current) return;
    const htmlString = iframeRef.current.srcdoc;
    if (!htmlString) return;

    try {
      const btn = document.getElementById('dl-btn');
      if (btn) btn.innerText = 'Generating PDF...';

      const response = await fetch('http://localhost:8000/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html_content: htmlString })
      });

      if (!response.ok) throw new Error('PDF Generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AgentIO_Proposal.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      if (btn) btn.innerText = 'Download PDF';
    } catch (error) {
      console.error(error);
      alert('Failed to generate PDF via backend.');
      const btn = document.getElementById('dl-btn');
      if (btn) btn.innerText = 'Download PDF';
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="navbar">
        <Link href="/" className="brand">
          <div className="brand-dot"></div>
          AgentIO Proposal Generator
        </Link>
        {view === 'editor' && (
          <button id="dl-btn" className="btn-primary" onClick={downloadPDF}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download PDF
          </button>
        )}
      </div>

      <div className="relative flex-1">

        {/* View 1: Upload */}
        <div className={`view ${view === 'upload' ? 'active' : ''}`}>
          <div className="upload-container">
            <h1 className="text-3xl font-semibold mb-4 tracking-tight">Transform Raw Data into Proposals</h1>
            <p className="text-[var(--text-body)] text-base mb-10 leading-relaxed max-w-[500px] mx-auto">
              Paste your client meeting notes, timelines, and budgets below. Our AI will extract the necessary information and build a stunning proposal.
            </p>

            <textarea
              className="raw-input"
              placeholder="E.g. Client is John Doe from Acme Corp. Email is john@acme.com. Phone 555-0192. Project takes 6 months and costs $35,000..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />

            {!loading ? (
              <button className="btn-primary w-full justify-center py-3.5" onClick={handleGenerate}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                Process with AgentIO
              </button>
            ) : (
              <div className="loader"></div>
            )}
          </div>
        </div>

        {/* View 2: Editor */}
        <div className={`view ${view === 'editor' ? 'active' : ''}`}>
          <div className="w-full h-full flex">

            {/* Left Panel - Form */}
            <div className="w-[400px] bg-[var(--panel-bg)] border-r border-[var(--panel-border)] flex flex-col h-full overflow-y-auto">
              <div className="p-5 border-b border-[var(--panel-border)]">
                <h2 className="text-base font-semibold">Extracted Information</h2>
                <p className="text-xs text-[var(--success)] mt-1 flex items-center gap-1">
                  <span className="block w-1.5 h-1.5 bg-[var(--success)] rounded-full"></span>
                  AI Extraction Successful
                </p>
              </div>

              <div className="p-6 flex-1">
                {formData && (
                  <>
                    {/* Client Info */}
                    <div className="text-[11px] uppercase tracking-widest text-[var(--text-body)] font-semibold mb-3 border-b border-[var(--panel-border)] pb-2">Client Information</div>
                    {Object.entries(formData.client).map(([key, val]) => (
                      <div className="mb-5" key={`client-${key}`}>
                        <label className="block text-[13px] font-medium text-[var(--text-body)] mb-2">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={val}
                          onChange={(e) => handleInputChange('client', key, e.target.value)}
                        />
                      </div>
                    ))}

                    {/* Sender Info */}
                    <div className="text-[11px] uppercase tracking-widest text-[var(--text-body)] font-semibold mt-8 mb-3 border-b border-[var(--panel-border)] pb-2">Sender Information</div>
                    {Object.entries(formData.sender).map(([key, val]) => (
                      <div className="mb-5" key={`sender-${key}`}>
                        <label className="block text-[13px] font-medium text-[var(--text-body)] mb-2">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={val}
                          onChange={(e) => handleInputChange('sender', key, e.target.value)}
                        />
                      </div>
                    ))}

                    {/* Project Details */}
                    <div className="text-[11px] uppercase tracking-widest text-[var(--text-body)] font-semibold mt-8 mb-3 border-b border-[var(--panel-border)] pb-2">Project Details</div>
                    <div className="mb-5">
                      <label className="block text-[13px] font-medium text-[var(--text-body)] mb-2">Duration (Months)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.details.NumberOfMonths}
                        onChange={(e) => handleInputChange('details', 'NumberOfMonths', e.target.value)}
                      />
                    </div>
                    <div className="mb-5">
                      <label className="block text-[13px] font-medium text-[var(--text-body)] mb-2">Monthly Hosting Fee</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.details.DollarAmount}
                        onChange={(e) => handleInputChange('details', 'DollarAmount', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 bg-[var(--bg-color)] flex flex-col relative">
              <div className="h-[56px] bg-[var(--panel-bg)] border-b border-[var(--panel-border)] flex items-center justify-between px-8">
                <span className="text-[15px] font-semibold text-[var(--text-main)] tracking-tight">Live Preview</span>
                <span className="text-[13px] font-medium text-[var(--text-body)] bg-[var(--bg-color)] px-3 py-1 rounded-full border border-[var(--panel-border)]">Changes apply automatically</span>
              </div>
              <div className="flex-1 overflow-hidden p-8 flex justify-center overflow-y-auto">
                <iframe
                  ref={iframeRef}
                  className="w-[794px] h-[1122px] bg-white shadow-sm border border-[var(--panel-border)] shrink-0 origin-top rounded-sm"
                ></iframe>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
