interface FormProps {
  showLabels?: boolean;
}

export default function Form({ showLabels = true }: FormProps) {
  return (
    <div className="w-full h-full" style={{ padding: '8px' }}>
      <div className="w-full h-full border-2 border-gray-400 rounded bg-gray-50 p-3 flex flex-col gap-2">
        {/* Input field 1 with optional label */}
        <div className="flex flex-col gap-1">
          {showLabels && <div className="h-1.5 bg-gray-500 rounded" style={{ width: '60px' }} />}
          <div className="w-full h-8 border-2 border-gray-400 rounded bg-white" />
        </div>

        {/* Input field 2 with optional label */}
        <div className="flex flex-col gap-1">
          {showLabels && <div className="h-1.5 bg-gray-500 rounded" style={{ width: '60px' }} />}
          <div className="w-full h-8 border-2 border-gray-400 rounded bg-white" />
        </div>

        {/* Textarea with optional label */}
        <div className="flex flex-col gap-1">
          {showLabels && <div className="h-1.5 bg-gray-500 rounded" style={{ width: '60px' }} />}
          <div className="w-full border-2 border-gray-400 rounded bg-white" style={{ height: '4rem' }} />
        </div>

        {/* Dropdown with optional label */}
        <div className="flex flex-col gap-1">
          {showLabels && <div className="h-1.5 bg-gray-500 rounded" style={{ width: '60px' }} />}
          <div className="w-full h-8 border-2 border-gray-400 rounded bg-white relative flex items-center justify-end pr-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-2">
          <div className="h-8 bg-gray-600 rounded" style={{ width: '80px' }} />
        </div>
      </div>
    </div>
  );
}
