import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // මේක අනිවාර්යයෙන්ම import කරන්න
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* App එක මේක ඇතුළට දාන්න */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)