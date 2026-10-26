import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// Tipografías incluidas en el proyecto (subconjunto latino): no dependen de servicios externos
import '@fontsource/anton/latin-400.css'
import '@fontsource/permanent-marker/latin-400.css'
import '@fontsource/courier-prime/latin-400.css'
import '@fontsource/courier-prime/latin-700.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
