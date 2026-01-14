import { useState } from 'react';
import { GlobalStyles } from '../../../store/visualBuilderStore';
import type { ViewMode } from '../../../pages/VisualBuilder';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  width?: '25' | '50' | '75' | '100'; // percentage width
  options?: string[]; // for select type
}

interface AllegiantSeedFormProps {
  props: {
    formTitle?: string;
    formDescription?: string;
    fields?: FormField[];
    submitButtonText?: string;
    successMessage?: string;
  };
  styles: {
    backgroundColor?: string;
    padding?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderStyle?: string;
    borderColor?: string;
    labelColor?: string;
    labelFontSize?: string;
    inputBorderColor?: string;
    inputBorderRadius?: string;
    inputBackgroundColor?: string;
    inputTextColor?: string;
    requiredColor?: string;
    buttonBackgroundColor?: string;
    buttonTextColor?: string;
    buttonBorderRadius?: string;
    descriptionColor?: string;
  };
  globalStyles: GlobalStyles;
  viewMode?: ViewMode;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const defaultFields: FormField[] = [
  { id: 'firstName', label: 'First name', type: 'text', required: true, width: '50' },
  { id: 'lastName', label: 'Last name', type: 'text', required: true, width: '50' },
  { id: 'email', label: 'Email address', type: 'email', required: true, width: '50' },
  { id: 'phone', label: 'Phone number', type: 'tel', required: true, width: '50' },
  { id: 'city', label: 'City', type: 'text', required: true, width: '50' },
  { id: 'state', label: 'State', type: 'text', required: true, width: '50' },
  { id: 'comments', label: 'Questions or comments', type: 'textarea', required: true, width: '100', placeholder: 'Please be as detailed as possible so that we can better address your inquiry' },
];

export default function AllegiantSeedForm({
  props,
  styles,
  viewMode = 'desktop',
  onToast,
}: AllegiantSeedFormProps) {
  const isMobile = viewMode === 'mobile';
  const [formData, setFormData] = useState<Record<string, string>>({});

  const fields = props.fields && props.fields.length > 0 ? props.fields : defaultFields;

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check required fields
    const missingFields = fields.filter(
      (field) => field.required && !formData[field.id]?.trim()
    );

    if (missingFields.length > 0) {
      if (onToast) {
        onToast(`Please fill in all required fields`, 'error');
      }
      return;
    }

    // Mock success
    if (onToast) {
      onToast(props.successMessage || 'Form submitted successfully!', 'success');
    }

    // Reset form
    setFormData({});
  };

  const getFieldWidth = (width?: string): string => {
    if (isMobile) return '100%';
    switch (width) {
      case '25': return 'calc(25% - 12px)';
      case '50': return 'calc(50% - 8px)';
      case '75': return 'calc(75% - 4px)';
      case '100':
      default: return '100%';
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: styles.labelColor || '#333333',
    fontSize: styles.labelFontSize || '14px',
    fontWeight: 600,
    marginBottom: '8px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: `1px solid ${styles.inputBorderColor || '#cccccc'}`,
    borderRadius: styles.inputBorderRadius || '4px',
    backgroundColor: styles.inputBackgroundColor || '#ffffff',
    color: styles.inputTextColor || '#333333',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const requiredStyle: React.CSSProperties = {
    color: styles.requiredColor || '#c41230',
    marginLeft: '4px',
  };

  return (
    <div
      style={{
        backgroundColor: styles.backgroundColor || '#ffffff',
        padding: styles.padding || (isMobile ? '20px' : '32px'),
        borderRadius: styles.borderRadius || '0px',
        border: styles.borderWidth
          ? `${styles.borderWidth} ${styles.borderStyle || 'solid'} ${styles.borderColor || '#e5e7eb'}`
          : 'none',
      }}
    >
      {/* Form Description */}
      {props.formDescription && (
        <p
          style={{
            color: styles.descriptionColor || '#666666',
            fontSize: '14px',
            marginTop: 0,
            marginBottom: '24px',
          }}
        >
          {props.formDescription}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* Form Fields */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          {fields.map((field) => (
            <div
              key={field.id}
              style={{
                width: getFieldWidth(field.width),
                minWidth: isMobile ? '100%' : '200px',
              }}
            >
              <label style={labelStyle}>
                {field.label}
                {field.required && <span style={requiredStyle}>*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    ...inputStyle,
                    minHeight: '150px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              ) : field.type === 'select' ? (
                <select
                  value={formData[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select...</option>
                  {(field.options || []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  style={inputStyle}
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            backgroundColor: styles.buttonBackgroundColor || '#0066a1',
            color: styles.buttonTextColor || '#ffffff',
            padding: '14px 32px',
            border: 'none',
            borderRadius: styles.buttonBorderRadius || '4px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {props.submitButtonText || 'Submit'}
        </button>
      </form>
    </div>
  );
}
