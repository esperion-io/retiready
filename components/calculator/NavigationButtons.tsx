import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NavigationButtonsProps {
    onNext?: () => void;
    onBack?: () => void;
    nextLabel?: string;
    disableNext?: boolean;
}

export function NavigationButtons({ onNext, onBack, nextLabel = 'Next', disableNext = false }: NavigationButtonsProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={handleBack}
            >
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.nextButton, disableNext && styles.disabledButton]}
                onPress={onNext}
                disabled={disableNext}
            >
                <Text style={styles.nextButtonText}>{nextLabel}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingBottom: 40, // Extra padding for safety on bottom
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 10,
        minWidth: 110,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        backgroundColor: '#f5f5f5',
    },
    nextButton: {
        backgroundColor: '#0a7ea4',
    },
    disabledButton: {
        opacity: 0.5,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
