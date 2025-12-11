import { VisualComponent, GlobalStyles } from '../../../store/visualBuilderStore';
import { ColumnDropZone } from '../molecules';
import type { ViewMode } from '../../../pages/VisualBuilder';

interface ColumnStyle {
  backgroundColor?: string;
  padding?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
}

interface RowComponentProps {
  props: {
    columns?: number;
    columnWidths?: string[];
    mobileColumnWidths?: string[];
    columnStyles?: ColumnStyle[];
  };
  styles: {
    gap?: string;
    padding?: string;
    backgroundColor?: string;
    width?: string;
    maxWidth?: string;
    minHeight?: string;
    margin?: string;
    alignItems?: string;
    justifyContent?: string;
    borderWidth?: string;
    borderStyle?: string;
    borderColor?: string;
    borderRadius?: string;
  };
  children: VisualComponent[];
  globalStyles: GlobalStyles;
  viewMode?: ViewMode;
  renderChild: (child: VisualComponent, isSelected: boolean, onSelect: () => void) => React.ReactNode;
}

export default function RowComponent({
  props,
  styles,
  children,
  globalStyles,
  viewMode = 'desktop',
  renderChild,
}: RowComponentProps) {
  const columns = props.columns || 2;
  const columnWidths = props.columnWidths || Array(columns).fill(`${100 / columns}%`);
  const mobileColumnWidths = props.mobileColumnWidths || [];
  const columnStyles = props.columnStyles || [];

  const isMobile = viewMode === 'mobile';
  const isTablet = viewMode === 'tablet';
  const isCompact = isMobile || isTablet;

  // Determine which widths to use based on view mode
  const getResponsiveWidth = (index: number) => {
    if (isCompact && mobileColumnWidths[index]) {
      return mobileColumnWidths[index];
    }
    return columnWidths[index] || `${100 / columns}%`;
  };

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
          width={getResponsiveWidth(index)}
          columnStyle={columnStyles[index] || {}}
          globalStyles={globalStyles}
          renderChild={renderChild}
        />
      ))}
    </div>
  );
}
