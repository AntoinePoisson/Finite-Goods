import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

import { App } from './app/App';
import { StoreProvider } from './app/StoreProvider';
import { appPath } from './infrastructure/routing';
import './styles/global.css';

const app = (
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>
);
const root = document.getElementById('root')!;

// Only the homepage is pre-rendered. Route shells from GitHub Pages start with an empty root.
if (root.hasChildNodes() && appPath() === '/') hydrateRoot(root, app);
else {
  root.replaceChildren();
  createRoot(root).render(app);
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    // Registration is deferred because offline support should never delay the first render.
    const register = () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
    if ('requestIdleCallback' in window) window.requestIdleCallback(() => void register());
    else globalThis.setTimeout(() => void register(), 1000);
  });
}
