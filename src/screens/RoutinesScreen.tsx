import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppStore } from '../stores/appStore';
import { useChildrenStore } from '../stores/childrenStore';
import { useRoutineStore } from '../stores/routineStore';
import { COLORS, CONTENT_MAX_WIDTH, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { formatDuration } from '../utils/date';
import { formatChildName } from '../utils/children';

export function RoutinesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const children = useChildrenStore((state) => state.children);
  const selectedChildId = useAppStore((state) => state.selectedChildId);
  const routines = useRoutineStore((state) => state.routines);
  const contentWidth = Math.min(width - SPACING.lg * 2, CONTENT_MAX_WIDTH.md);

  const activeChild = useMemo(
    () => children.find((child) => child.id === selectedChildId) ?? children[0],
    [children, selectedChildId],
  );
  const childRoutines = useMemo(
    () => routines.filter((routine) => routine.isActive && (!activeChild || routine.childId === activeChild.id)),
    [activeChild, routines],
  );
  const nextRoutine = childRoutines.find((routine) => routine.category === 'morning') ?? childRoutines[0];
  const otherRoutines = childRoutines.filter((routine) => routine.id !== nextRoutine?.id).slice(0, 6);

  const startRoutine = (routineId?: string) => {
    if (!routineId) {
      router.push('/parent/add-routine');
      return;
    }

    router.push({
      pathname: '/child/summary',
      params: { routineIds: routineId },
    });
  };

  if (!activeChild) {
    return (
      <LinearGradient colors={['#D8EEF0', '#EAF7EF', '#FFF8EF']} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aucun enfant</Text>
            <PrimaryButton label="Creer un profil" onPress={() => router.push('/parent/add-child')} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#D8EEF0', '#EAF7EF', '#FFF8EF']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'center' }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Routines</Text>
              <Text style={styles.subtitle}>Pour {formatChildName(activeChild.name)}</Text>
            </View>

            <View style={styles.focusCard}>
              <Text style={styles.focusLabel}>A lancer</Text>
              <Text style={styles.focusTitle}>{nextRoutine?.name ?? 'Creer une routine'}</Text>
              <Text style={styles.focusMeta}>
                {nextRoutine ? routineSummary(nextRoutine) : 'Prepare une routine simple cote parent.'}
              </Text>
              <PrimaryButton label={nextRoutine ? 'Commencer' : 'Creer'} onPress={() => startRoutine(nextRoutine?.id)} />
            </View>

            <View style={styles.quickRow}>
              <QuickButton label="Toutes les routines" onPress={() => router.push('/child')} />
              <QuickButton label="Calendrier" onPress={() => router.push('/child/calendar')} />
              <QuickButton label="Recompenses" onPress={() => router.push('/child/rewards')} />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Autres routines</Text>
              <TouchableOpacity onPress={() => router.push('/parent/routines')} activeOpacity={0.84}>
                <Text style={styles.manageLink}>Gerer</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.list}>
              {otherRoutines.length > 0 ? (
                otherRoutines.map((routine) => (
                  <TouchableOpacity
                    key={routine.id}
                    onPress={() => startRoutine(routine.id)}
                    activeOpacity={0.86}
                    style={[styles.routineRow, { borderColor: `${routine.color}55` }]}
                  >
                    <Text style={styles.routineIcon}>{routine.icon}</Text>
                    <View style={styles.routineCopy}>
                      <Text style={styles.routineName} numberOfLines={1}>{routine.name}</Text>
                      <Text style={styles.routineMeta}>{routineSummary(routine)}</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyList}>
                  <Text style={styles.emptyListText}>Pas d'autre routine active.</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function routineSummary(routine: { steps: Array<{ durationMinutes: number }> }) {
  const duration = routine.steps.reduce((sum, step) => sum + step.durationMinutes, 0);
  return `${routine.steps.length} etapes · ${formatDuration(duration)}`;
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function QuickButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.84} style={styles.quickButton}>
      <Text style={styles.quickButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: 110,
  },
  content: {
    gap: SPACING.md,
  },
  header: {
    gap: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  focusCard: {
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  focusLabel: {
    color: COLORS.secondaryDark,
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  focusTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
  },
  focusMeta: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
  primaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickButton: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  quickButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
  },
  manageLink: {
    color: COLORS.secondaryDark,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
  },
  list: {
    gap: SPACING.sm,
  },
  routineRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1.5,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  routineIcon: {
    fontSize: 28,
  },
  routineCopy: {
    flex: 1,
    minWidth: 0,
  },
  routineName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
  },
  routineMeta: {
    marginTop: 3,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
  arrow: {
    color: COLORS.textLight,
    fontSize: 28,
    fontWeight: '900',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
  },
  emptyList: {
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.64)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyListText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
});
