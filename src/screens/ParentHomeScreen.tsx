import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppStore } from '../stores/appStore';
import { useChildrenStore } from '../stores/childrenStore';
import { COLORS, CONTENT_MAX_WIDTH, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../constants/theme';

type ParentAction = {
  title: string;
  helper: string;
  icon: string;
  color: string;
  route: string;
};

const MAIN_ACTIONS: ParentAction[] = [
  { title: 'Enfants', helper: 'Profils', icon: '👶', color: '#86C8B1', route: '/parent/children' },
  { title: 'Routines', helper: 'Creer, modifier', icon: '📋', color: '#74BBD5', route: '/parent/routines' },
  { title: 'Calendrier', helper: 'Evenements', icon: '📅', color: '#9EC6D5', route: '/parent/calendar' },
  { title: 'Recompenses', helper: 'Etoiles, cadeaux', icon: '🎁', color: '#E6C26C', route: '/parent/rewards' },
  { title: 'Progression', helper: 'Stats simples', icon: '📈', color: '#A8D5BF', route: '/parent/stats' },
  { title: 'Reglages', helper: 'Meteo, import', icon: '⚙️', color: '#A98AD9', route: '/parent/weather' },
];

const QUICK_ACTIONS: ParentAction[] = [
  { title: 'Ajouter enfant', helper: '', icon: '+', color: '#86C8B1', route: '/parent/add-child' },
  { title: 'Nouvelle routine', helper: '', icon: '+', color: '#74BBD5', route: '/parent/add-routine' },
  { title: 'Catalogue', helper: '', icon: '+', color: '#E8B86D', route: '/parent/catalog' },
  { title: 'Importer', helper: '', icon: '+', color: '#A98AD9', route: '/parent/import' },
];

export function ParentHomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isParentMode = useAppStore((state) => state.isParentMode);
  const parentPin = useAppStore((state) => state.parentPin);
  const children = useChildrenStore((state) => state.children);
  const childrenHasHydrated = useChildrenStore((state) => state.hasHydrated);
  const contentWidth = Math.min(width - SPACING.lg * 2, CONTENT_MAX_WIDTH.md);
  const canUseFirstSetup = !parentPin && childrenHasHydrated && children.length === 0;

  useFocusEffect(
    React.useCallback(() => {
      if (!isParentMode && !canUseFirstSetup) {
        router.replace({
          pathname: '/pin',
          params: { redirect: '/parent' },
        } as any);
      }
    }, [canUseFirstSetup, isParentMode, router]),
  );

  if (!isParentMode && !canUseFirstSetup) {
    return null;
  }

  return (
    <LinearGradient colors={['#D8EEF0', '#EAF4F0', '#FFF8EF']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'center' }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Parent</Text>
              <Text style={styles.subtitle}>Que veux-tu gerer ?</Text>
            </View>

            <View style={styles.quickRow}>
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.title}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.84}
                  style={[styles.quickButton, { borderColor: `${action.color}55` }]}
                >
                  <Text style={[styles.quickIcon, { color: action.color }]}>{action.icon}</Text>
                  <Text style={styles.quickText}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionGrid}>
              {MAIN_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.title}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.86}
                  style={[styles.actionCard, { borderColor: `${action.color}55` }]}
                >
                  <View style={[styles.actionIconWrap, { backgroundColor: `${action.color}22` }]}>
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionHelper}>{action.helper}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={() => router.push('/parent/trash')} activeOpacity={0.84} style={styles.secondaryRow}>
              <Text style={styles.secondaryText}>Corbeille et restauration</Text>
              <Text style={styles.secondaryArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickButton: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  quickIcon: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
  },
  quickText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  actionCard: {
    flexGrow: 1,
    flexBasis: 170,
    minHeight: 142,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1.5,
    padding: SPACING.md,
    justifyContent: 'center',
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  actionIcon: {
    fontSize: 26,
  },
  actionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
  },
  actionHelper: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
  secondaryRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.72)',
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
  },
  secondaryArrow: {
    color: COLORS.textLight,
    fontSize: 28,
    fontWeight: '900',
  },
});
