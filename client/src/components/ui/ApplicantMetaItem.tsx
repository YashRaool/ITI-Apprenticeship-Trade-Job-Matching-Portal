import React from 'react';

interface ApplicantMetaItemProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

export const ApplicantMetaItem: React.FC<ApplicantMetaItemProps> = ({ icon, label, value }) => {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-ink-secondary uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
        {icon && <span className="text-ink-muted">{icon}</span>}
        {label}
      </span>
      <span className="text-sm font-medium text-ink-primary truncate" title={typeof value === 'string' ? value : undefined}>
        {value}
      </span>
    </div>
  );
};
