import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import VisualBuilder from './pages/VisualBuilder.tsx'
import PageManager from './pages/PageManager.tsx'
import LayoutManager from './pages/LayoutManager.tsx'
import LayoutEditor from './pages/LayoutEditor.tsx'
import Preview from './pages/Preview.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VisualBuilder />} />
        <Route path="/visual-builder" element={<VisualBuilder />} />
        <Route path="/pages" element={<PageManager />} />
        <Route path="/layouts" element={<LayoutManager />} />
        <Route path="/layout-editor" element={<LayoutEditor />} />
        <Route path="/preview/*" element={<Preview />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
