import React from 'react';
import { base44 } from '@/api/base44Client';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console
    // eslint-disable-next-line no-console
    console.error('UI ErrorBoundary caught:', error, info);
    // Send to backend logs (best effort)
    base44.functions.invoke('logEvent', {
      level: 'error',
      message: 'ErrorBoundary',
      details: error?.stack || String(error),
      context: { componentStack: info?.componentStack || '' },
      path: typeof window !== 'undefined' ? window.location.pathname : ''
    }).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto p-6 my-10 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <h2 className="text-xl font-semibold mb-2">Qualcosa è andato storto</h2>
          <p className="text-sm">Riprova più tardi. L'errore è stato registrato.</p>
      </div>
      );
    }
    return this.props.children;
  }
}