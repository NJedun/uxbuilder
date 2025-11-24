import { ComponentType } from '../types/builder';
import { useBuilderStore } from '../store/builderStore';
import { useState } from 'react';

interface ComponentItem {
  type: ComponentType;
  label: string;
  defaultProps?: Record<string, any>;
  defaultSize: { w: number; h: number };
}

interface ComponentGroup {
  title: string;
  items: ComponentItem[];
}

const componentGroups: ComponentGroup[] = [
  {
    title: 'Header',
    items: [
      {
        type: 'Logo',
        label: 'Logo',
        defaultProps: { text: 'LOGO', size: 'medium' },
        defaultSize: { w: 1, h: 1 },
      },
      {
        type: 'NavMenu',
        label: 'Nav Menu',
        defaultProps: { variant: 'simple', itemCount: 4 },
        defaultSize: { w: 4, h: 1 },
      },
      {
        type: 'SearchBar',
        label: 'Search Bar',
        defaultProps: { variant: 'simple' },
        defaultSize: { w: 3, h: 1 },
      },
      {
        type: 'HeaderActions',
        label: 'Header Actions',
        defaultProps: { variant: 'icons' },
        defaultSize: { w: 2, h: 1 },
      },
      {
        type: 'HamburgerIcon',
        label: 'Hamburger Menu',
        defaultProps: {},
        defaultSize: { w: 1, h: 1 },
      },
      {
        type: 'HeaderPattern',
        label: 'Full Header',
        defaultProps: { variant: 'simple' },
        defaultSize: { w: 12, h: 2 },
      },
    ],
  },
  {
    title: 'Content Patterns',
    items: [
      {
        type: 'HeroSection',
        label: 'Hero Section',
        defaultProps: { align: 'center', hasImageBackground: false },
        defaultSize: { w: 12, h: 6 },
      },
      {
        type: 'HeroWithImage',
        label: 'Hero with Image',
        defaultProps: { align: 'left' },
        defaultSize: { w: 12, h: 6 },
      },
      {
        type: 'ProductList',
        label: 'Product List',
        defaultProps: { layout: 'grid', columns: 3 },
        defaultSize: { w: 12, h: 8 },
      },
      {
        type: 'ProductCard',
        label: 'Product Card',
        defaultProps: { variant: 'grid' },
        defaultSize: { w: 3, h: 4 },
      },
      {
        type: 'ProductDetails',
        label: 'Product Details',
        defaultProps: { layout: 'sideBySide' },
        defaultSize: { w: 12, h: 8 },
      },
      {
        type: 'ContactForm',
        label: 'Contact Form',
        defaultProps: { layout: 'standard' },
        defaultSize: { w: 8, h: 8 },
      },
    ],
  },
  {
    title: 'Basic Elements',
    items: [
      {
        type: 'Title',
        label: 'Title',
        defaultProps: { text: 'Heading', level: 1 },
        defaultSize: { w: 2, h: 1 },
      },
      {
        type: 'Paragraph',
        label: 'Paragraph',
        defaultProps: { lines: 3 },
        defaultSize: { w: 2, h: 1 },
      },
      {
        type: 'Image',
        label: 'Image',
        defaultProps: {},
        defaultSize: { w: 2, h: 2 },
      },
      {
        type: 'List',
        label: 'List',
        defaultProps: { items: 2 },
        defaultSize: { w: 2, h: 1 },
      },
      {
        type: 'Card',
        label: 'Card',
        defaultProps: { variant: 'solid' },
        defaultSize: { w: 3, h: 2 },
      },
      {
        type: 'HorizontalLine',
        label: 'Horizontal Line',
        defaultProps: { width: 2, align: 'center' },
        defaultSize: { w: 12, h: 1 },
      },
    ],
  },
  {
    title: 'Buttons & Links',
    items: [
      {
        type: 'Button',
        label: 'Button',
        defaultProps: { text: 'Click Me', variant: 'primary' },
        defaultSize: { w: 1, h: 1 },
      },
      {
        type: 'Link',
        label: 'Link',
        defaultProps: { variant: 'primary', align: 'left' },
        defaultSize: { w: 1, h: 1 },
      },
    ],
  },
  {
    title: 'Forms',
    items: [
      {
        type: 'Form',
        label: 'Form',
        defaultProps: { showLabels: true },
        defaultSize: { w: 3, h: 6 },
      },
      {
        type: 'Input',
        label: 'Input',
        defaultProps: {},
        defaultSize: { w: 2, h: 1 },
      },
      {
        type: 'Textarea',
        label: 'Textarea',
        defaultProps: { rows: 3 },
        defaultSize: { w: 2, h: 2 },
      },
      {
        type: 'Dropdown',
        label: 'Dropdown',
        defaultProps: {},
        defaultSize: { w: 2, h: 1 },
      },
    ],
  },
  {
    title: 'Social',
    items: [
      {
        type: 'SocialLinks',
        label: 'Social Links',
        defaultProps: { count: 4, align: 'center' },
        defaultSize: { w: 2, h: 1 },
      },
    ],
  },
  {
    title: 'Footer',
    items: [
      {
        type: 'FooterPattern',
        label: 'Full Footer',
        defaultProps: { variant: 'multiColumn' },
        defaultSize: { w: 12, h: 4 },
      },
      {
        type: 'CopyrightText',
        label: 'Copyright Text',
        defaultProps: { align: 'center' },
        defaultSize: { w: 12, h: 1 },
      },
    ],
  },
];

export default function ComponentLibrary() {
  const { addComponent, selectedLayoutSection } = useBuilderStore();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['Header'])); // Header open by default

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const handleDragStart = (e: React.DragEvent, item: ComponentItem) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: item.type,
      defaultProps: item.defaultProps,
      defaultSize: item.defaultSize,
    }));
  };

  const handleAddComponent = (item: ComponentItem) => {
    const id = `${item.type}-${Date.now()}`;
    const defaultLayout = {
      x: 0,
      y: 0,
      w: item.defaultSize.w,
      h: item.defaultSize.h,
    };

    // Determine which section to add to
    let parentId: string | undefined;
    if (selectedLayoutSection) {
      parentId = selectedLayoutSection.toLowerCase();
    } else {
      // Default to body if no section is selected
      parentId = 'body';
    }

    addComponent({
      i: id,
      id,
      type: item.type,
      props: item.defaultProps,
      x: 0,
      y: 0,
      w: item.defaultSize.w,
      h: item.defaultSize.h,
      parentId,
      mobile: defaultLayout,
      tablet: defaultLayout,
      desktop: defaultLayout,
    } as any);
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Components</h2>

      {/* Selected Section Banner */}
      {selectedLayoutSection && (
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg">
          <div className="text-sm font-bold">Adding to: {selectedLayoutSection}</div>
          <div className="text-xs opacity-90 mt-1">Components will be placed in this section</div>
        </div>
      )}

      <div className="space-y-2 overflow-y-auto flex-1 pr-2">
        {componentGroups.map((group) => (
          <div key={group.title} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full px-4 py-2 flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <span className="font-semibold text-sm text-gray-700">{group.title}</span>
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  openGroups.has(group.title) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Group Items */}
            {openGroups.has(group.title) && (
              <div className="p-2 space-y-2">
                {group.items.map((item) => (
                  <div
                    key={`${group.title}-${item.type}-${item.label}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => handleAddComponent(item)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-500 transition-colors text-left text-sm font-medium text-gray-700 cursor-grab active:cursor-grabbing"
                  >
                    + {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
        <h3 className="text-sm font-semibold mb-2 text-gray-600">Instructions</h3>
        <p className="text-xs text-gray-500 mb-2">
          <strong>Drag</strong> components onto the canvas or <strong>click</strong> to add at top-left.
        </p>
        <p className="text-xs text-gray-500">
          Drag to move, resize from corner, hover to delete.
        </p>
      </div>
    </div>
  );
}
