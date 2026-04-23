import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { KeyValue } from '../../types/workflow';

// ─── Field ────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}
export const Field: React.FC<FieldProps> = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

// ─── TextInput ────────────────────────────────────────────────
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export const TextInput: React.FC<TextInputProps> = (props) => (
  <input
    {...props}
    className={`w-full px-3 py-2 text-sm bg-white border border-border rounded-lg
      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
      placeholder:text-gray-300 transition-all ${props.className || ''}`}
  />
);

// ─── Textarea ─────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export const Textarea: React.FC<TextareaProps> = (props) => (
  <textarea
    {...props}
    rows={props.rows || 3}
    className={`w-full px-3 py-2 text-sm bg-white border border-border rounded-lg
      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
      placeholder:text-gray-300 transition-all resize-none ${props.className || ''}`}
  />
);

// ─── Select ───────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}
export const Select: React.FC<SelectProps> = ({ options, placeholder, ...props }) => (
  <select
    {...props}
    className={`w-full px-3 py-2 text-sm bg-white border border-border rounded-lg
      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
      transition-all appearance-none cursor-pointer ${props.className || ''}`}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

// ─── Toggle ───────────────────────────────────────────────────
interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}
export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0
        ${checked ? 'bg-primary' : 'bg-gray-200'}`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm
          transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </div>
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

// ─── KeyValue editor ──────────────────────────────────────────
interface KVEditorProps {
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}
export const KVEditor: React.FC<KVEditorProps> = ({
  items,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}) => {
  const update = (i: number, field: 'key' | 'value', val: string) => {
    const next = items.map((item, idx) => idx === i ? { ...item, [field]: val } : item);
    onChange(next);
  };
  const add = () => onChange([...items, { key: '', value: '' }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-1.5 items-center">
          <TextInput
            value={item.key}
            onChange={e => update(i, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            className="flex-1 text-xs"
          />
          <TextInput
            value={item.value}
            onChange={e => update(i, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            className="flex-1 text-xs"
          />
          <button
            onClick={() => remove(i)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark font-medium transition-colors"
      >
        <Plus size={13} />
        Add field
      </button>
    </div>
  );
};

// ─── Section divider ──────────────────────────────────────────
export const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-dashed border-border pb-1">
      {title}
    </div>
    {children}
  </div>
);
