import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[var(--bg-base)] text-white gap-6 p-8">
        <div className="text-5xl font-display font-bold uppercase tracking-tight">Something broke</div>
        <p className="text-white/40 text-sm uppercase tracking-widest max-w-md text-center">
          {this.state.error?.message ?? 'An unexpected error occurred.'}
        </p>
        <button
          onClick={this.handleReset}
          className="mt-4 px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-white/90 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }
}
