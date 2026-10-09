import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading content...' }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="relative w-12 h-12 mb-4">
      <div className="absolute inset-0 w-12 h-12 rounded-full animate-ping border-2 border-blue-200" />
      <div className="w-12 h-12 rounded-full animate-spin border-2 border-blue-600 border-t-transparent" />
    </div>
    <p className="text-sm text-gray-500 font-medium tracking-wide">{message}</p>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="p-6 rounded-xl text-center max-w-md mx-auto my-8 shadow-sm bg-red-50 border border-red-200">
    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
    <p className="text-sm font-medium mb-4 text-red-800">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors bg-red-600 hover:bg-red-700 text-white"
      >
        <RefreshCw size={14} />
        <span>Try Again</span>
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{
  message: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ message, description, icon, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-6 bg-white border border-gray-200 border-dashed rounded-2xl text-center my-4"
  >
    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 shadow-sm text-gray-400">
      {icon ?? <Inbox size={26} className="text-gray-400" />}
    </div>
    <h4 className="text-base font-bold text-gray-900 mb-1">{message}</h4>
    {description && (
      <p className="text-xs sm:text-sm text-gray-500 max-w-sm mb-4 leading-relaxed">{description}</p>
    )}
    {action && <div className="mt-2">{action}</div>}
  </motion.div>
);
