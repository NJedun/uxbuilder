interface RatingBarProps {
  label: string;
  value: number;
  labelColor?: string;
  barBgColor?: string;
  barColor?: string;
}

export default function RatingBar({
  label,
  value,
  labelColor = '#374151',
  barBgColor = '#e5e7eb',
  barColor = '#4f46e5',
}: RatingBarProps) {
  // Convert 1-9 scale to percentage (1 = 100%, 9 = ~11%)
  const percentage = Math.max(0, Math.min(100, ((10 - value) / 9) * 100));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <div
        style={{
          width: '120px',
          flexShrink: 0,
          color: labelColor,
          fontSize: '14px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          height: '20px',
          backgroundColor: barBgColor,
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
