interface ImageComponentProps {
  props: {
    src?: string;
    alt?: string;
    linkUrl?: string;
    openInNewTab?: boolean;
  };
  styles: {
    width?: string;
    maxWidth?: string;
    height?: string;
    objectFit?: string;
    borderRadius?: string;
    margin?: string;
    borderWidth?: string;
    borderStyle?: string;
    borderColor?: string;
  };
}

// Placeholder image using data URI (no external dependency)
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect fill="#f3f4f6" width="400" height="300"/>
  <rect fill="#e5e7eb" x="150" y="100" width="100" height="80" rx="8"/>
  <circle fill="#d1d5db" cx="180" cy="130" r="15"/>
  <path fill="#d1d5db" d="M155 165 L175 145 L195 160 L215 135 L245 165 Z"/>
  <text x="200" y="210" font-family="system-ui, sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">Add Image URL</text>
</svg>
`);

export default function ImageComponent({ props, styles }: ImageComponentProps) {
  const imageElement = (
    <img
      src={props.src || PLACEHOLDER_IMAGE}
      alt={props.alt || 'Image'}
      style={{
        width: styles.width || '100%',
        maxWidth: styles.maxWidth,
        height: styles.height || 'auto',
        objectFit: (styles.objectFit as React.CSSProperties['objectFit']) || 'cover',
        borderRadius: styles.borderRadius,
        margin: styles.margin,
        display: 'block',
        borderWidth: styles.borderWidth,
        borderStyle: styles.borderStyle,
        borderColor: styles.borderColor,
      }}
    />
  );

  // Wrap in link if linkUrl is provided
  if (props.linkUrl) {
    return (
      <a
        href={props.linkUrl}
        target={props.openInNewTab ? '_blank' : '_self'}
        rel={props.openInNewTab ? 'noopener noreferrer' : undefined}
        onClick={(e) => e.preventDefault()}
        style={{ display: 'block' }}
      >
        {imageElement}
      </a>
    );
  }

  return imageElement;
}
