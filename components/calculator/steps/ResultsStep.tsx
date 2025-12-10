import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AssetItem, useCalculator } from '../../../context/CalculatorContext';

interface ResultsStepProps {
    onRestart: () => void;
    onBack: () => void;
}

export function ResultsStep({ onRestart, onBack }: ResultsStepProps) {
    const {
        userInfo,
        assets,
        totalAssets,
        // totalAnnualIncome, // We will calc manually per year 
        totalCurrentCostsYearly,
        totalVillageSavingsYearly,
        selectedPackage,
        weeklyVillageFee,
        totalAddonCost
    } = useCalculator();

    // Default to 'Leave It' (0) which corresponds to Min Spending ($2000/mo)
    const [spendRatio, setSpendRatio] = useState(0);

    // 1. Basic Readiness Logic
    const packageCost = selectedPackage?.cost || 0;
    const isReady = totalAssets >= packageCost;
    const freedEquity = totalAssets - packageCost;

    // 2. Longevity Calculation
    const person = userInfo.people[0];
    const age = parseInt(person.currentAge) || 70; // Default 70 if missing
    const gender = person.gender;
    const expectancy = gender === 'male' ? 85 : 88;
    const yearsLeft = Math.max(expectancy - age, 5); // Min 5 years cap for math safety

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
    const annualVillageCost = (weeklyVillageFee + totalAddonCost) * 52;
    const adjustedCurrentCosts = totalCurrentCostsYearly - totalVillageSavingsYearly;
    const totalAnnualCosts = adjustedCurrentCosts + annualVillageCost;

    // Loop through each year to calculate Net Flow
    let lifetimeNetFlow = 0;

    for (let i = 1; i <= yearsLeft; i++) {
        // Calculate Income for Year i
        // Include income if no duration set (lifetime) OR if duration >= i
        const yearIncome = assets
            .filter(a => a.type === 'income' && a.frequency !== 'lump_sum')
            .filter(a => a.duration === undefined || a.duration >= i)
            .reduce((sum, item) => sum + getAnnualValue(item), 0);

        const yearNet = yearIncome - totalAnnualCosts;
        lifetimeNetFlow += yearNet;
    }

    // Fixed Refund (Typical ORA)
    const fixedRefund = packageCost * 0.70;

    // Total Pot = Equity + Lifetime Net Flow + Capital Refund
    const totalPot = freedEquity + lifetimeNetFlow + fixedRefund;

    // Constraints
    const MIN_MONTHLY_SPEND = 2000;
    const minTotalSpend = MIN_MONTHLY_SPEND * 12 * yearsLeft;
    const maxTotalSpend = totalPot;

    // Only allow slider if max > min (otherwise capital warning)
    const isCapitalSufficient = totalPot >= minTotalSpend;

    const spendRange = Math.max(maxTotalSpend - minTotalSpend, 0);
    const currentTotalSpend = minTotalSpend + (spendRange * spendRatio);

    const monthlySpend = Math.max(currentTotalSpend / yearsLeft / 12, 0);
    const legacy = Math.max(totalPot - currentTotalSpend, 0);

    const progress = Math.min((totalAssets / (packageCost || 1)) * 100, 100);

    // Dynamic warning text for capital check
    const maxPossibleMonthly = Math.max((totalPot / yearsLeft / 12), 0);

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
                        <Text style={styles.cardTitle}>Capital Snapshot</Text>
                    </View>

                    <Text style={styles.label}>Assets vs. Entry Cost</Text>
                    <View style={styles.barContainer}>
                        <View style={[styles.barFill, { width: `${progress}%`, backgroundColor: isReady ? '#2e7d32' : '#ff8f00' }]} />
                        <View style={styles.markerLine} />
                    </View>
                    <View style={styles.barLabels}>
                        <Text style={styles.barLabel}>Have: ${totalAssets.toLocaleString()}</Text>
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

                {/* NEW: Expenses Breakdown */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="receipt" size={24} color="#e65100" />
                        <Text style={styles.cardTitle}>Estimated Annual Costs</Text>
                    </View>

                    <View style={styles.expenseRow}>
                        <Text style={styles.expenseLabel}>Village (Fee + Addons)</Text>
                        <Text style={styles.expenseValue}>${annualVillageCost.toLocaleString()}</Text>
                    </View>
                    <View style={styles.expenseRow}>
                        <Text style={styles.expenseLabel}>Personal (Food, etc.)</Text>
                        <Text style={styles.expenseValue}>${adjustedCurrentCosts.toLocaleString()}</Text>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.expenseTotalRow}>
                        <Text style={styles.expenseTotalLabel}>Total Outgoing</Text>
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
                            <Text style={styles.cardTitle}>{yearsLeft} Year Projection</Text>
                        </View>
                        <Text style={styles.descText}>
                            Based on standard life expectancy for your age ({age}) and gender ({gender}), we've projected your finances for the next <Text style={{ fontWeight: 'bold' }}>{yearsLeft} years</Text>.
                        </Text>
                        <Text style={[styles.descText, { marginTop: 8, fontSize: 12, fontStyle: 'italic' }]}>
                            Income streams with set durations will expire automatically in the calculation.
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
                            *Inheritance calculated as remaining capital after {yearsLeft} years of drawing monthly funds. "Spend It" fully drains the capital refund.
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
                <TouchableOpacity style={styles.restartBtn} onPress={onRestart}>
                    <Ionicons name="refresh" size={20} color="#0a7ea4" />
                    <Text style={styles.restartText}>Start New Journey</Text>
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
        fontSize: 16,
        color: '#333',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    descText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 20,
    },
    sliderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    sliderSub: {
        fontSize: 12,
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
        fontSize: 12,
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
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    projValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    projSub: {
        fontSize: 12,
        color: '#999',
    },
    note: {
        fontSize: 11,
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
        fontSize: 16,
        fontWeight: '600',
    },
    // New Expense Styles
    expenseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    expenseLabel: {
        fontSize: 14,
        color: '#666',
    },
    expenseValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
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
