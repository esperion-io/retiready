import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    visible: boolean;
    onHide: () => void;
}

export function Toast({ message, type, visible, onHide }: ToastProps) {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            const timer = setTimeout(() => {
                hide();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hide = () => {
        Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onHide();
        });
    };

    if (!visible) return null;

    const bgColors = {
        success: '#edf7ed',
        error: '#fdeded',
        info: '#e3f2fd',
    };

    const textColors = {
        success: '#1e4620',
        error: '#5f2120',
        info: '#014361',
    };

    const icons = {
        success: 'checkmark-circle' as const,
        error: 'alert-circle' as const,
        info: 'information-circle' as const,
    };

    const iconColors = {
        success: '#4caf50',
        error: '#ef5350',
        info: '#03a9f4',
    };

    return (
        <SafeAreaView style={styles.container} pointerEvents="box-none">
            <Animated.View
                style={[
                    styles.toast,
                    { opacity, backgroundColor: bgColors[type] }
                ]}
            >
                <Ionicons name={icons[type]} size={24} color={iconColors[type]} />
                <Text style={[styles.message, { color: textColors[type] }]}>{message}</Text>
                <TouchableOpacity onPress={hide}>
                    <Ionicons name="close" size={20} color={textColors[type]} />
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        gap: 12,
        maxWidth: 400,
        width: '90%',
    },
    message: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
});
