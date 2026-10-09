import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  rightContent?: React.ReactNode;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  rightContent,
  badge,
}) => {
  return (
    <div className="mb-8 pt-2">
      {onBack && (
        <motion.button
          type="button"
          onClick={onBack}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18 }}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors px-2 py-1.5 -ml-2 rounded-lg hover:bg-blue-50"
        >
          <ArrowLeft size={15} />
          <span>{backLabel}</span>
        </motion.button>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-[2rem] font-extrabold text-gray-900 tracking-tight leading-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="mt-1.5 text-gray-500 text-sm sm:text-base leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </motion.div>

        {rightContent && (
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};
