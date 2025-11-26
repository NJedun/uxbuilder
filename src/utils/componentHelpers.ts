import { PlacedComponent } from '../types/builder';

/**
 * Extract variant from component props, handling both 'variant' and 'layout' props
 * Some components use 'variant' while others use 'layout' for the same purpose
 */
export function getComponentVariant(component: PlacedComponent): string {
  return component.props?.variant || component.props?.layout || 'default';
}

/**
 * Check if component has a specific variant/layout
 */
export function hasVariant(component: PlacedComponent, targetVariant: string): boolean {
  return getComponentVariant(component) === targetVariant;
}

/**
 * Generate a unique key for component type + variant combination
 */
export function getComponentKey(type: string, variant?: string): string {
  return `${type}-${variant || 'default'}`;
}
