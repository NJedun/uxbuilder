import Title from './Title';
import Input from './Input';
import Button from './Button';
import IconButton from './IconButton';
import Paragraph from './Paragraph';

interface ContactFormProps {
  layout?: 'standard' | 'withInfo';
}

export default function ContactForm({
  layout = 'standard'
}: ContactFormProps) {
  if (layout === 'withInfo') {
    return (
      <div className="w-full h-full flex gap-8 p-8">
        {/* Left: Contact Info */}
        <div className="flex-1 flex flex-col gap-6 p-6 bg-gray-100 rounded">
          <div className="h-6 w-48">
            <Title level={1} align="left" />
          </div>

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex items-center gap-3">
              <IconButton variant="filled" size="medium" />
              <div className="flex flex-col gap-1">
                <div className="h-3 w-20">
                  <Title level={3} align="left" />
                </div>
                <div className="h-2 w-32">
                  <Paragraph lines={1} />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <IconButton variant="filled" size="medium" />
              <div className="flex flex-col gap-1">
                <div className="h-3 w-20">
                  <Title level={3} align="left" />
                </div>
                <div className="h-2 w-32">
                  <Paragraph lines={1} />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-3">
              <IconButton variant="filled" size="medium" />
              <div className="flex flex-col gap-1">
                <div className="h-3 w-20">
                  <Title level={3} align="left" />
                </div>
                <div className="h-2 w-40">
                  <Paragraph lines={1} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="flex-1 flex flex-col gap-4 p-6">
          <div className="h-6 w-48 mb-2">
            <Title level={1} align="left" />
          </div>

          {/* Name Field */}
          <div className="flex flex-col gap-2">
            <div className="h-3 w-16">
              <Title level={3} align="left" />
            </div>
            <div className="h-10 w-full">
              <Input showLabel={false} />
            </div>
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <div className="h-3 w-16">
              <Title level={3} align="left" />
            </div>
            <div className="h-10 w-full">
              <Input showLabel={false} />
            </div>
          </div>

          {/* Message Field */}
          <div className="flex flex-col gap-2">
            <div className="h-3 w-20">
              <Title level={3} align="left" />
            </div>
            <div className="h-24 w-full">
              <Input showLabel={false} />
            </div>
          </div>

          {/* Submit Button */}
          <div className="h-10 w-32 mt-2">
            <Button variant="primary" align="center" />
          </div>
        </div>
      </div>
    );
  }

  // Standard layout
  return (
    <div className="w-full h-full flex flex-col gap-4 p-8 max-w-2xl mx-auto">
      <div className="h-6 w-48 mb-2">
        <Title level={1} align="left" />
      </div>

      {/* Name Field */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-16">
          <Title level={3} align="left" />
        </div>
        <div className="h-10 w-full">
          <Input showLabel={false} />
        </div>
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-16">
          <Title level={3} align="left" />
        </div>
        <div className="h-10 w-full">
          <Input showLabel={false} />
        </div>
      </div>

      {/* Subject Field */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-20">
          <Title level={3} align="left" />
        </div>
        <div className="h-10 w-full">
          <Input showLabel={false} />
        </div>
      </div>

      {/* Message Field */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-20">
          <Title level={3} align="left" />
        </div>
        <div className="h-32 w-full">
          <Input showLabel={false} />
        </div>
      </div>

      {/* Submit Button */}
      <div className="h-12 w-full mt-2">
        <Button variant="primary" align="center" />
      </div>
    </div>
  );
}
