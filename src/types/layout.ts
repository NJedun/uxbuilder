import { VisualComponent, GlobalStyles } from '../store/visualBuilderStore';

// ===========================================
// ENTITY TYPES (Single Table Design)
// ===========================================

// Entity type discriminator
export type EntityType = 'layout' | 'page' | 'settings';

// Page types (excludes layout - layout is separate entityType)
export type PageType = 'PLP' | 'PDP' | 'landingPage';

// RowKey prefix convention
export const ROW_KEY_PREFIX = {
  layout: 'layout_',
  page: 'page_',
  settings: 'settings',
} as const;

// ===========================================
// BASE ENTITY
// ===========================================

interface BaseEntity {
  partitionKey: string;  // Project ID
  rowKey: string;        // Prefixed unique ID
  entityType: EntityType;
  createdAt: string;
  updatedAt: string;
}

// ===========================================
// LAYOUT ENTITY
// ===========================================

// Layout entity for storage (Azure Table)
export interface LayoutEntity extends BaseEntity {
  entityType: 'layout';
  name: string;
  isDefault: boolean;

  // Section components (JSON strings)
  headerComponents: string;   // JSON: VisualComponent[]
  footerComponents: string;   // JSON: VisualComponent[]
  bodySections: string;       // JSON: BodySection[]

  // Section styles (JSON strings)
  headerStyles: string;       // JSON: SectionStyles
  footerStyles: string;       // JSON: SectionStyles

  // Layout-level defaults
  globalStyles: string;       // JSON: GlobalStyles
}

// Parsed layout for use in app
export interface Layout {
  partitionKey: string;
  rowKey: string;
  entityType: 'layout';
  name: string;
  isDefault: boolean;

  headerComponents: VisualComponent[];
  footerComponents: VisualComponent[];
  bodySections: BodySection[];

  headerStyles: SectionStyles;
  footerStyles: SectionStyles;

  globalStyles: GlobalStyles;

  createdAt: string;
  updatedAt: string;
}

// ===========================================
// PAGE ENTITY
// ===========================================

// Page entity for storage (Azure Table)
export interface PageEntity extends BaseEntity {
  entityType: 'page';
  pageType: PageType;

  title: string;
  slug: string;
  summary: string;
  category: string;

  layoutRowKey: string;       // Reference to layout (e.g., "layout_Main_123")
  parentRowKey: string;       // Reference for PDP->PLP relationship

  // Content - ONLY sectionComponents (no deprecated 'components')
  sectionComponents: string;  // JSON: Record<sectionId, VisualComponent[]>

  // Page-specific style overrides
  globalStyles: string;       // JSON: Partial<GlobalStyles>

  isPublished: boolean;
}

// Parsed page for use in app
export interface Page {
  partitionKey: string;
  rowKey: string;
  entityType: 'page';
  pageType: PageType;

  title: string;
  slug: string;
  summary: string;
  category: string | null;

  layoutRowKey: string | null;
  parentRowKey: string | null;

  sectionComponents: SectionComponentsMap;
  globalStyles: Partial<GlobalStyles>;

  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===========================================
// PROJECT SETTINGS ENTITY
// ===========================================

// Project settings entity for storage (Azure Table)
export interface ProjectSettingsEntity extends BaseEntity {
  entityType: 'settings';
  projectName: string;
  defaultLayoutRowKey: string;  // Default layout for new pages
  globalStyles: string;         // JSON: GlobalStyles (project-wide defaults)
}

// Parsed project settings
export interface ProjectSettings {
  partitionKey: string;
  rowKey: string;
  entityType: 'settings';
  projectName: string;
  defaultLayoutRowKey: string | null;
  globalStyles: GlobalStyles;
  createdAt: string;
  updatedAt: string;
}

// ===========================================
// SECTION TYPES
// ===========================================

// Layout section types
export type LayoutSectionType = 'header' | 'body' | 'footer';

// Body section - defines a body zone in the layout
export interface BodySection {
  id: string;
  name: string;
  styles: SectionStyles;
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

// ===========================================
// DEFAULT VALUES
// ===========================================

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

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// Generate a unique ID with timestamp
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create rowKey with prefix
export const createRowKey = (entityType: EntityType, name: string): string => {
  const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = Date.now();

  if (entityType === 'settings') {
    return ROW_KEY_PREFIX.settings;
  }

  return `${ROW_KEY_PREFIX[entityType]}${sanitizedName}_${timestamp}`;
};

// Extract entity type from rowKey
export const getEntityTypeFromRowKey = (rowKey: string): EntityType | null => {
  if (rowKey === ROW_KEY_PREFIX.settings) return 'settings';
  if (rowKey.startsWith(ROW_KEY_PREFIX.layout)) return 'layout';
  if (rowKey.startsWith(ROW_KEY_PREFIX.page)) return 'page';
  return null;
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

// ===========================================
// PARSING HELPERS
// ===========================================

// Parse layout entity from storage to app format
export const parseLayoutEntity = (entity: LayoutEntity): Layout => ({
  partitionKey: entity.partitionKey,
  rowKey: entity.rowKey,
  entityType: 'layout',
  name: entity.name,
  isDefault: entity.isDefault || false,

  headerComponents: safeJsonParse(entity.headerComponents, []),
  footerComponents: safeJsonParse(entity.footerComponents, []),
  bodySections: safeJsonParse(entity.bodySections, getDefaultBodySections()),

  headerStyles: { ...defaultHeaderStyles, ...safeJsonParse(entity.headerStyles, {}) },
  footerStyles: { ...defaultFooterStyles, ...safeJsonParse(entity.footerStyles, {}) },

  globalStyles: safeJsonParse(entity.globalStyles, {}),

  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
});

// Parse page entity from storage to app format
export const parsePageEntity = (entity: PageEntity): Page => ({
  partitionKey: entity.partitionKey,
  rowKey: entity.rowKey,
  entityType: 'page',
  pageType: entity.pageType,

  title: entity.title,
  slug: entity.slug,
  summary: entity.summary || '',
  category: entity.category || null,

  layoutRowKey: entity.layoutRowKey || null,
  parentRowKey: entity.parentRowKey || null,

  sectionComponents: safeJsonParse(entity.sectionComponents, {}),
  globalStyles: safeJsonParse(entity.globalStyles, {}),

  isPublished: entity.isPublished || false,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
});

// Safe JSON parse with fallback
export const safeJsonParse = <T>(jsonString: string | undefined | null, fallback: T): T => {
  if (!jsonString || jsonString === '') return fallback;
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
};

// ===========================================
// DEPRECATED (for backward compatibility)
// ===========================================

// @deprecated Use PageEntity instead
export interface PageWithLayout {
  rowKey: string;
  partitionKey: string;
  pageType: PageType | 'layout';
  slug: string;
  parentRowKey: string | null;
  layoutRowKey: string | null;
  title: string;
  summary: string;
  category: string | null;
  components: string;
  sectionComponents: string;
  globalStyles: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
