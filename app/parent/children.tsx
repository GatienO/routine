import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { useRewardStore } from '../../src/stores/rewardStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/constants/theme';
import { backOrReplace } from '../../src/utils/navigation';
import { getGridItemWidth, getResponsiveColumns } from '../../src/utils/responsive';

export default function ParentChildrenScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const children = useChildrenStore((state) => state.children);
  const routines = useRoutineStore((state) => state.routines);
  const rewards = useRewardStore((state) => state.rewards);

  const childSummaries = useMemo(
    () =>
      children.map((child) => ({
        child,
        routineCount: routines.filter((routine) => routine.childId === child.id).length,
        starCount: rewards[child.id]?.totalStars ?? 0,
      })),
    [children, rewards, routines],
  );

  const contentWidth = Math.min(width - SPACING.lg * 2, 1320);
  const columns = getResponsiveColumns(width, { phone: 1, tablet: 2, desktop: 3, wide: 3 });
  const cardWidth = getGridItemWidth(contentWidth, columns, SPACING.md);

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        key={`children-grid-${columns}`}
        data={childSummaries}
        keyExtractor={(item) => item.child.id}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
        contentContainerStyle={[styles.listContent, styles.listContentCentered]}
        ListHeaderComponent={(
          <View style={[styles.headerBlock, { width: contentWidth, maxWidth: '100%' }]}>
            <View style={styles.headerRow}>
              <BackButton onPress={() => backOrReplace(router, '/parent')} style={styles.backBtn} />
              <View style={styles.headerText}>
                <Text style={styles.title}>Gestion des enfants</Text>
                <Text style={styles.subtitle}>
                  Un ecran dedie et compact pour naviguer plus vite entre les profils
                </Text>
              </View>
            </View>

            <Button
              title="Ajouter un enfant"
              onPress={() => router.push('/parent/add-child')}
              variant="primary"
              size="md"
              color={COLORS.secondary}
            />
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👶</Text>
            <Text style={styles.emptyTitle}>Aucun enfant pour le moment</Text>
            <Button
              title="Creer le premier profil"
              onPress={() => router.push('/parent/add-child')}
              variant="primary"
              size="sm"
              color={COLORS.secondary}
            />
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, maxWidth: '100%' }]}
            onPress={() => router.push(`/parent/add-child?id=${item.child.id}`)}
            activeOpacity={0.75}
          >
            <View style={styles.cardInner}>
              <Avatar
                emoji={item.child.avatar}
                color={item.child.color}
                size={64}
                avatarConfig={item.child.avatarConfig}
              />
              <Text style={styles.childName}>{item.child.name}</Text>
              <Text style={styles.childMeta}>{item.child.age} ans</Text>
              <View style={styles.statsRow}>
                <View style={styles.statPill}>
                  <Text style={styles.statValue}>{item.routineCount}</Text>
                  <Text style={styles.statLabel}>routines</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={styles.statValue}>{item.starCount}</Text>
                  <Text style={styles.statLabel}>etoiles</Text>
                </View>
              </View>
              <Text style={styles.editHint}>Touchez pour modifier</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  listContentCentered: {
    alignItems: 'center',
  },
  headerBlock: {
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  backBtn: {},
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  columnWrapper: {
    gap: SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardInner: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  childName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  childMeta: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  statPill: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  editHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  empty: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyIcon: {
    fontSize: 42,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
});
