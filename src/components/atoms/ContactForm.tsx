import Title from './Title';
import Input from './Input';
import Button from './Button';
import IconButton from './IconButton';
import Paragraph from './Paragraph';
import { useTheme } from '../../contexts/ThemeContext';

interface ContactFormProps {
  layout?: 'standard' | 'withInfo';
  useThemeStyles?: boolean;
}

export default function ContactForm({
  layout = 'standard',
  useThemeStyles = false
}: ContactFormProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.ContactForm?.default || {};
  const inlineStyles = useThemeStyles ? {
    backgroundColor: styles.backgroundColor,
    padding: styles.padding,
  } : {};

  if (layout === 'withInfo') {
    return (
      <div className="w-full h-full flex gap-8 p-8" style={inlineStyles}>
        {/* Left: Contact Info */}
        <div className="flex-1 flex flex-col gap-6 p-6 bg-gray-100 rounded">
          <div className="h-6">
            <Title level={1} align="left" useThemeStyles={useThemeStyles} />
          </div>

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex items-center gap-3">
              <IconButton variant="filled" size="medium" useThemeStyles={useThemeStyles} />
              <div className="flex flex-col gap-1">
                <div className="h-3">
                  <Title level={3} align="left" useThemeStyles={useThemeStyles} />
                </div>
                <div className="h-2">
                  <Paragraph lines={1} align="left" useThemeStyles={useThemeStyles} />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <IconButton variant="filled" size="medium" useThemeStyles={useThemeStyles} />
              <div className="flex flex-col gap-1">
                <div className="h-3">
                  <Title level={3} align="left" useThemeStyles={useThemeStyles} />
                </div>
                <div className="h-2">
                  <Paragraph lines={1} align="left" useThemeStyles={useThemeStyles} />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-3">
              <IconButton variant="filled" size="medium" useThemeStyles={useThemeStyles} />
              <div className="flex flex-col gap-1">
                <div className="h-3">
                  <Title level={3} align="left" useThemeStyles={useThemeStyles} />
                </div>
                <div className="h-2">
                  <Paragraph lines={1} align="left" useThemeStyles={useThemeStyles} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="flex-1 flex flex-col gap-4 p-6">
          <div className="h-6 mb-2">
            <Title level={1} align="left" useThemeStyles={useThemeStyles} />
          </div>

          {/* Name Field */}
          <div className="flex flex-col gap-2">
            <div className="h-3">
              <Title level={3} align="left" useThemeStyles={useThemeStyles} />
            </div>
            <div className="h-10 w-full">
              <Input showLabel={false} useThemeStyles={useThemeStyles} />
            </div>
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <div className="h-3">
              <Title level={3} align="left" useThemeStyles={useThemeStyles} />
            </div>
            <div className="h-10 w-full">
              <Input showLabel={false} useThemeStyles={useThemeStyles} />
            </div>
          </div>

          {/* Message Field */}
          <div className="flex flex-col gap-2">
            <div className="h-3">
              <Title level={3} align="left" useThemeStyles={useThemeStyles} />
            </div>
            <div className="h-24 w-full">
              <Input showLabel={false} useThemeStyles={useThemeStyles} />
            </div>
          </div>

          {/* Submit Button */}
          <div className="h-10 w-32 mt-2">
            <Button variant="primary" align="center" useThemeStyles={useThemeStyles} />
          </div>
        </div>
      </div>
    );
  }

  // Standard layout
  return (
    <div className="w-full h-full flex flex-col gap-4 p-8 max-w-2xl mx-auto" style={inlineStyles}>
      <div className="h-6 mb-2">
        <Title level={1} align="left" useThemeStyles={useThemeStyles} />
      </div>

      {/* Name Field */}
      <div className="flex flex-col gap-2">
        <div className="h-3">
          <Title level={3} align="left" useThemeStyles={useThemeStyles} />
        </div>
        <div className="h-10 w-full">
          <Input showLabel={false} useThemeStyles={useThemeStyles} />
        </div>
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-2">
        <div className="h-3">
          <Title level={3} align="left" useThemeStyles={useThemeStyles} />
        </div>
        <div className="h-10 w-full">
          <Input showLabel={false} useThemeStyles={useThemeStyles} />
        </div>
      </div>

      {/* Subject Field */}
      <div className="flex flex-col gap-2">
        <div className="h-3">
          <Title level={3} align="left" useThemeStyles={useThemeStyles} />
        </div>
        <div className="h-10 w-full">
          <Input showLabel={false} useThemeStyles={useThemeStyles} />
        </div>
      </div>

      {/* Message Field */}
      <div className="flex flex-col gap-2">
        <div className="h-3">
          <Title level={3} align="left" useThemeStyles={useThemeStyles} />
        </div>
        <div className="h-10 w-full">
          <Input showLabel={false} useThemeStyles={useThemeStyles} />
        </div>
      </div>

      {/* Submit Button */}
      <div className="h-12 w-full mt-2">
        <Button variant="primary" align="center" useThemeStyles={useThemeStyles} />
      </div>
    </div>
  );
}
