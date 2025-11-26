import { useState, useRef, useEffect } from 'react';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import { useBuilderStore, viewportConfigs } from '../store/builderStore';
import ComponentRenderer from '../components/ComponentRenderer';
import { useTheme } from '../contexts/ThemeContext';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface CanvasProps {
  readOnly?: boolean;
}

export default function Canvas({ readOnly = false }: CanvasProps) {
  const { theme } = useTheme();
  const {
    viewport,
    canvasSettingsByViewport,
    componentsByViewport,
    selectedComponents,
    selectedLayoutSection,
    updateLayout,
    removeComponent,
    addComponent,
    setSelectedComponents,
    setSelectedLayoutSection,
    setSectionHeight,
    clearSelection
  } = useBuilderStore();

  const components = componentsByViewport[viewport];
  const canvasSettings = canvasSettingsByViewport[viewport];
  const baseConfig = viewportConfigs[viewport];
  const canvasRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState<'header' | 'body' | 'footer' | null>(null);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);
  const [dragPreview, setDragPreview] = useState<{ section: string; col: number; row: number; width: number; height: number } | null>(null);

  const config = {
    ...baseConfig,
    width: canvasSettings.width || baseConfig.width,
    cols: canvasSettings.cols || baseConfig.cols,
  };

  const headerHeight = canvasSettings.headerHeight;
  const bodyHeight = canvasSettings.bodyHeight;
  const footerHeight = canvasSettings.footerHeight;

  // Separate components by section
  const headerComponents = components.filter(c => c.parentId === 'header');
  const bodyComponents = components.filter(c => c.parentId === 'body');
  const footerComponents = components.filter(c => c.parentId === 'footer');

  // Create layouts for each section
  const createLayouts = (sectionComponents: typeof components): Layouts => ({
    lg: sectionComponents.map((comp) => ({
      i: comp.i,
      x: comp.x,
      y: comp.y,
      w: comp.w,
      h: comp.h,
      static: false,
    })),
  });

  const headerLayouts = createLayouts(headerComponents);
  const bodyLayouts = createLayouts(bodyComponents);
  const footerLayouts = createLayouts(footerComponents);

  // Calculate minimum height needed for each section based on components
  const calculateMinHeight = (sectionComponents: typeof components): number => {
    if (sectionComponents.length === 0) return 100; // Minimum height when empty

    // Find the bottom-most component
    const maxBottom = Math.max(
      ...sectionComponents.map(comp => (comp.y + comp.h) * config.rowHeight)
    );

    return Math.max(100, maxBottom + 50); // Add 50px padding at bottom
  };

  // Auto-expand sections if components exceed current height
  useEffect(() => {
    const headerMinHeight = calculateMinHeight(headerComponents);
    const bodyMinHeight = calculateMinHeight(bodyComponents);
    const footerMinHeight = calculateMinHeight(footerComponents);

    if (headerHeight < headerMinHeight) {
      setSectionHeight('header', headerMinHeight);
    }
    if (bodyHeight < bodyMinHeight) {
      setSectionHeight('body', bodyMinHeight);
    }
    if (footerHeight < footerMinHeight) {
      setSectionHeight('footer', footerMinHeight);
    }
  }, [headerComponents.length, bodyComponents.length, footerComponents.length, components]);

  const handleLayoutChange = (layout: any[]) => {
    updateLayout(layout);
  };

  const handleCanvasClick = () => {
    clearSelection();
    setSelectedLayoutSection(null);
  };

  const handleSectionClick = (section: 'Header' | 'Body' | 'Footer', e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLayoutSection(section);
    clearSelection();
  };

  const handleDrop = (e: React.DragEvent, section: 'header' | 'body' | 'footer') => {
    e.preventDefault();

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));

      // Use the preview position if available (should always be available)
      if (dragPreview && dragPreview.section === section) {
        const id = `${data.type}-${Date.now()}`;

        addComponent({
          i: id,
          id,
          type: data.type,
          props: data.defaultProps,
          x: dragPreview.col,
          y: dragPreview.row,
          w: dragPreview.width,
          h: dragPreview.height,
          parentId: section,
        } as any);
      }
    } catch (error) {
      console.error('Failed to drop component:', error);
    } finally {
      // Clean up
      setDragPreview(null);
      delete (window as any).__draggedComponentSize;
    }
  };

  const handleDragOver = (e: React.DragEvent, section: 'header' | 'body' | 'footer') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    // Get component size from window (set during drag start)
    const componentSize = (window as any).__draggedComponentSize;
    if (!componentSize) return;

    const sectionElement = e.currentTarget as HTMLElement;
    const rect = sectionElement.getBoundingClientRect();

    // Calculate position relative to viewport (for visual preview)
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Account for grid margins when calculating grid position
    const marginX = 10;
    const marginY = 10;

    // React-grid-layout calculates column width as: (containerWidth - (cols - 1) * marginX) / cols
    const totalMarginWidth = (config.cols - 1) * marginX;
    const colWidth = (config.width - totalMarginWidth) / config.cols;

    // Calculate which grid cell we're over, accounting for margins
    const col = Math.floor(x / (colWidth + marginX));
    const row = Math.floor(y / (config.rowHeight + marginY));

    setDragPreview({
      section,
      col: Math.max(0, Math.min(col, config.cols - componentSize.w)),
      row: Math.max(0, row),
      width: componentSize.w,
      height: componentSize.h,
    });
  };

  const handleDragLeave = (e: React.DragEvent, section: 'header' | 'body' | 'footer') => {
    // Only clear preview if leaving this specific section
    // Check if we're actually leaving the section (not just moving to a child element)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isLeavingSection =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;

    if (isLeavingSection && dragPreview?.section === section) {
      setDragPreview(null);
    }
  };

  const handleResizeStart = (section: 'header' | 'body' | 'footer', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(section);
    setResizeStartY(e.clientY);
    const currentHeight = section === 'header' ? headerHeight : section === 'body' ? bodyHeight : footerHeight;
    setResizeStartHeight(currentHeight);
  };

  // Global resize listeners
  useEffect(() => {
    if (resizing) {
      const handleMove = (e: MouseEvent) => {
        const delta = e.clientY - resizeStartY;
        const newHeight = Math.max(100, resizeStartHeight + delta);
        setSectionHeight(resizing, newHeight);
      };

      const handleEnd = () => {
        setResizing(null);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
      };
    }
  }, [resizing, resizeStartY, resizeStartHeight, setSectionHeight]);

  const renderSection = (
    section: 'Header' | 'Body' | 'Footer',
    sectionId: 'header' | 'body' | 'footer',
    height: number,
    layouts: Layouts,
    sectionComponents: typeof components,
    bgColor: string,
    borderColor: string
  ) => {
    // Get section-specific background color from theme
    let sectionBgColor = '';
    if (readOnly) {
      if (sectionId === 'header') {
        sectionBgColor = theme.globalStyles.colors.headerBackground;
      } else if (sectionId === 'body') {
        sectionBgColor = theme.globalStyles.colors.bodyBackground;
      } else if (sectionId === 'footer') {
        sectionBgColor = theme.globalStyles.colors.footerBackground;
      }
    }

    return (
      <div
        className={`relative ${
          readOnly ? 'border-0' : `border-2 border-dashed ${borderColor}`
        } ${bgColor} ${
          !readOnly && selectedLayoutSection === section ? 'ring-2 ring-purple-500' : ''
        }`}
        style={{
          height: `${height}px`,
          width: config.width,
          backgroundColor: sectionBgColor || undefined
        }}
        onClick={(e) => !readOnly && handleSectionClick(section, e)}
        onDrop={(e) => !readOnly && handleDrop(e, sectionId)}
        onDragOver={!readOnly ? (e) => handleDragOver(e, sectionId) : undefined}
        onDragLeave={!readOnly ? (e) => handleDragLeave(e, sectionId) : undefined}
      >
      {!readOnly && (
        <div className="absolute top-2 left-2 text-xs font-bold text-gray-500 pointer-events-none z-10">
          {section}
        </div>
      )}

      {/* Drag Preview Overlay */}
      {!readOnly && dragPreview && dragPreview.section === sectionId && (
        (() => {
          // Calculate preview position accounting for grid margins
          const marginX = 10;
          const marginY = 10;

          // React-grid-layout calculates column width as: (containerWidth - (cols - 1) * marginX) / cols
          const totalMarginWidth = (config.cols - 1) * marginX;
          const colWidth = (config.width - totalMarginWidth) / config.cols;

          const left = (dragPreview.col * (colWidth + marginX));
          const top = (dragPreview.row * (config.rowHeight + marginY));
          const width = (dragPreview.width * colWidth) + ((dragPreview.width - 1) * marginX);
          const height = (dragPreview.height * config.rowHeight) + ((dragPreview.height - 1) * marginY);

          return (
            <div
              className="absolute bg-blue-500 bg-opacity-20 border-2 border-blue-500 border-dashed pointer-events-none z-20 rounded"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
              }}
            >
              <div className="absolute top-1 left-1 text-xs font-bold text-blue-700 bg-white bg-opacity-75 px-1 rounded">
                {dragPreview.width}x{dragPreview.height}
              </div>
              <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                Col: {dragPreview.col}, Row: {dragPreview.row}
              </div>
            </div>
          );
        })()
      )}

      <ResponsiveGridLayout
        key={`${viewport}-${sectionId}`}
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 0 }}
        cols={{ lg: config.cols }}
        rowHeight={config.rowHeight}
        width={config.width}
        margin={[10, 10]}
        onLayoutChange={handleLayoutChange}
        onDragStop={(layout, oldItem, newItem) => {
          // Select the component after dragging
          setSelectedComponents([newItem.i]);
        }}
        onResizeStop={(layout, oldItem, newItem) => {
          // Select the component after resizing
          setSelectedComponents([newItem.i]);
        }}
        isDraggable={!readOnly}
        isResizable={!readOnly}
        compactType={null}
        preventCollision={true}
      >
        {sectionComponents.map((comp) => (
          <div
            key={comp.i}
            onClick={(e) => {
              if (readOnly) return;
              e.stopPropagation();
              if (e.ctrlKey || e.metaKey) {
                const newSelection = selectedComponents.includes(comp.i)
                  ? selectedComponents.filter((selectedId) => selectedId !== comp.i)
                  : [...selectedComponents, comp.i];
                setSelectedComponents(newSelection);
              } else {
                setSelectedComponents([comp.i]);
              }
            }}
            className={`border rounded relative group ${
              readOnly
                ? 'border-transparent'
                : selectedComponents.includes(comp.i)
                ? 'border-blue-500 border-2'
                : 'border-transparent hover:border-gray-300'
            } ${readOnly ? '' : 'bg-white'}`}
          >
            <ComponentRenderer component={comp} useThemeStyles={readOnly} />
            {!readOnly && (
              <>
                {/* Position Display */}
                {selectedComponents.includes(comp.i) && (
                  <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg z-[1000] pointer-events-none">
                    Col: {comp.x}, Row: {comp.y}
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeComponent(comp.i);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg leading-none opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-[1000] cursor-pointer shadow-lg"
                  title="Delete component"
                >
                  ×
                </button>
              </>
            )}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="flex-1 overflow-auto p-8 bg-gray-100"
      onClick={handleCanvasClick}
    >
      <div
        className="mx-auto shadow-lg"
        style={{
          width: config.width,
          backgroundColor: readOnly ? theme.globalStyles.colors.background : '#ffffff'
        }}
      >
        {/* Header Section */}
        {renderSection(
          'Header',
          'header',
          headerHeight,
          headerLayouts,
          headerComponents,
          '',
          'border-gray-300'
        )}

        {/* Header Resize Handle */}
        {!readOnly && (
          <div
            className="w-full h-2 bg-gray-300 hover:bg-gray-400 cursor-ns-resize flex items-center justify-center pointer-events-auto relative z-50"
            onMouseDown={(e) => handleResizeStart('header', e)}
            style={{ userSelect: 'none' }}
          >
            <div className="w-12 h-1 bg-gray-500 rounded pointer-events-none"></div>
          </div>
        )}

        {/* Body Section */}
        {renderSection(
          'Body',
          'body',
          bodyHeight,
          bodyLayouts,
          bodyComponents,
          '',
          'border-gray-300'
        )}

        {/* Body Resize Handle */}
        {!readOnly && (
          <div
            className="w-full h-2 bg-gray-300 hover:bg-gray-400 cursor-ns-resize flex items-center justify-center pointer-events-auto relative z-50"
            onMouseDown={(e) => handleResizeStart('body', e)}
            style={{ userSelect: 'none' }}
          >
            <div className="w-12 h-1 bg-gray-500 rounded pointer-events-none"></div>
          </div>
        )}

        {/* Footer Section */}
        {renderSection(
          'Footer',
          'footer',
          footerHeight,
          footerLayouts,
          footerComponents,
          '',
          'border-gray-300'
        )}

        {/* Footer Resize Handle */}
        <div
          className="w-full h-2 bg-gray-300 hover:bg-gray-400 cursor-ns-resize flex items-center justify-center pointer-events-auto relative z-50"
          onMouseDown={(e) => handleResizeStart('footer', e)}
          style={{ userSelect: 'none' }}
        >
          <div className="w-12 h-1 bg-gray-500 rounded pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
