import { useState, useRef } from 'react';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import { useBuilderStore, viewportConfigs } from '../store/builderStore';
import ComponentRenderer from '../components/ComponentRenderer';
import Card from '../components/atoms/Card';
import Form from '../components/atoms/Form';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function Canvas() {
  const { viewport, canvasSettingsByViewport, componentsByViewport, selectedComponents, updateLayout, removeComponent, addComponent, setSelectedComponents, clearSelection } = useBuilderStore();
  const components = componentsByViewport[viewport];
  const canvasSettings = canvasSettingsByViewport[viewport];
  const baseConfig = viewportConfigs[viewport];
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastLayoutRef = useRef<any>(null);

  const config = {
    ...baseConfig,
    width: canvasSettings.width || baseConfig.width,
    cols: canvasSettings.cols || baseConfig.cols,
  };

  const canvasHeight = canvasSettings.height || 1080;

  // Separate components into three layers: background (containers), middle (cards/forms), foreground (others)
  const backgroundComponents = components.filter((comp) => comp.type === 'Container');
  const middleComponents = components.filter((comp) => comp.type === 'Card' || comp.type === 'Form');
  const foregroundComponents = components.filter((comp) => comp.type !== 'Container' && comp.type !== 'Card' && comp.type !== 'Form');

  const backgroundLayouts: Layouts = {
    lg: backgroundComponents.map((comp) => ({
      i: comp.i,
      x: comp.x,
      y: comp.y,
      w: comp.w,
      h: comp.h,
    })),
  };

  const middleLayouts: Layouts = {
    lg: middleComponents.map((comp) => ({
      i: comp.i,
      x: comp.x,
      y: comp.y,
      w: comp.w,
      h: comp.h,
    })),
  };

  const foregroundLayouts: Layouts = {
    lg: foregroundComponents.map((comp) => ({
      i: comp.i,
      x: comp.x,
      y: comp.y,
      w: comp.w,
      h: comp.h,
    })),
  };

  const handleLayoutChange = (_layout: any, allLayouts: Layouts) => {
    if (!allLayouts.lg) return;

    // If multiple components are selected, move them together
    if (selectedComponents.length > 1 && lastLayoutRef.current) {
      const movedItem = allLayouts.lg.find((item: any) => {
        const lastItem = lastLayoutRef.current.find((last: any) => last.i === item.i);
        return lastItem && (lastItem.x !== item.x || lastItem.y !== item.y);
      });

      if (movedItem && selectedComponents.includes(movedItem.i)) {
        const lastItem = lastLayoutRef.current.find((last: any) => last.i === movedItem.i);
        const deltaX = movedItem.x - lastItem.x;
        const deltaY = movedItem.y - lastItem.y;

        // Apply the same delta to all selected components
        const updatedLayout = allLayouts.lg.map((item: any) => {
          if (selectedComponents.includes(item.i) && item.i !== movedItem.i) {
            return {
              ...item,
              x: Math.max(0, Math.min(item.x + deltaX, config.cols - item.w)),
              y: Math.max(0, item.y + deltaY),
            };
          }
          return item;
        });

        lastLayoutRef.current = updatedLayout;
        updateLayout(updatedLayout);
        return;
      }
    }

    lastLayoutRef.current = allLayouts.lg;
    updateLayout(allLayouts.lg);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate grid position
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
      } as any);
    } catch (error) {
      console.error('Failed to drop component:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setIsSelecting(true);
    setSelectionBox({ startX, startY, endX: startX, endY: startY });
    clearSelection();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !selectionBox || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    setSelectionBox({ ...selectionBox, endX, endY });
  };

  const handleMouseUp = () => {
    if (!isSelecting || !selectionBox) return;

    const colWidth = config.width / config.cols;
    const minX = Math.min(selectionBox.startX, selectionBox.endX);
    const maxX = Math.max(selectionBox.startX, selectionBox.endX);
    const minY = Math.min(selectionBox.startY, selectionBox.endY);
    const maxY = Math.max(selectionBox.startY, selectionBox.endY);

    const selected = components.filter((comp) => {
      const compLeft = comp.x * colWidth;
      const compRight = (comp.x + comp.w) * colWidth;
      const compTop = comp.y * config.rowHeight;
      const compBottom = (comp.y + comp.h) * config.rowHeight;

      return (
        compLeft < maxX &&
        compRight > minX &&
        compTop < maxY &&
        compBottom > minY
      );
    });

    setSelectedComponents(selected.map((comp) => comp.i));
    setIsSelecting(false);
    setSelectionBox(null);
  };

  const handleComponentClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      // Toggle selection with Ctrl/Cmd
      const newSelection = selectedComponents.includes(id)
        ? selectedComponents.filter((selectedId) => selectedId !== id)
        : [...selectedComponents, id];
      setSelectedComponents(newSelection);
    } else {
      // Select only this component
      setSelectedComponents([id]);
    }
  };

  const getSelectionBoxStyle = () => {
    if (!selectionBox) return {};

    const minX = Math.min(selectionBox.startX, selectionBox.endX);
    const minY = Math.min(selectionBox.startY, selectionBox.endY);
    const width = Math.abs(selectionBox.endX - selectionBox.startX);
    const height = Math.abs(selectionBox.endY - selectionBox.startY);

    return {
      position: 'absolute' as const,
      left: minX,
      top: minY,
      width,
      height,
      border: '2px dashed #3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      pointerEvents: 'none' as const,
      zIndex: 1000,
    };
  };

  return (
    <div
      ref={canvasRef}
      className="bg-white border-2 border-dashed border-gray-300 overflow-auto relative"
      style={{
        width: config.width,
        height: canvasHeight,
        margin: '0 auto'
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isSelecting) {
          setIsSelecting(false);
          setSelectionBox(null);
        }
      }}
    >
      {/* Selection Box */}
      {isSelecting && selectionBox && (
        <div style={getSelectionBoxStyle()} />
      )}

      {/* Background Layer - Containers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <ResponsiveGridLayout
          key={`background-${viewport}`}
          className="layout"
          layouts={backgroundLayouts}
          breakpoints={{ lg: 0 }}
          cols={{ lg: config.cols }}
          rowHeight={config.rowHeight}
          width={config.width}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={true}
          compactType={null}
          preventCollision={true}
        >
          {backgroundComponents.map((comp) => (
            <div
              key={comp.i}
              onClick={(e) => handleComponentClick(e, comp.i)}
              className="bg-transparent hover:bg-gray-50 rounded cursor-move relative group pointer-events-auto"
              style={{
                height: '100%',
                border: `${comp.props?.borderWidth || 4}px solid black`,
                ...(selectedComponents.includes(comp.i) ? { boxShadow: '0 0 0 4px #3b82f6' } : {}),
              }}
            >
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeComponent(comp.i);
                }}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl leading-none opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-[1000] cursor-pointer shadow-lg"
                title="Delete container"
                style={{ pointerEvents: 'auto' }}
              >
                ×
              </button>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {/* Middle Layer - Cards & Forms */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0.5 }}>
        <ResponsiveGridLayout
          key={`middle-${viewport}`}
          className="layout"
          layouts={middleLayouts}
          breakpoints={{ lg: 0 }}
          cols={{ lg: config.cols }}
          rowHeight={config.rowHeight}
          width={config.width}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={true}
          compactType={null}
          preventCollision={true}
        >
          {middleComponents.map((comp) => (
            <div
              key={comp.i}
              onClick={(e) => handleComponentClick(e, comp.i)}
              className="rounded cursor-move relative group pointer-events-auto"
              style={{
                height: '100%',
                ...(selectedComponents.includes(comp.i) ? { boxShadow: '0 0 0 4px #3b82f6' } : {}),
              }}
            >
              {comp.type === 'Card' ? <Card {...comp.props} /> : <Form />}
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeComponent(comp.i);
                }}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl leading-none opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-[1000] cursor-pointer shadow-lg"
                title={`Delete ${comp.type.toLowerCase()}`}
                style={{ pointerEvents: 'auto' }}
              >
                ×
              </button>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {/* Foreground Layer - Regular Components */}
      <div className="relative pointer-events-none" style={{ zIndex: 1 }}>
        <ResponsiveGridLayout
          key={`foreground-${viewport}`}
          className="layout pointer-events-none"
          layouts={foregroundLayouts}
          breakpoints={{ lg: 0 }}
          cols={{ lg: config.cols }}
          rowHeight={config.rowHeight}
          width={config.width}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={true}
          compactType={null}
          preventCollision={true}
        >
          {foregroundComponents.map((comp) => (
            <div
              key={comp.i}
              onClick={(e) => handleComponentClick(e, comp.i)}
              className={`bg-transparent border rounded p-4 hover:border-gray-400 cursor-move relative group pointer-events-auto ${
                selectedComponents.includes(comp.i) ? 'border-blue-500 border-2 ring-2 ring-blue-300' : 'border-transparent'
              }`}
              style={{
                height: '100%',
              }}
            >
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeComponent(comp.i);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg leading-none opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-[1000] cursor-pointer shadow-lg"
                title="Delete component"
              >
                ×
              </button>
              <div className="h-full pointer-events-none flex items-center justify-center">
                <ComponentRenderer component={comp} />
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
