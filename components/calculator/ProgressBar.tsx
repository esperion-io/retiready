import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
    title: string;
}

export function ProgressBar({ currentStep, totalSteps, title }: ProgressBarProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.stepText}>Step {currentStep} of {totalSteps}</Text>
                <Text style={styles.titleText}>{title}</Text>
            </View>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${progress}%` }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    stepText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0a7ea4',
    },
    track: {
        height: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: '#0a7ea4',
        borderRadius: 3,
    },
});
