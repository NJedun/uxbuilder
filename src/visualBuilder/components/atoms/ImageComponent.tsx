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

export default function ImageComponent({ props, styles }: ImageComponentProps) {
  const imageElement = (
    <img
      src={props.src || 'https://via.placeholder.com/400x300?text=Add+Image+URL'}
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
