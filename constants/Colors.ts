/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#003366'; // Deep Blue for high contrast
const tintColorDark = '#FFFFFF';

export const Colors = {
    light: {
        text: '#1A1A1A', // Nearly black for best readability
        background: '#FAFAFA', // Soft white
        tint: tintColorLight,
        icon: '#4A4A4A',
        tabIconDefault: '#687076',
        tabIconSelected: tintColorLight,
        // Accessible Custom Colors
        primary: '#003366', // Deep Navy Blue
        secondary: '#0066CC', // Bright Blue for interactives
        accent: '#CC4400', // Burnt Orange for CTAs
        success: '#006633', // Dark Green
        warning: '#996600', // Dark Yellow/Gold
        card: '#FFFFFF',
        border: '#E0E0E0',
        textSecondary: '#444444',
    },
    dark: {
        text: '#ECEDEE',
        background: '#121212', // Standard dark mode bg
        tint: tintColorDark,
        icon: '#9BA1A6',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: tintColorDark,
        // Accessible Custom Colors - Dark Mode
        primary: '#66B2FF', // Light Blue
        secondary: '#3399FF',
        accent: '#FF884D', // Light Orange
        success: '#4ADE80',
        warning: '#FBBF24',
        card: '#1E1E1E',
        border: '#333333',
        textSecondary: '#BBBBBB',
    },
};
