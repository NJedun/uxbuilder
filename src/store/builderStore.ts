import { create } from 'zustand';
import { PlacedComponent, Viewport, ViewportConfig } from '../types/builder';

interface CanvasSettings {
  width: number | null;
  height: number | null;
  cols: number | null;
  headerHeight: number;
  bodyHeight: number;
  footerHeight: number;
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
  selectedLayoutSection: 'Header' | 'Body' | 'Footer' | null;
  projectName: string;
  zoom: number;
  setViewport: (viewport: Viewport) => void;
  setCustomWidth: (width: number | null) => void;
  setCustomCols: (cols: number | null) => void;
  setCustomHeight: (height: number | null) => void;
  setSectionHeight: (section: 'header' | 'body' | 'footer', height: number) => void;
  setSelectedLayoutSection: (section: 'Header' | 'Body' | 'Footer' | null) => void;
  addComponent: (component: PlacedComponent) => void;
  updateLayout: (layout: Array<{ i: string; x: number; y: number; w: number; h: number }>) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
  removeComponent: (id: string) => void;
  setSelectedComponents: (ids: string[]) => void;
  toggleComponentSelection: (id: string) => void;
  clearSelection: () => void;
  setProjectName: (name: string) => void;
  setZoom: (zoom: number) => void;
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
  headerHeight: 150,
  bodyHeight: 600,
  footerHeight: 200,
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
  selectedLayoutSection: null,
  projectName: 'Untitled Project',
  zoom: 1,
  setViewport: (viewport) => set({ viewport, selectedComponents: [], selectedLayoutSection: null }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedLayoutSection: (section) => set({ selectedLayoutSection: section }),
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
  setSectionHeight: (section, height) => set((state) => ({
    canvasSettingsByViewport: {
      ...state.canvasSettingsByViewport,
      [state.viewport]: {
        ...state.canvasSettingsByViewport[state.viewport],
        [`${section}Height`]: height,
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
      metadata: {
        gridSystem: {
          mobile: { columns: 4, rowHeight: 50 },
          tablet: { columns: 8, rowHeight: 50 },
          desktop: { columns: 12, rowHeight: 50 },
        },
        instructions: {
          overview: 'This JSON defines a wireframe layout. Follow ALL instructions below to generate a Next.js 14 website. DO NOT deviate from these specifications.',
          step1_framework: {
            description: 'Project Setup',
            framework: 'Next.js 14 with App Router',
            language: 'TypeScript',
            styling: 'Tailwind CSS',
            structure: 'Create app/page.tsx, app/layout.tsx, app/globals.css, and app/components/ folder',
          },
          step2_layout: {
            description: 'Page Layout Structure',
            rules: [
              'Header/Footer: <header className="w-full"><div className="max-w-7xl mx-auto px-4">content</div></header>',
              'Body: <main className="max-w-7xl mx-auto px-4"><div className="grid grid-cols-12 gap-4">ALL body components here</div></main>',
              'Grid positioning formula: x value → col-start-{x+1}, w value → col-span-{w}. Example: x:2 w:8 becomes col-start-3 col-span-8',
              'Components with parentId="header" render before <main>',
              'Components with parentId="body" render inside the grid',
              'Components with parentId="footer" render after </main>',
              'NO component should add its own px-* horizontal padding',
            ],
          },
          step3_components: {
            description: 'Component Generation Rules',
            rules: [
              'For each component in componentsByViewport.desktop array:',
              '1. Find component type (e.g., "HeaderPattern")',
              '2. Find variant in props (e.g., props.variant = "simple")',
              '3. Look up componentDefinitions[type][variant]',
              '4. Render ONLY the elements listed in the "elements" array',
              '5. Follow the "structure" template for HTML/JSX',
              'CRITICAL: DO NOT add any content not specified in componentDefinitions. If elements array has ["logo"], render ONLY a logo.',
            ],
          },
          step4_styling: {
            description: 'Styling Rules',
            rules: [
              'Use neutral colors: gray-100 to gray-900, white',
              'Use real HTML elements: Link, button, input (not placeholder rectangles)',
              'Use lucide-react for icons',
              'Keep styling minimal and functional',
            ],
          },
        },
        componentDefinitions: {
          HeaderPattern: {
            simple: {
              elements: ['logo', 'navLinks:4'],
              structure: '<header className="w-full border-b bg-white"><div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between"><Logo /><Nav links={4} /></div></header>',
            },
            ecommerce: {
              elements: ['logo', 'searchBar', 'headerActionsIcons'],
              structure: '<header className="w-full border-b bg-white"><div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between"><Logo /><SearchBar /><Icons: search, cart, user /></div></header>',
            },
            saas: {
              elements: ['logo', 'navLinks:3', 'loginButton', 'signupButton'],
              structure: '<header className="w-full border-b bg-white"><div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between"><Logo /><Nav links={3} /><Buttons: login, signup /></div></header>',
            },
            mobile: {
              elements: ['logo', 'menuIcon'],
              structure: '<header className="w-full border-b bg-white"><div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between"><Logo /><MenuIcon /></div></header>',
            },
          },
          FooterPattern: {
            simple: {
              elements: ['logo', 'navLinks:3'],
              structure: '<footer className="w-full border-t bg-white py-6"><div className="max-w-7xl mx-auto px-4 flex items-center justify-between"><Logo /><Nav links={3} /></div></footer>',
            },
            multiColumn: {
              elements: ['logo', 'linkColumns:3', 'linksPerColumn:4', 'subscribeInput', 'subscribeButton', 'socialIcons:4', 'copyrightText'],
              structure: '<footer className="w-full border-t bg-white py-8"><div className="max-w-7xl mx-auto px-4"><Row: Logo + 3 LinkColumns + Subscribe /><Row: Copyright centered /></div></footer>',
            },
          },
          HeroSection: {
            default: {
              elements: ['headline', 'subheadline', 'ctaButton'],
              structure: '<section className="py-16 bg-{hasImageBackground ? gray-800 text-white : gray-100}"><div className="max-w-7xl mx-auto px-4 text-{align}"><h1>Headline</h1><p>Subheadline</p><Button>CTA</Button></div></section>',
            },
          },
          HeroWithImage: {
            default: {
              elements: ['imagePlaceholder', 'headline', 'description', 'ctaButton'],
              structure: '<section className="py-16"><div className="flex gap-8">{align=left: Image first, then Text} OR {align=right: Text first, then Image}. Each 50% width.</div></section>',
            },
          },
          HorizontalLine: {
            default: {
              elements: ['line'],
              structure: '<div className="w-full py-4 flex items-{align}"><div className="w-full bg-gray-300" style="height: {width}px" /></div>. NOTE: width prop = thickness in PIXELS.',
            },
          },
          SearchBar: {
            simple: {
              elements: ['input'],
              structure: '<div className="w-full py-4"><input type="search" placeholder="Search..." /></div>',
            },
            withIcon: {
              elements: ['searchIcon', 'input'],
              structure: '<div className="w-full py-4"><div className="relative"><SearchIcon className="absolute left-3" /><input type="search" className="pl-10" /></div></div>',
            },
          },
          ProductList: {
            grid: {
              elements: ['productCards:{itemCount}'],
              structure: '<section className="py-8"><div className="grid grid-cols-{columns} gap-6">{itemCount} ProductCards in grid</div></section>',
            },
            list: {
              elements: ['productCards:{itemCount}'],
              structure: '<section className="py-8"><div className="flex flex-col gap-4">{itemCount} ProductCards in vertical stack (each full width, horizontal layout: image left + details right)</div></section>',
            },
          },
          ProductCard: {
            grid: {
              elements: ['imagePlaceholder', 'title', 'description', 'price', 'addToCartButton'],
              structure: '<div className="border rounded p-4"><ImagePlaceholder /><h3>Title</h3><p>Description</p><Price /><Button>Add to Cart</Button></div>',
            },
            list: {
              elements: ['imagePlaceholder', 'title', 'description', 'price', 'addToCartButton'],
              structure: '<div className="border rounded p-4 flex gap-4"><ImagePlaceholder className="w-32 h-32" /><div><h3>Title</h3><p>Description</p><Price /><Button>Add to Cart</Button></div></div>',
            },
          },
          ProductDetails: {
            sideBySide: {
              elements: ['mainImage', 'thumbnails:4', 'title', 'price', 'rating', 'description', 'sizeSelector', 'addToCartButton', 'wishlistButton'],
              structure: '<section className="py-8"><div className="flex gap-8"><div className="w-1/2"><MainImage /><Thumbnails count={4} /></div><div className="w-1/2"><Title /><Price /><Rating /><Description /><SizeSelector /><AddToCart /><Wishlist /></div></div></section>',
            },
            stacked: {
              elements: ['mainImage', 'title', 'price', 'description', 'addToCartButton', 'wishlistButton'],
              structure: '<section className="py-8"><div className="flex flex-col"><MainImage /><Title /><Price /><Description /><AddToCart /><Wishlist /></div></section>',
            },
          },
          ContactForm: {
            standard: {
              elements: ['title', 'nameInput', 'emailInput', 'subjectInput', 'messageTextarea', 'submitButton'],
              structure: '<section className="py-8 max-w-2xl mx-auto"><h2>Title</h2><form className="space-y-4"><Input label="Name" /><Input label="Email" /><Input label="Subject" /><Textarea label="Message" /><Button type="submit">Send</Button></form></section>',
            },
            withInfo: {
              elements: ['contactInfoTitle', 'contactInfo:email,phone,address', 'formTitle', 'nameInput', 'emailInput', 'messageTextarea', 'submitButton'],
              structure: '<section className="py-8"><div className="flex gap-8"><div className="w-1/2 bg-gray-100 p-6"><h2>Contact Info Title</h2><ContactInfo items={email,phone,address} /></div><div className="w-1/2 p-6"><h2>Form Title</h2><form><Input label="Name" /><Input label="Email" /><Textarea label="Message" /><Button type="submit">Send</Button></form></div></div></section>',
            },
          },
          Title: {
            default: {
              elements: ['heading'],
              structure: '<div className="py-4"><h{level} className="font-bold">{text}</h{level}></div>. Level 1=text-3xl, 2=text-2xl, 3=text-xl.',
            },
          },
        },
      },
    };
  },

  importProject: (data: ProjectData) => {
    // Handle migration from old formats
    let componentsByViewport: {
      mobile: PlacedComponent[];
      tablet: PlacedComponent[];
      desktop: PlacedComponent[];
    } = {
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
