import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AssetItem, TabType, useCalculator } from '../../../context/CalculatorContext';
import { useToast } from '../../../context/ToastContext';

interface AssetsStepProps {
    onNext: () => void;
    onBack: () => void;
}

const TOP_7_INCOME = [
    'Salary/Wages', 'NZ Super', 'Overseas Pension', 'Investment Income',
    'Rental Income', 'Dividends', 'Term Deposit Interest'
];

const TOP_7_SAVINGS = [
    'Bank Accounts', 'Term Deposits', 'KiwiSaver', 'Managed Funds',
    'Shares/Bonds', 'Cash', 'Inheritance'
];

const TOP_7_ASSETS = [
    'Family Home', 'Holiday Home', 'Rental Property', 'Vehicle',
    'Boat/Caravan', 'Jewelry/Art', 'Collectibles'
];

export function AssetsStep({ onNext, onBack }: AssetsStepProps) {
    const { assets, setAssets, totalAnnualIncome } = useCalculator();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<TabType>('income');

    // Inline Edit State
    const [editingItem, setEditingItem] = useState<{ name: string; isOther: boolean } | null>(null);
    const [inputName, setInputName] = useState(''); // Only for "Other"
    const [inputValue, setInputValue] = useState('');
    const [inputFreq, setInputFreq] = useState<AssetItem['frequency']>('yearly');
    const [inputDuration, setInputDuration] = useState(''); // Years remaining

    const currentList = useMemo(() => {
        switch (activeTab) {
            case 'income': return TOP_7_INCOME;
            case 'savings': return TOP_7_SAVINGS;
            case 'assets': return TOP_7_ASSETS;
            default: return [];
        }
    }, [activeTab]);

    const startAdding = (name: string, isOther: boolean) => {
        setEditingItem({ name, isOther });
        setInputValue('');
        setInputName(isOther ? '' : name);
        setInputFreq('yearly');
        setInputDuration('');
    };

    const handleCancel = () => {
        setEditingItem(null);
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
        setEditingItem(null);
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
                    <Text style={styles.headerTitle}>Income, Savings & Assets</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total {activeTab === 'income' ? 'Annual Income' : activeTab === 'savings' ? 'Savings' : 'Assets'}</Text>
                <Text style={styles.summaryValue}>${displayTotal.toLocaleString()}</Text>
            </View>

            {/* Tabs */}
            {!editingItem && (
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
            )}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* 1. VIEW MODE: Summary + Grid + List */}
                {!editingItem && (
                    <>
                        {/* Top 7 Grid */}
                        <View style={styles.grid}>
                            {currentList.map(name => (
                                <TouchableOpacity key={name} style={styles.gridBtn} onPress={() => startAdding(name, false)}>
                                    <Text style={styles.gridBtnText}>{name}</Text>
                                    <Ionicons name="add-circle" size={20} color="#0a7ea4" />
                                </TouchableOpacity>
                            ))}
                            {/* 8th Option: Other */}
                            <TouchableOpacity style={[styles.gridBtn, styles.otherBtn]} onPress={() => startAdding('Other', true)}>
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
                    </>
                )}

                {/* 2. EDIT MODE: Inline Form */}
                {editingItem && (
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View style={styles.inlineFormCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>
                                    {editingItem.isOther ? 'Add Item' : `Add ${editingItem.name}`}
                                </Text>
                            </View>

                            {editingItem.isOther && (
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
                                    autoFocus={!editingItem.isOther}
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

                            <View style={styles.formActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                    <Text style={styles.saveBtnText}>Add Item</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                )}

            </ScrollView>

            {/* Footer only visible if not editing (or we can keep it, but it might distract) */}
            {!editingItem && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.nextButton} onPress={onNext}>
                        <Text style={styles.nextButtonText}>Next Step</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}
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
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },
    activeTab: {
        backgroundColor: '#0a7ea4',
    },
    tabText: {
        color: '#666',
        fontWeight: '600',
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
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: "#0a7ea4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summaryValue: {
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gridBtn: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    otherBtn: {
        backgroundColor: '#666',
        borderColor: '#666',
    },
    gridBtnText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    listSection: {
        marginTop: 32,
    },
    itemCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
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
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Inline Form Styles
    inlineFormCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        marginTop: 8,
    },
    cardHeader: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
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
        borderColor: '#eee',
    },
    freqChipActive: {
        backgroundColor: '#e1f5fe',
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
    formActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    saveBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#0a7ea4',
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
