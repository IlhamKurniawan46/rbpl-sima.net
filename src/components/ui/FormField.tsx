'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  as?: 'input' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, as = 'input', options, className = '', id, ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
    const baseClass = `w-full h-11 px-3.5 text-sm bg-white border rounded-xl transition-colors duration-200 outline-none
      ${error
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
        : 'border-border focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100'
      }`;

    return (
      <div className="space-y-1.5">
        <label htmlFor={fieldId} className="block text-xs font-semibold text-text-primary">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>

        {as === 'textarea' ? (
          <textarea
            id={fieldId}
            className={`${baseClass} min-h-[100px] py-2.5 resize-none ${className}`}
            {...(props as InputHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : as === 'select' ? (
          <select
            id={fieldId}
            className={`${baseClass} ${className}`}
            {...(props as InputHTMLAttributes<HTMLSelectElement>)}
          >
            <option value="">Pilih...</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            ref={ref}
            id={fieldId}
            className={`${baseClass} ${className}`}
            {...props}
          />
        )}

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
