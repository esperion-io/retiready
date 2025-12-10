
import React, { createContext, ReactNode, useContext, useState } from 'react';

export type Person = {
    id: string;
    title: string;
    name: string;
    gender: 'male' | 'female';
    currentAge: string;
    // Avatar Props
    // OpenPeeps Keys
    body: string;
    face: string;
    hair: string;
    facialHair: string;
    accessory: string;
};

export type UserInfo = {
    people: Person[];
    goal: 'First Plan' | 'Update Plan' | 'Final Plan';
    avatar?: string; // Keep for fallback or overall theme if needed, but likely derived from Person 1 now
};

export type TabType = 'income' | 'savings' | 'assets';

export type AssetItem = {
    id: string;
    name: string;
    value: number;
    type: 'asset' | 'income' | 'savings';
    frequency?: 'lump_sum' | 'hourly' | 'weekly' | 'fortnightly' | 'monthly' | 'yearly';
    hoursPerWeek?: number;
    duration?: number; // Years remaining for income streams
};

export type CostItem = {
    id: string;
    name: string;
    value: number;
    frequency: 'weekly' | 'fortnightly' | 'monthly' | 'yearly';
    isVillageSaving?: boolean;
};

export type CostState = {
    currentCosts: CostItem[];
    villageSavings: CostItem[];
};

export type PackageOption = {
    type: 'villa' | 'apartment';
    bedrooms: 1 | 2 | 3;
    cost: number;
    isManualCost: boolean;
};

export type AddonItem = {
    id: string;
    name: string;
    cost: number;
    selected: boolean;
};

interface CalculatorContextType {
    userInfo: UserInfo;
    setUserInfo: (info: UserInfo) => void;
    assets: AssetItem[];
    setAssets: (assets: AssetItem[]) => void;
    costs: CostState;
    setCosts: (costs: CostState) => void;
    selectedPackage: PackageOption | null;
    setSelectedPackage: (pkg: PackageOption | null) => void;

    // Addons
    addons: AddonItem[];
    setAddons: (addons: AddonItem[]) => void;
    weeklyVillageFee: number;
    totalAddonCost: number;

    // Computed values helpers
    totalAssets: number;
    totalAnnualIncome: number;
    totalCurrentCostsYearly: number;
    totalVillageSavingsYearly: number;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export function CalculatorProvider({ children }: { children: ReactNode }) {
    const [userInfo, setUserInfo] = useState<UserInfo>({
        people: [{
            id: '1',
            title: 'Mr',
            name: '',
            gender: 'male',
            currentAge: '',
            body: 'Geek',
            face: 'Smile',
            hair: 'Short',
            facialHair: 'None',
            accessory: 'None'
        }],
        goal: 'First Plan',
        avatar: 'adventurer'
    });

    const [assets, setAssets] = useState<AssetItem[]>([]);

    const [costs, setCosts] = useState<CostState>({
        currentCosts: [],
        villageSavings: [],
    });

    const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);


    // Default Addons
    const [addons, setAddons] = useState<AddonItem[]>([
        { id: '1', name: 'Car Park', cost: 20, selected: false },
        { id: '2', name: 'Storage Unit', cost: 10, selected: false },
        { id: '3', name: 'Sky TV', cost: 15, selected: false },
        { id: '4', name: 'Internet', cost: 20, selected: false },
        { id: '5', name: 'Cleaner', cost: 50, selected: false },
        { id: '6', name: 'Meals', cost: 100, selected: false },
    ]);

    const weeklyVillageFee = 180;
    const totalAddonCost = addons.filter(a => a.selected).reduce((sum, a) => sum + a.cost, 0);

    const totalAssets = assets
        .filter(a => a.type === 'asset' || a.type === 'savings' || a.frequency === 'lump_sum')
        .reduce((sum, item) => sum + item.value, 0);

    const calculateAnnualIncome = (item: AssetItem) => {
        if (item.type !== 'income') return 0;
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

    const totalAnnualIncome = assets
        .filter(a => a.type === 'income' && a.frequency !== 'lump_sum')
        .reduce((sum, item) => sum + calculateAnnualIncome(item), 0);

    const calculateYearly = (item: CostItem) => {
        switch (item.frequency) {
            case 'weekly': return item.value * 52;
            case 'monthly': return item.value * 12;
            case 'yearly': return item.value;
            default: return 0;
        }
    };

    const SAVABLE_ITEMS = [
        'Rates', 'House Insurance', 'Exterior Maintenance', 'Home Maintenance',
        'Lawns / Gardens', 'Lawn/Garden', 'Lawn & Garden', 'Building Insurance', 'Water Rates', 'Security'
    ];

    const totalCurrentCostsYearly = costs.currentCosts.reduce((sum, item) => sum + calculateYearly(item), 0);

    // Derived Savings: Sum of current costs that are marked as village savings or match the list
    const totalVillageSavingsYearly = costs.currentCosts
        .filter(c => c.isVillageSaving || SAVABLE_ITEMS.includes(c.name))
        .reduce((sum, item) => sum + calculateYearly(item), 0);

    return (
        <CalculatorContext.Provider
            value={{
                userInfo,
                setUserInfo,
                assets,
                setAssets,
                costs,
                setCosts,
                selectedPackage,
                setSelectedPackage,
                addons,
                setAddons,
                weeklyVillageFee,
                totalAddonCost,
                totalAssets,
                totalAnnualIncome,
                totalCurrentCostsYearly,
                totalVillageSavingsYearly,
            }}
        >
            {children}
        </CalculatorContext.Provider>
    );
}

export function useCalculator() {
    const context = useContext(CalculatorContext);
    if (context === undefined) {
        throw new Error('useCalculator must be used within a CalculatorProvider');
    }
    return context;
}
