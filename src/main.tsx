import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ArtPreview } from './components/ArtPreview';
import './styles.css';

// Dev-only illustration gallery at #/art and #/art/<id>.
const artRoute = import.meta.env.DEV ? /^#\/art(?:\/([\w-]+))?$/.exec(location.hash) : null;
if (import.meta.env.DEV) window.addEventListener('hashchange', () => { if (/^#\/art/.test(location.hash) !== !!artRoute) location.reload(); });

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Could not find root element to mount to');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      {artRoute ? <ArtPreview id={artRoute[1]} /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>,
);
