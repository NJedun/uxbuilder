import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import VisualBuilder from './pages/VisualBuilder.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/ux-builder" replace />} />
        <Route path="/ux-builder" element={<App />} />
        <Route path="/visual-builder" element={<VisualBuilder />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
