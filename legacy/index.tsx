import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { installReportErrorFilter } from './utils/caughtErrors';
import './index.css';

installReportErrorFilter();

/** Last line of defence: anything unexpected shows a message and a reset, never a blank page. */
class RootBoundary extends Component<{ children: React.ReactNode }, { error: unknown; key: number }> {
  state = { error: null as unknown, key: 0 };
  static getDerivedStateFromError(error: unknown) {
    return { error };
  }
  componentDidCatch(error: unknown) {
    console.error('[scale] app crashed', error);
  }
  reset = () => {
    // Drop whatever deep link led here, then remount from defaults.
    history.replaceState(null, '', window.location.pathname + window.location.search);
    this.setState((s) => ({ error: null, key: s.key + 1 }));
  };
  render() {
    if (this.state.error) {
      return (
        <div role="alert" className="flex h-full flex-col items-center justify-center gap-4 bg-cosmos p-6 text-center text-white">
          <p className="text-lg font-semibold">Something went wrong.</p>
          <p className="max-w-sm text-sm text-white/75">The view could not be drawn. Resetting returns to the default comparison.</p>
          <button type="button" onClick={this.reset} className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent/80">
            Reset
          </button>
        </div>
      );
    }
    return <React.Fragment key={this.state.key}>{this.props.children}</React.Fragment>;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RootBoundary>
      <App />
    </RootBoundary>
  </React.StrictMode>,
);
