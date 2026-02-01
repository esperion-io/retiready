import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PromotionsStepProps {
    onNext: () => void;
    onBack: () => void;
    onRestart: () => void;
}

export function PromotionsStep({ onNext, onBack, onRestart }: PromotionsStepProps) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#666" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Promotions</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                <Text style={styles.introText}>
                    Special offers and services for your retirement journey.
                </Text>

                {/* Advertisement Spaces - 2x3 Grid */}
                <View style={styles.adGrid}>
                    {/* Row 1 */}
                    <View style={styles.adRow}>
                        <View style={styles.adMedium}>
                            <Text style={styles.adText}>Advertisement</Text>
                            <Text style={styles.adSubText}>300x250px</Text>
                        </View>
                        <View style={styles.adMedium}>
                            <Text style={styles.adText}>Advertisement</Text>
                            <Text style={styles.adSubText}>300x250px</Text>
                        </View>
                    </View>

                    {/* Row 2 */}
                    <View style={styles.adRow}>
                        <View style={styles.adMedium}>
                            <Text style={styles.adText}>Advertisement</Text>
                            <Text style={styles.adSubText}>300x250px</Text>
                        </View>
                        <View style={styles.adMedium}>
                            <Text style={styles.adText}>Advertisement</Text>
                            <Text style={styles.adSubText}>300x250px</Text>
                        </View>
                    </View>

                    {/* Row 3 */}
                    <View style={styles.adRow}>
                        <View style={styles.adMedium}>
                            <Text style={styles.adText}>Advertisement</Text>
                            <Text style={styles.adSubText}>300x250px</Text>
                        </View>
                        <View style={styles.adMedium}>
                            <Text style={styles.adText}>Advertisement</Text>
                            <Text style={styles.adSubText}>300x250px</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    introText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    adGrid: {
        gap: 20,
    },
    adRow: {
        flexDirection: 'row',
        gap: 12,
    },
    adMedium: {
        flex: 1,
        height: 250,
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    adText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
        marginBottom: 4,
    },
    adSubText: {
        fontSize: 14,
        color: '#bbb',
    },
});
