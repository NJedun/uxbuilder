import { ComponentType } from '../types/builder';
import { useBuilderStore } from '../store/builderStore';

interface ComponentItem {
  type: ComponentType;
  label: string;
  defaultProps?: Record<string, any>;
  defaultSize: { w: number; h: number };
}

const availableComponents: ComponentItem[] = [
  {
    type: 'Container',
    label: 'Container',
    defaultProps: { variant: 'bordered', padding: 'medium', borderWidth: 4 },
    defaultSize: { w: 4, h: 3 },
  },
  {
    type: 'Card',
    label: 'Card',
    defaultProps: { variant: 'solid' },
    defaultSize: { w: 3, h: 2 },
  },
  {
    type: 'Image',
    label: 'Image',
    defaultProps: {},
    defaultSize: { w: 2, h: 2 },
  },
  {
    type: 'Logo',
    label: 'Logo',
    defaultProps: { text: 'LOGO', size: 'medium' },
    defaultSize: { w: 1, h: 1 },
  },
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
  {
    type: 'List',
    label: 'List',
    defaultProps: { items: 2 },
    defaultSize: { w: 2, h: 1 },
  },
  {
    type: 'SocialLinks',
    label: 'Social Links',
    defaultProps: { count: 4, align: 'center' },
    defaultSize: { w: 2, h: 1 },
  },
  {
    type: 'Form',
    label: 'Form',
    defaultProps: {},
    defaultSize: { w: 3, h: 3 },
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
];

export default function ComponentLibrary() {
  const { addComponent } = useBuilderStore();

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

    addComponent({
      i: id,
      id,
      type: item.type,
      props: item.defaultProps,
      x: 0,
      y: 0,
      w: item.defaultSize.w,
      h: item.defaultSize.h,
      mobile: defaultLayout,
      tablet: defaultLayout,
      desktop: defaultLayout,
    } as any);
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Components</h2>
      <div className="space-y-2">
        {availableComponents.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onClick={() => handleAddComponent(item)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors text-left font-medium text-gray-700 cursor-grab active:cursor-grabbing"
          >
            + {item.label}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold mb-2 text-gray-600">Instructions</h3>
        <p className="text-xs text-gray-500 mb-3">
          <strong>Drag</strong> components onto the canvas or <strong>click</strong> to add at top-left.
        </p>
        <p className="text-xs text-gray-500">
          Drag to move, resize from corner, hover to delete.
        </p>
      </div>
    </div>
  );
}
