import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CaretDown, CaretUp, CheckCircle, Clock, ListBullets, Rocket, UsersThree } from 'phosphor-react-native';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { Avatar } from '../../src/components/ui/Avatar';
import { BackButton } from '../../src/components/ui/BackButton';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, CATEGORY_CONFIG } from '../../src/constants/theme';
import { backOrReplace } from '../../src/utils/navigation';
import { getGridItemWidth, getResponsiveColumns } from '../../src/utils/responsive';

function formatEndTime(totalMinutes: number): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + totalMinutes);
  return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function RoutineSummaryScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ routineIds?: string; childIds?: string; routineId?: string }>();
  const { children, getChild } = useChildrenStore();
  const { getRoutine, pendingStepOrders, setPendingStepOrders } = useRoutineStore();
  const [selectedChildIds, setSelectedChildIds] = React.useState<string[]>([]);
  const [stepOrderByRoutine, setStepOrderByRoutine] = React.useState<Record<string, string[]>>({});

  const routineIds = React.useMemo(() => {
    if (params.routineIds) return params.routineIds.split(',').filter(Boolean);
    if (params.routineId) return [params.routineId];
    return [];
  }, [params.routineIds, params.routineId]);

  const routines = React.useMemo(
    () => routineIds
      .map((routineId) => getRoutine(routineId))
      .filter((routine): routine is NonNullable<ReturnType<typeof getRoutine>> => Boolean(routine)),
    [getRoutine, routineIds],
  );

  React.useEffect(() => {
    if (routines.length === 0) return;

    const fromParams = (params.childIds ?? '').split(',').filter(Boolean);
    const defaults = Array.from(new Set(routines.map((routine) => routine.childId)));
    const nextSelection = fromParams.length > 0 ? fromParams : defaults;

    setSelectedChildIds((current) => {
      const sameLength = current.length === nextSelection.length;
      const sameValues = sameLength && current.every((value, index) => value === nextSelection[index]);
      return sameValues ? current : nextSelection;
    });
  }, [params.childIds, routines]);

  React.useEffect(() => {
    if (routines.length === 0) return;

    const nextOrders = routines.reduce<Record<string, string[]>>((acc, routine) => {
      const pending = pendingStepOrders[routine.id];
      acc[routine.id] = pending?.length
        ? pending.map((step) => step.id)
        : routine.steps.map((step) => step.id);
      return acc;
    }, {});

    setStepOrderByRoutine((current) => {
      const same = routines.every((routine) => {
        const currentIds = current[routine.id] ?? [];
        const nextIds = nextOrders[routine.id] ?? [];
        return currentIds.length === nextIds.length && currentIds.every((id, index) => id === nextIds[index]);
      });

      return same ? current : nextOrders;
    });
  }, [pendingStepOrders, routines]);

  const selectedChildren = React.useMemo(
    () => selectedChildIds
      .map((childId) => getChild(childId))
      .filter((child): child is NonNullable<ReturnType<typeof getChild>> => Boolean(child)),
    [selectedChildIds, getChild],
  );

  React.useEffect(() => {
    if (routineIds.length === 0) return;
    if (routines.length === 0) {
      router.replace('/child');
    }
  }, [router, routineIds.length, routines.length]);

  if (routines.length === 0) {
    return null;
  }

  const leadRoutine = routines[0];
  const totalDuration = routines.reduce(
    (sum, routine) => sum + routine.steps.reduce((stepSum, step) => stepSum + step.durationMinutes, 0),
    0,
  );
  const totalSteps = routines.reduce((sum, routine) => sum + routine.steps.length, 0);
  const endTime = formatEndTime(totalDuration);
  const categories = Array.from(new Set(routines.map((routine) => routine.category)))
    .map((category) => CATEGORY_CONFIG[category])
    .filter(Boolean);
  const contentWidth = Math.min(width - SPACING.lg * 2, 1100);
  const childColumns = getResponsiveColumns(width, { phone: 1, tablet: 2, desktop: 3, wide: 4 });
  const childCardWidth = Math.min(220, getGridItemWidth(contentWidth - SPACING.lg * 2, childColumns, SPACING.md));

  const toggleChild = (childId: string) => {
    setSelectedChildIds((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId],
    );
  };

  const moveStep = (routineId: string, stepId: string, direction: -1 | 1) => {
    setStepOrderByRoutine((prev) => {
      const currentOrder = prev[routineId] ?? [];
      const index = currentOrder.indexOf(stepId);
      if (index === -1) return prev;

      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= currentOrder.length) return prev;

      const nextOrder = [...currentOrder];
      const [moved] = nextOrder.splice(index, 1);
      nextOrder.splice(targetIndex, 0, moved);

      return {
        ...prev,
        [routineId]: nextOrder,
      };
    });
  };

  const handleContinue = () => {
    if (selectedChildIds.length === 0) return;

    const resolvedStepOrders = routines.reduce<Record<string, typeof routines[number]['steps']>>((acc, routine) => {
      const order = stepOrderByRoutine[routine.id] ?? routine.steps.map((step) => step.id);
      const stepsById = new Map(routine.steps.map((step) => [step.id, step]));
      acc[routine.id] = order
        .map((stepId) => stepsById.get(stepId))
        .filter((step): step is typeof routine.steps[number] => Boolean(step));
      return acc;
    }, {});

    setPendingStepOrders(resolvedStepOrders);

    router.push({
      pathname: '/child/presence',
      params: {
        routineIds: routineIds.join(','),
        childIds: selectedChildIds.join(','),
      },
    });
  };

  return (
    <LinearGradient
      colors={[leadRoutine.color + '35', '#FFF8F0', '#FFF8F0']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <BackButton onPress={() => backOrReplace(router, '/child')} style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, styles.scrollCentered]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(400)} style={[styles.hero, { width: contentWidth, maxWidth: '100%' }]}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: leadRoutine.color + '25', borderColor: leadRoutine.color + '60' },
              ]}
            >
              <OpenMoji emoji={leadRoutine.icon} size={68} />
            </View>
            <Text style={styles.routineName}>
              {routines.length > 1 ? `${routines.length} routines enchainees` : leadRoutine.name}
            </Text>
            <Text style={styles.routineDesc}>
              Choisis les enfants presents puis verifie les etapes avant le lancement.
            </Text>
            <View style={styles.categoriesRow}>
              {categories.map((category) => (
                <View
                  key={category.label}
                  style={[styles.categoryBadge, { backgroundColor: (category.color ?? COLORS.primary) + '30' }]}
                >
                  <Text style={styles.categoryText}>
                    {category.icon} {category.label}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.infoRow, { width: contentWidth, maxWidth: '100%' }]}>
            <View style={[styles.infoCard, { borderColor: leadRoutine.color + '40' }]}>
              <ListBullets size={22} weight="duotone" color={leadRoutine.color} />
              <Text style={styles.infoValue}>{totalSteps}</Text>
              <Text style={styles.infoLabel}>etapes</Text>
            </View>
            <View style={[styles.infoCard, { borderColor: leadRoutine.color + '40' }]}>
              <Clock size={22} weight="duotone" color={leadRoutine.color} />
              <Text style={styles.infoValue}>{totalDuration}</Text>
              <Text style={styles.infoLabel}>minutes</Text>
            </View>
            <View
              style={[
                styles.infoCard,
                { borderColor: leadRoutine.color + '60', backgroundColor: leadRoutine.color + '15' },
              ]}
            >
              <Text style={styles.endTimeFlag}>🏁</Text>
              <Text style={[styles.infoValue, { color: leadRoutine.color }]}>{endTime}</Text>
              <Text style={styles.infoLabel}>heure de fin</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(400)} style={[styles.panel, { width: contentWidth, maxWidth: '100%' }]}>
            <View style={styles.panelTitleRow}>
              <UsersThree size={20} weight="fill" color={COLORS.text} />
              <Text style={styles.panelTitle}>Qui fera la routine ?</Text>
            </View>
            <Text style={styles.panelHelpTop}>
              Tous les enfants presents gagneront des points.
            </Text>
            <View style={styles.childrenGrid}>
              {children.map((child) => {
                const isSelected = selectedChildIds.includes(child.id);

                return (
                  <AnimatedPressable
                    key={child.id}
                    onPress={() => toggleChild(child.id)}
                    style={[
                      styles.childCard,
                      { width: childCardWidth },
                      isSelected && { borderColor: child.color, backgroundColor: child.color + '20' },
                    ]}
                    scaleDown={0.95}
                  >
                    <View style={styles.avatarWrap}>
                      <Avatar
                        emoji={child.avatar}
                        color={child.color}
                        size={72}
                        avatarConfig={child.avatarConfig}
                      />
                      {isSelected ? (
                        <View style={[styles.selectedBadge, { backgroundColor: child.color }]}>
                          <CheckCircle size={18} weight="fill" color="#FFF" />
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childHint}>{isSelected ? 'selectionne' : 'ajouter'}</Text>
                  </AnimatedPressable>
                );
              })}
            </View>
              {selectedChildren.length > 0 ? (
                <Text style={styles.panelHelp}>
                  {selectedChildren.length} enfant{selectedChildren.length > 1 ? 's' : ''} {selectedChildren.length > 1
                    ? 'seront invites a confirmer leur presence a l etape suivante.'
                    : 'sera invite a confirmer sa presence a l etape suivante.'}
                </Text>
              ) : (
              <Text style={styles.panelHelp}>Choisis au moins un enfant pour continuer.</Text>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(260).duration(400)} style={[styles.panel, { width: contentWidth, maxWidth: '100%' }]}>
            <View style={styles.panelTitleRowBetween}>
              <Text style={styles.panelTitle}>Routines et etapes</Text>
              <Text style={styles.reorderHint}>Ordre</Text>
            </View>
            {routines.map((routine, routineIndex) => (
              <React.Fragment key={routine.id}>
                <View style={styles.routineHeader}>
                  <View style={[styles.smallIcon, { backgroundColor: routine.color + '20' }]}>
                    <OpenMoji emoji={routine.icon} size={24} />
                  </View>
                  <View style={styles.routineHeaderText}>
                    <Text style={styles.routineHeaderName}>
                      {routineIndex + 1}. {routine.name}
                    </Text>
                    <Text style={styles.routineHeaderMeta}>
                      {routine.steps.length} etapes · {routine.steps.reduce((sum, step) => sum + step.durationMinutes, 0)} min
                    </Text>
                  </View>
                </View>
                {(stepOrderByRoutine[routine.id] ?? routine.steps.map((step) => step.id))
                  .map((stepId) => routine.steps.find((step) => step.id === stepId))
                  .filter((step): step is NonNullable<typeof step> => Boolean(step))
                  .map((step, index, orderedSteps) => (
                  <View
                    key={step.id}
                    style={[
                      styles.stepRow,
                      routineIndex === routines.length - 1 &&
                      index === orderedSteps.length - 1 &&
                      { borderBottomWidth: 0 },
                    ]}
                  >
                    <View style={styles.stepActions}>
                      <TouchableOpacity
                        onPress={() => moveStep(routine.id, step.id, -1)}
                        disabled={index === 0}
                        style={[styles.stepActionBtn, index === 0 && styles.stepActionBtnDisabled]}
                      >
                        <CaretUp size={11} weight="bold" color={index === 0 ? COLORS.textLight : routine.color} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => moveStep(routine.id, step.id, 1)}
                        disabled={index === orderedSteps.length - 1}
                        style={[
                          styles.stepActionBtn,
                          index === orderedSteps.length - 1 && styles.stepActionBtnDisabled,
                        ]}
                      >
                        <CaretDown
                          size={11}
                          weight="bold"
                          color={index === orderedSteps.length - 1 ? COLORS.textLight : routine.color}
                        />
                      </TouchableOpacity>
                    </View>
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
              </React.Fragment>
            ))}
          </Animated.View>
        </ScrollView>

        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.startContainer}>
          <AnimatedPressable
            style={[
              styles.startBtn,
              { backgroundColor: selectedChildIds.length > 0 ? leadRoutine.color : COLORS.textLight },
            ]}
            onPress={handleContinue}
            disabled={selectedChildIds.length === 0}
            scaleDown={0.95}
          >
            <Rocket size={24} weight="fill" color="#FFF" />
            <Text style={styles.startText}>
              {selectedChildIds.length > 0 ? 'Valider la presence' : 'Choisis au moins un enfant'}
            </Text>
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
    paddingBottom: 140,
  },
  scrollCentered: {
    alignItems: 'center',
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
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  categoryText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  infoCard: {
    flexGrow: 1,
    flexBasis: 180,
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
  panel: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  panelTitleRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  panelTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  reorderHint: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    backgroundColor: COLORS.surface,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  panelHelpTop: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  panelHelp: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  childrenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  childCard: {
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1.5,
    borderColor: COLORS.surfaceSecondary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  selectedBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  childHint: {
    marginTop: 4,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  smallIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineHeaderText: {
    flex: 1,
  },
  routineHeaderName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  routineHeaderMeta: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    marginLeft: -SPACING.md,
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
  stepActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepActionBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  stepActionBtnDisabled: {
    opacity: 0.45,
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
