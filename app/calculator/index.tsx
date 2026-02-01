import React, { useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AssetsStep } from '../../components/calculator/steps/AssetsStep';
import { CostsStep } from '../../components/calculator/steps/CostsStep';
import { NextStepsStep } from '../../components/calculator/steps/NextStepsStep';
import { PackagesStep } from '../../components/calculator/steps/PackagesStep';
import { PromotionsStep } from '../../components/calculator/steps/PromotionsStep';
import { ResultsStep } from '../../components/calculator/steps/ResultsStep';
import { UserInfoStep } from '../../components/calculator/steps/UserInfoStep';
import { useCalculator } from '../../context/CalculatorContext';

const STEPS = [
    UserInfoStep,
    AssetsStep,
    CostsStep,
    PackagesStep,
    ResultsStep,
    NextStepsStep,
    PromotionsStep
];

const BACKGROUNDS = [
    '#e0f7fa', // Light Cyan (Start)
    '#e8f5e9', // Light Green (Nature)
    '#fff3e0', // Light Orange (Sunset)
    '#f3e5f5', // Light Purple (Twilight)
    '#e1f5fe', // Light Blue (End)
    '#fce4ec', // Light Pink (Promotions)
];

const SPACING = 20;

export default function HorizontalJourney() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const scrollRef = useRef<ScrollView>(null);
    const [step, setStep] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;

    const { userInfo, markStepCompleted, isStepCompleted } = useCalculator();
    // Use Person 1 as the main avatar walker
    const avatar = userInfo.people[0];

    // Responsive Card Dimensions
    const isDesktop = width > 768;
    const cardWidth = isDesktop ? 600 : width * 0.85;
    const cardHeight = isDesktop ? 750 : height * 0.96; // Increased desktop height and mobile top space utilization

    // Snapping configuration
    const snapInterval = cardWidth + SPACING;
    const insetHorizontal = (width - cardWidth) / 2;

    const next = () => {
        if (step < STEPS.length - 1) {
            const nextStep = step + 1;
            setStep(nextStep);
            scrollRef.current?.scrollTo({ x: nextStep * snapInterval, animated: true });
        }
    };

    const back = () => {
        if (step > 0) {
            const prevStep = step - 1;
            setStep(prevStep);
            scrollRef.current?.scrollTo({ x: prevStep * snapInterval, animated: true });
        }
    };

    const restart = () => {
        setStep(0);
        scrollRef.current?.scrollTo({ x: 0, animated: true });
    };

    const onScroll = (event: any) => {
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / snapInterval);

        // Update Step
        if (index !== step && index >= 0 && index < STEPS.length) {
            setStep(index);
        }

        // Animate Progress (0 to 1 based on total width)
        const maxScroll = snapInterval * (STEPS.length - 1);
        const progress = Math.min(Math.max(x / maxScroll, 0), 1);
        progressAnim.setValue(progress);
    };

    // Interpolate avatar position
    const avatarLeft = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [40, width - 80]
    });

    const renderMiniAvatar = () => {
        if (!avatar) return null;

        const people = userInfo.people;
        
        if (people.length === 1) {
            // Single avatar
            return (
                <View style={styles.miniAvatarRoot}>
                    <View style={styles.miniEmojiContainer}>
                        <Text style={styles.miniEmoji}>{avatar.avatar}</Text>
                    </View>
                </View>
            );
        } else if (people.length === 2) {
            // Two avatars side by side with overlap
            return (
                <View style={styles.multiAvatarContainer}>
                    <View style={[styles.miniAvatarRoot, { marginRight: -5 }]}>
                        <View style={styles.miniEmojiContainer}>
                            <Text style={styles.miniEmoji}>{people[0].avatar}</Text>
                        </View>
                    </View>
                    <View style={[styles.miniAvatarRoot, { marginLeft: -15, zIndex: 1 }]}>
                        <View style={styles.miniEmojiContainer}>
                            <Text style={styles.miniEmoji}>{people[1].avatar}</Text>
                        </View>
                    </View>
                </View>
            );
        }

        return null;
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            {/* Background Layer */}
            <View style={[styles.backgroundLayer, { backgroundColor: BACKGROUNDS[step] || BACKGROUNDS[0] }]} />

            <View style={styles.scrollContainer}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled={false}
                    snapToInterval={snapInterval}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: insetHorizontal,
                        alignItems: 'center',
                    }}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    style={[
                        isDesktop && { marginTop: -60 } // Extra shift up for desktop
                    ]}
                >
                {STEPS.map((Component, index) => (
                    <View
                        key={index}
                        style={[
                            styles.cardWrapper,
                            {
                                width: cardWidth,
                                height: cardHeight,
                                marginRight: index === STEPS.length - 1 ? 0 : SPACING,
                                opacity: index > step + 1 ? 0.6 : 1, // Grey out future steps beyond next
                            }
                        ]}
                    >
                        <View style={[
                            styles.glassCard,
                            index > step + 1 && styles.upcomingCard
                        ]}>
                            <Component
                                onNext={next}
                                onBack={back}
                                onRestart={restart}
                            />
                        </View>
                    </View>
                ))}
            </ScrollView>
            </View>

            {/* Walking Path Footer */}
            <View style={[styles.pathContainer, { paddingBottom: insets.bottom + 10 }]}>
                {/* Visual Path Line */}
                <View style={styles.pathLine} />

                {/* Milestones */}
                <View style={styles.milestones}>
                    {STEPS.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.milestoneDot,
                                isStepCompleted(i) ? { backgroundColor: '#4caf50' } : 
                                i <= step ? { backgroundColor: '#0a7ea4' } : { backgroundColor: '#ccc' }
                            ]}
                        />
                    ))}
                </View>

                {/* Animated Character */}
                <Animated.View style={[styles.avatarContainer, { transform: [{ translateX: avatarLeft }] }]}>
                    {renderMiniAvatar()}
                    <View style={styles.avatarShadow} />
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backgroundLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
    },
    scrollContainer: {
        flex: 1,
        marginTop: 20, // Restore proper margin above cards
    },
    cardWrapper: {
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    glassCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        padding: 24,
    },
    upcomingCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(200,200,200,0.4)',
    },
    pathContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100, // Area for the walking path
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
    },
    pathLine: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 2,
    },
    milestones: {
        position: 'absolute',
        bottom: 37,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    milestoneDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    avatarContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        alignItems: 'center',
        marginTop: -30,
    },
    multiAvatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        width: 90,
        marginBottom: 4,
        overflow: 'hidden',
    },
    miniAvatarRoot: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 60,
        width: 60,
        marginBottom: 4,
        overflow: 'hidden' // Ensure it fits
    },
    miniEmojiContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
    },
    miniEmoji: {
        fontSize: 40,
        fontWeight: 'bold',
        transform: [{ scaleX: -1 }], // Flip horizontally to face opposite direction
        position: 'absolute',
        bottom: 5,
    },
    miniHairEmoji: {
        fontSize: 30,
        position: 'absolute',
        top: 0,
    },
    miniAccessoryEmoji: {
        fontSize: 20,
        position: 'absolute',
        top: 5,
    },
    avatarShadow: {
        width: 20,
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 2,
    },
});
