import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { BounceIn, FadeIn, FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, HandTap, Rocket } from 'phosphor-react-native';
import { useAppStore } from '../../src/stores/appStore';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { AppPageHeader } from '../../src/components/ui/AppPageHeader';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, RADIUS, TOUCH, GRADIENTS } from '../../src/constants/theme';
import { backOrReplace } from '../../src/utils/navigation';
import { getGridItemWidth, getResponsiveColumns } from '../../src/utils/responsive';
import { formatChildName } from '../../src/utils/children';

export default function ChildPresenceScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ routineIds?: string; childIds?: string }>();
  const { selectChild } = useAppStore();
  const { getChild } = useChildrenStore();
  const { getRoutine, startExecution, startChain, pendingStepOrders } = useRoutineStore();
  const [confirmedChildIds, setConfirmedChildIds] = React.useState<string[]>([]);

  const routineIds = React.useMemo(
    () => (params.routineIds ?? '').split(',').filter(Boolean),
    [params.routineIds],
  );
  const childIds = React.useMemo(
    () => (params.childIds ?? '').split(',').filter(Boolean),
    [params.childIds],
  );
  const summaryHref = React.useMemo(
    () => ({
      pathname: '/child/summary' as const,
      params: {
        routineIds: routineIds.join(','),
        childIds: childIds.join(','),
      },
    }),
    [childIds, routineIds],
  );

  const routines = React.useMemo(
    () => routineIds
      .map((routineId) => getRoutine(routineId))
      .filter((routine): routine is NonNullable<ReturnType<typeof getRoutine>> => Boolean(routine)),
    [getRoutine, routineIds],
  );
  const children = React.useMemo(
    () => childIds
      .map((childId) => getChild(childId))
      .filter((child): child is NonNullable<ReturnType<typeof getChild>> => Boolean(child)),
    [childIds, getChild],
  );

  if (routines.length === 0 || children.length === 0) {
    router.replace('/child');
    return null;
  }

  const allConfirmed =
    childIds.length > 0 &&
    childIds.every((childId) => confirmedChildIds.includes(childId));

  const contentWidth = Math.min(width - SPACING.xl * 2, 1120);
  const gridColumns = getResponsiveColumns(width, { phone: 1, tablet: 2, desktop: 3, wide: 4 });
  const childCardWidth = Math.min(220, getGridItemWidth(contentWidth, gridColumns, SPACING.lg));

  const togglePresence = (childId: string) => {
    setConfirmedChildIds((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId],
    );
  };

  const handleStart = () => {
    if (!allConfirmed) return;

    selectChild(childIds[0] ?? null);

    if (routineIds.length >= 2) {
      const execution = startChain(routineIds, childIds, pendingStepOrders);
      if (!execution) return;
    } else {
      const execution = startExecution(routineIds[0], childIds, pendingStepOrders);
      if (!execution) return;
    }

    router.replace('/child/run');
  };

  return (
    <LinearGradient colors={GRADIENTS.warmBackground} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <AppPageHeader
            title="Presence"
            onBack={() => backOrReplace(router, summaryHref)}
            onHome={() => router.replace('/child')}
          />

          <Animated.Text entering={FadeIn.duration(400)} style={styles.title}>
            Qui est bien la ?
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(200).duration(300)} style={styles.subtitle}>
            Chaque enfant touche son avatar pour valider sa presence
          </Animated.Text>

          <View style={[styles.grid, { width: contentWidth, maxWidth: '100%' }]}>
            {children.map((child, index) => {
              const isConfirmed = confirmedChildIds.includes(child.id);

              return (
                <Animated.View
                  key={child.id}
                  entering={BounceIn.delay(300 + index * 120).duration(500)}
                >
                  <AnimatedPressable
                    onPress={() => togglePresence(child.id)}
                    style={[
                      styles.childCard,
                      { width: childCardWidth },
                      isConfirmed && { borderColor: child.color, backgroundColor: child.color + '24' },
                    ]}
                    scaleDown={0.9}
                    hitSlop={12}
                  >
                    <View style={styles.avatarWrap}>
                      <Avatar
                        emoji={child.avatar}
                        color={child.color}
                        size={112}
                        avatarConfig={child.avatarConfig}
                      />
                      {isConfirmed ? (
                        <View style={[styles.confirmBadge, { backgroundColor: child.color }]}>
                          <CheckCircle size={22} weight="fill" color="#FFF" />
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.childName}>{formatChildName(child.name)}</Text>
                    <View style={styles.tapBubble}>
                      {isConfirmed ? (
                        <Text style={styles.tapText}>Pret !</Text>
                      ) : (
                        <View style={styles.tapRow}>
                          <Text style={styles.tapText}>Je suis la</Text>
                          <HandTap size={18} weight="fill" color={COLORS.textSecondary} />
                        </View>
                      )}
                    </View>
                  </AnimatedPressable>
                </Animated.View>
              );
            })}
          </View>

          <AnimatedPressable
            style={[
              styles.startBtn,
              { backgroundColor: allConfirmed ? COLORS.secondary : COLORS.textLight },
            ]}
            onPress={handleStart}
            disabled={!allConfirmed}
            scaleDown={0.95}
          >
            <View style={styles.startRow}>
              <Rocket size={22} weight="fill" color="#FFF" />
              <Text style={styles.startText}>
                {allConfirmed ? 'Lancer la routine' : 'Touchez tous les avatars'}
              </Text>
            </View>
          </AnimatedPressable>
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
  backBtn: { alignSelf: 'flex-start' },
  title: {
    fontSize: FONT_SIZE.xxl + 2,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
    maxWidth: 360,
    lineHeight: 22,
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
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.lg + 4,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl + 4,
    borderWidth: 2,
    borderColor: COLORS.border,
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
  tapBubble: {
    backgroundColor: `${COLORS.textLight}14`,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  tapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tapText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  startBtn: {
    width: '100%',
    maxWidth: 440,
    minHeight: 72,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
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
