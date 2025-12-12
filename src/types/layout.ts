import { VisualComponent, GlobalStyles } from '../store/visualBuilderStore';

// Page types including layout
export type PageType = 'PLP' | 'PDP' | 'landingPage' | 'layout';

// Layout section types
export type LayoutSectionType = 'header' | 'body' | 'footer';

// Layout section - defines a region in the layout
export interface LayoutSection {
  id: string;
  type: LayoutSectionType;
  name: string;
  components: VisualComponent[];
  // Body section style options (content zone)
  styles?: {
    maxWidth?: string;
    margin?: string;
    padding?: string;
    backgroundColor?: string;
    minHeight?: string;
  };
}

// Body section - defines a body zone in the layout (multiple allowed)
export interface BodySection {
  id: string;
  name: string;
  styles: SectionStyles;
}

// Layout entity for storage
export interface LayoutEntity {
  rowKey: string;
  partitionKey: string; // Project name
  pageType: 'layout';
  name: string;
  slug: string;
  description?: string;
  isDefault?: boolean; // Is this the default layout for the project?
  headerComponents: string; // JSON string of VisualComponent[]
  footerComponents: string; // JSON string of VisualComponent[]
  bodySections: string; // JSON string of BodySection[]
  bodyStyles: string; // JSON string of body zone styles (deprecated, use bodySections)
  globalStyles: string; // JSON string of GlobalStyles
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Parsed layout for use in the app
export interface Layout {
  rowKey: string;
  partitionKey: string;
  name: string;
  slug: string;
  description?: string;
  isDefault?: boolean;
  headerComponents: VisualComponent[];
  footerComponents: VisualComponent[];
  bodySections: BodySection[];
  bodyStyles: {
    maxWidth?: string;
    margin?: string;
    padding?: string;
    backgroundColor?: string;
    minHeight?: string;
    contentMaxWidth?: string;
    contentMargin?: string;
    borderBottomWidth?: string;
    borderBottomStyle?: string;
    borderBottomColor?: string;
  };
  globalStyles: GlobalStyles;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Page entity with layout reference
export interface PageWithLayout {
  rowKey: string;
  partitionKey: string;
  pageType: PageType;
  slug: string;
  parentRowKey: string | null;
  layoutRowKey: string | null; // Reference to layout
  title: string;
  summary: string;
  category: string | null;
  components: string; // Body content components (deprecated, use sectionComponents)
  sectionComponents: string; // JSON string of Record<string, VisualComponent[]>
  globalStyles: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Type for section components mapping
export type SectionComponentsMap = Record<string, VisualComponent[]>;

// Section styles interface (shared by header, body, footer)
export interface SectionStyles {
  maxWidth: string;
  margin: string;
  padding: string;
  backgroundColor: string;
  minHeight: string;
  // Content wrapper styles (for inner content alignment)
  contentMaxWidth: string;
  contentMargin: string;
  // Border bottom styles
  borderBottomWidth: string;
  borderBottomStyle: string;
  borderBottomColor: string;
}

// Default body styles
export const defaultBodyStyles: SectionStyles = {
  maxWidth: '100%',
  margin: '0',
  padding: '0',
  backgroundColor: 'transparent',
  minHeight: '400px',
  contentMaxWidth: '1200px',
  contentMargin: '0 auto',
  borderBottomWidth: '',
  borderBottomStyle: '',
  borderBottomColor: '',
};

// Default header styles
export const defaultHeaderStyles: SectionStyles = {
  maxWidth: '100%',
  margin: '0',
  padding: '0',
  backgroundColor: 'transparent',
  minHeight: '',
  contentMaxWidth: '1200px',
  contentMargin: '0 auto',
  borderBottomWidth: '',
  borderBottomStyle: '',
  borderBottomColor: '',
};

// Default footer styles
export const defaultFooterStyles: SectionStyles = {
  maxWidth: '100%',
  margin: '0',
  padding: '0',
  backgroundColor: 'transparent',
  minHeight: '',
  contentMaxWidth: '1200px',
  contentMargin: '0 auto',
  borderBottomWidth: '',
  borderBottomStyle: '',
  borderBottomColor: '',
};

// Create a default body section
export const createDefaultBodySection = (index: number): BodySection => ({
  id: `body-section-${index}`,
  name: `Body Section ${index}`,
  styles: { ...defaultBodyStyles },
});

// Get default body sections array (at least one section)
export const getDefaultBodySections = (): BodySection[] => [
  createDefaultBodySection(1),
];
