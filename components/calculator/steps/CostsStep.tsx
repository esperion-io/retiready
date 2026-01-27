import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CostItem, useCalculator } from '../../../context/CalculatorContext';
import { useToast } from '../../../context/ToastContext';

// Utility function to format numbers with thousand separators
const formatNumberWithCommas = (value: string): string => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1] ? '.' + parts[1] : '';
    
    if (integerPart) {
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    return integerPart + decimalPart;
};

// Utility function to parse formatted number back to plain number
const parseFormattedNumber = (formattedValue: string): string => {
    return formattedValue.replace(/,/g, '');
};

interface CostsStepProps {
    onNext: () => void;
    onBack: () => void;
}

const COMMON_COST_OPTIONS = [
    'Rates', 'House Insurance', 'Contents Insurance', 'Electricity / Gas',
    'Internet / Phone', 'Food & Groceries', 'Transport & Petrol',
    'Medical & Health', 'Lawn & Garden', 'Home Maintenance'
];

export function CostsStep({ onNext, onBack }: CostsStepProps) {
    const {
        costs,
        setCosts,
        totalCurrentCostsYearly,
        totalVillageSavingsYearly
    } = useCalculator();

    // Derived state/setter
    const currentCosts = costs.currentCosts || [];
    const setCurrentCosts = (newCosts: CostItem[]) => {
        setCosts({ ...costs, currentCosts: newCosts });
    };
    const { showToast } = useToast();

    // Inline Edit State
    const [editingItem, setEditingItem] = useState<{ name: string; isOther: boolean } | null>(null);
    const [editId, setEditId] = useState<string | null>(null); // If set, we are editing this ID
    const [inputName, setInputName] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [formattedInputValue, setFormattedInputValue] = useState('');
    const [inputFreq, setInputFreq] = useState<CostItem['frequency']>('yearly');

    // Helper: Is this cost a village saving?
    const isVillageSaving = (name: string) => {
        const savingNames = [
            'Rates', 'House Insurance', 'Lawn', 'Garden', 'Maintenance', 'Exterior'
        ];
        // Simple string match or check logic
        return savingNames.some(s => name.toLowerCase().includes(s.toLowerCase()));
    };

    const startAdding = (name: string, isOther: boolean) => {
        setEditingItem({ name, isOther });
        setEditId(null);
        setInputValue('');
        setFormattedInputValue('');
        setInputName(isOther ? '' : name);
        setInputFreq('yearly');
    };

    const startEditing = (item: CostItem) => {
        const isOther = !COMMON_COST_OPTIONS.includes(item.name);
        setEditingItem({ name: item.name, isOther });
        setEditId(item.id);

        setInputName(item.name);
        const valueStr = item.value.toString();
        setInputValue(valueStr);
        setFormattedInputValue(formatNumberWithCommas(valueStr));
        setInputFreq(item.frequency);
    };

    const handleCancel = () => {
        setEditingItem(null);
        setEditId(null);
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

        const newItem: CostItem = {
            id: editId || Date.now().toString(),
            name: inputName,
            value: val,
            frequency: inputFreq,
            isVillageSaving: isVillageSaving(inputName)
        };

        if (editId) {
            // Update existing
            setCurrentCosts(currentCosts.map(c => c.id === editId ? newItem : c));
            showToast('Cost updated', 'success');
        } else {
            // Add new
            setCurrentCosts([...currentCosts, newItem]);
            showToast('Cost added', 'success');
        }

        setEditingItem(null);
        setEditId(null);
    };

    const removeCost = (id: string) => {
        setCurrentCosts(currentCosts.filter(c => c.id !== id));
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#666" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Living Costs</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            {/* Static Summary Card */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Annual Costs</Text>
                <Text style={styles.summaryValue}>${totalCurrentCostsYearly.toLocaleString()}</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* 1. VIEW MODE */}
                {!editingItem && (
                    <>
                        {/* Village Savings Highlight */}
                        {totalVillageSavingsYearly > 0 && (
                            <View style={styles.savingsCard}>
                                <View style={styles.savingsHeader}>
                                    <Ionicons name="trending-up" size={24} color="#2e7d32" />
                                    <View>
                                        <Text style={styles.savingsTitle}>Projected Savings</Text>
                                        <Text style={styles.savingsSub}>covered by village fee</Text>
                                    </View>
                                </View>
                                <Text style={styles.savingsValue}>${totalVillageSavingsYearly.toLocaleString()} / yr</Text>
                            </View>
                        )}

                        {/* Grid */}
                        <View style={styles.grid}>
                            {COMMON_COST_OPTIONS.map(name => (
                                <TouchableOpacity key={name} style={styles.gridBtn} onPress={() => startAdding(name, false)}>
                                    <Text style={styles.gridBtnText}>{name}</Text>
                                    <Ionicons name="add-circle" size={24} color="#0a7ea4" />
                                </TouchableOpacity>
                            ))}
                            {/* Other */}
                            <TouchableOpacity style={[styles.gridBtn, styles.otherBtn]} onPress={() => startAdding('Other', true)}>
                                <Text style={[styles.gridBtnText, { color: '#fff' }]}>Other</Text>
                                <Ionicons name="add" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Lists */}
                        {currentCosts.length > 0 && (
                            <View style={styles.listSection}>
                                <Text style={styles.sectionTitle}>Your Items</Text>
                                {currentCosts.map((item: CostItem) => (
                                    <View key={item.id} style={styles.itemWrapper}>
                                        <TouchableOpacity
                                            style={styles.itemCard}
                                            onPress={() => startEditing(item)}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <View style={styles.itemRow}>
                                                    <Text style={styles.itemName}>{item.name}</Text>
                                                    {item.isVillageSaving && (
                                                        <View style={styles.savingBadge}>
                                                            <Text style={styles.savingBadgeText}>Village Saving</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={styles.itemSub}>
                                                    ${item.value.toLocaleString()} / {item.frequency}
                                                </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => removeCost(item.id)} style={styles.deleteBtn}>
                                                <Ionicons name="trash-outline" size={20} color="#ff4444" />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                {/* Scroll Indicator */}
                                <View style={styles.scrollIndicator}>
                                    <Text style={styles.scrollText}>Scroll for more</Text>
                                    <Ionicons name="chevron-down" size={20} color="#999" />
                                </View>
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
                                    {editingItem.isOther ? 'Add Cost' : `Add ${editingItem.name}`}
                                </Text>
                            </View>

                            {editingItem.isOther && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="E.g. Netflix"
                                        value={inputName}
                                        onChangeText={setInputName}
                                        autoFocus
                                    />
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Cost ($)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={formattedInputValue}
                                    onChangeText={(text) => {
                                        const formatted = formatNumberWithCommas(text);
                                        setFormattedInputValue(formatted);
                                        setInputValue(parseFormattedNumber(formatted));
                                    }}
                                    autoFocus={!editingItem.isOther}
                                />
                            </View>

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

                            <View style={styles.formActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                    <Text style={styles.saveBtnText}>Add Cost</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                )}

            </ScrollView>

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
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    summaryLabel: {
        color: '#666',
        fontSize: 14,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summaryValue: {
        color: '#333',
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
    itemWrapper: {
        marginBottom: 12,
    },
    itemCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    deleteBtn: {
        padding: 8,
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
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    savingBadge: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#c8e6c9',
    },
    savingBadgeText: {
        fontSize: 12,
        color: '#2e7d32',
        fontWeight: '600',
    },
    savingsCard: {
        marginTop: -10,
        marginBottom: 24,
        backgroundColor: '#e8f5e9',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#c8e6c9',
        alignItems: 'center',
    },
    savingsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    savingsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    savingsSub: {
        fontSize: 14,
        color: '#4caf50',
    },
    savingsValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1b5e20',
        marginTop: 2,
    },
    scrollIndicator: {
        alignItems: 'center',
        marginTop: 16,
        opacity: 0.6,
    },
    scrollText: {
        fontSize: 14,
        color: '#999',
        marginBottom: 4,
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

    // Inline Form Styles (Shared with AssetsStep)
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
