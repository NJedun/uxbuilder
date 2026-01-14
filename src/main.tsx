import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { ToastProvider } from './components/Toast'
import { ConfirmProvider } from './components/ConfirmDialog'
import VisualBuilder from './pages/VisualBuilder.tsx'
import PageManager from './pages/PageManager.tsx'
import LayoutManager from './pages/LayoutManager.tsx'
import LayoutEditor from './pages/LayoutEditor.tsx'
import Preview from './pages/Preview.tsx'
import ContentIntake from './pages/ContentIntake.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ConfirmProvider>
          <Routes>
            <Route path="/" element={<VisualBuilder />} />
            <Route path="/visual-builder" element={<VisualBuilder />} />
            <Route path="/pages" element={<PageManager />} />
            <Route path="/layouts" element={<LayoutManager />} />
            <Route path="/layout-editor" element={<LayoutEditor />} />
            <Route path="/content-intake" element={<ContentIntake />} />
            <Route path="/preview/*" element={<Preview />} />
          </Routes>
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
