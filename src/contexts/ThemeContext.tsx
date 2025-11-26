import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import defaultTheme from '../styles/theme.json';

interface ThemeContextType {
  theme: typeof defaultTheme;
  updateTheme: (newTheme: Partial<typeof defaultTheme>) => void;
  updateComponentStyle: (component: string, variant: string, styles: any) => void;
  updateGlobalStyle: (category: string, property: string, value: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'uxBuilder_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme);
        // Merge with default theme to handle missing properties
        return {
          ...defaultTheme,
          ...parsed,
          globalStyles: {
            ...defaultTheme.globalStyles,
            ...parsed.globalStyles
          },
          componentStyles: {
            ...defaultTheme.componentStyles,
            ...parsed.componentStyles
          }
        };
      }
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
    }
    return defaultTheme;
  });

  const updateTheme = (newTheme: Partial<typeof defaultTheme>) => {
    setTheme((prev: typeof defaultTheme) => ({
      ...prev,
      ...newTheme
    }));
  };

  const updateComponentStyle = (component: string, variant: string, styles: any) => {
    setTheme((prev: typeof defaultTheme) => ({
      ...prev,
      componentStyles: {
        ...prev.componentStyles,
        [component]: {
          ...prev.componentStyles[component as keyof typeof prev.componentStyles],
          [variant]: {
            ...(prev.componentStyles[component as keyof typeof prev.componentStyles] as any)?.[variant],
            ...styles
          }
        }
      }
    }));
  };

  const updateGlobalStyle = (category: string, property: string, value: string) => {
    setTheme((prev: typeof defaultTheme) => ({
      ...prev,
      globalStyles: {
        ...prev.globalStyles,
        [category]: {
          ...(prev.globalStyles as any)[category],
          [property]: value
        }
      }
    }));
  };

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, updateComponentStyle, updateGlobalStyle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
