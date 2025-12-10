import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TooltipProps {
    content: string;
    children?: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
    const [visible, setVisible] = useState(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setVisible(true)}>
                {children || <Ionicons name="information-circle-outline" size={18} color="#0a7ea4" />}
            </TouchableOpacity>

            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
                    <View style={styles.tooltip}>
                        <Ionicons name="information-circle" size={24} color="#0a7ea4" style={{ marginBottom: 8 }} />
                        <Text style={styles.text}>{content}</Text>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 8,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    tooltip: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        maxWidth: 320,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    text: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
        textAlign: 'center',
    },
});
