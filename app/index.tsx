import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LandingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.logo}>RetiReady</Text>
                    <Text style={styles.tagline}>Future Living, Simplified.</Text>
                </View>

                <View style={styles.card}>
                    <Ionicons name="calculator-outline" size={64} color="#0a7ea4" style={styles.icon} />
                    <Text style={styles.title}>Retirement Calculator</Text>
                    <Text style={styles.description}>
                        Discover your financial readiness for retirement living.
                        Analyze your assets, compare costs, and see how much equity you could free up.
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push('/calculator')}
                    >
                        <Text style={styles.buttonText}>Start Calculator</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.features}>
                    <View style={styles.featureItem}>
                        <Ionicons name="cash-outline" size={24} color="#2e7d32" />
                        <Text style={styles.featureText}>Analyze Assets</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="home-outline" size={24} color="#f57c00" />
                        <Text style={styles.featureText}>Compare Options</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="trending-up-outline" size={24} color="#1565c0" />
                        <Text style={styles.featureText}>Project Savings</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 48,
        alignItems: 'center',
    },
    logo: {
        fontSize: 42,
        fontWeight: '800',
        color: '#0a7ea4',
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 18,
        color: '#666',
        marginTop: 8,
        fontStyle: 'italic',
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#f8f9fa',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    icon: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    button: {
        backgroundColor: '#0a7ea4',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    features: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        maxWidth: 400,
        marginTop: 48,
        gap: 16,
    },
    featureItem: {
        alignItems: 'center',
        gap: 8,
    },
    featureText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
});
