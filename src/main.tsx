import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import VisualBuilder from './pages/VisualBuilder.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VisualBuilder />} />
        <Route path="/visual-builder" element={<VisualBuilder />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
