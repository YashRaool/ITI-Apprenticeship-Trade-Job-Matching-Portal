import React from 'react';
import { ExternalLink } from 'lucide-react';

interface CertificationChipProps {
  title: string;
  url: string;
  status: string;
}

export const CertificationChip: React.FC<CertificationChipProps> = ({ title, url, status }) => {
  const isVerified = status === 'verified';
  const isPending  = status === 'pending';

  const chipStyle: React.CSSProperties = isVerified
    ? { background: 'var(--color-status-green-bg)', border: '1px solid var(--color-status-green-border)', color: 'var(--color-status-green)' }
    : isPending
    ? { background: 'var(--color-status-sky-bg)', border: '1px solid var(--color-status-sky-border)', color: 'var(--color-status-sky)' }
    : { background: 'var(--color-status-red-bg)', border: '1px solid var(--color-status-red-border)', color: 'var(--color-status-red)' };

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all hover:shadow-sm"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium truncate max-w-[180px] sm:max-w-[260px] hover:underline flex items-center gap-1"
        style={{ color: 'var(--color-teal)' }}
        title={title}
      >
        <ExternalLink size={11} className="shrink-0" />
        {title}
      </a>
      <span
        className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold shrink-0"
        style={chipStyle}
      >
        {status}
      </span>
    </div>
  );
};
