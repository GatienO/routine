import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRoutineStore } from '../../src/stores/routineStore';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { ArrowLeft, Clock, ListBullets, Rocket, CheckCircle } from 'phosphor-react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, CATEGORY_CONFIG } from '../../src/constants/theme';

function formatEndTime(totalMinutes: number): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + totalMinutes);
  return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function RoutineSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ routineId: string; chainIds?: string }>();
  const { getRoutine } = useRoutineStore();

  const routine = params.routineId ? getRoutine(params.routineId) : undefined;

  if (!routine) {
    router.back();
    return null;
  }

  const totalDuration = routine.steps.reduce((sum, s) => sum + s.durationMinutes, 0);
  const endTime = formatEndTime(totalDuration);
  const category = CATEGORY_CONFIG[routine.category];

  const handleStart = () => {
    router.push({
      pathname: '/child/mood',
      params: params.chainIds
        ? { routineId: params.routineId, chainIds: params.chainIds }
        : { routineId: params.routineId },
    });
  };

  return (
    <LinearGradient
      colors={[routine.color + '35', '#FFF8F0', '#FFF8F0']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} weight="bold" color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: routine.color + '25', borderColor: routine.color + '60' },
              ]}
            >
              <OpenMoji emoji={routine.icon} size={68} />
            </View>
            <Text style={styles.routineName}>{routine.name}</Text>
            {routine.description ? (
              <Text style={styles.routineDesc}>{routine.description}</Text>
            ) : null}
            <View style={[styles.categoryBadge, { backgroundColor: (category?.color ?? COLORS.primary) + '30' }]}>
              <Text style={styles.categoryText}>
                {category?.icon} {category?.label}
              </Text>
            </View>
          </Animated.View>

          {/* Info cards */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.infoRow}>
            <View style={[styles.infoCard, { borderColor: routine.color + '40' }]}>
              <ListBullets size={22} weight="duotone" color={routine.color} />
              <Text style={styles.infoValue}>{routine.steps.length}</Text>
              <Text style={styles.infoLabel}>étapes</Text>
            </View>
            <View style={[styles.infoCard, { borderColor: routine.color + '40' }]}>
              <Clock size={22} weight="duotone" color={routine.color} />
              <Text style={styles.infoValue}>{totalDuration}</Text>
              <Text style={styles.infoLabel}>minutes</Text>
            </View>
            <View
              style={[
                styles.infoCard,
                { borderColor: routine.color + '60', backgroundColor: routine.color + '15' },
              ]}
            >
              <Text style={styles.endTimeFlag}>🏁</Text>
              <Text style={[styles.infoValue, { color: routine.color }]}>{endTime}</Text>
              <Text style={styles.infoLabel}>heure de fin</Text>
            </View>
          </Animated.View>

          {/* Steps list */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.stepsSection}>
            <Text style={styles.stepsTitle}>Les étapes</Text>
            {routine.steps.map((step, index) => (
              <View
                key={step.id}
                style={[
                  styles.stepRow,
                  index === routine.steps.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={[styles.stepNumber, { backgroundColor: routine.color + '25' }]}>
                  <Text style={[styles.stepNumberText, { color: routine.color }]}>
                    {index + 1}
                  </Text>
                </View>
                <OpenMoji emoji={step.icon} size={28} />
                <Text style={styles.stepName} numberOfLines={1}>
                  {step.title}
                </Text>
                {step.durationMinutes > 0 ? (
                  <Text style={styles.stepDuration}>{step.durationMinutes} min</Text>
                ) : (
                  <CheckCircle size={16} weight="duotone" color={COLORS.textLight} />
                )}
              </View>
            ))}
          </Animated.View>
        </ScrollView>

        {/* Start CTA */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.startContainer}>
          <AnimatedPressable
            style={[styles.startBtn, { backgroundColor: routine.color }]}
            onPress={handleStart}
            scaleDown={0.95}
          >
            <Rocket size={24} weight="fill" color="#FFF" />
            <Text style={styles.startText}>C'est parti !</Text>
          </AnimatedPressable>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  scroll: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 120,
  },
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  routineName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  routineDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs,
  },
  categoryText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: 4,
    ...SHADOWS.sm,
  },
  endTimeFlag: { fontSize: 22 },
  infoValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.text,
  },
  infoLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  stepsSection: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  stepsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSecondary,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
  stepName: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  stepDuration: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  startContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: 'rgba(255,248,240,0.95)',
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceSecondary,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
    ...SHADOWS.md,
  },
  startText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: '#FFF',
  },
});
