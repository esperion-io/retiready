import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotFoundScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])}>
                <Text style={StyleSheet.flatten([styles.title, { color: theme.text }])}>This page doesn't exist.</Text>

                <Link href="/" asChild>
                    <TouchableOpacity style={StyleSheet.flatten([styles.link, { borderColor: theme.border }])}>
                        <Text style={StyleSheet.flatten([styles.linkText, { color: theme.secondary }])}>Go to home screen!</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderRadius: 8,
    },
    linkText: {
        fontSize: 18,
        fontWeight: '600',
    },
});
