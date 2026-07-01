import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PhiFinancialTerminal from "./PhiFinancialTerminal.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PhiFinancialTerminal />
  </StrictMode>,
)
