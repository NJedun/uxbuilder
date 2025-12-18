import { useState, useRef } from 'react';
import { useVisualBuilderStore, VisualComponent } from '../store/visualBuilderStore';
import { useConfirm } from '../components/ConfirmDialog';

interface SectionInfo {
  id: string;
  name: string;
}

interface DragState {
  draggedId: string | null;
  draggedParentId?: string;
  dropTargetId: string | null;
  dropPosition: 'before' | 'after' | 'inside' | null;
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
  forceExpanded?: boolean | null; // null = use local state, true = expand all, false = collapse all
  dragState: DragState;
  onDragStateChange: (state: DragState) => void;
  siblingCount: number;
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
  forceExpanded,
  dragState,
  onDragStateChange,
  siblingCount,
}: TreeNodeProps) {
  const {
    selectedComponentId,
    selectedComponentIds,
    toggleComponentSelection,
    moveComponent,
    deleteComponent,
    duplicateComponent,
    saveComponentAsTemplate,
    reorderComponentByDrag,
  } = useVisualBuilderStore();
  const { confirm } = useConfirm();
  const [localExpanded, setLocalExpanded] = useState(true);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const nodeRef = useRef<HTMLDivElement>(null);

  // Use forceExpanded if set, otherwise use local state
  const expanded = forceExpanded !== null && forceExpanded !== undefined ? forceExpanded : localExpanded;

  const isSelected = selectedComponentId === component.id;
  const isMultiSelected = selectedComponentIds.includes(component.id);
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

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateComponent(component.id);
  };

  const handleSaveAsTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplateName(component.type);
    setShowSaveTemplateModal(true);
  };

  const handleConfirmSaveTemplate = () => {
    if (templateName.trim()) {
      saveComponentAsTemplate(component.id, templateName.trim());
      setShowSaveTemplateModal(false);
      setTemplateName('');
    }
  };

  const handleMoveToSection = (e: React.MouseEvent, targetSectionId: string) => {
    e.stopPropagation();
    setShowSectionMenu(false);
    if (onMoveToSection && targetSectionId !== currentSectionId) {
      onMoveToSection(component.id, targetSectionId);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', component.id);
    onDragStateChange({
      draggedId: component.id,
      draggedParentId: parentId,
      dropTargetId: null,
      dropPosition: null,
    });
  };

  const handleDragEnd = () => {
    onDragStateChange({
      draggedId: null,
      draggedParentId: undefined,
      dropTargetId: null,
      dropPosition: null,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (dragState.draggedId === component.id) return;

    const rect = nodeRef.current?.getBoundingClientRect();
    if (!rect) return;

    const y = e.clientY - rect.top;
    const height = rect.height;

    let position: 'before' | 'after' | 'inside';

    // Determine drop position based on cursor location
    if (hasChildren && y > height * 0.25 && y < height * 0.75) {
      position = 'inside';
    } else if (y < height / 2) {
      position = 'before';
    } else {
      position = 'after';
    }

    if (dragState.dropTargetId !== component.id || dragState.dropPosition !== position) {
      onDragStateChange({
        ...dragState,
        dropTargetId: component.id,
        dropPosition: position,
      });
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    // Only clear if we're actually leaving this component
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!nodeRef.current?.contains(relatedTarget)) {
      if (dragState.dropTargetId === component.id) {
        onDragStateChange({
          ...dragState,
          dropTargetId: null,
          dropPosition: null,
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === component.id) {
      handleDragEnd();
      return;
    }

    const { dropPosition } = dragState;

    if (dropPosition === 'inside' && hasChildren) {
      // Drop inside this component (at the end of children)
      reorderComponentByDrag(draggedId, component.children!.length, undefined, component.id);
    } else if (dropPosition === 'before') {
      // Drop before this component
      reorderComponentByDrag(draggedId, index, undefined, parentId);
    } else if (dropPosition === 'after') {
      // Drop after this component
      reorderComponentByDrag(draggedId, index + 1, undefined, parentId);
    }

    handleDragEnd();
  };

  // Visual feedback for drag state
  const isDragging = dragState.draggedId === component.id;
  const isDropTarget = dragState.dropTargetId === component.id;
  const dropPosition = isDropTarget ? dragState.dropPosition : null;

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
      {/* Drop indicator before */}
      {dropPosition === 'before' && (
        <div
          className="h-0.5 bg-blue-500 rounded-full mx-2"
          style={{ marginLeft: `${depth * 16 + 8}px` }}
        />
      )}
      <div
        ref={nodeRef}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => toggleComponentSelection(component.id, e.ctrlKey || e.metaKey, e.shiftKey)}
        className={`
          flex items-center gap-1 px-2 py-1.5 cursor-pointer rounded text-sm transition-all
          ${isSelected ? 'bg-blue-100 text-blue-800' : isMultiSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}
          ${isDragging ? 'opacity-50' : ''}
          ${dropPosition === 'inside' ? 'ring-2 ring-blue-400 ring-inset bg-blue-50' : ''}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Drag handle */}
        <span className="cursor-grab text-gray-400 hover:text-gray-600 mr-1" title="Drag to reorder">
          ⋮⋮
        </span>

        {/* Expand/Collapse button */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLocalExpanded(!localExpanded);
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
          {/* Save as template button */}
          <button
            onClick={handleSaveAsTemplate}
            className="p-1 rounded text-xs text-green-500 hover:bg-green-100 hover:text-green-700"
            title="Save as template"
          >
            💾
          </button>
          {/* Duplicate button */}
          <button
            onClick={handleDuplicate}
            className="p-1 rounded text-xs text-blue-500 hover:bg-blue-100 hover:text-blue-700"
            title="Duplicate"
          >
            ⧉
          </button>
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
              forceExpanded={forceExpanded}
              dragState={dragState}
              onDragStateChange={onDragStateChange}
              siblingCount={component.children!.length}
            />
          ))}
        </div>
      )}

      {/* Drop indicator after */}
      {dropPosition === 'after' && (
        <div
          className="h-0.5 bg-blue-500 rounded-full mx-2"
          style={{ marginLeft: `${depth * 16 + 8}px` }}
        />
      )}

      {/* Save as Template Modal */}
      {showSaveTemplateModal && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setShowSaveTemplateModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-4 w-80">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Save as Template</h3>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmSaveTemplate();
                if (e.key === 'Escape') setShowSaveTemplateModal(false);
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveTemplateModal(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSaveTemplate}
                disabled={!templateName.trim()}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface ComponentTreeProps {
  availableSections?: SectionInfo[];
}

export default function ComponentTree({ availableSections = [] }: ComponentTreeProps) {
  const {
    components,
    sectionComponents,
    activeSectionId,
    moveComponentToSection,
    selectedComponentIds,
    clearSelection,
    deleteSelectedComponents,
    duplicateSelectedComponents,
    moveSelectedComponentsToSection,
  } = useVisualBuilderStore();
  const { confirm } = useConfirm();
  const [forceExpanded, setForceExpanded] = useState<boolean | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    draggedId: null,
    draggedParentId: undefined,
    dropTargetId: null,
    dropPosition: null,
  });
  const [showMoveToSectionMenu, setShowMoveToSectionMenu] = useState(false);

  const hasMultipleSelected = selectedComponentIds.length > 1;

  const handleDeleteSelected = async () => {
    const confirmed = await confirm({
      title: 'Delete Components',
      message: `Are you sure you want to delete ${selectedComponentIds.length} selected components?`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (confirmed) {
      deleteSelectedComponents();
    }
  };

  const handleMoveSelectedToSection = (targetSectionId: string) => {
    setShowMoveToSectionMenu(false);
    moveSelectedComponentsToSection(targetSectionId);
  };

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

  // Check if there are any components with children (for showing expand/collapse buttons)
  const hasNestedComponents = activeComponents.some(comp => comp.children && comp.children.length > 0);

  return (
    <div className="py-2">
      <div className="px-3 pb-2 mb-2 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Component Tree
        </h3>
        {hasNestedComponents && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setForceExpanded(true)}
              className={`p-1 rounded text-xs transition-colors ${
                forceExpanded === true
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Expand all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => setForceExpanded(false)}
              className={`p-1 rounded text-xs transition-colors ${
                forceExpanded === false
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Collapse all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {forceExpanded !== null && (
              <button
                onClick={() => setForceExpanded(null)}
                className="p-1 rounded text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="Reset to individual states"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Multi-select action bar */}
      {hasMultipleSelected && (
        <div className="px-3 py-2 mb-2 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
          <span className="text-xs text-blue-700 font-medium">
            {selectedComponentIds.length} selected
          </span>
          <div className="flex items-center gap-1">
            {/* Move to section dropdown */}
            {sections.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowMoveToSectionMenu(!showMoveToSectionMenu)}
                  className="p-1 rounded text-xs text-purple-600 hover:bg-purple-100"
                  title="Move to section"
                >
                  ⇄
                </button>
                {showMoveToSectionMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMoveToSectionMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 min-w-[140px]">
                      <div className="px-2 py-1 text-xs text-gray-500 border-b border-gray-100">
                        Move to:
                      </div>
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => handleMoveSelectedToSection(section.id)}
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
              onClick={duplicateSelectedComponents}
              className="p-1 rounded text-xs text-blue-600 hover:bg-blue-100"
              title="Duplicate selected"
            >
              ⧉
            </button>
            <button
              onClick={handleDeleteSelected}
              className="p-1 rounded text-xs text-red-500 hover:bg-red-100"
              title="Delete selected"
            >
              ×
            </button>
            <button
              onClick={clearSelection}
              className="p-1 rounded text-xs text-gray-500 hover:bg-gray-200"
              title="Clear selection"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
              forceExpanded={forceExpanded}
              dragState={dragState}
              onDragStateChange={setDragState}
              siblingCount={activeComponents.length}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
