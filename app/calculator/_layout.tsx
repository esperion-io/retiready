import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { CalculatorProvider } from '../../context/CalculatorContext';
import { ToastProvider } from '../../context/ToastContext';

export default function CalculatorLayout() {
    // Web-specific: Prevent swipe-back navigation (overscroll)
    React.useEffect(() => {
        if (Platform.OS === 'web') {
            document.body.style.overscrollBehaviorX = 'none';
            return () => {
                document.body.style.overscrollBehaviorX = 'auto';
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
