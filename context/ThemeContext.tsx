import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Theme } from '../types';

export const themes: Theme[] = [
    { id: 'rainbow', name: 'Rainbow Flow', className: 'from-rainbow_pale-red via-rainbow_pale-orange via-rainbow_pale-yellow via-rainbow_pale-green via-rainbow_pale-blue via-rainbow_pale-indigo to-rainbow_pale-violet bg-gradient-to-br bg-[length:200%_200%] animate-calm-rainbow', isDark: false },
    { id: 'ocean', name: 'Ocean Breeze', className: 'from-cyan-200 via-blue-300 to-teal-200 bg-gradient-to-br bg-[length:200%_200%] animate-calm-bg', isDark: false },
    { id: 'sunset', name: 'Sunset Glow', className: 'from-orange-300 via-red-300 to-purple-400 bg-gradient-to-br bg-[length:200%_200%] animate-calm-bg', isDark: false },
    { id: 'forest', name: 'Forest Calm', className: 'from-green-200 via-emerald-300 to-lime-200 bg-gradient-to-br bg-[length:200%_200%] animate-calm-bg', isDark: false },
    { id: 'light', name: 'Minimalist Light', className: 'bg-gray-100', isDark: false },
    { id: 'dark', name: 'Minimalist Dark', className: 'bg-gray-800', isDark: true },
];

export const defaultTheme = themes[0];

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: defaultTheme,
    setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        try {
            const savedThemeId = localStorage.getItem('studyWellTheme');
            if (savedThemeId) {
                return themes.find(t => t.id === savedThemeId) || defaultTheme;
            }

            // No saved theme, check system preference
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = themes.find(t => t.id === (prefersDark ? 'dark' : 'light'));
            return systemTheme || defaultTheme; // Fallback to default if light/dark themes are not found

        } catch {
            return defaultTheme;
        }
    });

    useEffect(() => {
        const root = window.document.documentElement;
        // Clean up old theme classes if any, not ideal but safe
        root.classList.remove('dark');

        if (theme.isDark) {
            root.classList.add('dark');
        }
        localStorage.setItem('studyWellTheme', theme.id);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);