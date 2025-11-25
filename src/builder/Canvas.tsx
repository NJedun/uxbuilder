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
    zoom,
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
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const colWidth = config.width / config.cols;
      const col = Math.floor(x / colWidth);
      const row = Math.floor(y / config.rowHeight);

      const id = `${data.type}-${Date.now()}`;

      addComponent({
        i: id,
        id,
        type: data.type,
        props: data.defaultProps,
        x: Math.max(0, Math.min(col, config.cols - data.defaultSize.w)),
        y: Math.max(0, row),
        w: data.defaultSize.w,
        h: data.defaultSize.h,
        parentId: section,
      } as any);
    } catch (error) {
      console.error('Failed to drop component:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
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
        onDragOver={!readOnly ? handleDragOver : undefined}
      >
      {!readOnly && (
        <div className="absolute top-2 left-2 text-xs font-bold text-gray-500 pointer-events-none z-10">
          {section}
        </div>
      )}

      <ResponsiveGridLayout
        key={`${viewport}-${sectionId}`}
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 0 }}
        cols={{ lg: config.cols }}
        rowHeight={config.rowHeight}
        width={config.width}
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
      style={{ zoom }}
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
