import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GroupProvider } from './context/GroupContext'
import './index.css'
import App from './App.jsx'
import OneSignal from 'react-onesignal';

// Initialize OneSignal
async function initOneSignal() {
  try {
    await OneSignal.init({
      appId: "d1ed5b32-2eed-44b7-9b70-747de55a3573",
      allowLocalhostAsSecureOrigin: true,
    });
    console.log('OneSignal initialized')
  } catch (error) {
    console.error('OneSignal init error:', error)
  }
}

initOneSignal()

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