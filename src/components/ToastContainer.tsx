import React, { useEffect } from 'react';
import { ToastMessage } from '../types/toast';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  X, 
  Bell, 
  BellOff
} from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  permissionStatus: NotificationPermission | 'unsupported';
  onRequestPermission: () => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  permissionStatus,
  onRequestPermission
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      
      {/* Active Toasts List */}
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-2xl shadow-2xl border transition-all duration-300 transform translate-y-0 backdrop-blur-md ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50'
                : isError
                ? 'bg-slate-900/95 border-rose-500/40 text-rose-100 shadow-rose-950/50'
                : isWarning
                ? 'bg-slate-900/95 border-amber-500/40 text-amber-100 shadow-amber-950/50'
                : 'bg-slate-900/95 border-cyan-500/40 text-cyan-100 shadow-cyan-950/50'
            }`}
            role="alert"
          >
            {/* Icon */}
            <div className="shrink-0 mr-3 mt-0.5">
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-400 animate-pulse" />}
              {isError && <XCircle className="h-5 w-5 text-rose-400 animate-bounce" />}
              {isWarning && <AlertTriangle className="h-5 w-5 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="h-5 w-5 text-cyan-400" />}
            </div>

            {/* Content */}
            <div className="flex-1 text-xs space-y-0.5 pr-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  {toast.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono ml-2">
                  {toast.timestamp}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans mt-1">
                {toast.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              title="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}

    </div>
  );
};
