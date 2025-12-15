import { useEffect } from 'react';
import { useVisualBuilderStore } from '../store/visualBuilderStore';
import VisualComponentRenderer from './VisualComponentRenderer';
import type { ViewMode } from '../pages/VisualBuilder';
import { Layout, BodySection, defaultBodyStyles, createDefaultBodySection } from '../types/layout';

interface VisualCanvasProps {
  viewMode?: ViewMode;
  previewLayout?: Layout | null;
}

export default function VisualCanvas({ viewMode = 'desktop', previewLayout }: VisualCanvasProps) {
  const {
    components,
    sectionComponents,
    activeSectionId,
    setActiveSectionId,
    selectComponent,
    selectedComponentId,
    loadFromLocalStorage,
  } = useVisualBuilderStore();

  // Get body sections from layout or create default
  const bodySections: BodySection[] = previewLayout?.bodySections && previewLayout.bodySections.length > 0
    ? previewLayout.bodySections
    : [createDefaultBodySection(1)];

  // Set first section as active if none selected
  useEffect(() => {
    if (!activeSectionId && bodySections.length > 0) {
      setActiveSectionId(bodySections[0].id);
    }
  }, [activeSectionId, bodySections, setActiveSectionId]);

  // Get components for a specific section
  const getSectionComponents = (sectionId: string) => {
    return sectionComponents[sectionId] || [];
  };

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on canvas, not on a component
    if (e.target === e.currentTarget) {
      selectComponent(null);
    }
  };

  // Get canvas width based on view mode
  const getCanvasWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
    }
  };

  const canvasWidth = getCanvasWidth();
  const isResponsiveView = viewMode !== 'desktop';

  return (
    <div className="flex justify-center w-full">
      <div
        id="visual-builder-canvas"
        className={`bg-white shadow-lg rounded-lg min-h-screen relative transition-all duration-300 ${
          isResponsiveView ? 'border-2 border-gray-300' : ''
        }`}
        style={{
          width: canvasWidth,
          maxWidth: viewMode === 'desktop' ? '1500px' : canvasWidth,
          minWidth: isResponsiveView ? canvasWidth : undefined,
        }}
        onClick={handleCanvasClick}
      >
      {/* Layout Header Preview */}
      {previewLayout && previewLayout.headerComponents.length > 0 && (
        <div
          className="relative cursor-pointer"
          onClick={() => selectComponent(null)}
        >
          <div className="absolute top-1 left-1 z-10 px-2 py-0.5 bg-purple-500 text-white text-[10px] rounded opacity-75">
            Layout Header
          </div>
          {previewLayout.headerComponents.map((component) => (
            <VisualComponentRenderer
              key={`layout-header-${component.id}`}
              component={component}
              isSelected={false}
              onSelect={() => selectComponent(null)}
              viewMode={viewMode}
              readOnly={true}
            />
          ))}
        </div>
      )}

      {/* Main Content Area (Body Sections) */}
      {bodySections.map((section) => {
        const sectionComps = getSectionComponents(section.id);
        const isActiveSection = activeSectionId === section.id;
        const styles = section.styles || defaultBodyStyles;

        return (
          <main
            key={section.id}
            onClick={(e) => {
              e.stopPropagation();
              setActiveSectionId(section.id);
            }}
            className={`relative cursor-pointer transition-all ${
              isActiveSection ? 'ring-2 ring-blue-400 ring-opacity-50' : 'hover:ring-1 hover:ring-gray-300'
            }`}
            style={{
              maxWidth: styles.maxWidth || '100%',
              margin: styles.margin || '0',
              backgroundColor: styles.backgroundColor || 'transparent',
              borderBottom: styles.borderBottomWidth
                ? `${styles.borderBottomWidth} ${styles.borderBottomStyle || 'solid'} ${styles.borderBottomColor || '#e5e7eb'}`
                : undefined,
            }}
          >
            {/* Section label */}
            <div
              className={`absolute top-1 left-1 z-10 px-2 py-0.5 text-white text-[10px] rounded transition-opacity ${
                isActiveSection ? 'bg-blue-500 opacity-100' : 'bg-gray-400 opacity-50'
              }`}
            >
              {section.name}
            </div>

            <div
              style={{
                maxWidth: styles.contentMaxWidth || '100%',
                margin: styles.contentMargin || '0',
                padding: styles.padding || '0',
                minHeight: styles.minHeight || '100px',
              }}
            >
              {sectionComps.length === 0 ? (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg m-4">
                  <div className="text-center text-gray-400">
                    <svg
                      className="mx-auto h-8 w-8 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <p className="text-sm font-medium">Add components to {section.name}</p>
                    <p className="text-xs mt-1">Click to select, then add from sidebar</p>
                  </div>
                </div>
              ) : (
                <>
                  {sectionComps.map((component) => (
                    <VisualComponentRenderer
                      key={component.id}
                      component={component}
                      isSelected={selectedComponentId === component.id}
                      onSelect={() => selectComponent(component.id)}
                      viewMode={viewMode}
                    />
                  ))}
                </>
              )}
            </div>
          </main>
        );
      })}

      {/* Layout Footer Preview */}
      {previewLayout && previewLayout.footerComponents.length > 0 && (
        <div
          className="relative cursor-pointer"
          onClick={() => selectComponent(null)}
        >
          <div className="absolute top-1 left-1 z-10 px-2 py-0.5 bg-purple-500 text-white text-[10px] rounded opacity-75">
            Layout Footer
          </div>
          {previewLayout.footerComponents.map((component) => (
            <VisualComponentRenderer
              key={`layout-footer-${component.id}`}
              component={component}
              isSelected={false}
              onSelect={() => selectComponent(null)}
              viewMode={viewMode}
              readOnly={true}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
