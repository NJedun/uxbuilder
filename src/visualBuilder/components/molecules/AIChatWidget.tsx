import { useState, useRef, useEffect, useCallback } from 'react';
import { GlobalStyles, useVisualBuilderStore } from '../../../store/visualBuilderStore';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatWidgetProps {
  props: {
    projectName?: string;
    placeholder?: string;
    title?: string;
    welcomeMessage?: string;
    // Auto-trigger from URL query param
    autoTriggerQueryParam?: string; // Query param to check (default: "q")
  };
  styles: {
    // Alignment styles
    alignItems?: string; // vertical: flex-start, center, flex-end
    justifyContent?: string; // horizontal: flex-start, center, flex-end
    containerHeight?: string; // height of wrapper for alignment
    // Container styles
    backgroundColor?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderStyle?: string;
    borderColor?: string;
    padding?: string;
    maxWidth?: string;
    minHeight?: string;
    // Header styles
    headerBackgroundColor?: string;
    headerTextColor?: string;
    headerFontSize?: string;
    headerFontWeight?: string;
    headerPadding?: string;
    // Message styles
    userMessageBgColor?: string;
    userMessageTextColor?: string;
    assistantMessageBgColor?: string;
    assistantMessageTextColor?: string;
    messageFontSize?: string;
    messageBorderRadius?: string;
    // Input styles
    inputBackgroundColor?: string;
    inputTextColor?: string;
    inputBorderColor?: string;
    inputBorderRadius?: string;
    inputPadding?: string;
    // Button styles
    buttonBackgroundColor?: string;
    buttonTextColor?: string;
    buttonBorderRadius?: string;
    buttonPadding?: string;
  };
  globalStyles: GlobalStyles;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

// Helper to render markdown-style links and basic formatting
function renderMessageContent(content: string, linkColor: string): React.ReactNode {
  // Split by markdown link pattern [text](url)
  const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, index) => {
    // Check if this part is a markdown link
    const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const [, text, url] = linkMatch;
      // Convert relative URLs to preview URLs
      const href = url.startsWith('#') || url.startsWith('/')
        ? `/preview/${url.replace(/^[#/]+/, '')}`
        : url;
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: linkColor,
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          {text}
        </a>
      );
    }
    // Return plain text, but handle line breaks
    return part.split('\n').map((line, lineIndex, arr) => (
      <span key={`${index}-${lineIndex}`}>
        {line}
        {lineIndex < arr.length - 1 && <br />}
      </span>
    ));
  });
}

export default function AIChatWidget({ props, styles, globalStyles, getStyle }: AIChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current project name from store as fallback - use shallow comparison to prevent unnecessary re-renders
  const storeProjectName = useVisualBuilderStore(
    useCallback((state) => state.projectName, [])
  );
  const projectName = props.projectName || storeProjectName || 'default';
  const placeholder = props.placeholder || 'Ask about our seed products...';
  const title = props.title || 'Product Assistant';
  const welcomeMessage = props.welcomeMessage || 'Hello! I can help you find the right seed products for your needs. What are you looking for?';
  const autoTriggerQueryParam = props.autoTriggerQueryParam || 'q';

  // Track if we've already auto-triggered to prevent duplicate triggers
  const hasAutoTriggeredRef = useRef(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Refocus input after loading completes
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      // Use a small timeout to ensure DOM has updated
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Check for auto-trigger query parameter on mount
  useEffect(() => {
    if (hasAutoTriggeredRef.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const queryValue = urlParams.get(autoTriggerQueryParam);

    if (queryValue && queryValue.trim()) {
      hasAutoTriggeredRef.current = true;
      // Trigger the chat with the query value
      triggerChatWithMessage(queryValue.trim());

      // Optionally remove the query param from URL to prevent re-triggering on refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete(autoTriggerQueryParam);
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [autoTriggerQueryParam]);

  // Function to trigger chat with a specific message (used by auto-trigger)
  const triggerChatWithMessage = async (userMessage: string) => {
    if (isLoading) return;

    setError(null);

    // Add user message
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          projectName,
          userMessage,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to get response');
      }

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.content }]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      // Keep the user message even if request failed
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);

    // Add user message
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Support both local development and production
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          projectName,
          userMessage,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to get response');
      }

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.content }]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      // Remove the user message if request failed
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    backgroundColor: getStyle(styles.backgroundColor, 'containerBackgroundColor') || '#ffffff',
    borderRadius: styles.borderRadius || '12px',
    borderWidth: styles.borderWidth || '1px',
    borderStyle: styles.borderStyle || 'solid',
    borderColor: styles.borderColor || '#e5e7eb',
    width: styles.maxWidth || '400px', // Fixed width to prevent resize during loading
    maxWidth: '100%', // But don't exceed parent container
    minHeight: styles.minHeight || '500px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: styles.headerBackgroundColor || getStyle(undefined, 'buttonBackgroundColor') || '#2563eb',
    color: styles.headerTextColor || '#ffffff',
    fontSize: styles.headerFontSize || '16px',
    fontWeight: styles.headerFontWeight || '600',
    padding: styles.headerPadding || '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const messagesContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: styles.padding || '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const userMessageStyle: React.CSSProperties = {
    backgroundColor: styles.userMessageBgColor || getStyle(undefined, 'buttonBackgroundColor') || '#2563eb',
    color: styles.userMessageTextColor || '#ffffff',
    fontSize: styles.messageFontSize || '14px',
    borderRadius: styles.messageBorderRadius || '12px',
    padding: '10px 14px',
    maxWidth: '80%',
    alignSelf: 'flex-end',
    wordBreak: 'break-word',
  };

  const assistantMessageStyle: React.CSSProperties = {
    backgroundColor: styles.assistantMessageBgColor || '#f3f4f6',
    color: styles.assistantMessageTextColor || getStyle(undefined, 'subtitleColor') || '#374151',
    fontSize: styles.messageFontSize || '14px',
    borderRadius: styles.messageBorderRadius || '12px',
    padding: '10px 14px',
    maxWidth: '80%',
    alignSelf: 'flex-start',
    wordBreak: 'break-word',
  };

  const inputContainerStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: styles.inputBackgroundColor || '#f9fafb',
    color: styles.inputTextColor || '#111827',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: styles.inputBorderColor || '#d1d5db',
    borderRadius: styles.inputBorderRadius || '8px',
    padding: styles.inputPadding || '10px 12px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: styles.buttonBackgroundColor || getStyle(undefined, 'buttonBackgroundColor') || '#2563eb',
    color: styles.buttonTextColor || '#ffffff',
    borderRadius: styles.buttonBorderRadius || '8px',
    padding: styles.buttonPadding || '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.7 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '80px',
  };

  // Wrapper style for alignment
  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: styles.alignItems || 'flex-start', // vertical alignment
    justifyContent: styles.justifyContent || 'flex-start', // horizontal alignment
    width: '100%',
    height: styles.containerHeight || 'auto',
    minHeight: styles.containerHeight ? undefined : '100%',
  };

  return (
    <div style={wrapperStyle}>
      <div style={containerStyle}>
        {/* Header */}
      <div style={headerStyle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {title}
      </div>

      {/* Messages */}
      <div style={messagesContainerStyle}>
        {/* Welcome message */}
        {messages.length === 0 && (
          <div style={assistantMessageStyle}>
            {welcomeMessage}
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, index) => (
          <div
            key={index}
            style={msg.role === 'user' ? userMessageStyle : assistantMessageStyle}
          >
            {msg.role === 'assistant'
              ? renderMessageContent(msg.content, getStyle(undefined, 'buttonBackgroundColor') || '#2563eb')
              : msg.content}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div style={assistantMessageStyle}>
            <span style={{ display: 'flex', gap: '4px' }}>
              <span style={{ animation: 'pulse 1s infinite' }}>.</span>
              <span style={{ animation: 'pulse 1s infinite 0.2s' }}>.</span>
              <span style={{ animation: 'pulse 1s infinite 0.4s' }}>.</span>
            </span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{ ...assistantMessageStyle, backgroundColor: '#fef2f2', color: '#dc2626' }}>
            Error: {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={inputContainerStyle}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            style={inputStyle}
            disabled={isLoading}
          />
          <button type="submit" style={buttonStyle} disabled={isLoading || !inputValue.trim()}>
            {isLoading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </form>
      </div>

        {/* Keyframe animations */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
