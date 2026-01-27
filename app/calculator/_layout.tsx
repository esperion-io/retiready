import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { CalculatorProvider } from '../../context/CalculatorContext';
import { ToastProvider } from '../../context/ToastContext';

export default function CalculatorLayout() {
    // Web-specific: Prevent swipe-back navigation (overscroll) & Adjust Scale
    React.useEffect(() => {
        if (Platform.OS === 'web') {
            document.body.style.overscrollBehaviorX = 'none';
            // User preference: 90% scale for better spacing on desktop
            (document.body.style as any).zoom = '90%';

            return () => {
                document.body.style.overscrollBehaviorX = 'auto';
                (document.body.style as any).zoom = '100%';
            };
        }
    }, []);

    return (
        <CalculatorProvider>
            <ToastProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </ToastProvider>
        </CalculatorProvider>
    );
}
