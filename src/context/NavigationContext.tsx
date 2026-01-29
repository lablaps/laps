'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface NavigationContextType {
  direction: 'left' | 'right' | null;
  setDirection: (direction: 'left' | 'right' | null) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [currentIndex, setCurrentIndex] = useState(2); // Home é o índice 2

  return (
    <NavigationContext.Provider value={{ direction, setDirection, currentIndex, setCurrentIndex }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation deve ser usado dentro de NavigationProvider');
  }
  return context;
};
