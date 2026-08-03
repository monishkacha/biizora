import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('amexora_theme');
    return saved ? saved === 'dark' : false; // Default to Executive Light for clean business feel
  });

  const [bgStyle, setBgStyle] = useState(() => {
    return localStorage.getItem('amexora_bg_style') || 'corporate-slate';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('amexora_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('amexora_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('amexora_bg_style', bgStyle);
  }, [bgStyle]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleTheme, bgStyle, setBgStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
