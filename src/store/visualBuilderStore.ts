import { create } from 'zustand';

export interface VisualComponent {
  id: string;
  type: string;
  variant?: string;
  props: Record<string, any>;
  customStyles?: Record<string, any>; // Component-level style overrides
  children?: VisualComponent[];
}

export interface GlobalStyles {
  // Container defaults
  containerBackgroundColor?: string;
  containerBackgroundImage?: string;
  containerBackgroundSize?: string;
  containerBackgroundPosition?: string;
  containerBackgroundRepeat?: string;
  containerPadding?: string;
  containerBorderRadius?: string;
  containerBorderWidth?: string;
  containerBorderStyle?: string;
  containerBorderColor?: string;

  // Title defaults
  titleColor?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  titleMarginBottom?: string;

  // Subtitle/Text defaults
  subtitleColor?: string;
  subtitleFontSize?: string;
  subtitleFontWeight?: string;
  subtitleMarginBottom?: string;

  // Button defaults
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonPadding?: string;
  buttonBorderRadius?: string;
  buttonFontSize?: string;
  buttonFontWeight?: string;
  buttonBorderWidth?: string;
  buttonBorderStyle?: string;
  buttonBorderColor?: string;

  // Row/Layout defaults
  rowGap?: string;
  rowPadding?: string;
  rowBackgroundColor?: string;

  // Column defaults
  columnBackgroundColor?: string;
  columnPadding?: string;
  columnBorderRadius?: string;
}

export interface VisualProjectData {
  version: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  instructions: {
    note: string;
  };
  components: VisualComponent[];
  globalStyles: GlobalStyles;
  theme: any; // Will be managed by ThemeContext
}

interface VisualBuilderState {
  projectName: string;
  components: VisualComponent[];
  globalStyles: GlobalStyles;
  selectedComponentId: string | null;
  draggedComponentType: string | null;

  setProjectName: (name: string) => void;
  addComponent: (component: VisualComponent, parentId?: string) => void;
  updateComponent: (id: string, updates: Partial<VisualComponent>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  setDraggedComponentType: (type: string | null) => void;
  reorderComponents: (components: VisualComponent[]) => void;
  updateGlobalStyles: (updates: Partial<GlobalStyles>) => void;

  exportProject: () => VisualProjectData;
  importProject: (data: VisualProjectData) => void;
  clearProject: () => void;

  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
}

const STORAGE_KEY = 'visualBuilder_project';
const VERSION = '1.0.0';

const defaultGlobalStyles: GlobalStyles = {
  // Container defaults
  containerBackgroundColor: '#1a1a2e',
  containerPadding: '60px 40px',
  containerBorderRadius: '0',

  // Title defaults
  titleColor: '#ffffff',
  titleFontSize: '42px',
  titleFontWeight: '700',
  titleMarginBottom: '20px',

  // Subtitle/Text defaults
  subtitleColor: '#cccccc',
  subtitleFontSize: '16px',
  subtitleFontWeight: '400',
  subtitleMarginBottom: '24px',

  // Button defaults
  buttonBackgroundColor: '#4f46e5',
  buttonTextColor: '#ffffff',
  buttonPadding: '12px 28px',
  buttonBorderRadius: '8px',
  buttonFontSize: '15px',
  buttonFontWeight: '600',

  // Row/Layout defaults
  rowGap: '20px',
  rowPadding: '20px',

  // Column defaults
  columnPadding: '16px',
  columnBorderRadius: '8px',
};

export const useVisualBuilderStore = create<VisualBuilderState>((set, get) => ({
  projectName: 'Untitled Project',
  components: [],
  globalStyles: { ...defaultGlobalStyles },
  selectedComponentId: null,
  draggedComponentType: null,

  setProjectName: (name: string) => {
    set({ projectName: name });
    get().saveToLocalStorage();
  },

  addComponent: (component: VisualComponent, parentId?: string) => {
    const state = get();

    if (parentId) {
      // Add as child to parent component
      const addToParent = (components: VisualComponent[]): VisualComponent[] => {
        return components.map(comp => {
          if (comp.id === parentId) {
            return {
              ...comp,
              children: [...(comp.children || []), component]
            };
          }
          if (comp.children) {
            return {
              ...comp,
              children: addToParent(comp.children)
            };
          }
          return comp;
        });
      };

      set({ components: addToParent(state.components) });
    } else {
      // Add to root level
      set({ components: [...state.components, component] });
    }

    get().saveToLocalStorage();
  },

  updateComponent: (id: string, updates: Partial<VisualComponent>) => {
    const updateInTree = (components: VisualComponent[]): VisualComponent[] => {
      return components.map(comp => {
        if (comp.id === id) {
          return { ...comp, ...updates };
        }
        if (comp.children) {
          return {
            ...comp,
            children: updateInTree(comp.children)
          };
        }
        return comp;
      });
    };

    set({ components: updateInTree(get().components) });
    get().saveToLocalStorage();
  },

  deleteComponent: (id: string) => {
    const deleteFromTree = (components: VisualComponent[]): VisualComponent[] => {
      return components
        .filter(comp => comp.id !== id)
        .map(comp => ({
          ...comp,
          children: comp.children ? deleteFromTree(comp.children) : undefined
        }));
    };

    set({
      components: deleteFromTree(get().components),
      selectedComponentId: get().selectedComponentId === id ? null : get().selectedComponentId
    });
    get().saveToLocalStorage();
  },

  selectComponent: (id: string | null) => {
    set({ selectedComponentId: id });
  },

  setDraggedComponentType: (type: string | null) => {
    set({ draggedComponentType: type });
  },

  reorderComponents: (components: VisualComponent[]) => {
    set({ components });
    get().saveToLocalStorage();
  },

  updateGlobalStyles: (updates: Partial<GlobalStyles>) => {
    set({ globalStyles: { ...get().globalStyles, ...updates } });
    get().saveToLocalStorage();
  },

  exportProject: () => {
    const state = get();
    return {
      version: VERSION,
      name: state.projectName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      instructions: {
        note: 'This project uses global styles as the primary styling method. Component customStyles should remain empty unless a specific component needs to override the global defaults. When editing, prefer updating globalStyles over individual component styles for consistent design across all components.',
      },
      components: state.components,
      globalStyles: state.globalStyles,
      theme: null, // Theme is managed separately by ThemeContext
    };
  },

  importProject: (data: VisualProjectData) => {
    set({
      projectName: data.name || 'Untitled Project',
      components: data.components || [],
      globalStyles: data.globalStyles || { ...defaultGlobalStyles },
      selectedComponentId: null,
    });
    get().saveToLocalStorage();
  },

  clearProject: () => {
    set({
      projectName: 'Untitled Project',
      components: [],
      globalStyles: { ...defaultGlobalStyles },
      selectedComponentId: null,
    });
    get().saveToLocalStorage();
  },

  saveToLocalStorage: () => {
    const state = get();
    const data = {
      version: VERSION,
      projectName: state.projectName,
      components: state.components,
      globalStyles: state.globalStyles,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  loadFromLocalStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const data = JSON.parse(stored);

      set({
        projectName: data.projectName || 'Untitled Project',
        components: data.components || [],
        globalStyles: data.globalStyles || { ...defaultGlobalStyles },
        selectedComponentId: null,
      });

      return true;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return false;
    }
  },
}));
