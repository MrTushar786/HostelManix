import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter';
import { NotificationContainer } from './components/Notification';
import { DialogProvider } from './components/DialogProvider';
import './css/theme.css';
import './css/VisibilityFixes.css';
import { SpeedInsights } from "@vercel/speed-insights/react";

function SessionWrapper() {
  useEffect(() => {
    let last = Date.now();
    const LIMIT = 30 * 60 * 1000; // 30 minutes
    const onActivity = () => {
      last = Date.now();
    };
    const timer = setInterval(() => {
      const token = sessionStorage.getItem('token');
      if (token && Date.now() - last > LIMIT) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('studentId');
        window.location.href = '/';
      }
    }, 60 * 1000);
    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('click', onActivity);
    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('click', onActivity);
    };
  }, []);
  return (
    <>
      <AppRouter />
      <NotificationContainer />
      <DialogProvider />
    </>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <SpeedInsights />
    <SessionWrapper />
  </StrictMode>
);
