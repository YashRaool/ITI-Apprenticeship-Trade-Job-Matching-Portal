import React from 'react';

export const FormSection: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="flex flex-col gap-4 py-6 border-b border-base-border last:border-b-0">
    <div>
      <h3 className="text-base sm:text-lg font-bold text-ink-primary tracking-tight">{title}</h3>
      {description && <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">{description}</p>}
    </div>
    <div className="grid gap-4 sm:gap-5">{children}</div>
  </div>
);

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ children, required, className = '', ...props }) => (
  <label className={`block text-xs sm:text-sm font-semibold text-ink-secondary tracking-wide mb-1.5 ${className}`} {...props}>
    {children} {required && <span className="text-sky">*</span>}
  </label>
);

const inputBaseClass =
  'w-full bg-base-muted border border-base-border rounded-lg px-3.5 py-2.5 text-sm text-ink-primary placeholder-ink-muted outline-none transition-all duration-150 focus:border-teal focus:ring-1 focus:ring-teal disabled:opacity-50 disabled:cursor-not-allowed';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input ref={ref} className={`${inputBaseClass} ${props.className || ''}`} {...props} />
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  (props, ref) => (
    <textarea
      ref={ref}
      className={`${inputBaseClass} resize-y min-h-[110px] leading-relaxed ${props.className || ''}`}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  (props, ref) => (
    <div className="relative">
      <select ref={ref} className={`${inputBaseClass} appearance-none pr-10 cursor-pointer ${props.className || ''}`} {...props}>
        {props.children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-secondary">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
);
Select.displayName = 'Select';
