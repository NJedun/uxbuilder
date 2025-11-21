import { useBuilderStore } from '../store/builderStore';
import { useRef } from 'react';

export default function Toolbar() {
  const { projectName, setProjectName, exportProject, importProject, clearProject, saveToLocalStorage } = useBuilderStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">Zont UX Builder</h1>
        <input
          type="text"
          value={projectName}
          onChange={handleProjectNameChange}
          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Project name"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleNew}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium text-sm"
        >
          New
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
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium text-sm cursor-pointer"
        >
          Import
        </label>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium text-sm"
        >
          Export JSON
        </button>
      </div>
    </div>
  );
}
