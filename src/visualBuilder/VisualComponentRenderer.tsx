import { VisualComponent, useVisualBuilderStore, GlobalStyles } from '../store/visualBuilderStore';
import type { ViewMode } from '../pages/VisualBuilder';
import {
  HeaderComponent,
  HeroSection,
  ImageComponent,
  RowComponent,
  LinkList,
  IconBox,
  TextComponent,
  ButtonComponent,
  Divider,
  FooterComponent,
  SeedProduct,
  ProductGrid,
} from './components';

interface VisualComponentRendererProps {
  component: VisualComponent;
  isSelected: boolean;
  onSelect: () => void;
  isNested?: boolean;
  viewMode?: ViewMode;
  readOnly?: boolean;
}

export default function VisualComponentRenderer({
  component,
  isSelected,
  onSelect,
  isNested = false,
  viewMode = 'desktop',
  readOnly = false,
}: VisualComponentRendererProps) {
  const { deleteComponent, selectComponent, selectedComponentId, globalStyles } =
    useVisualBuilderStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this component?')) {
      deleteComponent(component.id);
    }
  };

  // Helper to get style with global fallback
  const getStyle = (
    componentStyle: string | undefined,
    globalKey: keyof GlobalStyles
  ): string | undefined => {
    return componentStyle || (globalStyles[globalKey] as string | undefined);
  };

  // Render child helper for Row component
  const renderChild = (
    child: VisualComponent,
    childIsSelected: boolean,
    childOnSelect: () => void
  ) => (
    <VisualComponentRenderer
      key={child.id}
      component={child}
      isSelected={childIsSelected}
      onSelect={childOnSelect}
      isNested={true}
      viewMode={viewMode}
      readOnly={readOnly}
    />
  );

  const renderComponent = () => {
    const props = component.props || {};
    const styles = component.customStyles || {};

    switch (component.type) {
      case 'Header':
        return (
          <HeaderComponent
            props={props}
            styles={styles}
            globalStyles={globalStyles}
            viewMode={viewMode}
            getStyle={getStyle}
          />
        );

      case 'HeroSection':
        return (
          <HeroSection
            props={props}
            styles={styles}
            globalStyles={globalStyles}
            getStyle={getStyle}
          />
        );

      case 'Image':
        return <ImageComponent props={props} styles={styles} />;

      case 'Row':
        return (
          <RowComponent
            props={props}
            styles={styles}
            children={component.children || []}
            globalStyles={globalStyles}
            viewMode={viewMode}
            renderChild={renderChild}
          />
        );

      case 'LinkList':
        return (
          <LinkList
            props={props}
            styles={styles}
            globalStyles={globalStyles}
            getStyle={getStyle}
          />
        );

      case 'IconBox':
        return (
          <IconBox
            props={props}
            styles={styles}
            globalStyles={globalStyles}
            getStyle={getStyle}
          />
        );

      case 'Text':
        return (
          <TextComponent
            props={props}
            styles={styles}
            globalStyles={globalStyles}
            getStyle={getStyle}
          />
        );

      case 'Button':
        return (
          <ButtonComponent
            props={props}
            styles={styles}
            globalStyles={globalStyles}
            getStyle={getStyle}
          />
        );

      case 'Divider':
        return (
          <Divider
            props={props}
            styles={styles}
            globalStyles={globalStyles}
            getStyle={getStyle}
          />
        );

      case 'Footer':
        return (
          <FooterComponent
            props={props}
            styles={styles}
            globalStyles={globalStyles}
            getStyle={getStyle}
          />
        );

      case 'SeedProduct':
        return (
          <SeedProduct
            props={props}
            styles={styles}
            globalStyles={globalStyles}
            viewMode={viewMode}
            getStyle={getStyle}
          />
        );

      case 'ProductGrid':
        return (
          <ProductGrid
            props={props}
            styles={styles}
            globalStyles={globalStyles}
          />
        );

      default:
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">Unknown component type: {component.type}</p>
          </div>
        );
    }
  };

  // In readOnly mode, just render the component without any interactive wrapper
  if (readOnly) {
    return <>{renderComponent()}</>;
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`relative group ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } hover:ring-2 hover:ring-blue-300 hover:ring-offset-2 transition-all overflow-hidden`}
    >
      {renderComponent()}

      {/* Component Controls */}
      <div
        className={`absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
          isSelected ? 'opacity-100' : ''
        }`}
      >
        <button
          onClick={handleDelete}
          className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg text-xs"
          title="Delete component"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Selected indicator label */}
      {isSelected && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded shadow-lg">
          {component.type}
        </div>
      )}
    </div>
  );
}
