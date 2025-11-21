import { create } from 'zustand';
import { PlacedComponent, Viewport, ViewportConfig } from '../types/builder';

interface CanvasSettings {
  width: number | null;
  height: number | null;
  cols: number | null;
}

export interface ProjectData {
  version: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  viewport: Viewport;
  canvasSettingsByViewport: {
    mobile: CanvasSettings;
    tablet: CanvasSettings;
    desktop: CanvasSettings;
  };
  componentsByViewport: {
    mobile: PlacedComponent[];
    tablet: PlacedComponent[];
    desktop: PlacedComponent[];
  };
}

interface BuilderState {
  viewport: Viewport;
  canvasSettingsByViewport: {
    mobile: CanvasSettings;
    tablet: CanvasSettings;
    desktop: CanvasSettings;
  };
  componentsByViewport: {
    mobile: PlacedComponent[];
    tablet: PlacedComponent[];
    desktop: PlacedComponent[];
  };
  selectedComponents: string[];
  projectName: string;
  setViewport: (viewport: Viewport) => void;
  setCustomWidth: (width: number | null) => void;
  setCustomCols: (cols: number | null) => void;
  setCustomHeight: (height: number | null) => void;
  addComponent: (component: PlacedComponent) => void;
  updateLayout: (layout: Array<{ i: string; x: number; y: number; w: number; h: number }>) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
  removeComponent: (id: string) => void;
  setSelectedComponents: (ids: string[]) => void;
  toggleComponentSelection: (id: string) => void;
  clearSelection: () => void;
  setProjectName: (name: string) => void;
  exportProject: () => ProjectData;
  importProject: (data: ProjectData) => void;
  clearProject: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
}

export const viewportConfigs: Record<Viewport, ViewportConfig> = {
  mobile: { width: 375, cols: 4, rowHeight: 50 },
  tablet: { width: 768, cols: 8, rowHeight: 50 },
  desktop: { width: 1440, cols: 12, rowHeight: 50 },
};

const STORAGE_KEY = 'uxBuilder_project';
const VERSION = '2.0.0';

const defaultCanvasSettings: CanvasSettings = {
  width: null,
  height: null,
  cols: null,
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  viewport: 'desktop',
  canvasSettingsByViewport: {
    mobile: { ...defaultCanvasSettings },
    tablet: { ...defaultCanvasSettings },
    desktop: { ...defaultCanvasSettings },
  },
  componentsByViewport: {
    mobile: [],
    tablet: [],
    desktop: [],
  },
  selectedComponents: [],
  projectName: 'Untitled Project',
  setViewport: (viewport) => set({ viewport, selectedComponents: [] }),
  setCustomWidth: (width) => set((state) => ({
    canvasSettingsByViewport: {
      ...state.canvasSettingsByViewport,
      [state.viewport]: {
        ...state.canvasSettingsByViewport[state.viewport],
        width,
      },
    },
  })),
  setCustomCols: (cols) => set((state) => ({
    canvasSettingsByViewport: {
      ...state.canvasSettingsByViewport,
      [state.viewport]: {
        ...state.canvasSettingsByViewport[state.viewport],
        cols,
      },
    },
  })),
  setCustomHeight: (height) => set((state) => ({
    canvasSettingsByViewport: {
      ...state.canvasSettingsByViewport,
      [state.viewport]: {
        ...state.canvasSettingsByViewport[state.viewport],
        height,
      },
    },
  })),
  addComponent: (component) => set((state) => {
    // Add component only to the current viewport
    const { viewport } = state;

    return {
      componentsByViewport: {
        ...state.componentsByViewport,
        [viewport]: [...state.componentsByViewport[viewport], component],
      },
    };
  }),
  updateLayout: (layout) => set((state) => ({
    componentsByViewport: {
      ...state.componentsByViewport,
      [state.viewport]: state.componentsByViewport[state.viewport].map((comp) => {
        const layoutItem = layout.find((item) => item.i === comp.i);
        if (layoutItem) {
          return {
            ...comp,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          };
        }
        return comp;
      }),
    },
  })),
  updateComponentProps: (id, props) => set((state) => ({
    componentsByViewport: {
      ...state.componentsByViewport,
      [state.viewport]: state.componentsByViewport[state.viewport].map((comp) =>
        comp.i === id ? { ...comp, props: { ...comp.props, ...props } } : comp
      ),
    },
  })),
  removeComponent: (id) => set((state) => ({
    componentsByViewport: {
      ...state.componentsByViewport,
      [state.viewport]: state.componentsByViewport[state.viewport].filter((comp) => comp.i !== id),
    },
    selectedComponents: state.selectedComponents.filter((selectedId) => selectedId !== id),
  })),
  setSelectedComponents: (ids) => set({ selectedComponents: ids }),
  toggleComponentSelection: (id) => set((state) => ({
    selectedComponents: state.selectedComponents.includes(id)
      ? state.selectedComponents.filter((selectedId) => selectedId !== id)
      : [...state.selectedComponents, id],
  })),
  clearSelection: () => set({ selectedComponents: [] }),
  setProjectName: (name) => set({ projectName: name }),

  exportProject: () => {
    const state = get();
    const now = new Date().toISOString();

    // Get createdAt from localStorage if it exists
    let createdAt = now;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        createdAt = parsed.createdAt || now;
      }
    } catch (e) {
      // ignore
    }

    return {
      version: VERSION,
      name: state.projectName,
      createdAt,
      updatedAt: now,
      viewport: state.viewport,
      canvasSettingsByViewport: state.canvasSettingsByViewport,
      componentsByViewport: state.componentsByViewport,
    };
  },

  importProject: (data: ProjectData) => {
    // Handle migration from old formats
    let componentsByViewport = {
      mobile: [],
      tablet: [],
      desktop: [],
    };

    let canvasSettingsByViewport = {
      mobile: { ...defaultCanvasSettings },
      tablet: { ...defaultCanvasSettings },
      desktop: { ...defaultCanvasSettings },
    };

    if ((data as any).components) {
      // Version 1.0.0 - components array with viewport-specific layouts
      const oldComponents = (data as any).components;
      componentsByViewport.mobile = oldComponents.map((comp: any) => ({
        ...comp,
        x: comp.mobile?.x || 0,
        y: comp.mobile?.y || 0,
        w: comp.mobile?.w || 2,
        h: comp.mobile?.h || 2,
      }));
      componentsByViewport.tablet = oldComponents.map((comp: any) => ({
        ...comp,
        x: comp.tablet?.x || 0,
        y: comp.tablet?.y || 0,
        w: comp.tablet?.w || 2,
        h: comp.tablet?.h || 2,
      }));
      componentsByViewport.desktop = oldComponents.map((comp: any) => ({
        ...comp,
        x: comp.desktop?.x || 0,
        y: comp.desktop?.y || 0,
        w: comp.desktop?.w || 2,
        h: comp.desktop?.h || 2,
      }));

      // Old format had single canvasSettings - apply to all viewports
      if ((data as any).canvasSettings) {
        const oldSettings = (data as any).canvasSettings;
        canvasSettingsByViewport.mobile = { ...oldSettings };
        canvasSettingsByViewport.tablet = { ...oldSettings };
        canvasSettingsByViewport.desktop = { ...oldSettings };
      }
    } else if (data.componentsByViewport) {
      // Version 2.0.0 - already in correct format
      componentsByViewport = data.componentsByViewport;
      canvasSettingsByViewport = data.canvasSettingsByViewport || {
        mobile: { ...defaultCanvasSettings },
        tablet: { ...defaultCanvasSettings },
        desktop: { ...defaultCanvasSettings },
      };
    }

    set({
      projectName: data.name,
      viewport: data.viewport,
      canvasSettingsByViewport,
      componentsByViewport,
      selectedComponents: [],
    });
  },

  clearProject: () => {
    set({
      viewport: 'desktop',
      canvasSettingsByViewport: {
        mobile: { ...defaultCanvasSettings },
        tablet: { ...defaultCanvasSettings },
        desktop: { ...defaultCanvasSettings },
      },
      componentsByViewport: {
        mobile: [],
        tablet: [],
        desktop: [],
      },
      selectedComponents: [],
      projectName: 'Untitled Project',
    });
  },

  saveToLocalStorage: () => {
    try {
      const projectData = get().exportProject();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projectData));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },

  loadFromLocalStorage: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        get().importProject(data);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      return false;
    }
  },
}));
