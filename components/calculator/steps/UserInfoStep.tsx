import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Person, useCalculator } from '../../../context/CalculatorContext';
import { useToast } from '../../../context/ToastContext';

// Utility function to format numbers with thousand separators
const formatNumberWithCommas = (value: string): string => {
    // Remove existing commas and non-digit characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Split into integer and decimal parts
    const parts = cleanValue.split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1] ? '.' + parts[1] : '';
    
    // Add commas to integer part
    if (integerPart) {
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    return integerPart + decimalPart;
};

// Utility function to parse formatted number back to plain number
const parseFormattedNumber = (formattedValue: string): string => {
    return formattedValue.replace(/,/g, '');
};

interface UserInfoStepProps {
    onNext: () => void;
}

// Fun animal avatar options (filtered for compatibility)
const ANIMAL_AVATARS = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', 
    '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', 
    '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', 
    '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', 
    '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', 
    '🐐', '🦌', '🐕', '🐩', '🦮', '🐈', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', 
    '🦦', '🦥', '🐁', '🐀', '🦔'
];

// Neutral Defaults for all users
const NEUTRAL_DEFAULTS = {
    avatar: '🐶'
};

type PersonStyle = Pick<Person, 'avatar'>;

export function UserInfoStep({ onNext }: UserInfoStepProps) {
    const { userInfo, setUserInfo, markStepCompleted } = useCalculator();
    const { showToast } = useToast();
    const [editingId, setEditingId] = useState<string>(userInfo.people[0].id);
    
    // Track history of generated styles (last 2)
    const [history, setHistory] = useState<PersonStyle[]>([]);
    
    // State for formatted inputs
    const [formattedAge, setFormattedAge] = useState(() => 
        formatNumberWithCommas(userInfo.people[0].currentAge || '')
    );

    const activePerson = userInfo.people.find(p => p.id === editingId) || userInfo.people[0];

    // Get full lists for randomization
    const allAnimals = useMemo(() => ANIMAL_AVATARS, []);

    const handleNext = () => {
        const invalidPerson = userInfo.people.find(p => !p.name || !p.currentAge);
        if (invalidPerson) {
            showToast('Please enter name and age for all people.', 'error');
            return;
        }
        // Assuming 'name' and 'region' are now part of the top-level userInfo object
        // and are managed elsewhere or are implicitly available.
        // For this component, we'll use the existing userInfo.name and userInfo.region if they exist.
        // If they are not defined in the context, this will use undefined values.
        if (!userInfo.name || !userInfo.name.trim()) {
            showToast('Please enter your name', 'error');
            return;
        }

        // Save to context (this line is effectively a no-op if userInfo is already up-to-date,
        // but it ensures the context is explicitly updated before moving on)
        setUserInfo({
            ...userInfo,
            name: userInfo.name, // Assuming userInfo.name is already updated via another input
            region: userInfo.region, // Assuming userInfo.region is already updated via another input
        });

        // Mark this step as completed
        markStepCompleted(0);

        onNext();
    };

    const updatePerson = (id: string, field: keyof Person, value: any) => {
        const updatedPeople = userInfo.people.map(p => {
            if (p.id === id) {
                return { ...p, [field]: value };
            }
            return p;
        });
        setUserInfo({ ...userInfo, people: updatedPeople });
    };

    const updatePersonBatch = (id: string, updates: Partial<Person>) => {
        const updatedPeople = userInfo.people.map(p => {
            if (p.id === id) {
                return { ...p, ...updates };
            }
            return p;
        });
        setUserInfo({ ...userInfo, people: updatedPeople });
    };

    const randomize = () => {
        // Save CURRENT to history before randomizing
        const currentStyle: PersonStyle = {
            avatar: activePerson.avatar
        };

        // Keep last 3 items
        setHistory(prev => [currentStyle, ...prev].slice(0, 3));

        // Generate new random style
        const randomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

        // Use animal avatars
        const newStyle: PersonStyle = {
            avatar: randomElement(allAnimals),
        };

        updatePersonBatch(activePerson.id, newStyle);
    };

    const restoreFromHistory = (style: PersonStyle) => {
        // Save CURRENT to history before restoring? 
        // Typically "undo" just goes back. But history stack usually consumes items.
        // The user said "running history... so they can go back".
        // Let's swap: restore old, push current to history? Or just set it.
        // If I click history item, I just want that look.
        // I won't push the "abandoned" look to history to avoid clutter, 
        // OR I treat it as a new generation.
        // Let's just apply it.
        updatePersonBatch(activePerson.id, style);
    };


    const addPerson = () => {
        if (userInfo.people.length >= 2) return;
        const newPerson: Person = {
            id: Date.now().toString(),
            title: 'Mx',
            name: '',
            gender: 'neutral',
            currentAge: '',
            avatar: NEUTRAL_DEFAULTS.avatar,
        };
        setUserInfo({ ...userInfo, people: [...userInfo.people, newPerson] });
        setEditingId(newPerson.id);
        setHistory([]); // Clear history for new person context?
    };

    const removePerson = (id: string) => {
        if (userInfo.people.length <= 1) return; // Keep at least one person
        const updatedPeople = userInfo.people.filter(p => p.id !== id);
        setUserInfo({ ...userInfo, people: updatedPeople });
        // If we removed the currently editing person, switch to the first person
        if (editingId === id) {
            setEditingId(updatedPeople[0].id);
        }
        setHistory([]); // Clear history when removing person
    };

    const renderEmojiAvatar = (person: Person | PersonStyle, size: number = 140) => {
        const animalEmoji = person.avatar || '🐶';
        
        return (
            <View style={[styles.avatarContainer, { width: size, height: size }]}>
                <Text style={[styles.animalEmoji, { fontSize: size * 0.8 }]}>
                    {animalEmoji}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Create Profile</Text>
            </View>

            {/* Person Switcher */}
            <View style={styles.personTabs}>
                {userInfo.people.map((p, i) => (
                    <View key={p.id} style={styles.personTabContainer}>
                        <TouchableOpacity
                            style={[styles.personTab, editingId === p.id && styles.personTabActive]}
                            onPress={() => setEditingId(p.id)}
                        >
                            <Text style={[styles.personTabText, editingId === p.id && { color: '#fff' }]}>
                                {p.name || `Person ${i + 1}`}
                            </Text>
                        </TouchableOpacity>
                        {userInfo.people.length > 1 && i > 0 && (
                            <TouchableOpacity 
                                style={styles.removeMiniBtn} 
                                onPress={() => removePerson(p.id)}
                            >
                                <Ionicons name="close" size={20} color="#ff4444" />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
                {userInfo.people.length < 2 && (
                    <TouchableOpacity style={styles.addMiniBtn} onPress={addPerson}>
                        <Ionicons name="add" size={20} color="#0a7ea4" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
            >

                {/* Top Section: Avatar and Inputs */}
                <View style={styles.topSection}>
                    {/* Left: Avatar Preview */}
                    <View style={styles.previewColumn}>
                        <View style={styles.previewWrapper}>
                            {renderEmojiAvatar(activePerson, 140)}
                        </View>
                    </View>

                    {/* Right: Inputs */}
                    <View style={styles.inputsColumn}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>First Name</Text>
                            <TextInput
                                style={styles.input}
                                value={activePerson.name}
                                onChangeText={(t) => updatePerson(activePerson.id, 'name', t)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Age</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formattedAge}
                                onChangeText={(text) => {
                                    const formatted = formatNumberWithCommas(text);
                                    setFormattedAge(formatted);
                                    updatePerson(activePerson.id, 'currentAge', parseFormattedNumber(formatted));
                                }}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Do you live in Auckland?</Text>
                            <View style={styles.regionGrid}>
                                {['Yes', 'No'].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.regionChip,
                                            userInfo.region === option && styles.regionChipActive
                                        ]}
                                        onPress={() => setUserInfo({ ...userInfo, region: option })}
                                    >
                                        <Text style={[
                                            styles.regionText,
                                            userInfo.region === option && styles.regionTextActive
                                        ]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                    </View>
                </View>

                {/* History */}
                {history.length > 0 && (
                    <View style={styles.historyContainer}>
                        <Text style={styles.historyLabel}>Recent Choices</Text>
                        <View style={styles.historyRow}>
                            {history.map((style, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.historyItem}
                                    onPress={() => restoreFromHistory(style)}
                                >
                                    <View style={styles.historyBubble}>
                                        {renderEmojiAvatar(style, 50)}
                                    </View>
                                    <Ionicons name="arrow-undo" size={12} color="#0a7ea4" style={styles.restoreIcon} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Add some spacing */}
                <View style={styles.contentSpacer} />

            </ScrollView >

            {/* Footer with Randomize Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton} onPress={randomize}>
                    <Ionicons name="dice" size={20} color="#fff" />
                    <Text style={styles.nextButtonText}>Randomise Look</Text>
                    <Ionicons name="sparkles" size={18} color="#FFE082" />
                </TouchableOpacity>
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginBottom: 16,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    personTabs: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
        paddingTop: 16,
    },
    personTabContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    personTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    personTabActive: {
        backgroundColor: '#0a7ea4',
        borderColor: '#0a7ea4',
    },
    personTabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    addMiniBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f8f8f8',
        borderWidth: 2,
        borderColor: '#0a7ea4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeMiniBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f8f8f8',
        borderWidth: 2,
        borderColor: '#ff4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        gap: 24,
        paddingHorizontal: 16,
        flexWrap: 'wrap',
    },
    previewColumn: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewWrapper: {
        width: 160,
        height: 160,
        backgroundColor: '#fff',
        borderRadius: 80,
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    inputsColumn: {
        flex: 1,
        minWidth: 200,
        gap: 12,
    },
    inputGroup: {
        gap: 4,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 20,
        borderWidth: 1,
        borderColor: '#eee',
    },
    genderRow: {
        flexDirection: 'row',
        gap: 8,
    },
    genderBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    genderBtnActive: {
        backgroundColor: '#0a7ea4',
        borderColor: '#0a7ea4',
    },
    genderText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    genderTextActive: {
        color: '#fff',
        fontWeight: '700',
    },
    randomizerArea: {
        paddingHorizontal: 20,
        alignItems: 'center',
        gap: 24,
    },
    regionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 8,
    },
    regionChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#eee',
    },
    regionChipActive: {
        backgroundColor: '#e1f5fe',
        borderColor: '#0a7ea4',
    },
    regionText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    regionTextActive: {
        color: '#0a7ea4',
        fontWeight: '600',
    },
    randomBtn: {
        flexDirection: 'row',
        backgroundColor: '#0a7ea4',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
        shadowColor: "#0a7ea4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        width: '100%',
        maxWidth: 300,
        justifyContent: 'center',
    },
    randomBtnText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    historyContainer: {
        width: '100%',
        maxWidth: 300,
        gap: 12,
        alignItems: 'center',
        alignSelf: 'center',
    },
    historyLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        color: '#999',
        fontWeight: '600',
        letterSpacing: 1,
        textAlign: 'center',
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    historyItem: {
        alignItems: 'center',
        gap: 8,
    },
    historyBubble: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    restoreIcon: {
        marginTop: 4,
    },
    footer: {
        paddingTop: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    footerHistory: {
        alignItems: 'center',
    },
    nextButton: {
        marginTop: 10, // Extra spacing if needed
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
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollIndicator: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 4,
    },
    scrollIndicatorText: {
        fontSize: 14,
        color: '#0a7ea4',
        fontWeight: '500',
        textAlign: 'center',
    },
    avatarContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    baseEmoji: {
        position: 'absolute',
    },
    animalEmoji: {
        position: 'absolute',
        transform: [{ scaleX: -1 }], // Flip horizontally to face opposite direction
    },
    accessoryEmoji: {
        position: 'absolute',
        top: '10%',
        right: '10%',
    },
    spacer: {
        height: 40,
    },
    contentSpacer: {
        height: 60,
    },
});
