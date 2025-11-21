import { useEffect } from 'react';
import { useBuilderStore } from '../store/builderStore';

export function useAutoSave() {
  const { componentsByViewport, canvasSettingsByViewport, viewport, projectName, saveToLocalStorage } = useBuilderStore();

  useEffect(() => {
    // Auto-save whenever any of these values change
    const timeoutId = setTimeout(() => {
      saveToLocalStorage();
    }, 500); // Debounce by 500ms

    return () => clearTimeout(timeoutId);
  }, [componentsByViewport, canvasSettingsByViewport, viewport, projectName, saveToLocalStorage]);
}
