/**
 * Theme Provider - Applies appearance settings as CSS variables
 */

import React, { useEffect } from 'react';
import { useSettings } from '../store/hooks';

export function ThemeProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const { appearance } = useSettings();

  useEffect(() => {
    const root = document.documentElement;

    // Apply theme mode
    if (appearance.theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else if (appearance.theme === 'light') {
      root.classList.remove('dark-theme');
      root.classList.add('light-theme');
    } else {
      // Auto - use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark-theme');
        root.classList.remove('light-theme');
      } else {
        root.classList.remove('dark-theme');
        root.classList.add('light-theme');
      }
    }

    // Apply accent color
    root.style.setProperty('--accent-color', appearance.accentColor);
    root.style.setProperty('--accent-color-hover', adjustColor(appearance.accentColor, -10));
    root.style.setProperty('--accent-color-light', adjustColor(appearance.accentColor, 40, 0.1));

    // Apply font size
    const fontSizes = {
      small: { base: '13px', large: '18px', heading: '20px' },
      medium: { base: '14px', large: '20px', heading: '24px' },
      large: { base: '16px', large: '22px', heading: '28px' },
    };
    const sizes = fontSizes[appearance.fontSize] || fontSizes.medium;
    root.style.setProperty('--font-size-base', sizes.base);
    root.style.setProperty('--font-size-large', sizes.large);
    root.style.setProperty('--font-size-heading', sizes.heading);

    // Apply layout density
    const densities = {
      compact: { padding: '8px', gap: '8px', radius: '6px' },
      comfortable: { padding: '12px', gap: '12px', radius: '8px' },
      spacious: { padding: '16px', gap: '16px', radius: '12px' },
    };
    const density = densities[appearance.layoutDensity] || densities.comfortable;
    root.style.setProperty('--layout-padding', density.padding);
    root.style.setProperty('--layout-gap', density.gap);
    root.style.setProperty('--default-radius', density.radius);

    // Apply widget border radius
    root.style.setProperty('--widget-border-radius', `${appearance.widgetBorderRadius}px`);

    // Apply animation settings
    root.style.setProperty('--transition-duration', appearance.enableAnimations ? '0.2s' : '0s');

    // Apply transparency settings
    root.style.setProperty(
      '--widget-background',
      appearance.enableTransparency ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.98)'
    );
    root.style.setProperty(
      '--widget-backdrop-blur',
      appearance.enableTransparency ? 'blur(10px)' : 'blur(0px)'
    );
  }, [appearance]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (appearance.theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      if (e.matches) {
        root.classList.add('dark-theme');
        root.classList.remove('light-theme');
      } else {
        root.classList.remove('dark-theme');
        root.classList.add('light-theme');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [appearance.theme]);

  return <>{children}</>;
}

/**
 * Adjust a hex color's lightness
 */
function adjustColor(hex: string, amount: number, alpha?: number): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Adjust values
  const newR = Math.max(0, Math.min(255, r + amount));
  const newG = Math.max(0, Math.min(255, g + amount));
  const newB = Math.max(0, Math.min(255, b + amount));

  if (alpha !== undefined) {
    return `rgba(${newR}, ${newG}, ${newB}, ${alpha})`;
  }

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

export default ThemeProvider;
