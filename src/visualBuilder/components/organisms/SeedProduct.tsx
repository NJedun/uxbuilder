import { GlobalStyles, SeedProductData } from '../../../store/visualBuilderStore';
import { RatingBar } from '../atoms';
import { CategoryCard } from '../molecules';
import type { ViewMode } from '../../../pages/VisualBuilder';

interface SeedProductProps {
  props: {
    seedProductData?: SeedProductData;
  };
  styles: {
    backgroundColor?: string;
    padding?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderStyle?: string;
    borderColor?: string;
    labelColor?: string;
    valueColor?: string;
    ratingBarBgColor?: string;
    ratingBarColor?: string;
    cardBgColor?: string;
    cardBorderColor?: string;
    cardTitleColor?: string;
    titleColor?: string;
    titleFontSize?: string;
    descriptionColor?: string;
    descriptionFontSize?: string;
  };
  globalStyles: GlobalStyles;
  viewMode?: ViewMode;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

export default function SeedProduct({
  props,
  styles,
  globalStyles,
  viewMode = 'desktop',
  getStyle,
}: SeedProductProps) {
  const isMobile = viewMode === 'mobile';

  const seedData: SeedProductData = props.seedProductData || {
    productName: 'Product Name',
    description: 'Product description',
    heroImage: '',
    ratings: [],
    agronomics: [],
    fieldPerformance: [],
    diseaseResistance: [],
  };

  return (
    <div
      style={{
        backgroundColor: styles.backgroundColor || '#ffffff',
        borderRadius: styles.borderRadius || '8px',
        overflow: 'hidden',
        border: styles.borderWidth
          ? `${styles.borderWidth} ${styles.borderStyle || 'solid'} ${styles.borderColor || '#e5e7eb'}`
          : '1px solid #e5e7eb',
      }}
    >
      {/* Hero Image */}
      {seedData.heroImage && (
        <div
          style={{
            width: '100%',
            height: isMobile ? '150px' : '200px',
            overflow: 'hidden',
          }}
        >
          <img
            src={seedData.heroImage}
            alt={seedData.productName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: styles.padding || (isMobile ? '20px' : '30px') }}>
        {/* Title & Description */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2
            style={{
              color: getStyle(styles.titleColor, 'seedProductTitleColor'),
              fontSize: isMobile
                ? '24px'
                : getStyle(styles.titleFontSize, 'seedProductTitleFontSize'),
              fontWeight: '700',
              margin: '0 0 8px 0',
            }}
          >
            {seedData.productName}
          </h2>
          <p
            style={{
              color: getStyle(styles.descriptionColor, 'seedProductDescriptionColor'),
              fontSize: getStyle(styles.descriptionFontSize, 'seedProductDescriptionFontSize'),
              margin: 0,
            }}
          >
            {seedData.description}
          </p>
        </div>

        {/* Rating Section */}
        {seedData.ratings && seedData.ratings.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3
              style={{
                color: getStyle(styles.cardTitleColor, 'seedProductCardTitleColor'),
                fontSize: '18px',
                fontWeight: '600',
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              Rating
            </h3>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '12px',
                color: '#6b7280',
              }}
            >
              <span style={{ marginLeft: '132px' }}>Fair</span>
              <span>Average</span>
              <span>Excellent</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
                fontSize: '11px',
                color: '#9ca3af',
                marginLeft: '132px',
              }}
            >
              {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
            {seedData.ratings.map((rating, index) => (
              <RatingBar
                key={index}
                label={rating.label}
                value={rating.value}
                labelColor={getStyle(styles.labelColor, 'seedProductLabelColor')}
                barBgColor={getStyle(styles.ratingBarBgColor, 'seedProductRatingBarBgColor')}
                barColor={getStyle(styles.ratingBarColor, 'seedProductRatingBarColor')}
              />
            ))}
          </div>
        )}

        {/* Product Characteristics Cards */}
        <div>
          <h3
            style={{
              color: getStyle(styles.cardTitleColor, 'seedProductCardTitleColor'),
              fontSize: '18px',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            Product characteristics
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '16px',
            }}
          >
            {seedData.agronomics && seedData.agronomics.length > 0 && (
              <CategoryCard
                title="Agronomics"
                iconUrl={seedData.agronomicsIcon}
                items={seedData.agronomics}
                isMobile={isMobile}
                bgColor={getStyle(styles.cardBgColor, 'seedProductCardBgColor')}
                borderColor={getStyle(styles.cardBorderColor, 'seedProductCardBorderColor')}
                titleColor={getStyle(styles.cardTitleColor, 'seedProductCardTitleColor')}
                labelColor={getStyle(styles.labelColor, 'seedProductLabelColor')}
                valueColor={getStyle(styles.valueColor, 'seedProductValueColor')}
              />
            )}
            {seedData.fieldPerformance && seedData.fieldPerformance.length > 0 && (
              <CategoryCard
                title="Field performance"
                iconUrl={seedData.fieldPerformanceIcon}
                items={seedData.fieldPerformance}
                isMobile={isMobile}
                bgColor={getStyle(styles.cardBgColor, 'seedProductCardBgColor')}
                borderColor={getStyle(styles.cardBorderColor, 'seedProductCardBorderColor')}
                titleColor={getStyle(styles.cardTitleColor, 'seedProductCardTitleColor')}
                labelColor={getStyle(styles.labelColor, 'seedProductLabelColor')}
                valueColor={getStyle(styles.valueColor, 'seedProductValueColor')}
              />
            )}
            {seedData.diseaseResistance && seedData.diseaseResistance.length > 0 && (
              <CategoryCard
                title="Disease tolerance"
                iconUrl={seedData.diseaseResistanceIcon}
                items={seedData.diseaseResistance}
                isMobile={isMobile}
                bgColor={getStyle(styles.cardBgColor, 'seedProductCardBgColor')}
                borderColor={getStyle(styles.cardBorderColor, 'seedProductCardBorderColor')}
                titleColor={getStyle(styles.cardTitleColor, 'seedProductCardTitleColor')}
                labelColor={getStyle(styles.labelColor, 'seedProductLabelColor')}
                valueColor={getStyle(styles.valueColor, 'seedProductValueColor')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
