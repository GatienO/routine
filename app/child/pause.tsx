import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { BounceIn, FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { CheckCircle, Coffee, Rocket } from 'phosphor-react-native';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { AppPageHeader } from '../../src/components/ui/AppPageHeader';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { COLORS, FONT_SIZE, GRADIENTS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import { formatChildName } from '../../src/utils/children';
import { formatDuration } from '../../src/utils/date';
import { getGridItemWidth, getResponsiveColumns } from '../../src/utils/responsive';

export default function ChildRoutinePauseScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { getChild } = useChildrenStore();
  const { currentExecution, chainQueue, cancelExecution, getRoutine } = useRoutineStore();

  const routine = currentExecution ? getRoutine(currentExecution.routineId) : undefined;
  const participantChildren = React.useMemo(() => {
    const childIds =
      currentExecution?.participantChildIds?.length
        ? currentExecution.participantChildIds
        : currentExecution?.childId
          ? [currentExecution.childId]
          : [];

    return childIds
      .map((childId) => getChild(childId))
      .filter((child): child is NonNullable<ReturnType<typeof getChild>> => Boolean(child));
  }, [currentExecution?.childId, currentExecution?.participantChildIds, getChild]);

  React.useEffect(() => {
    if (!currentExecution) {
      router.replace('/child');
      return;
    }

    if (!routine) {
      cancelExecution();
      router.replace('/child');
    }
  }, [cancelExecution, currentExecution, routine, router]);

  if (!currentExecution || !routine) return null;

  const totalDuration = routine.steps.reduce(
    (sum, step) => sum + Math.max(step.durationMinutes, step.minimumDurationMinutes ?? 0),
    0,
  );
  const contentWidth = Math.min(width - SPACING.xl * 2, 1120);
  const gridColumns = getResponsiveColumns(width, { phone: 1, tablet: 2, desktop: 3, wide: 4 });
  const childCardWidth = Math.min(220, getGridItemWidth(contentWidth, gridColumns, SPACING.lg));
  const remainingRoutineCount = chainQueue.length + 1;

  const handleContinue = () => {
    router.replace('/child/run');
  };

  const handleStop = () => {
    cancelExecution();
    router.replace('/child');
  };

  return (
    <LinearGradient colors={GRADIENTS.warmBackground} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <AppPageHeader
            title="Pause"
            onBack={handleStop}
            onHome={handleStop}
          />

          <Animated.View entering={FadeIn.duration(350)} style={styles.hero}>
            <View style={[styles.routineIcon, { backgroundColor: routine.color + '24' }]}>
              <OpenMoji emoji={routine.icon} size={64} />
            </View>
            <View style={styles.pauseBadge}>
              <Coffee size={18} weight="fill" color={COLORS.secondaryDark} />
              <Text style={styles.pauseBadgeText}>Petite pause</Text>
            </View>
            <Text style={styles.title}>Prochaine routine</Text>
            <Text style={styles.routineName}>{routine.name}</Text>
            <Text style={styles.subtitle}>
              Les enfants sont deja valides. Respirez un instant, puis lancez la suite.
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaPill}>{routine.steps.length} etapes</Text>
              <Text style={styles.metaPill}>{formatDuration(totalDuration)}</Text>
              {remainingRoutineCount > 1 ? (
                <Text style={styles.metaPill}>{remainingRoutineCount} routines restantes</Text>
              ) : null}
            </View>
          </Animated.View>

          <View style={[styles.grid, { width: contentWidth, maxWidth: '100%' }]}>
            {participantChildren.map((child, index) => (
              <Animated.View
                key={child.id}
                entering={BounceIn.delay(220 + index * 100).duration(500)}
              >
                <View
                  style={[
                    styles.childCard,
                    { width: childCardWidth, borderColor: child.color, backgroundColor: child.color + '24' },
                  ]}
                >
                  <View style={styles.avatarWrap}>
                    <Avatar
                      emoji={child.avatar}
                      color={child.color}
                      size={112}
                      avatarConfig={child.avatarConfig}
                    />
                    <View style={[styles.confirmBadge, { backgroundColor: child.color }]}>
                      <CheckCircle size={22} weight="fill" color="#FFF" />
                    </View>
                  </View>
                  <Text style={styles.childName}>{formatChildName(child.name)}</Text>
                  <View style={styles.readyBubble}>
                    <Text style={styles.readyText}>Pret</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>

          <Animated.View entering={FadeInDown.delay(280).duration(300)} style={styles.footer}>
            <AnimatedPressable
              style={[styles.startBtn, { backgroundColor: routine.color }]}
              onPress={handleContinue}
              scaleDown={0.95}
            >
              <View style={styles.startRow}>
                <Rocket size={22} weight="fill" color="#FFF" />
                <Text style={styles.startText}>Lancer la prochaine routine</Text>
              </View>
            </AnimatedPressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    maxWidth: 460,
  },
  routineIcon: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.sm,
  },
  pauseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  pauseBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.secondaryDark,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  routineName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  metaPill: {
    overflow: 'hidden',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 5,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.lg,
    alignContent: 'center',
  },
  childCard: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.lg + 4,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl + 4,
    borderWidth: 2,
    ...SHADOWS.sm,
  },
  avatarWrap: {
    position: 'relative',
  },
  confirmBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  childName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  readyBubble: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  readyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '800',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  startBtn: {
    width: '100%',
    maxWidth: 480,
    minHeight: 72,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.md,
  },
  startRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    width: '100%',
  },
  startText: {
    flexShrink: 1,
    color: '#FFF',
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    textAlign: 'center',
  },
});
