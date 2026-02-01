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
    const { selectedPackage, setSelectedPackage, weeklyVillageFee, setResultsUnblurred } = useCalculator();

    const [type, setType] = useState<'villa' | 'apartment'>(selectedPackage?.type || 'villa');
    const [bedrooms, setBedrooms] = useState<1 | 2 | 3>(selectedPackage?.bedrooms || 2);
    const [isManual, setIsManual] = useState(selectedPackage?.isManualCost || false);
    const [manualCost, setManualCost] = useState(selectedPackage?.isManualCost ? selectedPackage.cost.toString() : '');
    const [isManualFee, setIsManualFee] = useState(selectedPackage?.isManualFee || false);
    const [manualFee, setManualFee] = useState(selectedPackage?.isManualFee && selectedPackage.weeklyFee ? selectedPackage.weeklyFee.toString() : '');

    const [selectedCompany, setSelectedCompany] = useState('');

    const currentBaseline = BASELINE_COSTS[type][bedrooms];
    const displayCost = isManual && manualCost ? parseFloat(manualCost) : currentBaseline;

    useEffect(() => {
        const cost = isManual && manualCost ? parseFloat(manualCost) : currentBaseline;
        const fee = isManualFee && manualFee ? parseFloat(manualFee) : undefined;
        if (!isNaN(cost)) {
            setSelectedPackage({ 
                type, 
                bedrooms, 
                cost, 
                isManualCost: isManual,
                weeklyFee: fee,
                isManualFee: isManualFee
            });
        }
    }, [type, bedrooms, isManual, manualCost, isManualFee, manualFee]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#666" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Living Options</Text>
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
                        />
                    )}
                </View>

                {/* Legal Fees Note */}
                <View style={styles.legalFeesNote}>
                    <Ionicons name="information-circle-outline" size={24} color="#e65100" />
                    <View style={styles.legalFeesContent}>
                        <Text style={styles.legalFeesTitle}>Important: Legal Fees</Text>
                        <Text style={styles.legalFeesText}>This estimate does not include one-time legal fees (typically $2,000-$5,000) for conveyancing and documentation when moving into a retirement village.</Text>
                    </View>
                </View>

                {/* Retirement Company Selection */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionHeader}>Preferred Retirement Company</Text>
                </View>

                <View style={styles.companyCard}>
                    <Text style={styles.companyLabel}>Which retirement company are you most interested in?</Text>
                    
                    <View style={styles.companyGrid}>
                        {[
                            { 
                                id: 'oceania', 
                                name: 'Oceania Healthcare', 
                                keyPoints: [
                                    '• 12 months free weekly fees + $5,000 relocation',
                                    '• 13 premium villages across Auckland/North Island',
                                    '• Focus on luxury amenities & resort-style living'
                                ]
                            },
                            { 
                                id: 'ryman', 
                                name: 'Ryman Healthcare', 
                                keyPoints: [
                                    '• No departure fees - 100% capital refund guarantee',
                                    '• 40+ villages, largest NZ retirement operator',
                                    '• Strong financial stability & dividend history'
                                ]
                            },
                            { 
                                id: 'summerset', 
                                name: 'Summerset', 
                                keyPoints: [
                                    '• Fixed weekly fee increases (CPI + 2% max)',
                                    '• Modern architect-designed villages',
                                    '• Excellent care continuum independence to hospital care'
                                ]
                            },
                            { 
                                id: 'metlifecare', 
                                name: 'Metlifecare', 
                                keyPoints: [
                                    '• Strong focus on wellness & active aging',
                                    '• Premium locations with sea/city views',
                                    '• Comprehensive health monitoring systems'
                                ]
                            },
                            { 
                                id: 'bupa', 
                                name: 'Bupa Villages', 
                                keyPoints: [
                                    '• International backing with global healthcare expertise',
                                    '• Flexible care options & aging-in-place support',
                                    '• Competitive entry pricing & transparent fees'
                                ]
                            }
                        ].map((company) => (
                            <TouchableOpacity
                                key={company.id}
                                style={[styles.companyOption, selectedCompany === company.id && styles.companyOptionSelected]}
                                onPress={() => setSelectedCompany(company.id)}
                            >
                                <Text style={[styles.companyName, selectedCompany === company.id && styles.companyNameSelected]}>
                                    {company.name}
                                </Text>
                                <View style={styles.keyPoints}>
                                    {company.keyPoints.map((point, index) => (
                                        <Text key={index} style={[styles.keyPoint, selectedCompany === company.id && styles.keyPointSelected]}>
                                            {point}
                                        </Text>
                                    ))}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
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

                    <View style={styles.manualRow}>
                        <Text style={styles.manualLabel}>Enter custom weekly fee?</Text>
                        <Switch
                            value={isManualFee}
                            onValueChange={setIsManualFee}
                            trackColor={{ false: '#ddd', true: '#0a7ea4' }}
                        />
                    </View>
                    {isManualFee && (
                        <TextInput
                            style={styles.manualInput}
                            keyboardType="numeric"
                            value={manualFee}
                            onChangeText={setManualFee}
                        />
                    )}

                    <View style={styles.feeNote}>
                        <Ionicons name="restaurant-outline" size={16} color="#e65100" />
                        <Text style={styles.feeNoteText}>Note: You will still need to purchase your own food.</Text>
                    </View>
                </View>

                <View style={{ height: 40 }} />

            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton} onPress={() => {
                    setResultsUnblurred(true);
                    onNext();
                }}>
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
        marginBottom: 10,
        borderRadius: 8,
        fontSize: 18,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    infoNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 32,
    },
    infoNoteText: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
    },
    legalFeesNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: '#fff3e0',
        padding: 16,
        borderRadius: 12,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#ffcc02',
    },
    legalFeesContent: {
        flex: 1,
    },
    legalFeesTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e65100',
        marginBottom: 4,
    },
    legalFeesText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    sectionHeaderRow: {
        marginBottom: 16,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    sectionSub: {
        fontSize: 16,
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
        fontSize: 18,
        fontWeight: '600',
        color: '#0d47a1',
    },
    feeSub: {
        fontSize: 14,
        color: '#1565c0',
    },
    feeValue: {
        fontSize: 28,
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
        fontSize: 14,
        color: '#e65100',
        fontStyle: 'italic',
        flex: 1,
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
    // Company Selection Styles
    companyCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    companyLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    companyGrid: {
        gap: 12,
    },
    companyOption: {
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 16,
        alignItems: 'flex-start',
    },
    companyOptionSelected: {
        backgroundColor: '#e3f2fd',
        borderColor: '#0a7ea4',
    },
    companyName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    companyNameSelected: {
        color: '#0a7ea4',
    },
    companyOffer: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    companyOfferSelected: {
        color: '#1976d2',
    },
    keyPoints: {
        marginTop: 8,
    },
    keyPoint: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
        lineHeight: 16,
    },
    keyPointSelected: {
        color: '#1565c0',
    },
});
