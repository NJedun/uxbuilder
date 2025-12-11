import { AttributeList } from '../atoms';

interface CategoryCardProps {
  title: string;
  iconUrl?: string;
  items: { label: string; value: string }[];
  isMobile?: boolean;
  bgColor?: string;
  borderColor?: string;
  titleColor?: string;
  labelColor?: string;
  valueColor?: string;
}

export default function CategoryCard({
  title,
  iconUrl,
  items,
  isMobile = false,
  bgColor = '#ffffff',
  borderColor = '#e5e7eb',
  titleColor = '#111827',
  labelColor = '#374151',
  valueColor = '#111827',
}: CategoryCardProps) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: isMobile ? '100%' : '200px',
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        {iconUrl && (
          <img
            src={iconUrl}
            alt={title}
            style={{
              width: '48px',
              height: '48px',
              objectFit: 'contain',
              marginBottom: '8px',
            }}
          />
        )}
        <h4
          style={{
            margin: 0,
            color: titleColor,
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          {title}
        </h4>
      </div>
      <AttributeList items={items} labelColor={labelColor} valueColor={valueColor} />
    </div>
  );
}
