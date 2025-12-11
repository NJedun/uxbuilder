import { VisualComponent, useVisualBuilderStore, GlobalStyles } from '../../../store/visualBuilderStore';

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
  renderChild: (child: VisualComponent, isSelected: boolean, onSelect: () => void) => React.ReactNode;
}

export default function ColumnDropZone({
  columnIndex,
  children,
  width,
  columnStyle = {},
  globalStyles,
  renderChild,
}: ColumnDropZoneProps) {
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
        border:
          hasCustomStyles && columnStyle.borderWidth
            ? `${columnStyle.borderWidth} ${columnStyle.borderStyle || 'solid'} ${columnStyle.borderColor || '#e5e7eb'}`
            : hasContent
              ? 'none'
              : '2px dashed #e5e7eb',
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
        columnChildren.map((child) =>
          renderChild(child, selectedComponentId === child.id, () => selectComponent(child.id))
        )
      )}
    </div>
  );
}
