import ProductCard from './ProductCard';

interface ProductListProps {
  layout?: 'grid' | 'list';
  columns?: number;
  itemCount?: number;
}

export default function ProductList({
  layout = 'grid',
  columns = 3,
  itemCount = 6
}: ProductListProps) {
  if (layout === 'list') {
    return (
      <div className="w-full h-full flex flex-col gap-4 p-4">
        {Array.from({ length: itemCount }).map((_, i) => (
          <ProductCard key={i} variant="list" />
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
    <div className={`w-full h-full grid ${gridCols} gap-4 p-4`}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <ProductCard key={i} variant="grid" />
      ))}
    </div>
  );
}
