import { useState } from 'react';
import { useVisualBuilderStore, VisualComponent } from '../store/visualBuilderStore';

interface TreeNodeProps {
  component: VisualComponent;
  depth: number;
  index: number;
  parentId?: string;
  isFirst: boolean;
  isLast: boolean;
}

function TreeNode({ component, depth, index, parentId, isFirst, isLast }: TreeNodeProps) {
  const {
    selectedComponentId,
    selectComponent,
    moveComponent,
    deleteComponent,
  } = useVisualBuilderStore();
  const [expanded, setExpanded] = useState(true);

  const isSelected = selectedComponentId === component.id;
  const hasChildren = component.children && component.children.length > 0;

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveComponent(component.id, 'up', parentId);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveComponent(component.id, 'down', parentId);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this component?')) {
      deleteComponent(component.id);
    }
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'Header': return '📍';
      case 'HeroSection': return '🎯';
      case 'Image': return '🖼️';
      case 'Row': return '⊞';
      case 'LinkList': return '📋';
      case 'ImageBox': return '🖼️';
      case 'Text': return '📝';
      case 'Button': return '🔘';
      case 'Divider': return '➖';
      case 'Footer': return '🦶';
      default: return '📦';
    }
  };

  const getComponentLabel = (comp: VisualComponent) => {
    if (comp.type === 'Header') {
      return comp.props?.logoText || 'Header';
    }
    if (comp.type === 'HeroSection') {
      const title = comp.props?.title || '';
      return title.length > 20 ? title.substring(0, 20) + '...' : title || 'Hero Section';
    }
    if (comp.type === 'Image') {
      const alt = comp.props?.alt || '';
      return alt.length > 20 ? alt.substring(0, 20) + '...' : alt || 'Image';
    }
    if (comp.type === 'Row') {
      return `Row (${comp.props?.columns || 2} cols)`;
    }
    if (comp.type === 'LinkList') {
      return comp.props?.label || 'Link List';
    }
    if (comp.type === 'ImageBox') {
      const title = comp.props?.title || '';
      return title.length > 20 ? title.substring(0, 20) + '...' : title || 'Image Box';
    }
    if (comp.type === 'Text') {
      const content = comp.props?.content || '';
      return content.length > 20 ? content.substring(0, 20) + '...' : content || 'Text';
    }
    if (comp.type === 'Button') {
      return comp.props?.text || 'Button';
    }
    if (comp.type === 'Divider') {
      return 'Divider';
    }
    if (comp.type === 'Footer') {
      return 'Footer';
    }
    return comp.type;
  };

  return (
    <div>
      <div
        onClick={() => selectComponent(component.id)}
        className={`
          flex items-center gap-1 px-2 py-1.5 cursor-pointer rounded text-sm
          ${isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand/Collapse button */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            {expanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Icon and Label */}
        <span className="text-base">{getComponentIcon(component.type)}</span>
        <span className="flex-1 truncate">{getComponentLabel(component)}</span>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100">
          <button
            onClick={handleMoveUp}
            disabled={isFirst}
            className={`p-1 rounded text-xs ${
              isFirst
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }`}
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={handleMoveDown}
            disabled={isLast}
            className={`p-1 rounded text-xs ${
              isLast
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }`}
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded text-xs text-red-400 hover:bg-red-100 hover:text-red-600"
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {component.children!.map((child, childIndex) => (
            <TreeNode
              key={child.id}
              component={child}
              depth={depth + 1}
              index={childIndex}
              parentId={component.id}
              isFirst={childIndex === 0}
              isLast={childIndex === component.children!.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComponentTree() {
  const { components, sectionComponents, activeSectionId } = useVisualBuilderStore();

  // Get components for the active section, fallback to deprecated components array
  const activeComponents = activeSectionId && sectionComponents[activeSectionId]
    ? sectionComponents[activeSectionId]
    : components;

  if (activeComponents.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <p>No components yet</p>
        <p className="text-xs mt-1">Add components from the library</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="px-3 pb-2 mb-2 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Component Tree
        </h3>
      </div>
      <div className="space-y-0.5">
        {activeComponents.map((component, index) => (
          <div key={component.id} className="group">
            <TreeNode
              component={component}
              depth={0}
              index={index}
              isFirst={index === 0}
              isLast={index === activeComponents.length - 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
