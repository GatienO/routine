import { useEffect, useMemo, useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ClockCounterClockwise, Heart, Sparkle } from 'phosphor-react-native';
import { ActivityDetailOverlay } from '../components/ActivityDetailOverlay';
import { ActivityList } from '../components/ActivityList';
import { FilterBar } from '../components/FilterBar';
import { SearchBar } from '../components/SearchBar';
import { ResponsiveOverlay } from '../../../components/ui/ResponsiveOverlay';
import { activities } from '../activities';
import { useActivityStore } from '../activity-store';
import type { Activity, ActivityWeather } from '../types';
import { findMatchingActivities, sortActivitiesByRelevance } from '../activity-filter';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { CONTENT_MAX_WIDTH, FONT_SIZE, SHADOWS, SPACING, type ThemeColors } from '../../../constants/theme';

type CollectionView = 'discover' | 'favorites' | 'recent';
type Energy = 'calm' | 'energy';
type Place = 'indoor' | 'outdoor';

export default function ActivitiesHomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ view?: string; activity?: string; surprise?: string }>();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const filters = useActivityStore((state) => state.filters);
  const favoriteIds = useActivityStore((state) => state.favoriteIds);
  const history = useActivityStore((state) => state.history);
  const setFilters = useActivityStore((state) => state.setFilters);
  const resetFilters = useActivityStore((state) => state.resetFilters);
  const toggleFavorite = useActivityStore((state) => state.toggleFavorite);
  const [view, setView] = useState<CollectionView>(normalizeView(params.view));
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(() => activities.find((item) => item.id === params.activity) ?? null);
  const [surpriseOpen, setSurpriseOpen] = useState(params.surprise === '1');
  const [visibleCount, setVisibleCount] = useState(12);
  const horizontalPadding = width >= 720 ? 32 : width < 350 ? 16 : 20;
  const contentWidth = Math.min(width - horizontalPadding * 2, CONTENT_MAX_WIDTH.xl);

  useEffect(() => { setView(normalizeView(params.view)); }, [params.view]);
  useEffect(() => { setSelectedActivity(activities.find((item) => item.id === params.activity) ?? null); }, [params.activity]);
  useEffect(() => { setSurpriseOpen(params.surprise === '1'); }, [params.surprise]);
  useEffect(() => { setVisibleCount(12); }, [filters, view]);

  const discover = useMemo(() => sortActivitiesByRelevance(findMatchingActivities(filters, activities, favoriteIds), favoriteIds, history), [favoriteIds, filters, history]);
  const collection = useMemo(() => {
    if (view === 'favorites') return sortActivitiesByRelevance(activities.filter((item) => favoriteIds.includes(item.id)), favoriteIds, history);
    if (view === 'recent') return history.map((entry) => activities.find((item) => item.id === entry.activityId)).filter(Boolean) as Activity[];
    return discover;
  }, [discover, favoriteIds, history, view]);
  const visible = collection.slice(0, visibleCount);

  const changeView = (next: CollectionView) => { setView(next); router.setParams({ view: next === 'discover' ? undefined : next }); };
  const openActivity = (activity: Activity) => { setSelectedActivity(activity); router.setParams({ activity: activity.id }); };
  const closeActivity = () => { setSelectedActivity(null); router.setParams({ activity: undefined }); };
  const closeSurprise = () => { setSurpriseOpen(false); router.setParams({ surprise: undefined }); };

  return <View style={[styles.safe, { backgroundColor: 'transparent' }]}><Stack.Screen options={{ title: 'Activités', headerShown: false }} /><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"><View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
    <View style={styles.heading}><Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Une idée à partager</Text></View>
    <View style={[styles.tabs, { backgroundColor: colors.surfaceSecondary }]}><ViewTab label="Découvrir" active={view === 'discover'} onPress={() => changeView('discover')} icon={<Sparkle size={18} color={view === 'discover' ? colors.information : colors.textSecondary} />} colors={colors} /><ViewTab label="Favoris" active={view === 'favorites'} onPress={() => changeView('favorites')} icon={<Heart size={18} color={view === 'favorites' ? colors.attention : colors.textSecondary} />} colors={colors} /><ViewTab label="Récentes" active={view === 'recent'} onPress={() => changeView('recent')} icon={<ClockCounterClockwise size={18} color={view === 'recent' ? colors.time : colors.textSecondary} />} colors={colors} /></View>
    {view === 'discover' ? <><SearchBar value={filters.search ?? ''} onChange={(search) => setFilters({ search })} placeholder="Rechercher une activité" /><FilterBar filters={filters} resultCount={discover.length} onChange={setFilters} onReset={resetFilters} onSurprise={() => { setSurpriseOpen(true); router.setParams({ surprise: '1' }); }} /></> : null}
    {view !== 'discover' ? <View style={styles.collectionHeading}><Text style={[styles.count, { color: colors.textSecondary }]}>{view === 'favorites' ? 'Vos favoris' : 'Consultées récemment'} · {collection.length} idées</Text></View> : null}
    {collection.length ? <><ActivityList activities={visible} favoriteIds={favoriteIds} onOpenActivity={openActivity} onToggleFavorite={toggleFavorite} />{visible.length < collection.length ? <Pressable accessibilityRole="button" onPress={() => setVisibleCount((count) => count + 12)} style={[styles.moreButton, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.moreText, { color: colors.text }]}>Afficher 12 idées de plus</Text></Pressable> : null}</> : <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={styles.emptyEmoji}>{view === 'favorites' ? '♡' : view === 'recent' ? '◷' : '🌿'}</Text><Text style={[styles.emptyTitle, { color: colors.text }]}>{view === 'favorites' ? 'Aucun favori' : view === 'recent' ? 'Aucune activité récente' : 'Aucune idée ne correspond'}</Text><Text style={[styles.emptyText, { color: colors.textSecondary }]}>{view === 'discover' ? 'Effacez quelques filtres pour retrouver des idées.' : 'Revenez dans Découvrir pour ouvrir une activité.'}</Text><Pressable accessibilityRole="button" onPress={() => view === 'discover' ? resetFilters() : changeView('discover')} style={[styles.emptyAction, { backgroundColor: colors.actionSoft }]}><Text style={[styles.emptyActionText, { color: colors.action }]}>{view === 'discover' ? 'Effacer les filtres' : 'Découvrir des idées'}</Text></Pressable></View>}
  </View></ScrollView><SurpriseOverlay visible={surpriseOpen} onClose={closeSurprise} onPick={(activity) => { closeSurprise(); openActivity(activity); }} /><ActivityDetailOverlay activity={selectedActivity} visible={Boolean(selectedActivity)} onClose={closeActivity} /></View>;
}

function SurpriseOverlay({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (activity: Activity) => void }) { const { colors } = useAppTheme(); const [energy, setEnergy] = useState<Energy>('calm'); const [place, setPlace] = useState<Place>('indoor'); const candidates = activities.filter((activity) => matchesEnergy(activity, energy) && matchesPlace(activity.weather, place)); const pick = () => onPick((candidates.length ? candidates : activities)[Math.floor(Math.random() * (candidates.length || activities.length))]); return <ResponsiveOverlay visible={visible} title="Une surprise adaptée" subtitle="Deux choix rapides, puis une seule proposition." onClose={onClose} footer={<Pressable accessibilityRole="button" onPress={pick} style={[styles.overlayPrimary, { backgroundColor: colors.transition }]}><Sparkle size={18} color={colors.background} /><Text style={[styles.overlayPrimaryText, { color: colors.background }]}>Trouver une idée</Text></Pressable>}><OptionGroup title="Énergie du moment" colors={colors}><Option label="Calme" active={energy === 'calm'} onPress={() => setEnergy('calm')} colors={colors} /><Option label="Bouger" active={energy === 'energy'} onPress={() => setEnergy('energy')} colors={colors} /></OptionGroup><OptionGroup title="Où ?" colors={colors}><Option label="À l’intérieur" active={place === 'indoor'} onPress={() => setPlace('indoor')} colors={colors} /><Option label="Dehors" active={place === 'outdoor'} onPress={() => setPlace('outdoor')} colors={colors} /></OptionGroup><View style={[styles.surpriseHint, { backgroundColor: colors.transitionSoft }]}><Text style={[styles.surpriseHintTitle, { color: colors.text }]}>{candidates.length} possibilité{candidates.length > 1 ? 's' : ''}</Text><Text style={[styles.emptyText, { color: colors.textSecondary }]}>L’idée reste modifiable et se fait avec l’adulte.</Text></View></ResponsiveOverlay>; }
function ViewTab({ label, active, onPress, icon, colors }: { label: string; active: boolean; onPress: () => void; icon: React.ReactNode; colors: ThemeColors }) { return <Pressable aria-selected={active} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.tab, active && { backgroundColor: colors.surface, ...SHADOWS.sm }]}>{icon}<Text style={[styles.tabText, { color: active ? colors.text : colors.textSecondary }]}>{label}</Text></Pressable>; }
function OptionGroup({ title, colors, children }: { title: string; colors: ThemeColors; children: React.ReactNode }) { return <View style={styles.optionGroup}><Text style={[styles.optionTitle, { color: colors.text }]}>{title}</Text><View style={styles.optionRow}>{children}</View></View>; }
function Option({ label, active, onPress, colors }: { label: string; active: boolean; onPress: () => void; colors: ThemeColors }) { return <Pressable aria-pressed={active} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.option, { backgroundColor: active ? colors.transitionSoft : colors.surface, borderColor: active ? colors.transition : colors.border }]}><Text style={[styles.optionText, { color: colors.text }]}>{label}</Text></Pressable>; }
function normalizeView(value?: string): CollectionView { return value === 'favorites' || value === 'recent' ? value : 'discover'; }
function matchesEnergy(activity: Activity, energy: Energy) { return energy === 'calm' ? activity.noiseLevel === 'low' || activity.activityType === 'calm' || activity.activityType === 'story' : activity.noiseLevel !== 'low' || activity.activityType === 'motor' || activity.activityType === 'challenge'; }
function matchesPlace(weather: ActivityWeather, place: Place) { return place === 'indoor' ? weather === 'indoor' || weather === 'rainy' || weather === 'any' : weather === 'outdoor' || weather === 'sunny' || weather === 'any'; }

const styles = StyleSheet.create({
  safe: { flex: 1 }, scroll: { paddingTop: 16, paddingBottom: SPACING.xl, alignItems: 'center' }, content: { gap: SPACING.md }, heading: { gap: 6 }, eyebrow: { fontSize: FONT_SIZE.xs, lineHeight: 18, fontWeight: '800', letterSpacing: 0.8 }, title: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.6 }, subtitle: { maxWidth: 620, fontSize: FONT_SIZE.sm, lineHeight: 21 }, tabs: { width: '100%', maxWidth: 460, flexDirection: 'row', padding: 5, borderRadius: 18, gap: 4 }, tab: { flex: 1, minWidth: 0, justifyContent: 'center', minHeight: 44, borderRadius: 14, paddingHorizontal: 3, flexDirection: 'row', alignItems: 'center', gap: 5 }, tabText: { fontSize: 12, fontWeight: '700' }, quickRow: { flexDirection: 'row', flexWrap: 'wrap' }, surpriseButton: { minHeight: 46, borderRadius: 15, paddingHorizontal: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: 7 }, surpriseText: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, collectionHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: SPACING.md }, sectionTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700' }, count: { fontSize: FONT_SIZE.xs }, featured: { gap: SPACING.sm }, featuredLabel: { fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 0.7 }, moreButton: { minHeight: 48, marginTop: SPACING.lg, alignSelf: 'center', paddingHorizontal: SPACING.lg, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, moreText: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, empty: { minHeight: 300, borderRadius: 22, borderWidth: 1, padding: SPACING.xl, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm }, emptyEmoji: { fontSize: 42 }, emptyTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', textAlign: 'center' }, emptyText: { maxWidth: 470, fontSize: FONT_SIZE.sm, lineHeight: 21, textAlign: 'center' }, emptyAction: { minHeight: 48, marginTop: SPACING.sm, borderRadius: 14, paddingHorizontal: SPACING.lg, alignItems: 'center', justifyContent: 'center' }, emptyActionText: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, overlayPrimary: { minHeight: 50, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm }, overlayPrimaryText: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, optionGroup: { gap: SPACING.sm }, optionTitle: { fontSize: FONT_SIZE.md, fontWeight: '800' }, optionRow: { flexDirection: 'row', gap: SPACING.sm }, option: { flex: 1, minHeight: 54, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, optionText: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, surpriseHint: { minHeight: 130, borderRadius: 20, padding: SPACING.lg, alignItems: 'center', justifyContent: 'center' }, surpriseHintTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
});
