import { useState, useEffect } from 'react';
import { ProductSummaryCard } from '../molecules';
import { GlobalStyles } from '../../../store/visualBuilderStore';

interface ChildPage {
  rowKey: string;
  title: string;
  summary: string;
  slug: string;
}

interface ProductGridProps {
  props: {
    parentRowKey?: string; // If set, fetches children of this PLP
    columns?: number;
    gap?: string;
  };
  styles: {
    padding?: string;
    backgroundColor?: string;
    cardBackgroundColor?: string;
    cardBorderColor?: string;
    titleColor?: string;
    textColor?: string;
    linkColor?: string;
  };
  globalStyles: GlobalStyles;
  // For preview mode - pass children directly
  childPages?: ChildPage[];
}

export default function ProductGrid({
  props,
  styles,
  childPages: injectedChildren,
}: ProductGridProps) {
  const [children, setChildren] = useState<ChildPage[]>(injectedChildren || []);
  const [loading, setLoading] = useState(!injectedChildren && !!props.parentRowKey);

  const columns = props.columns || 3;
  const gap = props.gap || '24px';

  useEffect(() => {
    if (injectedChildren) {
      setChildren(injectedChildren);
      return;
    }

    if (props.parentRowKey) {
      fetchChildren();
    }
  }, [props.parentRowKey, injectedChildren]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/pages?parentRowKey=${props.parentRowKey}`);

      if (response.ok) {
        const data = await response.json();
        setChildren(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch child pages:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: styles.padding || '40px 20px',
          backgroundColor: styles.backgroundColor,
          textAlign: 'center',
        }}
      >
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-3 gap-6 w-full max-w-4xl">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div
        style={{
          padding: styles.padding || '40px 20px',
          backgroundColor: styles.backgroundColor,
          textAlign: 'center',
          color: '#6b7280',
        }}
      >
        <p>No products found in this category.</p>
        <p className="text-sm mt-2">Add Product Pages (PDPs) with this category as parent.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: styles.padding || '40px 20px',
        backgroundColor: styles.backgroundColor,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {children.map((child) => (
          <ProductSummaryCard
            key={child.rowKey}
            title={child.title}
            summary={child.summary}
            slug={child.slug}
            backgroundColor={styles.cardBackgroundColor}
            borderColor={styles.cardBorderColor}
            titleColor={styles.titleColor}
            textColor={styles.textColor}
            linkColor={styles.linkColor}
          />
        ))}
      </div>
    </div>
  );
}
