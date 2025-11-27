import { VisualComponent, useVisualBuilderStore, GlobalStyles } from '../store/visualBuilderStore';

interface VisualComponentRendererProps {
  component: VisualComponent;
  isSelected: boolean;
  onSelect: () => void;
  isNested?: boolean;
}

interface ColumnStyle {
  backgroundColor?: string;
  padding?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
}

interface ColumnDropZoneProps {
  columnIndex: number;
  children: VisualComponent[];
  width: string;
  columnStyle?: ColumnStyle;
  globalStyles: GlobalStyles;
}

function ColumnDropZone({ columnIndex, children, width, columnStyle = {}, globalStyles }: ColumnDropZoneProps) {
  const { selectComponent, selectedComponentId } = useVisualBuilderStore();

  const columnChildren = children.filter(
    (child) => child.props?.columnIndex === columnIndex
  );

  const hasContent = columnChildren.length > 0;
  const hasCustomStyles = columnStyle.backgroundColor || columnStyle.borderWidth || columnStyle.padding;

  // Use column style -> global column style -> defaults
  const bgColor = columnStyle.backgroundColor || globalStyles.columnBackgroundColor;
  const padding = columnStyle.padding || globalStyles.columnPadding;
  const borderRadius = columnStyle.borderRadius || globalStyles.columnBorderRadius || '4px';

  return (
    <div
      style={{
        flex: `0 0 calc(${width} - 10px)`,
        width: `calc(${width} - 10px)`,
        minHeight: '100px',
        backgroundColor: bgColor || (hasContent ? 'transparent' : '#f9fafb'),
        border: hasCustomStyles && columnStyle.borderWidth
          ? `${columnStyle.borderWidth} ${columnStyle.borderStyle || 'solid'} ${columnStyle.borderColor || '#e5e7eb'}`
          : (hasContent ? 'none' : '2px dashed #e5e7eb'),
        borderRadius: borderRadius,
        padding: padding || undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxSizing: 'border-box',
      }}
    >
      {!hasContent ? (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          Column {columnIndex + 1}
        </div>
      ) : (
        columnChildren.map((child) => (
          <VisualComponentRenderer
            key={child.id}
            component={child}
            isSelected={selectedComponentId === child.id}
            onSelect={() => selectComponent(child.id)}
            isNested={true}
          />
        ))
      )}
    </div>
  );
}

export default function VisualComponentRenderer({
  component,
  isSelected,
  onSelect,
  isNested = false,
}: VisualComponentRendererProps) {
  const { deleteComponent, selectComponent, selectedComponentId, globalStyles } = useVisualBuilderStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this component?')) {
      deleteComponent(component.id);
    }
  };

  // Helper to get style with global fallback
  const getStyle = (componentStyle: string | undefined, globalKey: keyof GlobalStyles): string | undefined => {
    return componentStyle || globalStyles[globalKey] as string | undefined;
  };

  const renderComponent = () => {
    const props = component.props || {};
    const styles = component.customStyles || {};

    if (component.type === 'HeroSection') {
      // Calculate margin based on container alignment
      const getContainerMargin = () => {
        if (styles.margin) return styles.margin;
        switch (styles.containerAlign) {
          case 'left': return '0 auto 0 0';
          case 'right': return '0 0 0 auto';
          case 'center': return '0 auto';
          default: return undefined;
        }
      };

      // Get background image URL (component or global)
      const bgImage = styles.backgroundImage || globalStyles.containerBackgroundImage;
      const bgSize = styles.backgroundSize || globalStyles.containerBackgroundSize || 'cover';
      const bgPosition = styles.backgroundPosition || globalStyles.containerBackgroundPosition || 'center';
      const bgRepeat = styles.backgroundRepeat || globalStyles.containerBackgroundRepeat || 'no-repeat';

      return (
        <div
          style={{
            backgroundColor: getStyle(styles.backgroundColor, 'containerBackgroundColor'),
            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
            backgroundSize: bgImage ? bgSize : undefined,
            backgroundPosition: bgImage ? bgPosition : undefined,
            backgroundRepeat: bgImage ? bgRepeat : undefined,
            width: styles.width,
            maxWidth: styles.maxWidth,
            minHeight: styles.minHeight,
            padding: getStyle(styles.padding, 'containerPadding'),
            margin: getContainerMargin(),
            textAlign: (styles.textAlign as any) || 'center',
            // Border styles
            borderWidth: getStyle(styles.borderWidth, 'containerBorderWidth'),
            borderStyle: getStyle(styles.borderStyle, 'containerBorderStyle'),
            borderColor: getStyle(styles.borderColor, 'containerBorderColor'),
            borderRadius: getStyle(styles.borderRadius, 'containerBorderRadius'),
          }}
        >
          {/* Title */}
          <h1
            style={{
              color: getStyle(styles.titleColor, 'titleColor'),
              fontSize: getStyle(styles.titleFontSize, 'titleFontSize'),
              fontWeight: getStyle(styles.titleFontWeight, 'titleFontWeight'),
              marginBottom: getStyle(styles.titleMarginBottom, 'titleMarginBottom'),
              maxWidth: styles.titleMaxWidth,
              margin: styles.textAlign === 'center' ? '0 auto' : 0,
              marginBlockEnd: getStyle(styles.titleMarginBottom, 'titleMarginBottom'),
            }}
          >
            {props.title || 'Welcome to Our Website'}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: getStyle(styles.subtitleColor, 'subtitleColor'),
              fontSize: getStyle(styles.subtitleFontSize, 'subtitleFontSize'),
              fontWeight: getStyle(styles.subtitleFontWeight, 'subtitleFontWeight'),
              marginBottom: getStyle(styles.subtitleMarginBottom, 'subtitleMarginBottom'),
              maxWidth: styles.subtitleMaxWidth || '600px',
              margin: styles.textAlign === 'center' ? '0 auto' : 0,
              marginBlockEnd: getStyle(styles.subtitleMarginBottom, 'subtitleMarginBottom'),
            }}
          >
            {props.subtitle || 'This is a paragraph of text that provides information to the reader.'}
          </p>

          {/* Button */}
          {props.showButton !== false && (
            <button
              style={{
                backgroundColor: getStyle(styles.buttonBackgroundColor, 'buttonBackgroundColor'),
                color: getStyle(styles.buttonTextColor, 'buttonTextColor'),
                padding: getStyle(styles.buttonPadding, 'buttonPadding'),
                borderRadius: getStyle(styles.buttonBorderRadius, 'buttonBorderRadius'),
                fontSize: getStyle(styles.buttonFontSize, 'buttonFontSize'),
                fontWeight: getStyle(styles.buttonFontWeight, 'buttonFontWeight'),
                // Button border
                borderWidth: getStyle(styles.buttonBorderWidth, 'buttonBorderWidth') || '0',
                borderStyle: getStyle(styles.buttonBorderStyle, 'buttonBorderStyle') || 'solid',
                borderColor: getStyle(styles.buttonBorderColor, 'buttonBorderColor'),
                cursor: 'pointer',
              }}
            >
              {props.buttonText || 'Get Started'}
            </button>
          )}
        </div>
      );
    }

    if (component.type === 'Row') {
      const columns = props.columns || 2;
      const columnWidths = props.columnWidths || Array(columns).fill(`${100 / columns}%`);
      const columnStyles = props.columnStyles || [];
      const children = component.children || [];

      return (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: styles.gap || globalStyles.rowGap || '20px',
            padding: styles.padding || globalStyles.rowPadding,
            backgroundColor: styles.backgroundColor || globalStyles.rowBackgroundColor || undefined,
            width: styles.width,
            maxWidth: styles.maxWidth,
            minHeight: styles.minHeight || '120px',
            margin: styles.margin,
            alignItems: styles.alignItems || 'stretch',
            justifyContent: styles.justifyContent || 'flex-start',
            // Border styles
            borderWidth: styles.borderWidth,
            borderStyle: styles.borderStyle,
            borderColor: styles.borderColor,
            borderRadius: styles.borderRadius,
          }}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <ColumnDropZone
              key={index}
              columnIndex={index}
              children={children}
              width={columnWidths[index] || `${100 / columns}%`}
              columnStyle={columnStyles[index] || {}}
              globalStyles={globalStyles}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600 text-sm">Unknown component type: {component.type}</p>
      </div>
    );
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`relative group ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } hover:ring-2 hover:ring-blue-300 hover:ring-offset-2 transition-all overflow-hidden`}
    >
      {renderComponent()}

      {/* Component Controls */}
      <div
        className={`absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
          isSelected ? 'opacity-100' : ''
        }`}
      >
        <button
          onClick={handleDelete}
          className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg text-xs"
          title="Delete component"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Selected indicator label */}
      {isSelected && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded shadow-lg">
          {component.type}
        </div>
      )}
    </div>
  );
}
