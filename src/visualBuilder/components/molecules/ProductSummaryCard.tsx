import { Link } from 'react-router-dom';

interface ProductSummaryCardProps {
  title: string;
  summary: string;
  slug: string;
  linkColor?: string;
  titleColor?: string;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export default function ProductSummaryCard({
  title,
  summary,
  slug,
  linkColor = '#2563eb',
  titleColor = '#111827',
  textColor = '#6b7280',
  backgroundColor = '#ffffff',
  borderColor = '#e5e7eb',
}: ProductSummaryCardProps) {
  return (
    <div
      style={{
        backgroundColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'box-shadow 0.2s ease',
      }}
      className="hover:shadow-lg"
    >
      {/* Title */}
      <h3
        style={{
          color: titleColor,
          fontSize: '20px',
          fontWeight: '700',
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {title}
      </h3>

      {/* Summary */}
      <p
        style={{
          color: textColor,
          fontSize: '14px',
          lineHeight: 1.6,
          margin: 0,
          flex: 1,
        }}
      >
        {summary}
      </p>

      {/* Learn More Link */}
      <Link
        to={`/preview/${slug}`}
        style={{
          color: linkColor,
          fontSize: '14px',
          fontWeight: '500',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        Learn more
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
    </div>
  );
}
