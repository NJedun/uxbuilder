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
    { label: 'Emergence', value: 1 },
    { label: 'Standability', value: 2 },
    { label: 'Stress Tolerance', value: 3 },
    { label: 'SDS', value: 2 },
    { label: 'IDC', value: 4 },
    { label: 'Shattering', value: 1 },
    { label: 'White Mold', value: 3 },
    { label: 'BSR', value: 2 },
  ],
  agronomics: [
    { label: 'Relative Maturity', value: '0.0' },
    { label: 'Plant Height', value: 'Med' },
    { label: 'Plant Type', value: 'Med-bushy' },
  ],
  fieldPerformance: [
    { label: 'Fine Soil', value: 'VG' },
    { label: 'Medium Soil', value: 'VG' },
    { label: 'No-Till', value: 'G' },
  ],
  diseaseResistance: [
    { label: 'Root Rot', value: '5' },
    { label: 'White Mold', value: '4' },
    { label: 'Stem Rot', value: 'R' },
  ],
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
  setGlobalStyles: (styles: GlobalStyles) => void;
  moveComponent: (id: string, direction: 'up' | 'down', parentId?: string) => void;

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
  titleColor: '#ffffff',
  titleFontSize: '42px',
  titleFontWeight: '700',
  titleMarginBottom: '20px',

  // H2 defaults
  h2Color: '#ffffff',
  h2FontSize: '32px',
  h2FontWeight: '700',
  h2MarginBottom: '16px',

  // H3 defaults
  h3Color: '#ffffff',
  h3FontSize: '24px',
  h3FontWeight: '600',
  h3MarginBottom: '12px',

  // H4 defaults
  h4Color: '#ffffff',
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

    if (!parentId) {
      // Moving at root level
      set({ components: moveInArray(state.components) });
    } else {
      // Moving within a parent's children
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

      set({ components: moveInTree(state.components) });
    }

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
