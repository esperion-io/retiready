import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AssetItem, useCalculator } from '../../../context/CalculatorContext';
import { useToast } from '../../../context/ToastContext';

interface AssetsStepProps {
    onNext: () => void;
    onBack: () => void;
}

type TabType = 'income' | 'savings' | 'assets';

const TOP_7_INCOME = ['Salary', 'Wages', 'Superannuation', 'Dividends', 'Interest', 'Rental Income', 'Business Profit'];
const TOP_7_SAVINGS = ['KiwiSaver / Super', 'Bank Savings', 'Term Deposit', 'Shares', 'Managed Funds', 'Bonds', 'Crypto'];
const TOP_7_ASSETS = ['Family Home', 'Investment Property', 'Holiday Home', 'Vehicle', 'Boat', 'Caravan', 'Collections'];

export function AssetsStep({ onNext, onBack }: AssetsStepProps) {
    const { assets, setAssets, totalAssets, totalAnnualIncome } = useCalculator();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<TabType>('income');

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<{ name: string; isOther: boolean } | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [inputName, setInputName] = useState(''); // Only for "Other"
    const [inputFreq, setInputFreq] = useState<AssetItem['frequency']>('yearly');
    const [inputDuration, setInputDuration] = useState(''); // Years remaining

    const currentList = useMemo(() => {
        switch (activeTab) {
            case 'income': return TOP_7_INCOME;
            case 'savings': return TOP_7_SAVINGS;
            case 'assets': return TOP_7_ASSETS;
        }
    }, [activeTab]);

    const openAddModal = (name: string, isOther: boolean) => {
        setEditingItem({ name, isOther });
        setInputValue('');
        setInputName(isOther ? '' : name);
        setInputFreq('yearly');
        setInputDuration(''); // Default empty (implies lifetime/indefinite if left blank? or force strict?)
        setModalVisible(true);
    };

    const handleSave = () => {
        const val = parseFloat(inputValue);
        if (isNaN(val) || val < 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }
        if (!inputName.trim()) {
            showToast('Please enter a name', 'error');
            return;
        }

        let durationTerm: number | undefined = undefined;
        if (activeTab === 'income' && inputDuration) {
            const d = parseInt(inputDuration);
            if (!isNaN(d) && d > 0) {
                durationTerm = d;
            }
        }

        const typeMap: Record<TabType, AssetItem['type']> = {
            'income': 'income',
            'savings': 'savings',
            'assets': 'asset'
        };

        const newItem: AssetItem = {
            id: Date.now().toString(),
            name: inputName,
            value: val,
            type: typeMap[activeTab],
            frequency: activeTab === 'income' ? inputFreq : 'lump_sum',
            duration: durationTerm
        };

        setAssets([...assets, newItem]);
        setModalVisible(false);
        showToast('Item added', 'success');
    };

    const removeAsset = (id: string) => {
        setAssets(assets.filter(a => a.id !== id));
    };

    // Filter items for current tab list
    const tabItems = assets.filter(a => {
        if (activeTab === 'income') return a.type === 'income';
        if (activeTab === 'savings') return a.type === 'savings';
        return a.type === 'asset';
    });

    // ... existing tabTotal and displayTotal logic ...
    const displayTotal = activeTab === 'income' ? totalAnnualIncome :
        tabItems.reduce((sum, i) => sum + i.value, 0);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#666" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Assets & Income</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {(['income', 'savings', 'assets'] as TabType[]).map(t => (
                    <TouchableOpacity
                        key={t}
                        style={[styles.tab, activeTab === t && styles.activeTab]}
                        onPress={() => setActiveTab(t)}
                    >
                        <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total {activeTab === 'income' ? 'Annual Income' : activeTab === 'savings' ? 'Savings' : 'Assets'}</Text>
                    <Text style={styles.summaryValue}>${displayTotal.toLocaleString()}</Text>
                </View>

                {/* Top 7 Grid */}
                <Text style={styles.sectionTitle}>Add {activeTab}</Text>
                <View style={styles.grid}>
                    {currentList.map(name => (
                        <TouchableOpacity key={name} style={styles.gridBtn} onPress={() => openAddModal(name, false)}>
                            <Text style={styles.gridBtnText}>{name}</Text>
                            <Ionicons name="add-circle" size={20} color="#0a7ea4" />
                        </TouchableOpacity>
                    ))}
                    {/* 8th Option: Other */}
                    <TouchableOpacity style={[styles.gridBtn, styles.otherBtn]} onPress={() => openAddModal('Other', true)}>
                        <Text style={[styles.gridBtnText, { color: '#fff' }]}>Other</Text>
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* List of Added Items */}
                {tabItems.length > 0 && (
                    <View style={styles.listSection}>
                        <Text style={styles.sectionTitle}>Your Items</Text>
                        {tabItems.map(item => (
                            <View key={item.id} style={styles.itemCard}>
                                <View>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemSub}>
                                        ${item.value.toLocaleString()}
                                        {item.type === 'income' && item.frequency !== 'lump_sum' ? `/${item.frequency}` : ''}
                                        {item.duration ? ` for ${item.duration} yr${item.duration > 1 ? 's' : ''}` : ''}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => removeAsset(item.id)}>
                                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton} onPress={onNext}>
                    <Text style={styles.nextButtonText}>Next Step</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Add Item Modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingItem?.isOther ? 'Add Other Item' : `Add ${editingItem?.name}`}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {editingItem?.isOther && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="E.g. BitCoin"
                                    value={inputName}
                                    onChangeText={setInputName}
                                    autoFocus
                                />
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Value ($)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={inputValue}
                                onChangeText={setInputValue}
                                autoFocus={!editingItem?.isOther} // Focus value if name is preset
                            />
                        </View>

                        {activeTab === 'income' && (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Frequency</Text>
                                    <View style={styles.freqRow}>
                                        {(['weekly', 'fortnightly', 'monthly', 'yearly'] as const).map(f => (
                                            <TouchableOpacity
                                                key={f}
                                                style={[styles.freqChip, inputFreq === f && styles.freqChipActive]}
                                                onPress={() => setInputFreq(f)}
                                            >
                                                <Text style={[styles.freqText, inputFreq === f && styles.freqTextActive]}>
                                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Years Remaining (Optional)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="E.g. 5 (Leave blank for lifetime)"
                                        keyboardType="numeric"
                                        value={inputDuration}
                                        onChangeText={setInputDuration}
                                    />
                                </View>
                            </>
                        )}

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveBtnText}>Add Item</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
        paddingHorizontal: 20, // Add padding back
        justifyContent: 'space-between',
        marginBottom: 16,
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
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    activeTab: {
        backgroundColor: '#0a7ea4',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    summaryCard: {
        backgroundColor: '#0a7ea4',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        alignItems: 'center',
        shadowColor: "#0a7ea4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    summaryValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gridBtn: {
        width: '48%', // roughly 2 cols
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 0,
    },
    otherBtn: {
        backgroundColor: '#333',
        borderColor: '#333',
    },
    gridBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    listSection: {
        marginTop: 32,
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    itemSub: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    nextButton: {
        backgroundColor: '#0a7ea4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 30,
        gap: 8,
        shadowColor: "#0a7ea4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    inputGroup: {
        marginBottom: 20,
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
    },
    freqRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    freqChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    freqChipActive: {
        backgroundColor: '#e6f4f9',
        borderColor: '#0a7ea4',
    },
    freqText: {
        fontSize: 14,
        color: '#666',
    },
    freqTextActive: {
        color: '#0a7ea4',
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: '#0a7ea4',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
