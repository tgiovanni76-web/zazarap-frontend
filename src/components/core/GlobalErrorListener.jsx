import React, { useEffect } from 'react';
import { useLogger } from '@/components/logging/useLogger';

export default function GlobalErrorListener() {
  const { logError } = useLogger();

  useEffect(() => {
    const onError = (event) => {
      logError('window.error', {
        message: event?.message,
        filename: event?.filename,
        lineno: event?.lineno,
        colno: event?.colno,
        error: event?.error?.stack || String(event?.error || '')
      });
    };
    const onRejection = (event) => {
      logError('unhandledrejection', {
        reason: event?.reason?.stack || String(event?.reason || '')
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, [logError]);

  return null;
}