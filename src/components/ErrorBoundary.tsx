import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State { error: Error | null; }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Scale of Everything crashed', error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="error-screen">
        <div>
          <h1>Something broke on the way to the cosmos.</h1>
          <p>Reload the page to try again. If it keeps happening, the details below will help.</p>
          <pre>{String(this.state.error?.stack || this.state.error)}</pre>
          <button className="iconbtn iconbtn--primary" onClick={() => location.reload()}>Reload</button>
        </div>
      </div>
    );
  }
}
