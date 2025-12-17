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

  // Header defaults
  headerBackgroundColor?: string;
  headerPadding?: string;
  headerBorderWidth?: string;
  headerBorderStyle?: string;
  headerBorderColor?: string;
  headerMaxWidth?: string;
  headerJustifyContent?: string;
  headerAlignItems?: string;

  // Logo defaults
  logoColor?: string;
  logoFontSize?: string;
  logoFontWeight?: string;

  // Nav link defaults
  navLinkColor?: string;
  navLinkFontSize?: string;
  navLinkFontWeight?: string;
  navLinkGap?: string;
  navLinkHoverColor?: string;

  // Nav divider defaults
  navDividerColor?: string;
  navDividerHeight?: string;
  navDividerMargin?: string;

  // Title defaults (H1)
  titleColor?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  titleMarginBottom?: string;

  // H2 defaults
  h2Color?: string;
  h2FontSize?: string;
  h2FontWeight?: string;
  h2MarginBottom?: string;

  // H3 defaults
  h3Color?: string;
  h3FontSize?: string;
  h3FontWeight?: string;
  h3MarginBottom?: string;

  // H4 defaults
  h4Color?: string;
  h4FontSize?: string;
  h4FontWeight?: string;
  h4MarginBottom?: string;

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

  // Link defaults
  linkColor?: string;
  linkFontSize?: string;
  linkFontWeight?: string;
  linkTextDecoration?: string;
  linkHoverColor?: string;

  // LinkList defaults
  linkListLabelColor?: string;
  linkListLabelFontSize?: string;
  linkListLabelFontWeight?: string;
  linkListLabelMarginBottom?: string;
  linkListItemColor?: string;
  linkListItemFontSize?: string;
  linkListItemGap?: string;

  // IconBox defaults
  iconBoxIconSize?: string;
  iconBoxIconColor?: string;
  iconBoxTitleColor?: string;
  iconBoxTitleFontSize?: string;
  iconBoxTitleFontWeight?: string;
  iconBoxDescriptionColor?: string;
  iconBoxDescriptionFontSize?: string;

  // Footer defaults
  footerBackgroundColor?: string;
  footerPadding?: string;
  footerTextColor?: string;
  footerCopyrightColor?: string;
  footerCopyrightFontSize?: string;

  // Divider defaults
  dividerColor?: string;
  dividerHeight?: string;
  dividerMargin?: string;

  // SeedProduct defaults
  seedProductTitleColor?: string;
  seedProductTitleFontSize?: string;
  seedProductDescriptionColor?: string;
  seedProductDescriptionFontSize?: string;
  seedProductRatingBarColor?: string;
  seedProductRatingBarBgColor?: string;
  seedProductCardBgColor?: string;
  seedProductCardBorderColor?: string;
  seedProductCardTitleColor?: string;
  seedProductCardIconColor?: string;
  seedProductLabelColor?: string;
  seedProductValueColor?: string;
}

// SeedProduct data types
export interface SeedProductRating {
  label: string;
  value: number; // 1-9 scale
}

export interface SeedProductAttribute {
  label: string;
  value: string;
}

export interface SeedProductData {
  productName: string;
  description: string;
  heroImage?: string;
  agronomicsIcon?: string;
  fieldPerformanceIcon?: string;
  diseaseResistanceIcon?: string;
  ratings: SeedProductRating[];
  agronomics: SeedProductAttribute[];
  fieldPerformance: SeedProductAttribute[];
  diseaseResistance: SeedProductAttribute[];
}

export const defaultSeedProductData: SeedProductData = {
  productName: 'Product Name',
  description: 'Product description goes here.',
  heroImage: '',
  agronomicsIcon: '',
  fieldPerformanceIcon: '',
  diseaseResistanceIcon: '',
  ratings: [
    { label: 'Label', value: 1 }
  ],
  agronomics: [
    { label: 'Label', value: '0.0' },
  ],
  fieldPerformance: [
    { label: 'Label', value: 'VG' },
  ],
  diseaseResistance: [
    { label: 'Label', value: '5' },
  ],
}

// Type for section components mapping
export type SectionComponentsMap = Record<string, VisualComponent[]>;

export interface VisualProjectData {
  version: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  instructions: {
    note: string;
  };
  components: VisualComponent[]; // Deprecated, use sectionComponents
  sectionComponents?: SectionComponentsMap;
  globalStyles: GlobalStyles;
  theme: any; // Will be managed by ThemeContext
}

interface VisualBuilderState {
  projectName: string;
  components: VisualComponent[]; // Deprecated, use sectionComponents
  sectionComponents: SectionComponentsMap;
  activeSectionId: string | null;
  globalStyles: GlobalStyles;
  selectedComponentId: string | null;
  draggedComponentType: string | null;
  // State for adding components to a specific column when a Row is selected
  selectedRowColumn: number;

  setProjectName: (name: string) => void;
  setSelectedRowColumn: (column: number) => void;
  addComponent: (component: VisualComponent, parentId?: string) => void;
  updateComponent: (id: string, updates: Partial<VisualComponent>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  setDraggedComponentType: (type: string | null) => void;
  reorderComponents: (components: VisualComponent[]) => void;
  updateGlobalStyles: (updates: Partial<GlobalStyles>) => void;
  setGlobalStyles: (styles: GlobalStyles) => void;
  moveComponent: (id: string, direction: 'up' | 'down', parentId?: string) => void;
  setActiveSectionId: (sectionId: string | null) => void;
  setSectionComponents: (sectionComponents: SectionComponentsMap) => void;
  getActiveComponents: () => VisualComponent[];

  exportProject: () => VisualProjectData;
  importProject: (data: VisualProjectData) => void;
  clearProject: () => void;
  clearCanvas: () => void;

  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
}

const STORAGE_KEY = 'visualBuilder_project';
const PROJECT_NAME_KEY = 'uxBuilder_lastProjectName'; // Shared across Visual Builder and Layout Editor
const VERSION = '1.0.0';

const defaultGlobalStyles: GlobalStyles = {
  // Container defaults
  containerBackgroundColor: '#fff',
  containerPadding: '60px 40px',
  containerBorderRadius: '0',

  // Header defaults
  headerBackgroundColor: '#ffffff',
  headerPadding: '16px 40px',
  headerJustifyContent: 'space-between',
  headerAlignItems: 'center',

  // Logo defaults
  logoColor: '#1a1a1a',
  logoFontSize: '24px',
  logoFontWeight: '700',

  // Nav link defaults
  navLinkColor: '#1a1a1a',
  navLinkFontSize: '14px',
  navLinkFontWeight: '500',
  navLinkGap: '32px',

  // Nav divider defaults
  navDividerColor: '#cccccc',
  navDividerHeight: '20px',
  navDividerMargin: '0 8px',

  // Title defaults (H1)
  titleColor: '#000',
  titleFontSize: '42px',
  titleFontWeight: '700',
  titleMarginBottom: '20px',

  // H2 defaults
  h2Color: '#000',
  h2FontSize: '32px',
  h2FontWeight: '700',
  h2MarginBottom: '16px',

  // H3 defaults
  h3Color: '#000',
  h3FontSize: '24px',
  h3FontWeight: '600',
  h3MarginBottom: '12px',

  // H4 defaults
  h4Color: '#000',
  h4FontSize: '20px',
  h4FontWeight: '600',
  h4MarginBottom: '10px',

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

  // Link defaults
  linkColor: '#4f46e5',
  linkFontSize: '14px',
  linkFontWeight: '500',
  linkTextDecoration: 'none',
  linkHoverColor: '#3730a3',

  // LinkList defaults
  linkListLabelColor: '#ffffff',
  linkListLabelFontSize: '14px',
  linkListLabelFontWeight: '700',
  linkListLabelMarginBottom: '12px',
  linkListItemColor: 'rgba(255,255,255,0.7)',
  linkListItemFontSize: '13px',
  linkListItemGap: '8px',

  // IconBox defaults
  iconBoxIconSize: '48px',
  iconBoxTitleColor: '#1a1a2e',
  iconBoxTitleFontSize: '18px',
  iconBoxTitleFontWeight: '600',
  iconBoxDescriptionColor: '#666666',
  iconBoxDescriptionFontSize: '14px',

  // Footer defaults
  footerBackgroundColor: '#1a2744',
  footerPadding: '50px 60px',
  footerTextColor: '#ffffff',
  footerCopyrightColor: 'rgba(255,255,255,0.5)',
  footerCopyrightFontSize: '12px',

  // Divider defaults
  dividerColor: '#e5e7eb',
  dividerHeight: '1px',
  dividerMargin: '20px 0',

  // SeedProduct defaults
  seedProductTitleColor: '#003087',
  seedProductTitleFontSize: '32px',
  seedProductDescriptionColor: '#666666',
  seedProductDescriptionFontSize: '16px',
  seedProductRatingBarColor: '#003087',
  seedProductRatingBarBgColor: '#e5e7eb',
  seedProductCardBgColor: '#f8fafc',
  seedProductCardBorderColor: '#e2e8f0',
  seedProductCardTitleColor: '#003087',
  seedProductCardIconColor: '#003087',
  seedProductLabelColor: '#374151',
  seedProductValueColor: '#111827',
};

export const useVisualBuilderStore = create<VisualBuilderState>((set, get) => ({
  projectName: localStorage.getItem(PROJECT_NAME_KEY) || 'Untitled Project',
  components: [], // Deprecated, maintained for backward compatibility
  sectionComponents: {},
  activeSectionId: null,
  globalStyles: { ...defaultGlobalStyles },
  selectedComponentId: null,
  draggedComponentType: null,
  selectedRowColumn: 0,

  setProjectName: (name: string) => {
    set({ projectName: name });
    // Save project name separately for persistence across sessions
    if (name && name !== 'Untitled Project') {
      localStorage.setItem(PROJECT_NAME_KEY, name);
    }
    get().saveToLocalStorage();
  },

  setSelectedRowColumn: (column: number) => {
    set({ selectedRowColumn: column });
  },

  addComponent: (component: VisualComponent, parentId?: string) => {
    const state = get();

    // Helper to add to parent in a component tree
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

    // If we have an active section, add to sectionComponents
    if (state.activeSectionId) {
      const currentSectionComponents = state.sectionComponents[state.activeSectionId] || [];

      if (parentId) {
        const updatedComponents = addToParent(currentSectionComponents);
        set({
          sectionComponents: {
            ...state.sectionComponents,
            [state.activeSectionId]: updatedComponents
          }
        });
      } else {
        set({
          sectionComponents: {
            ...state.sectionComponents,
            [state.activeSectionId]: [...currentSectionComponents, component]
          }
        });
      }
    } else {
      // Fallback to deprecated components array for backward compatibility
      if (parentId) {
        set({ components: addToParent(state.components) });
      } else {
        set({ components: [...state.components, component] });
      }
    }

    get().saveToLocalStorage();
  },

  updateComponent: (id: string, updates: Partial<VisualComponent>) => {
    const state = get();

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

    // Helper to check if component exists in tree
    const existsInTree = (components: VisualComponent[]): boolean => {
      for (const comp of components) {
        if (comp.id === id) return true;
        if (comp.children && existsInTree(comp.children)) return true;
      }
      return false;
    };

    // Search across all sections to find and update the component
    const newSectionComponents = { ...state.sectionComponents };
    let found = false;

    for (const sectionId of Object.keys(newSectionComponents)) {
      if (existsInTree(newSectionComponents[sectionId])) {
        newSectionComponents[sectionId] = updateInTree(newSectionComponents[sectionId]);
        found = true;
        break;
      }
    }

    if (found) {
      set({ sectionComponents: newSectionComponents });
    } else {
      // Fallback to deprecated components array
      set({ components: updateInTree(state.components) });
    }
    get().saveToLocalStorage();
  },

  deleteComponent: (id: string) => {
    const state = get();

    const deleteFromTree = (components: VisualComponent[]): VisualComponent[] => {
      return components
        .filter(comp => comp.id !== id)
        .map(comp => ({
          ...comp,
          children: comp.children ? deleteFromTree(comp.children) : undefined
        }));
    };

    // Helper to check if component exists in tree
    const existsInTree = (components: VisualComponent[]): boolean => {
      for (const comp of components) {
        if (comp.id === id) return true;
        if (comp.children && existsInTree(comp.children)) return true;
      }
      return false;
    };

    // Search across all sections to find and delete the component
    const newSectionComponents = { ...state.sectionComponents };
    let found = false;

    for (const sectionId of Object.keys(newSectionComponents)) {
      if (existsInTree(newSectionComponents[sectionId])) {
        newSectionComponents[sectionId] = deleteFromTree(newSectionComponents[sectionId]);
        found = true;
        break;
      }
    }

    if (found) {
      set({
        sectionComponents: newSectionComponents,
        selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId
      });
    } else {
      // Fallback to deprecated components array
      set({
        components: deleteFromTree(state.components),
        selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId
      });
    }
    get().saveToLocalStorage();
  },

  selectComponent: (id: string | null) => {
    set({ selectedComponentId: id });
  },

  setDraggedComponentType: (type: string | null) => {
    set({ draggedComponentType: type });
  },

  reorderComponents: (components: VisualComponent[]) => {
    const state = get();

    // If we have an active section, reorder in sectionComponents
    if (state.activeSectionId) {
      set({
        sectionComponents: {
          ...state.sectionComponents,
          [state.activeSectionId]: components
        }
      });
    } else {
      // Fallback to deprecated components array
      set({ components });
    }
    get().saveToLocalStorage();
  },

  updateGlobalStyles: (updates: Partial<GlobalStyles>) => {
    set({ globalStyles: { ...get().globalStyles, ...updates } });
    get().saveToLocalStorage();
  },

  setGlobalStyles: (styles: GlobalStyles) => {
    set({ globalStyles: styles });
    get().saveToLocalStorage();
  },

  moveComponent: (id: string, direction: 'up' | 'down', parentId?: string) => {
    const state = get();

    const moveInArray = (arr: VisualComponent[]): VisualComponent[] => {
      const index = arr.findIndex(comp => comp.id === id);
      if (index === -1) return arr;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= arr.length) return arr;

      const newArr = [...arr];
      const [removed] = newArr.splice(index, 1);
      newArr.splice(newIndex, 0, removed);
      return newArr;
    };

    const moveInTree = (components: VisualComponent[]): VisualComponent[] => {
      return components.map(comp => {
        if (comp.id === parentId && comp.children) {
          return {
            ...comp,
            children: moveInArray(comp.children)
          };
        }
        if (comp.children) {
          return {
            ...comp,
            children: moveInTree(comp.children)
          };
        }
        return comp;
      });
    };

    // If we have an active section, move in sectionComponents
    if (state.activeSectionId && state.sectionComponents[state.activeSectionId]) {
      const sectionComps = state.sectionComponents[state.activeSectionId];
      if (!parentId) {
        set({
          sectionComponents: {
            ...state.sectionComponents,
            [state.activeSectionId]: moveInArray(sectionComps)
          }
        });
      } else {
        set({
          sectionComponents: {
            ...state.sectionComponents,
            [state.activeSectionId]: moveInTree(sectionComps)
          }
        });
      }
    } else {
      // Fallback to deprecated components array
      if (!parentId) {
        set({ components: moveInArray(state.components) });
      } else {
        set({ components: moveInTree(state.components) });
      }
    }

    get().saveToLocalStorage();
  },

  setActiveSectionId: (sectionId: string | null) => {
    set({ activeSectionId: sectionId });
  },

  setSectionComponents: (sectionComponents: SectionComponentsMap) => {
    set({ sectionComponents });
    get().saveToLocalStorage();
  },

  getActiveComponents: () => {
    const state = get();
    if (state.activeSectionId && state.sectionComponents[state.activeSectionId]) {
      return state.sectionComponents[state.activeSectionId];
    }
    // Fallback to deprecated components array for backward compatibility
    return state.components;
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

        aiStyleGuideExtraction: {
          purpose: 'When given a reference image (screenshot of a website), extract the visual style guide and apply it to globalStyles. DO NOT guess colors - carefully inspect each section of the image.',

          extractionProcess: [
            '1. HEADER SECTION: Look at the top navigation bar. Note the background color, logo color/style, navigation link colors, and spacing.',
            '2. HERO/CONTENT SECTIONS: Identify primary background colors, title text colors, subtitle/body text colors, and button styles.',
            '3. BUTTONS: Extract background color, text color, border-radius (rounded vs square), padding size, and any borders.',
            '4. TYPOGRAPHY: Note font weights (bold headings vs light body), sizes, and color contrast patterns.',
            '5. FOOTER SECTION: Carefully inspect - footers often have DIFFERENT backgrounds than the main content. Check column label colors, link colors, copyright bar separately.',
            '6. ACCENT COLORS: Identify the brand\'s primary color (often used in buttons, links, highlights).',
            '7. DIVIDERS/BORDERS: Look for separator lines, their colors and thickness.'
          ],

          commonMistakes: [
            'Assuming footer has same dark/light theme as header - always check separately',
            'Missing subtle background color differences between sections',
            'Not noticing copyright bar has different background than main footer',
            'Confusing hover states with default colors',
            'Missing border colors on buttons or inputs'
          ],

          colorExtractionTips: [
            'White backgrounds: #ffffff',
            'Off-white/light gray: #f5f5f5, #f0f0f0, #fafafa',
            'Dark backgrounds: Check if true black #000000 or dark gray #1a1a1a or navy #1a2744',
            'Gray text: Usually #666666, #888888, or #999999',
            'Use rgba() for semi-transparent colors like muted footer links'
          ]
        },

        globalStylesReference: {
          header: ['headerBackgroundColor', 'headerPadding', 'headerBorderWidth', 'headerBorderStyle', 'headerBorderColor', 'headerMaxWidth', 'headerJustifyContent', 'headerAlignItems'],
          logo: ['logoColor', 'logoFontSize', 'logoFontWeight'],
          navigation: ['navLinkColor', 'navLinkFontSize', 'navLinkFontWeight', 'navLinkGap', 'navLinkHoverColor', 'navDividerColor', 'navDividerHeight', 'navDividerMargin'],
          titles: ['titleColor', 'titleFontSize', 'titleFontWeight', 'titleMarginBottom'],
          subtitles: ['subtitleColor', 'subtitleFontSize', 'subtitleFontWeight', 'subtitleMarginBottom'],
          buttons: ['buttonBackgroundColor', 'buttonTextColor', 'buttonPadding', 'buttonBorderRadius', 'buttonFontSize', 'buttonFontWeight', 'buttonBorderWidth', 'buttonBorderStyle', 'buttonBorderColor'],
          container: ['containerBackgroundColor', 'containerBackgroundImage', 'containerBackgroundSize', 'containerBackgroundPosition', 'containerBackgroundRepeat', 'containerPadding', 'containerBorderRadius', 'containerBorderWidth', 'containerBorderStyle', 'containerBorderColor'],
          rows: ['rowGap', 'rowPadding', 'rowBackgroundColor'],
          columns: ['columnBackgroundColor', 'columnPadding', 'columnBorderRadius'],
          links: ['linkColor', 'linkFontSize', 'linkFontWeight', 'linkTextDecoration', 'linkHoverColor'],
          linkLists: ['linkListLabelColor', 'linkListLabelFontSize', 'linkListLabelFontWeight', 'linkListLabelMarginBottom', 'linkListItemColor', 'linkListItemFontSize', 'linkListItemGap'],
          iconBox: ['iconBoxIconSize', 'iconBoxIconColor', 'iconBoxTitleColor', 'iconBoxTitleFontSize', 'iconBoxTitleFontWeight', 'iconBoxDescriptionColor', 'iconBoxDescriptionFontSize'],
          footer: ['footerBackgroundColor', 'footerPadding', 'footerTextColor', 'footerCopyrightColor', 'footerCopyrightFontSize'],
          dividers: ['dividerColor', 'dividerHeight', 'dividerMargin']
        },

        outputFormat: 'After extracting styles from an image, update ONLY the globalStyles object. Keep component customStyles empty unless a specific component needs to differ from global defaults.'
      },
      components: state.components, // Deprecated, maintained for backward compatibility
      sectionComponents: state.sectionComponents,
      globalStyles: state.globalStyles,
      theme: null, // Theme is managed separately by ThemeContext
    };
  },

  importProject: (data: VisualProjectData) => {
    const name = data.name || 'Untitled Project';
    set({
      projectName: name,
      components: data.components || [], // Deprecated, maintained for backward compatibility
      sectionComponents: data.sectionComponents || {},
      activeSectionId: null,
      globalStyles: data.globalStyles || { ...defaultGlobalStyles },
      selectedComponentId: null,
    });
    // Save project name separately for persistence
    if (name && name !== 'Untitled Project') {
      localStorage.setItem(PROJECT_NAME_KEY, name);
    }
    get().saveToLocalStorage();
  },

  clearProject: () => {
    set({
      projectName: 'Untitled Project',
      components: [],
      sectionComponents: {},
      activeSectionId: null,
      globalStyles: { ...defaultGlobalStyles },
      selectedComponentId: null,
    });
    get().saveToLocalStorage();
  },

  clearCanvas: () => {
    const state = get();

    // If we have an active section, only clear that section
    if (state.activeSectionId) {
      set({
        sectionComponents: {
          ...state.sectionComponents,
          [state.activeSectionId]: []
        },
        selectedComponentId: null,
      });
    } else {
      // Clear deprecated components array
      set({
        components: [],
        selectedComponentId: null,
      });
    }
    get().saveToLocalStorage();
  },

  saveToLocalStorage: () => {
    const state = get();
    const data = {
      version: VERSION,
      projectName: state.projectName,
      components: state.components, // Deprecated, maintained for backward compatibility
      sectionComponents: state.sectionComponents,
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
        components: data.components || [], // Deprecated, maintained for backward compatibility
        sectionComponents: data.sectionComponents || {},
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
