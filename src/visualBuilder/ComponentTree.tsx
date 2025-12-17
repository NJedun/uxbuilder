import { useState } from 'react';
import { useVisualBuilderStore, VisualComponent } from '../store/visualBuilderStore';
import { useConfirm } from '../components/ConfirmDialog';

interface SectionInfo {
  id: string;
  name: string;
}

interface TreeNodeProps {
  component: VisualComponent;
  depth: number;
  index: number;
  parentId?: string;
  isFirst: boolean;
  isLast: boolean;
  currentSectionId: string;
  availableSections: SectionInfo[];
  onMoveToSection?: (componentId: string, targetSectionId: string) => void;
}

function TreeNode({
  component,
  depth,
  index,
  parentId,
  isFirst,
  isLast,
  currentSectionId,
  availableSections,
  onMoveToSection,
}: TreeNodeProps) {
  const {
    selectedComponentId,
    selectComponent,
    moveComponent,
    deleteComponent,
  } = useVisualBuilderStore();
  const { confirm } = useConfirm();
  const [expanded, setExpanded] = useState(true);
  const [showSectionMenu, setShowSectionMenu] = useState(false);

  const isSelected = selectedComponentId === component.id;
  const hasChildren = component.children && component.children.length > 0;

  // Only show section move for root-level components (no parentId) when there are multiple sections
  const canMoveToSection = !parentId && availableSections.length > 1;

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveComponent(component.id, 'up', parentId);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveComponent(component.id, 'down', parentId);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await confirm({
      title: 'Delete Component',
      message: 'Are you sure you want to delete this component?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (confirmed) {
      deleteComponent(component.id);
    }
  };

  const handleMoveToSection = (e: React.MouseEvent, targetSectionId: string) => {
    e.stopPropagation();
    setShowSectionMenu(false);
    if (onMoveToSection && targetSectionId !== currentSectionId) {
      onMoveToSection(component.id, targetSectionId);
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
          {/* Move to section dropdown */}
          {canMoveToSection && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSectionMenu(!showSectionMenu);
                }}
                className="p-1 rounded text-xs text-purple-500 hover:bg-purple-100 hover:text-purple-700"
                title="Move to section"
              >
                ⇄
              </button>
              {showSectionMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSectionMenu(false);
                    }}
                  />
                  <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded shadow-lg z-20 min-w-[140px]">
                    <div className="px-2 py-1 text-xs text-gray-500 border-b border-gray-100">
                      Move to:
                    </div>
                    {availableSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={(e) => handleMoveToSection(e, section.id)}
                        disabled={section.id === currentSectionId}
                        className={`w-full px-3 py-1.5 text-left text-xs ${
                          section.id === currentSectionId
                            ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-purple-50'
                        }`}
                      >
                        {section.name}
                        {section.id === currentSectionId && ' (current)'}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
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
              currentSectionId={currentSectionId}
              availableSections={availableSections}
              onMoveToSection={onMoveToSection}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ComponentTreeProps {
  availableSections?: SectionInfo[];
}

export default function ComponentTree({ availableSections = [] }: ComponentTreeProps) {
  const { components, sectionComponents, activeSectionId, moveComponentToSection } = useVisualBuilderStore();

  // Get components for the active section, fallback to deprecated components array
  const activeComponents = activeSectionId && sectionComponents[activeSectionId]
    ? sectionComponents[activeSectionId]
    : components;

  // Derive sections from sectionComponents if not provided
  const sections: SectionInfo[] = availableSections.length > 0
    ? availableSections
    : Object.keys(sectionComponents).map((id, index) => ({
        id,
        name: `Body ${index + 1}`,
      }));

  const currentSectionId = activeSectionId || 'default';

  const handleMoveToSection = (componentId: string, targetSectionId: string) => {
    moveComponentToSection(componentId, currentSectionId, targetSectionId);
  };

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
              currentSectionId={currentSectionId}
              availableSections={sections}
              onMoveToSection={handleMoveToSection}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
