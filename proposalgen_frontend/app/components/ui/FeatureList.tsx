'use client';
import React, { useState, useRef } from 'react';
import { GripVertical, Trash2, Plus, Check, X } from 'lucide-react';
import { ProposalData } from '../types';

interface FeatureListProps {
  label: string;
  field: keyof ProposalData;
  formData: ProposalData | null;
  handleInputChange: (field: keyof ProposalData, value: string | string[]) => void;
}

export default function FeatureList({ label, field, formData, handleInputChange }: FeatureListProps) {
  const items: string[] = (Array.isArray(formData?.[field]) ? formData![field] : []) as string[];

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newValue, setNewValue] = useState('');

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const update = (newItems: string[]) => handleInputChange(field, newItems);

  // Inline edit
  const startEdit = (i: number) => {
    setEditingIndex(i);
    setEditValue(items[i]);
  };

  const confirmEdit = () => {
    if (editingIndex === null) return;
    if (editValue.trim()) {
      const next = [...items];
      next[editingIndex] = editValue.trim();
      update(next);
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  // Delete
  const deleteItem = (i: number) => {
    update(items.filter((_, idx) => idx !== i));
    if (editingIndex === i) setEditingIndex(null);
  };

  // Add new
  const confirmAdd = () => {
    if (newValue.trim()) {
      update([...items, newValue.trim()]);
    }
    setNewValue('');
    setAddingNew(false);
  };

  const cancelAdd = () => {
    setNewValue('');
    setAddingNew(false);
  };

  // Drag and drop
  const onDragStart = (i: number) => {
    dragIndex.current = i;
    setDragging(i);
  };

  const onDragEnter = (i: number) => {
    dragOverIndex.current = i;
    setDragOver(i);
  };

  const onDragEnd = () => {
    if (
      dragIndex.current !== null &&
      dragOverIndex.current !== null &&
      dragIndex.current !== dragOverIndex.current
    ) {
      const next = [...items];
      const [moved] = next.splice(dragIndex.current, 1);
      next.splice(dragOverIndex.current, 0, moved);
      update(next);
    }
    dragIndex.current = null;
    dragOverIndex.current = null;
    setDragging(null);
    setDragOver(null);
  };

  const hasItems = items.length > 0;

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">{label}</label>
        {hasItems && (
          <span className="flex items-center text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
            AI filled
          </span>
        )}
      </div>

      <div className="border-[1.5px] border-[#e2e8f0] rounded-[10px] bg-white overflow-hidden">
        {items.map((item, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragEnter={() => onDragEnter(i)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`flex items-center group border-b border-[#f1f5f9] last:border-b-0 transition-all
              ${dragging === i ? 'opacity-40' : ''}
              ${dragOver === i && dragging !== i ? 'bg-blue-50' : 'hover:bg-gray-50'}
            `}
          >
            {/* Grip handle */}
            <div className="px-2 py-3 cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-400 flex-shrink-0 select-none">
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Row number */}
            <span className="text-[11px] font-bold text-gray-300 w-5 flex-shrink-0 select-none">{i + 1}.</span>

            {/* Content or edit input */}
            {editingIndex === i ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmEdit();
                  if (e.key === 'Escape') cancelEdit();
                }}
                className="flex-1 py-2 px-2 text-[14px] text-[#334155] bg-blue-50 outline-none border-l-2 border-[#1a56c4]"
              />
            ) : (
              <span
                onClick={() => startEdit(i)}
                title="Click to edit"
                className="flex-1 py-3 px-2 text-[14px] text-[#334155] cursor-text leading-snug"
              >
                {item}
              </span>
            )}

            {/* Action buttons */}
            {editingIndex === i ? (
              <div className="flex gap-1 px-2 flex-shrink-0">
                <button
                  onClick={confirmEdit}
                  className="w-6 h-6 rounded flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => deleteItem(i)}
                className="px-3 py-3 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* Add new row */}
        {addingNew ? (
          <div className="flex items-center border-t border-[#e2e8f0] bg-blue-50/50">
            <div className="px-2 py-3 text-blue-200 flex-shrink-0">
              <GripVertical className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-blue-200 w-5 flex-shrink-0">{items.length + 1}.</span>
            <input
              autoFocus
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmAdd();
                if (e.key === 'Escape') cancelAdd();
              }}
              placeholder="Type feature and press Enter..."
              className="flex-1 py-2 px-2 text-[14px] text-[#334155] bg-transparent outline-none"
            />
            <div className="flex gap-1 px-2 flex-shrink-0">
              <button
                onClick={confirmAdd}
                className="w-6 h-6 rounded flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={cancelAdd}
                className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingNew(true)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-[#1a56c4] hover:bg-blue-50 transition-colors border-t border-[#f1f5f9]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add feature
          </button>
        )}
      </div>
    </div>
  );
}
