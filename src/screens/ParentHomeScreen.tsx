import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { beginPinNavigation } from '../utils/pinNavigation';
import { useAppStore } from '../stores/appStore';
import {
  CalendarDots,
  CaretRight,
  ChartLineUp,
  Cloud,
  Database,
  Info,
  ListChecks,
  LockSimple,
  Play,
  Plus,
  SlidersHorizontal,
  Trash,
  UsersThree,
} from 'phosphor-react-native';
import { ParentingTips } from '../components/parent/ParentingTips';
import { AppTutorialModal } from '../components/tutorial/AppTutorialModal';
import { useAppTheme } from '../hooks/useAppTheme';
import { useCalendarStore } from '../stores/calendarStore';
import { useChildrenStore } from '../stores/childrenStore';
import { useRealRewardStore } from '../stores/realRewardStore';
import { useRoutineStore } from '../stores/routineStore';
import { useLocalProfileStore } from '../stores/localProfileStore';
import { CONTENT_MAX_WIDTH, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';
import { ThemeModeControl } from '../components/ui/ThemeModeControl';

const PARENT_SECTIONS = [
  { key: 'family', title: 'Famille', helper: 'Enfants et préférences', route: '/parent/children', Icon: UsersThree, tone: 'actionSoft' },
  { key: 'routines', title: 'Routines', helper: 'Créer et organiser', route: '/parent/routines', Icon: ListChecks, tone: 'transitionSoft' },
  { key: 'calendar', title: 'Calendrier', helper: 'Préparer les repères', route: '/parent/calendar', Icon: CalendarDots, tone: 'timeSoft' },
  { key: 'progress', title: 'Progrès', helper: 'Étoiles et récompenses', route: '/parent/stats', Icon: ChartLineUp, tone: 'informationSoft' },
  { key: 'settings', title: 'Réglages', helper: 'Météo, sécurité et données', Icon: SlidersHorizontal, tone: 'surfaceSecondary' },
] as const;

const SETTINGS = [
  { title: 'Météo et tenue', helper: 'Ville, horaires et conseils', route: '/parent/weather', Icon: Cloud },
  { title: 'Sécurité', helper: 'Code PIN parent', route: '/pin', Icon: LockSimple },
  { title: 'Importer une routine', helper: 'Vérifier un lien, un code ou un fichier JSON', route: '/parent/import', Icon: Database },
  { title: 'Corbeille', helper: 'Retrouver les routines supprimées', route: '/parent/trash', Icon: Trash },
] as const;

export function ParentHomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { colors } = useAppTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const tutorialPromptPending = useLocalProfileStore((state) => state.tutorialPromptPending);
  const dismissTutorialPrompt = useLocalProfileStore((state) => state.dismissTutorialPrompt);
  const completeTutorial = useLocalProfileStore((state) => state.completeTutorial);
  const children = useChildrenStore((state) => state.children);
  const childrenHasHydrated = useChildrenStore((state) => state.hasHydrated);
  const routines = useRoutineStore((state) => state.routines);
  const events = useCalendarStore((state) => state.events);
  const rewards = useRealRewardStore((state) => state.realRewards);
  const contentWidth = Math.min(width - SPACING.lg * 2, CONTENT_MAX_WIDTH.lg);
  const compact = width < 720;
  const shortLandscape = width >= 900 && height < 820;
  const activeRoutineCount = routines.filter((routine) => routine.isActive).length;

  if (!childrenHasHydrated) return null;

  const sectionMeta: Record<string, string> = {
    family: `${children.length} enfant${children.length > 1 ? 's' : ''}`,
    routines: `${activeRoutineCount} active${activeRoutineCount > 1 ? 's' : ''}`,
    calendar: `${events.length} repère${events.length > 1 ? 's' : ''}`,
    progress: `${rewards.length} récompense${rewards.length > 1 ? 's' : ''}`,
    settings: settingsOpen ? 'Masquer' : 'Ouvrir',
  };

  return (
    <View style={[styles.gradient, { backgroundColor: 'transparent' }]}>

      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={[styles.scroll, shortLandscape && styles.scrollShortLandscape, { alignItems: 'center' }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.content, shortLandscape && styles.contentShortLandscape, { width: contentWidth, maxWidth: '100%' }]}>
            <View style={[styles.heading, shortLandscape && styles.headingShortLandscape]}>
              <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Espace parent</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Préparez les routines et les repères.
              </Text>
            </View>

            <View style={styles.primaryActions}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Créer une routine"
                activeOpacity={0.84}
                onPress={() => router.push('/parent/add-routine')}
                style={[styles.primaryButton, { backgroundColor: colors.actionSoft }]}
              >
                <Plus size={20} weight="regular" color={colors.action} />
                <Text style={[styles.primaryButtonText, { color: colors.action }]}>Créer une routine</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Aller aux routines à lancer"
                activeOpacity={0.84}
                onPress={() => router.replace('/routines')}
                style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Play size={19} weight="fill" color={colors.text} />
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Lancer</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Outils</Text>
              <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>5 intentions, rien de plus</Text>
            </View>

            <View style={styles.sectionGrid}>
              {PARENT_SECTIONS.map((section) => {
                const Icon = section.Icon;
                const isSettings = section.key === 'settings';
                const tone = colors.surface;

                return (
                  <TouchableOpacity
                    key={section.key}
                    accessibilityRole="button"
                    accessibilityLabel={`${section.title}, ${section.helper}`}
                    accessibilityState={isSettings ? { expanded: settingsOpen } : undefined}
                    aria-expanded={isSettings ? settingsOpen : undefined}
                    activeOpacity={0.84}
                    onPress={() => {
                      if (isSettings) setSettingsOpen((open) => !open);
                      else if ('route' in section) router.push(section.route);
                    }}
                    style={[
                      styles.sectionCard,
                      compact && styles.sectionCardCompact,
                      shortLandscape && styles.sectionCardShortLandscape,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <View style={[styles.sectionIcon, { backgroundColor: tone }]}>
                      <Icon size={25} weight="regular" color={colors.text} />
                    </View>
                    <View style={styles.sectionCopy}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>{section.title}</Text>
                      <Text style={[styles.cardHelper, { color: colors.textSecondary }]}>{section.helper}</Text>
                      <Text style={[styles.cardMeta, { color: colors.action }]}>{sectionMeta[section.key]}</Text>
                    </View>
                    <CaretRight
                      size={18}
                      weight="regular"
                      color={colors.textLight}
                      style={isSettings && settingsOpen ? { transform: [{ rotate: '90deg' }] } : undefined}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {settingsOpen ? (
              <View accessibilityLabel="Réglages rapides" style={[styles.settingsPanel, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.settingsTitle, { color: colors.text }]}>Réglages rapides</Text>
                <View style={[styles.appearanceRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.settingsCopy}>
                    <Text style={[styles.settingsRowTitle, { color: colors.text }]}>Apparence</Text>
                    <Text style={[styles.settingsRowHelper, { color: colors.textSecondary }]}>Choisissez une ambiance conçue pour vous.</Text>
                  </View>
                  <ThemeModeControl />
                </View>
                {SETTINGS.map(({ title, helper, route, Icon }) => (
                  <TouchableOpacity
                    key={route}
                    accessibilityRole="button"
                    accessibilityLabel={`${title}, ${helper}`}
                    activeOpacity={0.82}
                    onPress={() => route === '/pin'
                      ? router.push({ pathname: '/pin', params: { returnTo: beginPinNavigation('/parent', useAppStore.getState().isParentMode) } })
                      : router.push(route)}
                    style={[styles.settingsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View style={[styles.settingsIcon, { backgroundColor: colors.informationSoft }]}>
                      <Icon size={20} weight="regular" color={colors.information} />
                    </View>
                    <View style={styles.settingsCopy}>
                      <Text style={[styles.settingsRowTitle, { color: colors.text }]}>{title}</Text>
                      <Text style={[styles.settingsRowHelper, { color: colors.textSecondary }]}>{helper}</Text>
                    </View>
                    <CaretRight size={17} weight="regular" color={colors.textLight} />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Guide de l’application"
                  activeOpacity={0.82}
                  onPress={() => setTutorialOpen(true)}
                  style={[styles.settingsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={[styles.settingsIcon, { backgroundColor: colors.informationSoft }]}>
                    <Info size={20} weight="regular" color={colors.information} />
                  </View>
                  <View style={styles.settingsCopy}>
                    <Text style={[styles.settingsRowTitle, { color: colors.text }]}>Guide de l’application</Text>
                    <Text style={[styles.settingsRowHelper, { color: colors.textSecondary }]}>{tutorialPromptPending ? 'Découvrir les étapes de démarrage' : 'Revoir les étapes de démarrage'}</Text>
                  </View>
                  <CaretRight size={17} weight="regular" color={colors.textLight} />
                </TouchableOpacity>
              </View>
            ) : null}

            <ParentingTips />
          </View>
        </ScrollView>
      </SafeAreaView>
      {tutorialOpen ? <AppTutorialModal visible onClose={() => { dismissTutorialPrompt(); setTutorialOpen(false); }} onComplete={completeTutorial} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  scrollShortLandscape: { paddingTop: SPACING.md, paddingBottom: SPACING.md },
  content: { gap: SPACING.lg },
  contentShortLandscape: { gap: SPACING.md },
  heading: { gap: SPACING.sm, paddingTop: SPACING.sm },
  headingShortLandscape: { paddingTop: 0 },
  eyebrow: { fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: FONT_SIZE.xxl, lineHeight: 38, fontWeight: '700', letterSpacing: -0.8 },
  subtitle: { maxWidth: 620, fontSize: FONT_SIZE.sm, lineHeight: 21 },
  primaryActions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  primaryButton: {
    minHeight: 52,
    flexGrow: 1,
    flexBasis: 210,
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  primaryButtonText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  secondaryButton: {
    minHeight: 52,
    minWidth: 120,
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  secondaryButtonText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  sectionHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700' },
  sectionHint: { fontSize: FONT_SIZE.xs },
  sectionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  sectionCard: {
    flexGrow: 1,
    flexBasis: 300,
    minHeight: 126,
    borderRadius: 20,
    borderWidth: 1,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionCardCompact: { flexBasis: '100%', minHeight: 110 },
  sectionCardShortLandscape: { minHeight: 110 },
  sectionIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  sectionCopy: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  cardHelper: { fontSize: FONT_SIZE.xs, marginTop: 3 },
  cardMeta: { fontSize: FONT_SIZE.xs, fontWeight: '700', marginTop: SPACING.sm },
  settingsPanel: { borderRadius: 22, padding: SPACING.md, gap: SPACING.sm },
  settingsTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.xs },
  appearanceRow: { minHeight: 76, borderRadius: 16, borderWidth: 1, padding: SPACING.sm, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.md },
  settingsRow: {
    minHeight: 68,
    borderRadius: 16,
    borderWidth: 1,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  settingsIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  settingsCopy: { flex: 1, minWidth: 0 },
  settingsRowTitle: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  settingsRowHelper: { fontSize: FONT_SIZE.xs, marginTop: 2 },
});
