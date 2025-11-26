import { useBuilderStore } from '../store/builderStore';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useTheme } from '../contexts/ThemeContext';

export default function Toolbar() {
  const { projectName, setProjectName, exportProject, importProject, clearProject, saveToLocalStorage } = useBuilderStore();
  const { theme, updateTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const themeInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const projectData = exportProject();
    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);
        importProject(data);
        saveToLocalStorage(); // Save to localStorage after import
        alert(`Project "${data.name}" imported successfully!`);
      } catch (error) {
        alert('Failed to import project. Invalid JSON file.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNew = () => {
    if (confirm('Create a new project? Current work will be lost if not exported.')) {
      clearProject();
      saveToLocalStorage(); // Clear localStorage
    }
  };

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
    saveToLocalStorage(); // Auto-save on name change
  };

  const handleExportPNG = async () => {
    // Select the main canvas container that holds all three sections
    const canvasElement = document.querySelector('.mx-auto.bg-white.shadow-lg') as HTMLElement;
    if (!canvasElement) {
      alert('Canvas not found');
      return;
    }

    try {
      // Hide section labels and resize handles before export
      const labels = canvasElement.querySelectorAll('.absolute.top-2.left-2');
      const resizeHandles = document.querySelectorAll('.cursor-ns-resize');
      const sections = canvasElement.querySelectorAll('.border-dashed');

      labels.forEach((label) => (label as HTMLElement).style.display = 'none');
      resizeHandles.forEach((handle) => (handle as HTMLElement).style.display = 'none');
      sections.forEach((section) => {
        (section as HTMLElement).classList.remove('border-dashed');
        (section as HTMLElement).style.border = 'none';
      });

      const canvas = await html2canvas(canvasElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
      });

      // Restore visibility
      labels.forEach((label) => (label as HTMLElement).style.display = '');
      resizeHandles.forEach((handle) => (handle as HTMLElement).style.display = '');
      sections.forEach((section) => {
        (section as HTMLElement).classList.add('border-dashed');
        (section as HTMLElement).style.border = '';
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Failed to export PNG:', error);
      alert('Failed to export PNG');
    }
  };

  const handleExportTheme = () => {
    const json = JSON.stringify(theme, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_theme_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const themeData = JSON.parse(json);
        updateTheme(themeData);
        alert('Theme imported successfully!');
      } catch (error) {
        alert('Failed to import theme. Invalid JSON file.');
        console.error('Theme import error:', error);
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be imported again
    if (themeInputRef.current) {
      themeInputRef.current.value = '';
    }
  };

  const handleClearTheme = () => {
    if (confirm('Reset theme to default? This will clear all custom theme styles.')) {
      localStorage.removeItem('uxBuilder_theme');
      window.location.reload();
    }
  };

  const handleExportPDF = async () => {
    // Select the main canvas container that holds all three sections
    const canvasElement = document.querySelector('.mx-auto.bg-white.shadow-lg') as HTMLElement;
    if (!canvasElement) {
      alert('Canvas not found');
      return;
    }

    try {
      // Hide section labels and resize handles before export
      const labels = canvasElement.querySelectorAll('.absolute.top-2.left-2');
      const resizeHandles = document.querySelectorAll('.cursor-ns-resize');
      const sections = canvasElement.querySelectorAll('.border-dashed');

      labels.forEach((label) => (label as HTMLElement).style.display = 'none');
      resizeHandles.forEach((handle) => (handle as HTMLElement).style.display = 'none');
      sections.forEach((section) => {
        (section as HTMLElement).classList.remove('border-dashed');
        (section as HTMLElement).style.border = 'none';
      });

      const canvas = await html2canvas(canvasElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
      });

      // Restore visibility
      labels.forEach((label) => (label as HTMLElement).style.display = '');
      resizeHandles.forEach((handle) => (handle as HTMLElement).style.display = '');
      sections.forEach((section) => {
        (section as HTMLElement).classList.add('border-dashed');
        (section as HTMLElement).style.border = '';
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate PDF dimensions (A4 or custom based on canvas aspect ratio)
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF');
    }
  };

  return (
    <div className="min-h-16 bg-white border-b border-gray-200 px-2 sm:px-6 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">UX Builder</h1>
        <input
          type="text"
          value={projectName}
          onChange={handleProjectNameChange}
          className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Project name"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
        <button
          onClick={handleNew}
          className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
        >
          New
        </button>

        <button
          onClick={handleClearTheme}
          className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
        >
          Clear Theme
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          id="import-input"
        />
        <label
          htmlFor="import-input"
          className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium text-xs sm:text-sm cursor-pointer whitespace-nowrap"
        >
          Import
        </label>

        <button
          onClick={handleExport}
          className="hidden sm:block px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium text-sm whitespace-nowrap"
        >
          Export JSON
        </button>

        <button
          onClick={handleExport}
          className="sm:hidden px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium text-xs whitespace-nowrap"
        >
          JSON
        </button>

        <button
          onClick={handleExportPNG}
          className="hidden sm:block px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors font-medium text-sm whitespace-nowrap"
        >
          Export PNG
        </button>

        <button
          onClick={handleExportPNG}
          className="sm:hidden px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors font-medium text-xs whitespace-nowrap"
        >
          PNG
        </button>

        <button
          onClick={handleExportPDF}
          className="hidden sm:block px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium text-sm whitespace-nowrap"
        >
          Export PDF
        </button>

        <button
          onClick={handleExportPDF}
          className="sm:hidden px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium text-xs whitespace-nowrap"
        >
          PDF
        </button>

        {/* Theme Export/Import */}
        <div className="hidden sm:block w-px h-8 bg-gray-300"></div>

        <input
          ref={themeInputRef}
          type="file"
          accept=".json"
          onChange={handleImportTheme}
          className="hidden"
          id="import-theme-input"
        />
        <label
          htmlFor="import-theme-input"
          className="px-3 sm:px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors font-medium text-xs sm:text-sm cursor-pointer whitespace-nowrap"
        >
          Import Theme
        </label>

        <button
          onClick={handleExportTheme}
          className="hidden sm:block px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors font-medium text-sm whitespace-nowrap"
        >
          Export Theme
        </button>

        <button
          onClick={handleExportTheme}
          className="sm:hidden px-3 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors font-medium text-xs whitespace-nowrap"
        >
          Theme
        </button>
      </div>
    </div>
  );
}
