import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// @ts-ignore
import Peep, { Accessories, Body, Face, FacialHair, Hair } from 'react-native-peeps';
import { Person, useCalculator } from '../../../context/CalculatorContext';
import { useToast } from '../../../context/ToastContext';

interface UserInfoStepProps {
    onNext: () => void;
}

// Curated Positive Faces
const POSITIVE_FACES = ['Calm', 'Cheeky', 'Cute', 'Driven', 'EatingHappy', 'EyesClosed', 'OldAged', 'Smile'];

// Gender Defaults (still useful for initial add or reset)
const MALE_DEFAULTS = {
    hair: 'Short',
    body: 'ButtonShirt',
    facialHair: 'None',
    face: 'Smile',
    accessory: 'None'
};

const FEMALE_DEFAULTS = {
    hair: 'Long',
    body: 'Dress',
    facialHair: 'None',
    face: 'Smile',
    accessory: 'None'
};

type PersonStyle = Pick<Person, 'hair' | 'face' | 'body' | 'facialHair' | 'accessory'>;

export function UserInfoStep({ onNext }: UserInfoStepProps) {
    const { userInfo, setUserInfo } = useCalculator();
    const { showToast } = useToast();
    const [editingId, setEditingId] = useState<string>(userInfo.people[0].id);

    // Track history of generated styles (last 2)
    const [history, setHistory] = useState<PersonStyle[]>([]);

    const activePerson = userInfo.people.find(p => p.id === editingId) || userInfo.people[0];

    // Get full lists for randomization
    const allHair = useMemo(() => Object.keys(Hair), []);
    const allBody = useMemo(() => Object.keys(Body), []);
    const allFacialHair = useMemo(() => ['None', ...Object.keys(FacialHair)], []);
    const allAccessories = useMemo(() => ['None', ...Object.keys(Accessories)], []);

    const handleNext = () => {
        const invalidPerson = userInfo.people.find(p => !p.name || !p.currentAge);
        if (invalidPerson) {
            showToast('Please enter name and age for all people.', 'error');
            return;
        }
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
        // 1. Save current style to history
        const currentStyle: PersonStyle = {
            hair: activePerson.hair,
            face: activePerson.face,
            body: activePerson.body,
            facialHair: activePerson.facialHair,
            accessory: activePerson.accessory
        };

        // Keep last 3 items
        setHistory(prev => [currentStyle, ...prev].slice(0, 3));

        // 2. Generate new random style
        const randomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

        // Filter lists based on gender
        let availableBodies = allBody;
        if (activePerson.gender === 'male') {
            availableBodies = allBody.filter(b => b !== 'Dress');
        }

        const newStyle: PersonStyle = {
            face: randomElement(POSITIVE_FACES),
            hair: randomElement(allHair),
            body: randomElement(availableBodies),
            facialHair: Math.random() > 0.7 ? randomElement(allFacialHair) : 'None',
            accessory: Math.random() > 0.7 ? randomElement(allAccessories) : 'None',
        };

        // Gender Constraints
        if (activePerson.gender === 'female') {
            newStyle.facialHair = 'None';
            // Optionally bias against very short hair? But "Long" is just one option. 
            // Random is random. Just ensuring no beard is the main "gender" constraint for female.
        } else if (activePerson.gender === 'male') {
            // Ensure we don't accidentally get a "female" specific item if any exist besides Dress.
            // Peeps are mostly neutral.
        }

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

    const handleGenderChange = (gender: 'male' | 'female') => {
        // User request: "buttons to choose gender changes the gender of the avatar"
        // This implies setting defaults immediately.
        const defaults = gender === 'male' ? MALE_DEFAULTS : FEMALE_DEFAULTS;
        updatePersonBatch(activePerson.id, { gender, ...defaults });
    };

    const addPerson = () => {
        if (userInfo.people.length >= 2) return;
        const newPerson: Person = {
            id: Date.now().toString(),
            title: 'Mrs',
            name: '',
            gender: 'female',
            currentAge: '',
            ...FEMALE_DEFAULTS,
            accessory: 'None',
        };
        setUserInfo({ ...userInfo, people: [...userInfo.people, newPerson] });
        setEditingId(newPerson.id);
        setHistory([]); // Clear history for new person context?
    };

    const renderPeep = (p: Partial<PersonStyle>, size = 200, offsetY = 0) => {
        const hairComp = Hair[p.hair || 'Short'] || Hair.Short;
        const faceComp = Face[p.face || 'Smile'] || Face.Smile;
        const bodyComp = Body[p.body || 'Geek'] || Body.Geek;

        const facialHairComp = p.facialHair && p.facialHair !== 'None' ? FacialHair[p.facialHair] : undefined;
        const accessoryComp = p.accessory && p.accessory !== 'None' ? Accessories[p.accessory] : undefined;

        return (
            <Peep
                style={{ width: size, height: size, marginTop: offsetY }}
                hair={hairComp}
                face={faceComp}
                body={bodyComp}
                facialHair={facialHairComp}
                accessory={accessoryComp}
                viewBox={{ x: 0, y: 0, width: 850, height: 1200 }}
            />
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Who Are You?</Text>
            </View>

            {/* Person Switcher */}
            <View style={styles.personTabs}>
                {userInfo.people.map((p, i) => (
                    <TouchableOpacity
                        key={p.id}
                        style={[styles.personTab, editingId === p.id && styles.personTabActive]}
                        onPress={() => setEditingId(p.id)}
                    >
                        <Text style={[styles.personTabText, editingId === p.id && { color: '#fff' }]}>
                            {p.name || `Person ${i + 1}`}
                        </Text>
                    </TouchableOpacity>
                ))}
                {userInfo.people.length < 2 && (
                    <TouchableOpacity style={styles.addMiniBtn} onPress={addPerson}>
                        <Ionicons name="add" size={20} color="#0a7ea4" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Top Section: Avatar and Inputs */}
                <View style={styles.topSection}>
                    {/* Left: Avatar Preview */}
                    <View style={styles.previewColumn}>
                        <View style={styles.previewWrapper}>
                            {renderPeep(activePerson, 140, 25)}
                        </View>
                    </View>

                    {/* Right: Inputs */}
                    <View style={styles.inputsColumn}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Name"
                                value={activePerson.name}
                                onChangeText={(t) => updatePerson(activePerson.id, 'name', t)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Age</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Age"
                                keyboardType="numeric"
                                value={activePerson.currentAge}
                                onChangeText={(t) => updatePerson(activePerson.id, 'currentAge', t)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Gender</Text>
                            <View style={styles.genderRow}>
                                <TouchableOpacity
                                    onPress={() => handleGenderChange('male')}
                                    style={[styles.genderBtn, activePerson.gender === 'male' && styles.genderBtnActive]}
                                >
                                    <Ionicons name="male" size={18} color={activePerson.gender === 'male' ? '#fff' : '#666'} />
                                    <Text style={[styles.genderText, activePerson.gender === 'male' && styles.genderTextActive]}>Male</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleGenderChange('female')}
                                    style={[styles.genderBtn, activePerson.gender === 'female' && styles.genderBtnActive]}
                                >
                                    <Ionicons name="female" size={18} color={activePerson.gender === 'female' ? '#fff' : '#666'} />
                                    <Text style={[styles.genderText, activePerson.gender === 'female' && styles.genderTextActive]}>Female</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Randomizer Section */}
                <View style={styles.randomizerArea}>

                    {/* Randomize Button */}
                    <TouchableOpacity style={styles.randomBtn} onPress={randomize}>
                        <Ionicons name="dice" size={24} color="#fff" />
                        <Text style={styles.randomBtnText}>Randomise Look</Text>
                        <Ionicons name="sparkles" size={18} color="#FFE082" />
                    </TouchableOpacity>

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
                                            {renderPeep(style, 50)}
                                        </View>
                                        <Ionicons name="arrow-undo" size={12} color="#0a7ea4" style={styles.restoreIcon} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>Start Journey</Text>
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
    header: {
        marginBottom: 16,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
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
    },
    personTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    personTabActive: {
        backgroundColor: '#0a7ea4',
        borderColor: '#0a7ea4',
    },
    personTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    addMiniBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#0a7ea4',
        borderStyle: 'dashed',
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
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
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
        fontSize: 14,
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    historyContainer: {
        width: '100%',
        maxWidth: 300,
        gap: 12,
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
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
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
        fontSize: 18,
        fontWeight: 'bold',
    },
});
