import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import VisualBuilder from './pages/VisualBuilder.tsx'
import StyleGuide from './pages/StyleGuide.tsx'
import PageManager from './pages/PageManager.tsx'
import Preview from './pages/Preview.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VisualBuilder />} />
        <Route path="/visual-builder" element={<VisualBuilder />} />
        <Route path="/styleguide" element={<StyleGuide />} />
        <Route path="/pages" element={<PageManager />} />
        <Route path="/preview/*" element={<Preview />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
