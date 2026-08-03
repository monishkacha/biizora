import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Light-only product experience — dark mode disabled
  const [darkMode] = useState(false);
  const [bgStyle, setBgStyleState] = useState(() => {
    return localStorage.getItem('biizora_bg_style') || 'ivory-cream';
  });

  useEffect(() => {
    localStorage.setItem('biizora_theme', 'light');
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('biizora_bg_style', bgStyle);
  }, [bgStyle]);

  const toggleTheme = () => {};
  const setBgStyle = (style) => setBgStyleState(style);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, bgStyle, setBgStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
