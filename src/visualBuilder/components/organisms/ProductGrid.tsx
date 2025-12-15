import { useState, useEffect } from 'react';
import { ProductSummaryCard } from '../molecules';
import { GlobalStyles } from '../../../store/visualBuilderStore';

interface ChildPage {
  rowKey: string;
  title: string;
  summary: string;
  slug: string;
}

// Sample preview products for design mode
const sampleProducts = [
  { rowKey: '1', title: 'Allegiant\n009F93N XF', summary: 'Plant type and yield that excels in western environments.', isNew: false },
  { rowKey: '2', title: 'Allegiant\n009F23 XF', summary: 'IDC and standability leader at this relative maturity.', isNew: false },
  { rowKey: '3', title: 'Allegiant\n01F24N XF', summary: 'Well-rounded plant type and agronomics which make this a big-acre product.', isNew: true },
  { rowKey: '4', title: 'Allegiant\n02F96N XF', summary: 'Great yield potential with IDC tolerance and complementary agronomics.', isNew: true },
  { rowKey: '5', title: 'Allegiant\n05F54N XF', summary: 'Lineup-leading IDC with head-turning yields.', isNew: false },
  { rowKey: '6', title: 'Allegiant\n07F36N XF', summary: 'Another key IDC product with impressive plant type and great standability.', isNew: true },
  { rowKey: '7', title: 'Allegiant\n09F16N XF', summary: 'A versatile product that strikes a perfect balance between toughness and high performance.', isNew: true },
  { rowKey: '8', title: 'Allegiant\n14F35N XF', summary: 'Eye-catching soybean backed by performance and defensive characteristics.', isNew: false },
];

interface ProductGridProps {
  props: {
    parentRowKey?: string;
    columns?: number;
    gap?: string;
    // Content options
    showLearnMore?: boolean;
    showDownloadLink?: boolean;
    showNewBadge?: boolean;
    learnMoreText?: string;
    downloadLinkText?: string;
  };
  styles: {
    padding?: string;
    backgroundColor?: string;
    // Card styles
    cardBackgroundColor?: string;
    cardBorderColor?: string;
    cardBorderRadius?: string;
    cardPadding?: string;
    cardBorderWidth?: string;
    // Text styles
    titleColor?: string;
    titleFontSize?: string;
    titleFontWeight?: string;
    textColor?: string;
    textFontSize?: string;
    // Link styles
    linkColor?: string;
    linkFontSize?: string;
    // Badge styles
    badgeBackgroundColor?: string;
    badgeTextColor?: string;
  };
  globalStyles: GlobalStyles;
  childPages?: ChildPage[];
}

// Preview card component for design mode
function PreviewProductCard({
  title,
  summary,
  isNew,
  showLearnMore = true,
  showDownloadLink = true,
  showNewBadge = true,
  learnMoreText = 'Learn more',
  downloadLinkText = 'Download tech sheet',
  backgroundColor = '#ffffff',
  borderColor = '#e5e7eb',
  borderRadius = '8px',
  cardPadding = '24px',
  borderWidth = '1px',
  titleColor = '#003087',
  titleFontSize = '18px',
  titleFontWeight = '700',
  textColor = '#6b7280',
  textFontSize = '14px',
  linkColor = '#003087',
  linkFontSize = '14px',
  badgeBackgroundColor = '#003087',
  badgeTextColor = '#ffffff',
}: {
  title: string;
  summary: string;
  isNew?: boolean;
  showLearnMore?: boolean;
  showDownloadLink?: boolean;
  showNewBadge?: boolean;
  learnMoreText?: string;
  downloadLinkText?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
  cardPadding?: string;
  borderWidth?: string;
  titleColor?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  textColor?: string;
  textFontSize?: string;
  linkColor?: string;
  linkFontSize?: string;
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
}) {
  const [titlePart1, titlePart2] = title.split('\n');

  return (
    <div
      style={{
        backgroundColor,
        border: `${borderWidth} solid ${borderColor}`,
        borderRadius,
        padding: cardPadding,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        minHeight: '200px',
      }}
    >
      {/* NEW Badge */}
      {isNew && showNewBadge && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: badgeBackgroundColor,
            color: badgeTextColor,
            fontSize: '11px',
            fontWeight: '600',
            padding: '4px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
          }}
        >
          NEW
        </div>
      )}

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div
          style={{
            color: titleColor,
            fontSize: `calc(${titleFontSize} - 2px)`,
            fontWeight: '600',
            lineHeight: 1.3,
          }}
        >
          {titlePart1}
        </div>
        <div
          style={{
            color: titleColor,
            fontSize: titleFontSize,
            fontWeight: titleFontWeight,
            lineHeight: 1.3,
          }}
        >
          {titlePart2}
        </div>
      </div>

      {/* Summary */}
      <p
        style={{
          color: textColor,
          fontSize: textFontSize,
          lineHeight: 1.5,
          margin: 0,
          flex: 1,
        }}
      >
        {summary}
      </p>

      {/* Learn More Link */}
      {showLearnMore && (
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{
            color: linkColor,
            fontSize: linkFontSize,
            fontWeight: '500',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {learnMoreText}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </a>
      )}

      {/* Download tech sheet link */}
      {showDownloadLink && (
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{
            color: linkColor,
            fontSize: `calc(${linkFontSize} - 1px)`,
            fontWeight: '400',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {/* PDF Icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13.5c0-.83.67-1.5 1.5-1.5h.5v3h-.5c-.83 0-1.5-.67-1.5-1.5zm6.5 3c0 .28-.22.5-.5.5h-2v-1h2c.28 0 .5.22.5.5zm-.5-2.5h-2v-1h2c.55 0 1 .45 1 1s-.45 1-1 1z" />
          </svg>
          {downloadLinkText}
        </a>
      )}
    </div>
  );
}

// Default styles for ProductGrid - used when no styles are provided
const defaultGridStyles = {
  padding: '40px 20px',
  backgroundColor: '#f3f4f6',
  cardBackgroundColor: '#ffffff',
  cardBorderColor: '#e5e7eb',
  cardBorderRadius: '8px',
  cardPadding: '24px',
  cardBorderWidth: '1px',
  titleColor: '#003087',
  titleFontSize: '18px',
  titleFontWeight: '700',
  textColor: '#6b7280',
  textFontSize: '14px',
  linkColor: '#003087',
  linkFontSize: '14px',
  badgeBackgroundColor: '#003087',
  badgeTextColor: '#ffffff',
};

export default function ProductGrid({
  props,
  styles,
  childPages: injectedChildren,
}: ProductGridProps) {
  const [children, setChildren] = useState<ChildPage[]>(injectedChildren || []);
  const [loading, setLoading] = useState(!injectedChildren && !!props.parentRowKey);

  const columns = props.columns || 4;
  const gap = props.gap || '24px';

  // Content options with defaults
  const showLearnMore = props.showLearnMore !== false;
  const showDownloadLink = props.showDownloadLink !== false;
  const showNewBadge = props.showNewBadge !== false;
  const learnMoreText = props.learnMoreText || 'Learn more';
  const downloadLinkText = props.downloadLinkText || 'Download tech sheet';

  // Merge provided styles with defaults
  const mergedStyles = { ...defaultGridStyles, ...styles };

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
          padding: mergedStyles.padding,
          backgroundColor: mergedStyles.backgroundColor,
          textAlign: 'center',
        }}
      >
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-4 gap-6 w-full max-w-5xl">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show preview cards when no children are loaded (design mode)
  if (children.length === 0 && !props.parentRowKey) {
    return (
      <div
        style={{
          padding: mergedStyles.padding,
          backgroundColor: mergedStyles.backgroundColor,
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
          {sampleProducts.slice(0, columns * 2).map((product) => (
            <PreviewProductCard
              key={product.rowKey}
              title={product.title}
              summary={product.summary}
              isNew={product.isNew}
              showLearnMore={showLearnMore}
              showDownloadLink={showDownloadLink}
              showNewBadge={showNewBadge}
              learnMoreText={learnMoreText}
              downloadLinkText={downloadLinkText}
              backgroundColor={mergedStyles.cardBackgroundColor}
              borderColor={mergedStyles.cardBorderColor}
              borderRadius={mergedStyles.cardBorderRadius}
              cardPadding={mergedStyles.cardPadding}
              borderWidth={mergedStyles.cardBorderWidth}
              titleColor={mergedStyles.titleColor}
              titleFontSize={mergedStyles.titleFontSize}
              titleFontWeight={mergedStyles.titleFontWeight}
              textColor={mergedStyles.textColor}
              textFontSize={mergedStyles.textFontSize}
              linkColor={mergedStyles.linkColor}
              linkFontSize={mergedStyles.linkFontSize}
              badgeBackgroundColor={mergedStyles.badgeBackgroundColor}
              badgeTextColor={mergedStyles.badgeTextColor}
            />
          ))}
        </div>
        <p
          style={{
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '12px',
            marginTop: '16px',
            fontStyle: 'italic',
          }}
        >
          Preview mode - Products will be loaded from child pages at runtime
        </p>
      </div>
    );
  }

  // Show message when parentRowKey is set but no children found
  if (children.length === 0) {
    return (
      <div
        style={{
          padding: mergedStyles.padding,
          backgroundColor: mergedStyles.backgroundColor,
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
        padding: mergedStyles.padding,
        backgroundColor: mergedStyles.backgroundColor,
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
            showLearnMore={showLearnMore}
            learnMoreText={learnMoreText}
            backgroundColor={mergedStyles.cardBackgroundColor}
            borderColor={mergedStyles.cardBorderColor}
            borderRadius={mergedStyles.cardBorderRadius}
            cardPadding={mergedStyles.cardPadding}
            titleColor={mergedStyles.titleColor}
            titleFontSize={mergedStyles.titleFontSize}
            titleFontWeight={mergedStyles.titleFontWeight}
            textColor={mergedStyles.textColor}
            textFontSize={mergedStyles.textFontSize}
            linkColor={mergedStyles.linkColor}
          />
        ))}
      </div>
    </div>
  );
}
