import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CostItem, useCalculator } from '../../../context/CalculatorContext';
import { useToast } from '../../../context/ToastContext';
import { Tooltip } from '../../ui/Tooltip';

interface CostsStepProps {
    onNext: () => void;
    onBack: () => void;
}

type TabType = 'current' | 'savings';

const TOP_7_CURRENT = ['Groceries', 'Power / Gas', 'Rates', 'House Insurance', 'Vehicle Expenses', 'Internet / Phone', 'Medical'];
const SAVABLE_ITEMS = ['Rates', 'House Insurance', 'Exterior Maintenance', 'Lawns / Gardens', 'Building Insurance', 'Water Rates', 'Security'];

export function CostsStep({ onNext, onBack }: CostsStepProps) {
    const { costs, setCosts, totalCurrentCostsYearly, totalVillageSavingsYearly } = useCalculator();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<TabType>('current');

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<{ name: string; isOther: boolean } | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [inputName, setInputName] = useState(''); // Only for "Other"
    const [inputFreq, setInputFreq] = useState<CostItem['frequency']>('weekly');

    const openAddModal = (name: string, isOther: boolean) => {
        setEditingItem({ name, isOther });
        setInputValue('');
        setInputName(isOther ? '' : name);
        setInputFreq('weekly');
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

        const newItem: CostItem = {
            id: Date.now().toString(),
            name: inputName,
            value: val,
            frequency: inputFreq
        };

        setCosts({ ...costs, currentCosts: [...costs.currentCosts, newItem] });
        setModalVisible(false);
        showToast('Item added', 'success');
    };

    const removeItem = (id: string) => {
        setCosts({ ...costs, currentCosts: costs.currentCosts.filter(c => c.id !== id) });
    };

    // Derived Savings List
    const savingsList = useMemo(() => {
        return costs.currentCosts.filter(c => SAVABLE_ITEMS.includes(c.name));
    }, [costs.currentCosts]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#666" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Costs & Savings</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, activeTab === 'current' && styles.activeTab]} onPress={() => setActiveTab('current')}>
                    <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>Current Costs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'savings' && styles.activeTab]} onPress={() => setActiveTab('savings')}>
                    <Text style={[styles.tabText, activeTab === 'savings' && styles.activeTabText]}>Village Savings</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {activeTab === 'current' ? (
                    <>
                        {/* Summary Card */}
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Total Yearly Cost</Text>
                            <Text style={styles.summaryValue}>${totalCurrentCostsYearly.toLocaleString()}</Text>
                        </View>

                        <View style={styles.helper}>
                            <Text style={styles.helperText}>What do you spend now?</Text>
                            <Tooltip content="Include all regular expenses to get an accurate comparison." />
                        </View>

                        {/* Grid */}
                        <Text style={styles.sectionTitle}>Add Cost</Text>
                        <View style={styles.grid}>
                            {TOP_7_CURRENT.map(name => (
                                <TouchableOpacity key={name} style={styles.gridBtn} onPress={() => openAddModal(name, false)}>
                                    <Text style={styles.gridBtnText}>{name}</Text>
                                    <Ionicons name="add-circle" size={20} color={'#0a7ea4'} />
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={[styles.gridBtn, styles.otherBtn]} onPress={() => openAddModal('Other', true)}>
                                <Text style={[styles.gridBtnText, { color: '#fff' }]}>Other</Text>
                                <Ionicons name="add" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* List Items */}
                        {costs.currentCosts.length > 0 && (
                            <View style={styles.listSection}>
                                <Text style={styles.sectionTitle}>Your Costs</Text>
                                {costs.currentCosts.map(item => (
                                    <View key={item.id} style={styles.itemCard}>
                                        <View>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            <Text style={styles.itemSub}>
                                                ${item.value.toLocaleString()} / {item.frequency}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => removeItem(item.id)}>
                                            <Ionicons name="trash-outline" size={20} color="#ff4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                ) : (
                    <>
                        {/* Savings View */}
                        <View style={[styles.summaryCard, styles.summaryCardGreen]}>
                            <Text style={styles.summaryLabel}>Potential Savings</Text>
                            <Text style={styles.summaryValue}>${totalVillageSavingsYearly.toLocaleString()}</Text>
                        </View>

                        <View style={styles.reasoningBox}>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                                <Ionicons name="information-circle" size={20} color="#2e7d32" />
                                <Text style={styles.reasoningTitle}>Why these savings?</Text>
                            </View>
                            <Text style={styles.reasoningText}>
                                When you move into a Retirement Village, many of your current property-related costs are covered by the village's weekly fee.
                            </Text>
                            <Text style={[styles.reasoningText, { marginTop: 8 }]}>
                                We've identified the costs below from your list that you likely won't have to pay anymore.
                            </Text>
                        </View>

                        {savingsList.length > 0 ? (
                            <View style={styles.listSection}>
                                <Text style={styles.sectionTitle}>Costs You Save</Text>
                                {savingsList.map(item => (
                                    <View key={item.id} style={styles.itemCard}>
                                        <View>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            <Text style={styles.itemSub}>
                                                ${item.value.toLocaleString()} / {item.frequency}
                                            </Text>
                                        </View>
                                        <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="wallet-outline" size={48} color="#ccc" />
                                <Text style={styles.emptyStateText}>
                                    No savable costs found yet. Try adding things like "Rates", "Insurance", or "Maintenance" in the Current Costs tab.
                                </Text>
                            </View>
                        )}
                    </>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton} onPress={onNext}>
                    <Text style={styles.nextButtonText}>Next Step</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Modal */}
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
                                    placeholder="E.g. Gym Membership"
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
                                value={inputValue}
                                onChangeText={setInputValue}
                                autoFocus={!editingItem?.isOther}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Frequency</Text>
                            <View style={styles.freqRow}>
                                {(['weekly', 'monthly', 'yearly'] as const).map(f => (
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

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSave}
                        >
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
        paddingHorizontal: 20,
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
        flex: 1,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#333',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    summaryCard: {
        backgroundColor: '#ff6b6b', // Red-ish for costs
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: "#ff6b6b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    summaryCardGreen: {
        backgroundColor: '#2e7d32', // Green for savings
        shadowColor: "#2e7d32",
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
    helper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    helperText: {
        color: '#666',
        fontSize: 14,
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
        width: '48%',
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
    reasoningBox: {
        backgroundColor: '#e8f5e9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#c8e6c9',
    },
    reasoningTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    reasoningText: {
        fontSize: 14,
        color: '#1b5e20',
        lineHeight: 20,
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        gap: 16,
    },
    emptyStateText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 14,
        lineHeight: 20,
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
    // Modal
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
        backgroundColor: '#ffebeb', // light red
        borderColor: '#ff6b6b',
    },
    freqText: {
        fontSize: 14,
        color: '#666',
    },
    freqTextActive: {
        color: '#ff6b6b',
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: '#ff6b6b',
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
