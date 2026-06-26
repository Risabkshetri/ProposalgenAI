import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface ColumnDef {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  width?: string;
}

interface TableEditorProps {
  label: string;
  items: Record<string, string>[];
  columns: ColumnDef[];
  onChange: (items: Record<string, string>[]) => void;
  onAdd: () => void;
}

export default function TableEditor({ label, items = [], columns, onChange, onAdd }: TableEditorProps) {
  
  const handleItemChange = (index: number, key: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    onChange(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  // Simple drag and drop using HTML5
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex === dropIndex) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    onChange(newItems);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wide flex items-center">
          <div className="w-1.5 h-4 bg-[#1a56c4] rounded-full mr-2"></div>
          {label}
        </label>
        <button
          onClick={onAdd}
          className="text-[#1a56c4] hover:bg-blue-50 px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
        </button>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        {/* Header */}
        <div className="flex bg-gray-50 border-b border-gray-200 p-2">
          <div className="w-8 flex-shrink-0"></div>
          {columns.map(col => (
            <div key={col.key} className="text-[11px] font-bold text-gray-500 uppercase px-2" style={{ width: col.width || `${100 / columns.length}%` }}>
              {col.label}
            </div>
          ))}
          <div className="w-8 flex-shrink-0"></div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="flex p-2 items-start group hover:bg-gray-50 transition-colors"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="w-8 flex-shrink-0 flex items-center justify-center pt-2 cursor-grab text-gray-300 hover:text-gray-500">
                <GripVertical className="w-4 h-4" />
              </div>
              
              {columns.map(col => (
                <div key={col.key} className="px-2" style={{ width: col.width || `${100 / columns.length}%` }}>
                  {col.type === 'textarea' ? (
                    <textarea
                      value={item[col.key] || ''}
                      onChange={(e) => handleItemChange(index, col.key, e.target.value)}
                      className="w-full text-[13px] bg-transparent border border-transparent hover:border-gray-200 focus:border-[#1a56c4] focus:bg-white rounded-md p-1.5 focus:outline-none transition-all resize-none min-h-[60px]"
                      placeholder={`Enter ${col.label.toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={item[col.key] || ''}
                      onChange={(e) => handleItemChange(index, col.key, e.target.value)}
                      className="w-full text-[13px] font-medium bg-transparent border border-transparent hover:border-gray-200 focus:border-[#1a56c4] focus:bg-white rounded-md p-1.5 focus:outline-none transition-all"
                      placeholder={`Enter ${col.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}

              <div className="w-8 flex-shrink-0 flex items-center justify-center pt-2">
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-[13px]">
              No rows added yet. Click &quot;Add Row&quot; to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
