import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const AppContainer: React.FC = () => {
  const [isSandboxMode, setIsSandboxMode] = useState(() => {
    try {
      const item = window.localStorage.getItem('isSandboxMode');
      return item ? JSON.parse(item) : false;
    } catch (error) {
      console.error("Error reading 'isSandboxMode' from localStorage", error);
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('isSandboxMode', JSON.stringify(isSandboxMode));
    } catch (error) {
      console.error("Error writing 'isSandboxMode' to localStorage", error);
    }
  }, [isSandboxMode]);

  const toggleSandboxMode = () => {
    setIsSandboxMode(prev => !prev);
  };

  return <App key={isSandboxMode ? 'sandbox' : 'dev'} isSandboxMode={isSandboxMode} toggleSandboxMode={toggleSandboxMode} />;
};


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppContainer />
  </React.StrictMode>
);