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
          <div className="h-6 w-48 bg-gray-700 rounded"></div>

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
              <div className="flex flex-col gap-1">
                <div className="h-3 w-20 bg-gray-600 rounded"></div>
                <div className="h-2 w-32 bg-gray-400 rounded"></div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
              <div className="flex flex-col gap-1">
                <div className="h-3 w-20 bg-gray-600 rounded"></div>
                <div className="h-2 w-32 bg-gray-400 rounded"></div>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
              <div className="flex flex-col gap-1">
                <div className="h-3 w-20 bg-gray-600 rounded"></div>
                <div className="h-2 w-40 bg-gray-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="flex-1 flex flex-col gap-4 p-6">
          <div className="h-6 w-48 bg-gray-700 rounded mb-2"></div>

          {/* Name Field */}
          <div className="flex flex-col gap-2">
            <div className="h-3 w-16 bg-gray-600 rounded"></div>
            <div className="h-10 w-full border-2 border-gray-300 rounded bg-white"></div>
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <div className="h-3 w-16 bg-gray-600 rounded"></div>
            <div className="h-10 w-full border-2 border-gray-300 rounded bg-white"></div>
          </div>

          {/* Message Field */}
          <div className="flex flex-col gap-2">
            <div className="h-3 w-20 bg-gray-600 rounded"></div>
            <div className="h-24 w-full border-2 border-gray-300 rounded bg-white"></div>
          </div>

          {/* Submit Button */}
          <div className="h-10 w-32 bg-gray-600 rounded mt-2"></div>
        </div>
      </div>
    );
  }

  // Standard layout
  return (
    <div className="w-full h-full flex flex-col gap-4 p-8 max-w-2xl mx-auto">
      <div className="h-6 w-48 bg-gray-700 rounded mb-2"></div>

      {/* Name Field */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-16 bg-gray-600 rounded"></div>
        <div className="h-10 w-full border-2 border-gray-300 rounded bg-white"></div>
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-16 bg-gray-600 rounded"></div>
        <div className="h-10 w-full border-2 border-gray-300 rounded bg-white"></div>
      </div>

      {/* Subject Field */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-20 bg-gray-600 rounded"></div>
        <div className="h-10 w-full border-2 border-gray-300 rounded bg-white"></div>
      </div>

      {/* Message Field */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-20 bg-gray-600 rounded"></div>
        <div className="h-32 w-full border-2 border-gray-300 rounded bg-white"></div>
      </div>

      {/* Submit Button */}
      <div className="h-12 w-full bg-gray-600 rounded mt-2"></div>
    </div>
  );
}
