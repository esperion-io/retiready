import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AssetItem, useCalculator } from '../../../context/CalculatorContext';

interface ResultsStepProps {
    onRestart: () => void;
    onBack: () => void;
    onNext: () => void; // Added onNext
}

export function ResultsStep({ onRestart, onBack, onNext }: ResultsStepProps) {
    const {
        userInfo,
        assets,
        totalAssets,
        // totalAnnualIncome, // We will calc manually per year 
        totalCurrentCostsYearly,
        totalVillageSavingsYearly,
        selectedPackage,
        weeklyVillageFee,
        costs
    } = useCalculator();

    // Default to 'Leave It' (0) which corresponds to Min Spending ($2000/mo)
    const [spendRatio, setSpendRatio] = useState(0);

    // 1. Basic Readiness Logic
    const packageCost = selectedPackage?.cost || 0;
    const isReady = totalAssets >= packageCost;
    const freedEquity = totalAssets - packageCost;

    // 2. Longevity Calculation (Initial)
    const person = userInfo.people[0];
    const age = parseInt(person.currentAge) || 70;
    const gender = person.gender;
    const defaultExpectancy = gender === 'male' ? 85 : 88;
    const defaultYears = Math.max(defaultExpectancy - age, 5);

    // State for Dynamic Lifespan
    const [projectedYears, setProjectedYears] = useState(defaultYears);

    // 3. Projections (Yearly Loop)
    // Helper: Calc One Item Annual Value
    const getAnnualValue = (item: AssetItem) => {
        const val = item.value;
        switch (item.frequency) {
            case 'hourly': return val * (item.hoursPerWeek || 0) * 52;
            case 'weekly': return val * 52;
            case 'fortnightly': return val * 26;
            case 'monthly': return val * 12;
            case 'yearly': return val;
            default: return 0;
        }
    };

    // Constant Annual Costs
    const annualVillageFee = weeklyVillageFee * 52;

    // Living Costs
    const annualLivingCosts = totalCurrentCostsYearly;
    const annualSavings = totalVillageSavingsYearly;

    const totalAnnualCosts = annualVillageFee + annualLivingCosts - annualSavings;

    // Loop through each year to calculate Net Flow
    let lifetimeNetFlow = 0;
    let lifetimeGrossIncome = 0;

    for (let i = 1; i <= projectedYears; i++) {
        // Calculate Income for Year i
        const yearIncome = assets
            .filter(a => a.type === 'income' && a.frequency !== 'lump_sum')
            .filter(a => a.duration === undefined || a.duration >= i)
            .reduce((sum, item) => sum + getAnnualValue(item), 0);

        lifetimeGrossIncome += yearIncome;
        const yearNet = yearIncome - totalAnnualCosts;
        lifetimeNetFlow += yearNet;
    }

    // Total Liquid Pot (Cash + Income - Costs)
    const liquidPot = freedEquity + lifetimeNetFlow;

    // Fixed Refund (Typical ORA - 70% of entry)
    const fixedRefund = packageCost * 0.70;

    // Constraints
    const MIN_MONTHLY_SPEND = 2000;
    const minTotalSpend = MIN_MONTHLY_SPEND * 12 * projectedYears;

    // Max Spend is capped at Liquid Pot (cannot spend the ORA refund while living there)
    const maxTotalSpend = Math.max(liquidPot, minTotalSpend);

    // Only allow slider if we have enough liquid cash to meet min spend
    const isCapitalSufficient = liquidPot >= minTotalSpend;

    const spendRange = Math.max(maxTotalSpend - minTotalSpend, 0);
    const currentTotalSpend = minTotalSpend + (spendRange * spendRatio);

    const monthlySpend = Math.max(currentTotalSpend / projectedYears / 12, 0);

    // Legacy = The unspent liquid cash + The fixed refund
    const remainingLiquid = Math.max(liquidPot - currentTotalSpend, 0);
    const legacy = remainingLiquid + fixedRefund;

    // Wealth = Assets + Lifetime Income
    const totalWealth = totalAssets + lifetimeGrossIncome;
    const progress = Math.min((totalWealth / (packageCost || 1)) * 100, 100);

    // Dynamic warning text for capital check
    const maxPossibleMonthly = Math.max((liquidPot / projectedYears / 12), 0);

    // Config based on Verdict
    const verdictConfig = isReady ? {
        title: "You Are Ready!",
        sub: "You are financially prepared for this lifestyle choice.",
        color: "#2e7d32",
        icon: "checkmark-circle" as const,
        bg: "#e8f5e9"
    } : {
        title: "Not Quite Ready",
        sub: "You may need to bridge a capital gap to afford this option.",
        color: "#ff8f00",
        icon: "alert-circle" as const,
        bg: "#fff8e1"
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#666" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Financial Outlook</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* 1. Verdict Banner */}
                <View style={[styles.verdictCard, { backgroundColor: verdictConfig.bg, borderColor: verdictConfig.color }]}>
                    <Ionicons name={verdictConfig.icon} size={48} color={verdictConfig.color} />
                    <View style={styles.verdictTextContent}>
                        <Text style={[styles.verdictTitle, { color: verdictConfig.color }]}>{verdictConfig.title}</Text>
                        <Text style={styles.verdictSub}>{verdictConfig.sub}</Text>
                    </View>
                </View>

                {/* 2. Capital Breakdown */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="cash" size={24} color="#0a7ea4" />
                        <Text style={styles.cardTitle}>Wealth Snapshot</Text>
                    </View>

                    <Text style={styles.label}>Wealth vs. Entry Cost</Text>
                    <View style={styles.barContainer}>
                        <View style={[styles.barFill, { width: `${progress}%`, backgroundColor: isReady ? '#2e7d32' : '#ff8f00' }]} />
                        <View style={styles.markerLine} />
                    </View>
                    <View style={styles.barLabels}>
                        <Text style={styles.barLabel}>Have: ${totalWealth.toLocaleString()}</Text>
                        <Text style={styles.barLabel}>Need: ${packageCost.toLocaleString()}</Text>
                    </View>

                    {isReady && (
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Freed Equity</Text>
                            <Text style={[styles.statValue, { color: '#2e7d32' }]}>
                                +${freedEquity.toLocaleString()}
                            </Text>
                        </View>
                    )}
                </View>

                {/* NEW: Expenses Breakdown (Itemized Receipt) */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="receipt" size={24} color="#e65100" />
                        <Text style={styles.cardTitle}>Annual Costs (Receipt)</Text>
                    </View>

                    {/* Detailed List */}
                    <View style={styles.receiptList}>
                        {/* Income Sources */}
                        <View style={styles.receiptSection}>
                            <Text style={styles.receiptSectionTitle}>Income Sources</Text>
                            {assets
                                .filter(a => a.type === 'income' && a.frequency !== 'lump_sum')
                                .filter(a => a.duration === undefined || a.duration >= 1)
                                .map((item, index) => {
                                    const annualValue = getAnnualValue(item);
                                    return (
                                        <View key={item.id} style={styles.receiptRow}>
                                            <Text style={styles.receiptLabel}>{item.name}</Text>
                                            <Text style={styles.receiptValue}>${annualValue.toLocaleString()}</Text>
                                        </View>
                                    );
                                })}
                            {assets.filter(a => a.type === 'income' && a.frequency !== 'lump_sum').length === 0 && (
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>No regular income</Text>
                                    <Text style={styles.receiptValue}>$0</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.separator} />

                        {/* Village Costs */}
                        <View style={styles.receiptSection}>
                            <Text style={styles.receiptSectionTitle}>Village Costs</Text>
                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>Weekly Village Fee (x52)</Text>
                                <Text style={styles.receiptValue}>${annualVillageFee.toLocaleString()}</Text>
                            </View>
                        </View>

                        {/* Living Costs Breakdown */}
                        <View style={styles.receiptSection}>
                            <Text style={styles.receiptSectionTitle}>Living Costs</Text>
                            {costs.currentCosts.map((item, index) => {
                                const yearlyValue = item.value * (item.frequency === 'weekly' ? 52 : item.frequency === 'monthly' ? 12 : 1);
                                return (
                                    <View key={item.id} style={styles.receiptRow}>
                                        <Text style={styles.receiptLabel}>{item.name}</Text>
                                        <Text style={styles.receiptValue}>${yearlyValue.toLocaleString()}</Text>
                                    </View>
                                );
                            })}
                            {costs.currentCosts.length === 0 && (
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>No living costs entered</Text>
                                    <Text style={styles.receiptValue}>$0</Text>
                                </View>
                            )}
                        </View>

                        {/* Village Savings */}
                        {annualSavings > 0 && (
                            <>
                                <View style={styles.separator} />
                                <View style={styles.receiptSection}>
                                    <Text style={styles.receiptSectionTitle}>Village Savings</Text>
                                    {costs.currentCosts
                                        .filter(c => c.isVillageSaving || ['Rates', 'House Insurance', 'Exterior Maintenance', 'Home Maintenance', 'Lawns / Gardens', 'Lawn/Garden', 'Lawn & Garden', 'Building Insurance', 'Water Rates', 'Security'].some(s => c.name.toLowerCase().includes(s.toLowerCase())))
                                        .map((item, index) => {
                                            const yearlyValue = item.value * (item.frequency === 'weekly' ? 52 : item.frequency === 'monthly' ? 12 : 1);
                                            return (
                                                <View key={item.id} style={[styles.receiptRow, styles.savingRow]}>
                                                    <Text style={styles.savingLabel}>{item.name}</Text>
                                                    <Text style={styles.savingValue}>-${yearlyValue.toLocaleString()}</Text>
                                                </View>
                                            );
                                        })}
                                </View>
                            </>
                        )}
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.expenseTotalRow}>
                        <Text style={styles.expenseTotalLabel}>Total Net Outgoing</Text>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.expenseTotalValue}>${totalAnnualCosts.toLocaleString()} / yr</Text>
                            <Text style={styles.expenseTotalSub}>(${(totalAnnualCosts / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })} / mo)</Text>
                        </View>
                    </View>
                </View>

                {/* 3. Longevity & Projections */}
                {isReady && isCapitalSufficient && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="hourglass" size={24} color="#7b1fa2" />
                            <Text style={styles.cardTitle}>{projectedYears} Year Projection</Text>
                        </View>
                        <Text style={styles.descText}>
                            Based on your age ({age}), we are projecting your finances to age <Text style={{ fontWeight: 'bold' }}>{age + projectedYears}</Text>.
                        </Text>

                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderLabel}>Term: {projectedYears} Years</Text>
                            <Slider
                                style={{ flex: 1, height: 40 }}
                                minimumValue={5}
                                maximumValue={40}
                                step={1}
                                value={projectedYears}
                                onValueChange={setProjectedYears}
                                minimumTrackTintColor="#7b1fa2"
                                maximumTrackTintColor="#ccc"
                                thumbTintColor="#7b1fa2"
                            />
                        </View>

                        <Text style={[styles.descText, { marginTop: 0, fontSize: 12, fontStyle: 'italic', marginBottom: 20 }]}>
                            Income streams with set durations will expire automatically.
                        </Text>

                        <View style={styles.separator} />

                        <Text style={styles.sliderTitle}>Lifestyle vs. Legacy</Text>
                        <Text style={styles.sliderSub}>Adjust spending vs. inheritance. (Floor: $2000/mo)</Text>

                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderLabel}>Leave It</Text>
                            <Slider
                                style={{ flex: 1, height: 40 }}
                                minimumValue={0}
                                maximumValue={1}
                                step={0.05}
                                value={spendRatio}
                                onValueChange={setSpendRatio}
                                minimumTrackTintColor="#0a7ea4"
                                maximumTrackTintColor="#ccc"
                                thumbTintColor="#0a7ea4"
                            />
                            <Text style={styles.sliderLabel}>Spend It</Text>
                        </View>

                        <View style={styles.projectionRow}>
                            <View style={styles.projectionBox}>
                                <Text style={styles.projLabel}>Available Funds</Text>
                                <Text style={styles.projValue}>${monthlySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                                <Text style={styles.projSub}>/ month</Text>
                            </View>
                            <View style={styles.verticalLine} />
                            <View style={styles.projectionBox}>
                                <Text style={styles.projLabel}>Inheritance</Text>
                                <Text style={styles.projValue}>${(legacy / 1000).toFixed(0)}k</Text>
                                <Text style={styles.projSub}>Estimated</Text>
                            </View>
                        </View>

                        <Text style={styles.note}>
                            *Inheritance = 70% Unit Refund + Any unspent liquid capital. "Spend It" drains your liquid capital but leaves the refund intact.
                        </Text>
                    </View>
                )}

                {isReady && !isCapitalSufficient && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="warning" size={24} color="#ff8f00" />
                            <Text style={styles.cardTitle}>Insufficient Capital</Text>
                        </View>
                        <Text style={styles.descText}>
                            Even with your assets and income, you likely won't meet the recommended floor of <Text style={{ fontWeight: 'bold' }}>$2,000 / month</Text> for this lifestyle duration.
                        </Text>
                        <Text style={[styles.statValue, { marginTop: 16, color: '#d32f2f', alignSelf: 'center' }]}>
                            Max Possible: ${maxPossibleMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })} / mo
                        </Text>
                    </View>
                )}

                {!isReady && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="build" size={24} color="#ff8f00" />
                            <Text style={styles.cardTitle}>Gap Analysis</Text>
                        </View>
                        <Text style={styles.descText}>
                            You are currently <Text style={{ fontWeight: 'bold' }}>${Math.abs(freedEquity).toLocaleString()}</Text> short of the entry cost.
                            Consider freeing up more assets or exploring other village options.
                        </Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.primaryBtn} onPress={onNext}>
                    <Text style={styles.primaryBtnText}>View Next Steps</Text>
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
    // ... existing styles ...
    primaryBtn: {
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
    primaryBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
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
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    verdictCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 24,
        gap: 16,
    },
    verdictTextContent: {
        flex: 1,
    },
    verdictTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    verdictSub: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    barContainer: {
        height: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        marginBottom: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    barFill: {
        height: '100%',
        borderRadius: 6,
    },
    markerLine: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: '#333',
        opacity: 0.2
    },
    barLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    barLabel: {
        fontSize: 12,
        color: '#666',
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 0,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f9f9f9',
    },
    statLabel: {
        fontSize: 18,
        color: '#333',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    descText: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 20,
    },
    sliderTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    sliderSub: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    sliderLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0a7ea4',
    },
    projectionRow: {
        flexDirection: 'row',
        backgroundColor: '#f8fbfc',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    projectionBox: {
        flex: 1,
        alignItems: 'center',
    },
    verticalLine: {
        width: 1,
        height: 40,
        backgroundColor: '#e1e1e1',
    },
    projLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    projValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    projSub: {
        fontSize: 14,
        color: '#999',
    },
    note: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        marginTop: 16,
        textAlign: 'center',
    },
    restartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 30,
        gap: 8,
        borderWidth: 1,
        borderColor: '#0a7ea4',
    },
    restartText: {
        color: '#0a7ea4',
        fontSize: 18,
        fontWeight: '600',
    },
    // New Expense Styles
    // Receipt Styles
    receiptList: {
        marginBottom: 16,
        gap: 8,
    },
    receiptSection: {
        marginBottom: 16,
    },
    receiptSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    receiptRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    receiptLabel: {
        fontSize: 16,
        color: '#666',
    },
    receiptValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    savingRow: {
        marginTop: 4,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        borderStyle: 'dashed',
    },
    savingLabel: {
        fontSize: 16,
        color: '#2e7d32',
        fontStyle: 'italic',
    },
    savingValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2e7d32',
    },
    expenseTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    expenseTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    expenseTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e65100',
    },
    expenseTotalSub: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
});
