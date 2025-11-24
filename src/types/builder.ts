export type ComponentType =
  | 'Button'
  | 'Title'
  | 'Logo'
  | 'Image'
  | 'Card'
  | 'Paragraph'
  | 'Link'
  | 'List'
  | 'Input'
  | 'Textarea'
  | 'Dropdown'
  | 'Form'
  | 'SocialLinks'
  // Header Components
  | 'NavMenu'
  | 'SearchBar'
  | 'HeaderActions'
  | 'HamburgerIcon'
  | 'HeaderPattern'
  | 'HorizontalLine'
  // Footer Components
  | 'FooterPattern'
  | 'CopyrightText';

export interface ComponentDefinition {
  id: string;
  type: ComponentType;
  props?: Record<string, any>;
  isBackground?: boolean; // If true, renders on background layer (like Container)
}

export interface ComponentLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlacedComponent extends ComponentDefinition {
  i: string; // unique identifier for grid layout
  x: number;
  y: number;
  w: number;
  h: number;
  parentId?: string; // 'header', 'body', or 'footer' for section-based layout
}

export type Viewport = 'mobile' | 'tablet' | 'desktop';

export interface ViewportConfig {
  width: number;
  cols: number;
  rowHeight: number;
}
