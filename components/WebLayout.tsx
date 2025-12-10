import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Link, usePathname } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WebLayout({ children }: { children: React.ReactNode }) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { width } = useWindowDimensions();
    const pathname = usePathname();

    const isSmallScreen = width < 768;

    return (
        <SafeAreaView style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])} edges={['top', 'left', 'right']}>
            <View style={StyleSheet.flatten([styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }])}>
                <View style={StyleSheet.flatten([styles.headerContent, { maxWidth: 1200 }])}>
                    <Link href="/" asChild>
                        <TouchableOpacity accessibilityRole="header">
                            <Text style={StyleSheet.flatten([styles.logo, { color: theme.primary }])}>Retiready</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={StyleSheet.flatten([
                    styles.scrollContent,
                    { backgroundColor: theme.background },
                    isSmallScreen ? { paddingHorizontal: 16 } : { alignItems: 'center' }
                ])}
            >
                <View style={StyleSheet.flatten([{ width: '100%', maxWidth: 960 }, !isSmallScreen && { paddingHorizontal: 0 }])}>
                    <View role="main">
                        {children}
                    </View>
                </View>

                <View style={StyleSheet.flatten([styles.footer, { borderTopColor: theme.border }])}>
                    <Text style={StyleSheet.flatten([styles.footerText, { color: theme.textSecondary }])}>
                        © {new Date().getFullYear()} Retiready. Empowering seniors with clarity.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        width: '100%',
        alignItems: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    logo: {
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: Platform.select({ web: 'Georgia, serif', default: 'System' }),
    },
    nav: {
        flexDirection: 'row',
        gap: 24,
    },
    navItem: {
        paddingVertical: 8,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    navText: {
        fontSize: 18,
        fontWeight: '500',
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 32,
        paddingBottom: 64,
    },
    footer: {
        marginTop: 64,
        paddingTop: 32,
        borderTopWidth: 1,
        width: '100%',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
    },
});
