import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// O vite-plugin-pwa injeta o registro do service worker automaticamente
// quando configurado com 'autoUpdate' no vite.config.ts

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);