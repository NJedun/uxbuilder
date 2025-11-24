import { useBuilderStore } from '../store/builderStore';

export default function PropertiesPanel() {
  const { componentsByViewport, viewport, selectedComponents, updateComponentProps } = useBuilderStore();
  const components = componentsByViewport[viewport];

  if (selectedComponents.length !== 1) {
    return (
      <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Properties</h2>
        <p className="text-sm text-gray-500">
          {selectedComponents.length === 0
            ? 'Select a component to edit its properties'
            : 'Select only one component to edit properties'}
        </p>
      </div>
    );
  }

  const selectedId = selectedComponents[0];
  const component = components.find((c) => c.i === selectedId);

  if (!component) return null;

  const handlePropChange = (key: string, value: any) => {
    updateComponentProps(selectedId, { [key]: value });
  };

  return (
    <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Properties</h2>

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Type: {component.type}</p>
      </div>

      {/* NavMenu Properties */}
      {component.type === 'NavMenu' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <select
              value={component.props?.variant || 'simple'}
              onChange={(e) => handlePropChange('variant', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="simple">Simple</option>
              <option value="withDropdown">With Dropdown</option>
              <option value="withButton">With CTA Button</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items Count
            </label>
            <input
              type="number"
              min="2"
              max="8"
              value={component.props?.itemCount || 4}
              onChange={(e) => handlePropChange('itemCount', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}

      {/* SearchBar Properties */}
      {component.type === 'SearchBar' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Style
          </label>
          <select
            value={component.props?.variant || 'simple'}
            onChange={(e) => handlePropChange('variant', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="simple">Simple</option>
            <option value="withIcon">With Icon</option>
          </select>
        </div>
      )}

      {/* HeaderActions Properties */}
      {component.type === 'HeaderActions' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Style
          </label>
          <select
            value={component.props?.variant || 'icons'}
            onChange={(e) => handlePropChange('variant', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="icons">Icons (Cart, User, Notifications)</option>
            <option value="buttons">Buttons (Login, Sign Up)</option>
          </select>
        </div>
      )}

      {/* HeaderPattern Properties */}
      {component.type === 'HeaderPattern' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layout Style
          </label>
          <select
            value={component.props?.variant || 'simple'}
            onChange={(e) => handlePropChange('variant', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="simple">Simple (Logo + Nav)</option>
            <option value="ecommerce">E-commerce (Logo + Search + Icons)</option>
            <option value="saas">SaaS (Logo + Nav + CTA Buttons)</option>
            <option value="mobile">Mobile (Logo + Hamburger)</option>
          </select>
        </div>
      )}

      {/* HorizontalLine Properties */}
      {component.type === 'HorizontalLine' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Line Width (px)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={component.props?.width || 2}
              onChange={(e) => handlePropChange('width', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vertical Alignment
            </label>
            <select
              value={component.props?.align || 'center'}
              onChange={(e) => handlePropChange('align', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </>
      )}

      {/* FooterPattern Properties */}
      {component.type === 'FooterPattern' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layout Style
          </label>
          <select
            value={component.props?.variant || 'simple'}
            onChange={(e) => handlePropChange('variant', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="simple">Simple (Logo + Nav)</option>
            <option value="withSocial">With Social Links</option>
            <option value="multiColumn">Multi-Column</option>
          </select>
        </div>
      )}

      {/* CopyrightText Properties */}
      {component.type === 'CopyrightText' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alignment
          </label>
          <select
            value={component.props?.align || 'center'}
            onChange={(e) => handlePropChange('align', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      )}

      {/* ProductCard Properties */}
      {component.type === 'ProductCard' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layout
          </label>
          <select
            value={component.props?.variant || 'grid'}
            onChange={(e) => handlePropChange('variant', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="grid">Grid View</option>
            <option value="list">List View</option>
          </select>
        </div>
      )}

      {/* ProductList Properties */}
      {component.type === 'ProductList' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layout
            </label>
            <select
              value={component.props?.layout || 'grid'}
              onChange={(e) => handlePropChange('layout', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </select>
          </div>
          {component.props?.layout === 'grid' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Columns
              </label>
              <input
                type="number"
                min="1"
                max="4"
                value={component.props?.columns || 3}
                onChange={(e) => handlePropChange('columns', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Items
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={component.props?.itemCount || 6}
              onChange={(e) => handlePropChange('itemCount', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}

      {/* ProductDetails Properties */}
      {component.type === 'ProductDetails' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layout
          </label>
          <select
            value={component.props?.layout || 'sideBySide'}
            onChange={(e) => handlePropChange('layout', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sideBySide">Side by Side</option>
            <option value="stacked">Stacked</option>
          </select>
        </div>
      )}

      {/* HeroSection Properties */}
      {component.type === 'HeroSection' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alignment
            </label>
            <select
              value={component.props?.align || 'center'}
              onChange={(e) => handlePropChange('align', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={component.props?.hasImageBackground === true}
                onChange={(e) => handlePropChange('hasImageBackground', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Image Background</span>
            </label>
          </div>
        </>
      )}

      {/* HeroWithImage Properties */}
      {component.type === 'HeroWithImage' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image Position
          </label>
          <select
            value={component.props?.align || 'left'}
            onChange={(e) => handlePropChange('align', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      )}

      {/* ContactForm Properties */}
      {component.type === 'ContactForm' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layout
          </label>
          <select
            value={component.props?.layout || 'standard'}
            onChange={(e) => handlePropChange('layout', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="standard">Standard</option>
            <option value="withInfo">With Contact Info</option>
          </select>
        </div>
      )}

      {/* Card Properties */}
      {component.type === 'Card' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background
          </label>
          <select
            value={component.props?.variant || 'solid'}
            onChange={(e) => handlePropChange('variant', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="solid">Solid</option>
            <option value="image">Image (Hero)</option>
          </select>
        </div>
      )}

      {/* Button Properties */}
      {component.type === 'Button' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variant
            </label>
            <select
              value={component.props?.variant || 'primary'}
              onChange={(e) => handlePropChange('variant', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alignment
            </label>
            <select
              value={component.props?.align || 'center'}
              onChange={(e) => handlePropChange('align', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </>
      )}

      {/* Title Properties */}
      {component.type === 'Title' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <select
              value={component.props?.level || 1}
              onChange={(e) => handlePropChange('level', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alignment
            </label>
            <select
              value={component.props?.align || 'left'}
              onChange={(e) => handlePropChange('align', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </>
      )}

      {/* Paragraph Properties */}
      {component.type === 'Paragraph' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lines
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={component.props?.lines || 3}
            onChange={(e) => handlePropChange('lines', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Logo Properties */}
      {component.type === 'Logo' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size
          </label>
          <select
            value={component.props?.size || 'medium'}
            onChange={(e) => handlePropChange('size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      )}

      {/* Link Properties */}
      {component.type === 'Link' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variant
            </label>
            <select
              value={component.props?.variant || 'primary'}
              onChange={(e) => handlePropChange('variant', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alignment
            </label>
            <select
              value={component.props?.align || 'left'}
              onChange={(e) => handlePropChange('align', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </>
      )}

      {/* List Properties */}
      {component.type === 'List' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Items
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={component.props?.items || 2}
            onChange={(e) => handlePropChange('items', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* SocialLinks Properties */}
      {component.type === 'SocialLinks' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icons Count
            </label>
            <input
              type="number"
              min="1"
              max="8"
              value={component.props?.count || 4}
              onChange={(e) => handlePropChange('count', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alignment
            </label>
            <select
              value={component.props?.align || 'center'}
              onChange={(e) => handlePropChange('align', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </>
      )}

      {/* Textarea Properties */}
      {component.type === 'Textarea' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rows
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={component.props?.rows || 3}
              onChange={(e) => handlePropChange('rows', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={component.props?.showLabel === true}
                onChange={(e) => handlePropChange('showLabel', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Show Label</span>
            </label>
          </div>
        </>
      )}

      {/* Form Properties */}
      {component.type === 'Form' && (
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={component.props?.showLabels !== false}
              onChange={(e) => handlePropChange('showLabels', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Labels</span>
          </label>
        </div>
      )}

      {/* Input Properties */}
      {component.type === 'Input' && (
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={component.props?.showLabel === true}
              onChange={(e) => handlePropChange('showLabel', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Label</span>
          </label>
        </div>
      )}

      {/* Dropdown Properties */}
      {component.type === 'Dropdown' && (
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={component.props?.showLabel === true}
              onChange={(e) => handlePropChange('showLabel', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Label</span>
          </label>
        </div>
      )}
    </div>
  );
}
