import ProductCard from './ProductCard';
import { useComponentStyles } from '../../hooks/useComponentStyles';
import { cx } from '../../utils/classNames';

interface ProductListProps {
  layout?: 'grid' | 'list';
  columns?: number;
  itemCount?: number;
  useThemeStyles?: boolean;
}

export default function ProductList({
  layout = 'grid',
  columns = 3,
  itemCount = 6,
  useThemeStyles = false
}: ProductListProps) {
  const { containerStyles, gapStyle } = useComponentStyles(
    'ProductList',
    layout,
    useThemeStyles,
    ['backgroundColor', 'padding']
  );

  if (layout === 'list') {
    return (
      <div
        className={`w-full h-full flex flex-col ${cx(useThemeStyles, 'gap-4 p-4')}`}
        style={{ ...containerStyles, ...gapStyle }}
      >
        {Array.from({ length: itemCount }).map((_, i) => (
          <ProductCard key={i} variant="list" useThemeStyles={useThemeStyles} />
        ))}
      </div>
    );
  }

  // Grid layout
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns] || 'grid-cols-3';

  return (
    <div
      className={`w-full h-full grid ${gridCols} ${cx(useThemeStyles, 'gap-4 p-4')}`}
      style={{ ...containerStyles, ...gapStyle }}
    >
      {Array.from({ length: itemCount }).map((_, i) => (
        <ProductCard key={i} variant="grid" useThemeStyles={useThemeStyles} />
      ))}
    </div>
  );
}
