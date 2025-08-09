import React, { createContext, useState, useEffect } from 'react';

// Define your themes with their CSS variables
const themes = {
  default: {
    '--primary-color': '#0f172a',         
    '--secondary-color': '#64748b',       
    '--accent-color': '#1a56db',          
    '--light-accent': '#f8fafc',          
    '--light-gray': '#e2e8f0',            
    '--white': '#ffffff',                 
    '--hover-color': '#1e429f',           
    '--background-alt': '#f1f5f9',        
    '--shadow-color': 'rgba(0, 0, 0, 0.08)', 
    '--purple-light': '#f3f0ff',          
    '--purple-border': '#e9d5ff',         
    '--purple-dark': '#7c3aed',          
    '--green-light': '#ecfdf5',           
    '--red-light': '#fef2f2',             
    '--sidebar-bg': '#000000',            
    '--sidebar-text': '#ffffff',          
    '--sidebar-hover': '#1f2937',         
    '--submenu-bg': '#0f1624',            
    '--submenu-active-bg': '#2d3748',     
    '--submenu-hover-bg': '#1a202c',
    '--accent-color-rgb': '26, 86, 219'   
  },
  dark: {
    '--primary-color': '#e2e8f0',         
    '--secondary-color': '#94a3b8',       
    '--accent-color': '#60a5fa',          
    '--light-accent': '#1e293b',          
    '--light-gray': '#334155',            
    '--white': '#0f172a',                 
    '--hover-color': '#93c5fd',           
    '--background-alt': '#1e293b',        
    '--shadow-color': 'rgba(0, 0, 0, 0.25)', 
    '--purple-light': '#1e1b4b',          
    '--purple-border': '#4c1d95',         
    '--purple-dark': '#8b5cf6',          
    '--green-light': '#064e3b',           
    '--red-light': '#7f1d1d',             
    '--sidebar-bg': '#020617',            
    '--sidebar-text': '#f8fafc',          
    '--sidebar-hover': '#334155',         
    '--submenu-bg': '#0f172a',            
    '--submenu-active-bg': '#1e293b',     
    '--submenu-hover-bg': '#1e293b',
    '--accent-color-rgb': '96, 165, 250'      
  },
  forest: {
    '--primary-color': '#0f172a',         
    '--secondary-color': '#64748b',       
    '--accent-color': '#2f855a',          
    '--light-accent': '#f0fff4',          
    '--light-gray': '#d1fae5',            
    '--white': '#ffffff',                 
    '--hover-color': '#276749',           
    '--background-alt': '#ecfdf5',        
    '--shadow-color': 'rgba(0, 0, 0, 0.08)', 
    '--purple-light': '#f0fff4',          
    '--purple-border': '#c6f6d5',         
    '--purple-dark': '#38a169',          
    '--green-light': '#f0fff4',           
    '--red-light': '#fef2f2',             
    '--sidebar-bg': '#1a202c',            
    '--sidebar-text': '#ffffff',          
    '--sidebar-hover': '#2d3748',         
    '--submenu-bg': '#2d3748',            
    '--submenu-active-bg': '#38a169',     
    '--submenu-hover-bg': '#2d3748',
    '--accent-color-rgb': '47, 133, 90'
  },
  ruby: {
    '--primary-color': '#0f172a',         
    '--secondary-color': '#64748b',       
    '--accent-color': '#9b2c2c',          
    '--light-accent': '#fff5f5',          
    '--light-gray': '#fed7d7',            
    '--white': '#ffffff',                 
    '--hover-color': '#822727',           
    '--background-alt': '#fef2f2',        
    '--shadow-color': 'rgba(0, 0, 0, 0.08)', 
    '--purple-light': '#fff5f5',          
    '--purple-border': '#feb2b2',         
    '--purple-dark': '#c53030',          
    '--green-light': '#ecfdf5',           
    '--red-light': '#fff5f5',             
    '--sidebar-bg': '#1a202c',            
    '--sidebar-text': '#ffffff',          
    '--sidebar-hover': '#2d3748',         
    '--submenu-bg': '#2d3748',            
    '--submenu-active-bg': '#9b2c2c',     
    '--submenu-hover-bg': '#2d3748',
    '--accent-color-rgb': '155, 44, 44'
  },
  amber: {
    '--primary-color': '#0f172a',         
    '--secondary-color': '#64748b',       
    '--accent-color': '#b7791f',          
    '--light-accent': '#fffbeb',          
    '--light-gray': '#fef3c7',            
    '--white': '#ffffff',                 
    '--hover-color': '#975a16',           
    '--background-alt': '#fef3c7',        
    '--shadow-color': 'rgba(0, 0, 0, 0.08)', 
    '--purple-light': '#fffbeb',          
    '--purple-border': '#fbd38d',         
    '--purple-dark': '#d69e2e',          
    '--green-light': '#ecfdf5',           
    '--red-light': '#fef2f2',             
    '--sidebar-bg': '#1a202c',            
    '--sidebar-text': '#ffffff',          
    '--sidebar-hover': '#2d3748',         
    '--submenu-bg': '#2d3748',            
    '--submenu-active-bg': '#b7791f',     
    '--submenu-hover-bg': '#2d3748',
    '--accent-color-rgb': '183, 121, 31'
  },
  ocean: {
    '--primary-color': '#0f172a',         
    '--secondary-color': '#64748b',       
    '--accent-color': '#285e61',          
    '--light-accent': '#e6fffa',          
    '--light-gray': '#b2f5ea',            
    '--white': '#ffffff',                 
    '--hover-color': '#234e52',           
    '--background-alt': '#e6fffa',        
    '--shadow-color': 'rgba(0, 0, 0, 0.08)', 
    '--purple-light': '#e6fffa',          
    '--purple-border': '#81e6d9',         
    '--purple-dark': '#319795',          
    '--green-light': '#ecfdf5',           
    '--red-light': '#fef2f2',             
    '--sidebar-bg': '#1a202c',            
    '--sidebar-text': '#ffffff',          
    '--sidebar-hover': '#2d3748',         
    '--submenu-bg': '#2d3748',            
    '--submenu-active-bg': '#285e61',     
    '--submenu-hover-bg': '#2d3748',
    '--accent-color-rgb': '40, 94, 97'
  }
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Get the saved theme from localStorage or use default
  const savedTheme = localStorage.getItem('theme') || 'default';
  const [currentTheme, setCurrentTheme] = useState(savedTheme);
  
  // Apply theme when it changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('theme', currentTheme);
    
    // Apply theme by setting CSS variables
    const theme = themes[currentTheme] || themes.default;
    Object.keys(theme).forEach(variable => {
      document.documentElement.style.setProperty(variable, theme[variable]);
    });
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
