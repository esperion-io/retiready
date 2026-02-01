import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useToast } from '../../../context/ToastContext';

interface NextStepsStepProps {
    onRestart: () => void;
    onBack: () => void;
}

const RESOURCES = [
    {
        title: 'Eldernet NZ',
        desc: 'Comprehensive directory of rest homes and retirement villages.',
        url: 'https://www.eldernet.co.nz/'
    },
    {
        title: 'Sorted.org.nz',
        desc: 'Independent financial advice and retirement planning tools.',
        url: 'https://sorted.org.nz/guides/retirement'
    },
    {
        title: 'Work and Income (WINZ)',
        desc: 'Information on Residential Care Subsidy and other support.',
        url: 'https://www.workandincome.govt.nz/'
    },
    {
        title: 'Retirement Village Association',
        desc: 'Industry body with helpful guides and code of practice.',
        url: 'https://www.retirementvillages.org.nz/'
    }
];

export function NextStepsStep({ onRestart, onBack }: NextStepsStepProps) {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);

    const handleSendEmail = () => {
        if (!email.trim() || !email.includes('@')) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        setSending(true);
        // Simulate sending
        setTimeout(() => {
            showToast('Plan sent successfully!', 'success');
            setEmail('');
            setSending(false);
        }, 1500);
    };

    const openLink = (url: string) => {
        Linking.openURL(url).catch(() => showToast('Could not open link', 'error'));
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#666" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Next Steps</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                <Text style={styles.introText}>
                    Your plan is ready! Take action now to secure your future.
                </Text>

                {/* Email Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="mail" size={24} color="#0a7ea4" />
                        <Text style={styles.cardTitle}>Save Your Plan</Text>
                    </View>
                    <Text style={styles.cardDesc}>
                        Receive a detailed PDF report of your financial outlook and living options directly to your inbox.
                    </Text>

                    <View style={styles.emailRow}>
                        <TextInput
                            style={styles.emailInput}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
                            onPress={handleSendEmail}
                            disabled={sending}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Resources Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="library" size={24} color="#0a7ea4" />
                        <Text style={styles.cardTitle}>Helpful Resources</Text>
                    </View>
                    <Text style={styles.cardDesc}>
                        Explore these trusted resources for retirement planning and village information.
                    </Text>

                    <View style={styles.resourceList}>
                        {RESOURCES.map((resource, index) => (
                            <View key={index} style={[styles.resourceItem, index < RESOURCES.length - 1 && styles.borderBottom]}>
                                <View style={{ flex: 1, paddingRight: 16 }}>
                                    <Text style={styles.resTitle}>{resource.title}</Text>
                                    <Text style={styles.resDesc}>{resource.desc}</Text>
                                </View>
                                <TouchableOpacity style={styles.callBtn} onPress={() => openLink(resource.url)}>
                                    <Text style={styles.callBtnText}>Visit</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.restartBtn} onPress={onRestart}>
                    <Ionicons name="refresh" size={20} color="#666" />
                    <Text style={styles.restartText}>Start Over</Text>
                </TouchableOpacity>
            </View>
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
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    cardDesc: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 20,
    },
    emailRow: {
        flexDirection: 'row',
        gap: 12,
    },
    emailInput: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    sendBtn: {
        backgroundColor: '#0a7ea4',
        width: 48,
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnDisabled: {
        backgroundColor: '#ccc',
    },
    resourceList: {
        gap: 16,
    },
    resourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 16,
    },
    resTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0a7ea4',
        marginBottom: 4,
    },
    resDesc: {
        fontSize: 12,
        color: '#666',
        paddingRight: 16,
    },
    callBtn: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1565c0',
    },
    callBtnText: {
        color: '#1565c0',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    restartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    restartText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
});
