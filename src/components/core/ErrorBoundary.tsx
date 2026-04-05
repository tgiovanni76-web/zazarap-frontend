import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: any;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error } as State;
  }

  componentDidCatch(error: any, info: any) {
    // Basic logging – could be extended to send to backend
    // eslint-disable-next-line no-console
    console.error('UI ErrorBoundary caught:', error, info);
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