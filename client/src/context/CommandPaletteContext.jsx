import React, { createContext, useContext, useState, useEffect } from 'react';

const CommandPaletteContext = createContext();

export const CommandPaletteProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openPalette = () => setIsOpen(true);
  const closePalette = () => setIsOpen(false);

  return (
    <CommandPaletteContext.Provider value={{ isOpen, openPalette, closePalette }}>
      {children}
    </CommandPaletteContext.Provider>
  );
};

export const useCommandPalette = () => useContext(CommandPaletteContext);
