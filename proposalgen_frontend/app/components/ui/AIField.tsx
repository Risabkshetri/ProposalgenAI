import React, { useState } from 'react';
import { ProposalData } from '../types';

interface AIFieldProps {
  label: string;
  field: keyof ProposalData;
  isTextArea?: boolean;
  formData: ProposalData | null;
  handleInputChange: (field: keyof ProposalData, value: unknown) => void;
  type?: 'text' | 'number' | 'tags' | 'select';
  options?: string[]; // for select
  prefix?: string; // e.g. "₹"
  suffix?: string; // e.g. "weeks"
}

export default function AIField({ 
  label, 
  field, 
  isTextArea = false,
  formData,
  handleInputChange,
  type = 'text',
  options = [],
  prefix,
  suffix
}: AIFieldProps) {
  
  const value = formData?.[field] ?? '';
  
  // Tag input logic
  const [tagInput, setTagInput] = useState('');
  
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const currentTags = (Array.isArray(value) ? value : []) as string[];
      if (!currentTags.includes(tagInput.trim())) {
        handleInputChange(field, [...currentTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (!Array.isArray(value)) return;
    handleInputChange(field, (value as string[]).filter(t => t !== tagToRemove));
  };

  return (
    <div className="mb-5 relative">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">{label}</label>
        {value !== '' && value !== null && (!Array.isArray(value) || value.length > 0) && (
          <span className="flex items-center text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></div>
            AI filled
          </span>
        )}
      </div>

      {isTextArea ? (
        <textarea
          value={value as string}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full min-h-[120px] p-3 text-[15px] border-[1.5px] border-[#e2e8f0] rounded-[10px] bg-white focus:ring-0 focus:border-[#1a56c4] focus:shadow-[0_0_0_3px_rgba(26,86,196,0.12)] outline-none transition-all resize-y text-[#334155]"
        />
      ) : type === 'select' ? (
        <select
          value={value as string}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full h-[44px] md:h-[48px] px-3 text-[15px] border-[1.5px] border-[#e2e8f0] rounded-[10px] bg-white focus:ring-0 focus:border-[#1a56c4] focus:shadow-[0_0_0_3px_rgba(26,86,196,0.12)] outline-none transition-all text-[#334155]"
        >
          <option value="" disabled>Select {label}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : type === 'tags' ? (
        <div className="min-h-[44px] md:h-auto p-2 border-[1.5px] border-[#e2e8f0] rounded-[10px] bg-white focus-within:border-[#1a56c4] focus-within:shadow-[0_0_0_3px_rgba(26,86,196,0.12)] transition-all flex flex-wrap gap-2 items-center">
          <div className="flex flex-wrap gap-2 mt-2">
            {(Array.isArray(value) ? value as string[] : []).map((tag, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-700 text-[12px] font-medium px-3 py-1 rounded-full flex items-center">
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-2 text-gray-400 hover:text-red-500 font-bold px-1">×</button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder={Array.isArray(value) && value.length > 0 ? "Add another..." : "Type and press Enter"}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-[15px] text-[#334155] px-1"
          />
        </div>
      ) : (
        <div className="relative flex items-center">
          {prefix && <span className="absolute left-3 text-gray-500 font-medium">{prefix}</span>}
          <input
            type={type}
            value={value as string}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full h-[44px] md:h-[48px] text-[15px] border-[1.5px] border-[#e2e8f0] rounded-[10px] bg-white focus:ring-0 focus:border-[#1a56c4] focus:shadow-[0_0_0_3px_rgba(26,86,196,0.12)] outline-none transition-all text-[#334155] ${prefix ? 'pl-8' : 'px-3'} ${suffix ? 'pr-16' : ''}`}
          />
          {suffix && <span className="absolute right-3 text-gray-500 text-[14px]">{suffix}</span>}
        </div>
      )}
    </div>
  );
}
