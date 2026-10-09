import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

type Scheme = {
  bg: string;
  color: string;
  dot: string;
};

function getScheme(s: string): Scheme {
  switch (s) {
    case 'hired':
    case 'verified':
    case 'active':
      return {
        bg:     'bg-green-100',
        color:  'text-green-800',
        dot:    'bg-green-500',
      };
    case 'applied':
    case 'viewed':
      return {
        bg:     'bg-blue-100',
        color:  'text-blue-800',
        dot:    'bg-blue-500',
      };
    case 'shortlisted':
    case 'pending':
      return {
        bg:     'bg-yellow-100',
        color:  'text-yellow-800',
        dot:    'bg-yellow-500',
      };
    case 'rejected':
    case 'closed':
      return {
        bg:     'bg-red-100',
        color:  'text-red-800',
        dot:    'bg-red-500',
      };
    default:
      return {
        bg:     'bg-gray-100',
        color:  'text-gray-800',
        dot:    'bg-gray-500',
      };
  }
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const s = getScheme(status.toLowerCase());
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize tracking-wide select-none ${s.bg} ${s.color} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {status}
    </span>
  );
};
