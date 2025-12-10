import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCalculator } from '../../../context/CalculatorContext';

interface PackagesStepProps {
    onNext: () => void;
    onBack: () => void;
}

const BASELINE_COSTS = {
    villa: { 1: 450000, 2: 650000, 3: 850000 },
    apartment: { 1: 350000, 2: 550000, 3: 750000 },
};

export function PackagesStep({ onNext, onBack }: PackagesStepProps) {
    const { selectedPackage, setSelectedPackage, addons, setAddons, weeklyVillageFee } = useCalculator();

    const [type, setType] = useState<'villa' | 'apartment'>(selectedPackage?.type || 'villa');
    const [bedrooms, setBedrooms] = useState<1 | 2 | 3>(selectedPackage?.bedrooms || 2);
    const [isManual, setIsManual] = useState(selectedPackage?.isManualCost || false);
    const [manualCost, setManualCost] = useState(selectedPackage?.isManualCost ? selectedPackage.cost.toString() : '');

    const currentBaseline = BASELINE_COSTS[type][bedrooms];
    const displayCost = isManual && manualCost ? parseFloat(manualCost) : currentBaseline;

    useEffect(() => {
        const cost = isManual && manualCost ? parseFloat(manualCost) : currentBaseline;
        if (!isNaN(cost)) {
            setSelectedPackage({ type, bedrooms, cost, isManualCost: isManual });
        }
    }, [type, bedrooms, isManual, manualCost]);

    const toggleAddon = (id: string) => {
        setAddons(addons.map(a => a.id === id ? { ...a, selected: !a.selected } : a));
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#666" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Living Options</Text>
                    <Text style={styles.headerSubtitle}>Choose your ideal home</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Option Selector */}
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.optionCard, type === 'villa' && styles.optionActive]}
                        onPress={() => setType('villa')}
                    >
                        <Ionicons name="home" size={32} color={type === 'villa' ? '#fff' : '#0a7ea4'} />
                        <Text style={[styles.optionText, type === 'villa' && styles.textActive]}>Villa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionCard, type === 'apartment' && styles.optionActive]}
                        onPress={() => setType('apartment')}
                    >
                        <Ionicons name="business" size={32} color={type === 'apartment' ? '#fff' : '#0a7ea4'} />
                        <Text style={[styles.optionText, type === 'apartment' && styles.textActive]}>Apartment</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Bedrooms</Text>
                <View style={styles.row}>
                    {[1, 2, 3].map((num) => (
                        <TouchableOpacity
                            key={num}
                            style={[styles.bedBtn, bedrooms === num && styles.bedBtnActive]}
                            onPress={() => setBedrooms(num as 1 | 2 | 3)}
                        >
                            <Text style={[styles.bedText, bedrooms === num && styles.textActive]}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Estimated Cost */}
                <View style={styles.costBox}>
                    <Text style={styles.costLabel}>Estimated Entry Price</Text>
                    <Text style={styles.costValue}>${displayCost.toLocaleString()}</Text>

                    <View style={styles.manualRow}>
                        <Text style={styles.manualLabel}>Enter custom quote?</Text>
                        <Switch
                            value={isManual}
                            onValueChange={setIsManual}
                            trackColor={{ false: '#ddd', true: '#0a7ea4' }}
                        />
                    </View>
                    {isManual && (
                        <TextInput
                            style={styles.manualInput}
                            keyboardType="numeric"
                            value={manualCost}
                            onChangeText={setManualCost}
                            placeholder="Enter Amount"
                        />
                    )}
                </View>

                {/* Weekly Fee Section */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionHeader}>On-Going Costs</Text>
                </View>

                <View style={styles.feeCard}>
                    <View style={styles.feeRow}>
                        <View>
                            <Text style={styles.feeLabel}>Weekly Village Fee</Text>
                            <Text style={styles.feeSub}>Covers rates, insurance, maintenance</Text>
                        </View>
                        <Text style={styles.feeValue}>${weeklyVillageFee}</Text>
                    </View>
                    <View style={styles.feeNote}>
                        <Ionicons name="restaurant-outline" size={16} color="#e65100" />
                        <Text style={styles.feeNoteText}>Note: You will still need to purchase your own food.</Text>
                    </View>
                </View>

                {/* Addons Grid */}
                <Text style={styles.sectionHeader}>Add-ons (Optional)</Text>
                <Text style={styles.sectionSub}>Select any extra services you might need.</Text>

                <View style={styles.grid}>
                    {addons.map(addon => (
                        <TouchableOpacity
                            key={addon.id}
                            style={[styles.addonCard, addon.selected && styles.addonActive]}
                            onPress={() => toggleAddon(addon.id)}
                        >
                            <View style={styles.addonTop}>
                                <Text style={[styles.addonName, addon.selected && styles.textActive]}>{addon.name}</Text>
                                <Ionicons
                                    name={addon.selected ? "checkbox" : "square-outline"}
                                    size={24}
                                    color={addon.selected ? "#fff" : "#ccc"}
                                />
                            </View>
                            <Text style={[styles.addonCost, addon.selected && styles.textActive]}>+${addon.cost}/wk</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 40 }} />

            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton} onPress={onNext}>
                    <Text style={styles.nextButtonText}>Final Results</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
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
        marginBottom: 24,
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
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    optionCard: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    optionActive: {
        backgroundColor: '#0a7ea4',
        borderColor: '#0a7ea4',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0a7ea4',
    },
    textActive: {
        color: '#fff',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    bedBtn: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    bedBtnActive: {
        backgroundColor: '#0a7ea4',
        borderColor: '#0a7ea4',
    },
    bedText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
    },
    costBox: {
        marginTop: 12,
        padding: 24,
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 32,
    },
    costLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    costValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    manualRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    manualLabel: {
        color: '#666',
    },
    manualInput: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        fontSize: 18,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    sectionHeaderRow: {
        marginBottom: 16,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    sectionSub: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    feeCard: {
        backgroundColor: '#e3f2fd',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#bbdefb',
        marginBottom: 32,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    feeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0d47a1',
    },
    feeSub: {
        fontSize: 12,
        color: '#1565c0',
    },
    feeValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0d47a1',
    },
    feeNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fff3e0',
        padding: 12,
        borderRadius: 8,
    },
    feeNoteText: {
        fontSize: 12,
        color: '#e65100',
        fontStyle: 'italic',
        flex: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    addonCard: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 0,
    },
    addonActive: {
        backgroundColor: '#0a7ea4',
        borderColor: '#0a7ea4',
    },
    addonTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    addonName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    addonCost: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0a7ea4',
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
});
