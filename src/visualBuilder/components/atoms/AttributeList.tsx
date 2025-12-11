interface AttributeItem {
  label: string;
  value: string;
}

interface AttributeListProps {
  items: AttributeItem[];
  labelColor?: string;
  valueColor?: string;
}

export default function AttributeList({
  items,
  labelColor = '#374151',
  valueColor = '#111827',
}: AttributeListProps) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((item, index) => (
        <li
          key={index}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 0',
            borderBottom: index < items.length - 1 ? '1px solid #e5e7eb' : 'none',
            fontSize: '14px',
          }}
        >
          <span style={{ color: labelColor }}>{item.label}</span>
          <span style={{ color: valueColor, fontWeight: '500' }}>{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
