import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GroupProvider } from './context/GroupContext'
import './index.css'
import App from './App.jsx'

// Initialize OneSignal after page loads
if (typeof window !== 'undefined') {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "d1ed5b32-2eed-44b7-9b70-747de55a3573",
      allowLocalhostAsSecureOrigin: true,
    });
  });
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