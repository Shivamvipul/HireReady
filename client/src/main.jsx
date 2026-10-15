import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { useAuth } from './store/authStore';
import './index.css';

useAuth.getState().init();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
      <Toaster position="top-right" toastOptions={{ style: { background: '#ffffff', color: '#17342e', border: '1px solid #dbe4de', borderRadius: '12px', boxShadow: '0 8px 24px rgba(23,52,46,0.12)' } }} />
    </BrowserRouter>
  </React.StrictMode>
);
