import { Link } from 'react-router-dom';

interface ProductSummaryCardProps {
  title: string;
  summary: string;
  slug: string;
  showLearnMore?: boolean;
  learnMoreText?: string;
  linkColor?: string;
  titleColor?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  textColor?: string;
  textFontSize?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
  cardPadding?: string;
}

export default function ProductSummaryCard({
  title,
  summary,
  slug,
  showLearnMore = true,
  learnMoreText = 'Learn more',
  linkColor,
  titleColor,
  titleFontSize,
  titleFontWeight,
  textColor,
  textFontSize,
  backgroundColor,
  borderColor,
  borderRadius,
  cardPadding,
}: ProductSummaryCardProps) {
  // Use Allegiant brand defaults matching PreviewProductCard
  const finalTitleColor = titleColor || '#003087';
  const finalTitleFontSize = titleFontSize || '18px';
  const finalTitleFontWeight = titleFontWeight || '700';
  const finalTextColor = textColor || '#6b7280';
  const finalTextFontSize = textFontSize || '14px';
  const finalLinkColor = linkColor || '#003087';
  const finalBackgroundColor = backgroundColor || '#ffffff';
  const finalBorderColor = borderColor || '#e5e7eb';
  const finalBorderRadius = borderRadius || '8px';
  const finalCardPadding = cardPadding || '24px';

  // Split title by newline for two-line display (matching PreviewProductCard)
  const titleParts = title.split('\n');
  const titlePart1 = titleParts[0];
  const titlePart2 = titleParts[1];

  return (
    <div
      style={{
        backgroundColor: finalBackgroundColor,
        border: `1px solid ${finalBorderColor}`,
        borderRadius: finalBorderRadius,
        padding: finalCardPadding,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'box-shadow 0.2s ease',
        minHeight: '200px',
      }}
      className="hover:shadow-lg"
    >
      {/* Title - centered like PreviewProductCard */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div
          style={{
            color: finalTitleColor,
            fontSize: `calc(${finalTitleFontSize} - 2px)`,
            fontWeight: '600',
            lineHeight: 1.3,
          }}
        >
          {titlePart1}
        </div>
        {titlePart2 && (
          <div
            style={{
              color: finalTitleColor,
              fontSize: finalTitleFontSize,
              fontWeight: finalTitleFontWeight,
              lineHeight: 1.3,
            }}
          >
            {titlePart2}
          </div>
        )}
      </div>

      {/* Summary */}
      <p
        style={{
          color: finalTextColor,
          fontSize: finalTextFontSize,
          lineHeight: 1.5,
          margin: 0,
          flex: 1,
        }}
      >
        {summary}
      </p>

      {/* Learn More Link */}
      {showLearnMore && (
        <Link
          to={`/preview/${slug}`}
          style={{
            color: finalLinkColor,
            fontSize: '14px',
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
        </Link>
      )}
    </div>
  );
}
