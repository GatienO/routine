import React, { useEffect, useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowCounterClockwise, Trash } from 'phosphor-react-native';
import { AppPageHeader } from '../../src/components/ui/AppPageHeader';
import { Card } from '../../src/components/ui/Card';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/constants/theme';
import { useRoutineStore } from '../../src/stores/routineStore';
import { formatDuration } from '../../src/utils/date';

function getDaysLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export default function ParentTrashScreen() {
  const router = useRouter();
  const trashedRoutines = useRoutineStore((state) => state.trashedRoutines);
  const restoreRoutine = useRoutineStore((state) => state.restoreRoutine);
  const cleanupExpiredTrash = useRoutineStore((state) => state.cleanupExpiredTrash);

  useEffect(() => {
    cleanupExpiredTrash();
  }, [cleanupExpiredTrash]);

  const sortedTrash = useMemo(
    () =>
      [...trashedRoutines].sort(
        (left, right) => new Date(right.deletedAt).getTime() - new Date(left.deletedAt).getTime(),
      ),
    [trashedRoutines],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <AppPageHeader
            title="Corbeille"
            onBack={() => router.replace('/parent')}
            onHome={() => router.replace('/parent')}
          />
          <Text style={styles.subtitle}>
            Les routines supprimees restent restaurables pendant 30 jours.
          </Text>
        </View>

        {sortedTrash.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🧺</Text>
              <Text style={styles.emptyTitle}>Corbeille vide</Text>
              <Text style={styles.emptyText}>Aucune routine n’attend ici pour le moment.</Text>
            </View>
          </Card>
        ) : (
          sortedTrash.map((routine) => {
            const totalDuration = routine.steps.reduce((sum, step) => sum + step.durationMinutes, 0);
            const daysLeft = getDaysLeft(routine.expiresAt);

            return (
              <Card key={routine.id} style={styles.routineCard}>
                <View style={styles.routineRow}>
                  <View style={[styles.iconWrap, { backgroundColor: `${routine.color}22` }]}>
                    <OpenMoji emoji={routine.icon} size={28} />
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.name}>{routine.name}</Text>
                    <Text style={styles.meta}>
                      {routine.steps.length} etapes · ~{formatDuration(totalDuration)}
                    </Text>
                    <Text style={styles.trashMeta}>
                      Supprimee le {new Date(routine.deletedAt).toLocaleDateString('fr-FR')} ·
                      expire dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => restoreRoutine(routine.id)}
                    style={styles.restoreButton}
                    activeOpacity={0.82}
                  >
                    <ArrowCounterClockwise size={16} weight="bold" color="#FFF" />
                    <Text style={styles.restoreButtonText}>Restaurer</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  back: {
    marginBottom: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xl + 2,
    fontWeight: '900',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 34,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  routineCard: {
    marginBottom: SPACING.sm,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  meta: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  trashMeta: {
    marginTop: 2,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  restoreButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
});
