'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ConfigProvider, App } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { darkThemeConfig, lightThemeConfig } from './themeConfig';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  themeMode: ThemeMode;
  mounted: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'dark',
  mounted: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'dark',
}) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultTheme);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem('inventx_theme_mode') as ThemeMode | null;
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        queueMicrotask(() => {
          setThemeModeState(savedTheme);
        });
      }
    } catch {
      // ignore in restricted environments
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', themeMode);
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(`${themeMode}-theme`);
    try {
      localStorage.setItem('inventx_theme_mode', themeMode);
    } catch {
      // ignore
    }
  }, [themeMode, mounted]);

  const toggleTheme = () => {
    setThemeModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const currentAntdTheme = useMemo(() => {
    return themeMode === 'light' ? lightThemeConfig : darkThemeConfig;
  }, [themeMode]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        mounted,
        toggleTheme,
        setThemeMode: setThemeModeState,
      }}
    >
      <AntdRegistry>
        <ConfigProvider theme={currentAntdTheme}>
          <App>
            {children}
          </App>
        </ConfigProvider>
      </AntdRegistry>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
