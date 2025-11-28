
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  // If we can't find root, write to body so user sees something
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Critical Error: Could not find root element.</div>';
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Application crashed during render:", error);
  rootElement.innerHTML = `<div style="color: #ef4444; padding: 20px; font-family: monospace;">
    <h1>Application Failed to Start</h1>
    <p>Please check the console for details.</p>
    <pre>${error instanceof Error ? error.message : String(error)}</pre>
  </div>`;
}
