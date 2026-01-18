import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GroupProvider } from './context/GroupContext'
import './index.css'
import App from './App.jsx'

// Initialize OneSignal after page loads
if (typeof window !== 'undefined') {
  // Wait for OneSignal to be available
  const initOneSignal = () => {
    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async function(OneSignal) {
        try {
          await OneSignal.init({
            appId: "d1ed5b32-2eed-44b7-9b70-747de55a3573",
            allowLocalhostAsSecureOrigin: true,
          });
          console.log('OneSignal initialized successfully!');
        } catch (error) {
          console.error('OneSignal init error:', error);
        }
      });
    } else {
      // If OneSignal isn't loaded yet, try again in 100ms
      setTimeout(initOneSignal, 100);
    }
  };
  
  // Start trying to initialize
  setTimeout(initOneSignal, 500);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GroupProvider>
          <App />
        </GroupProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)