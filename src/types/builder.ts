export type ComponentType = 'Button' | 'Title' | 'Container' | 'Logo' | 'Image' | 'Card' | 'Paragraph' | 'Link' | 'List' | 'Input' | 'Textarea' | 'Dropdown' | 'Form' | 'SocialLinks';

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
}

export type Viewport = 'mobile' | 'tablet' | 'desktop';

export interface ViewportConfig {
  width: number;
  cols: number;
  rowHeight: number;
}
