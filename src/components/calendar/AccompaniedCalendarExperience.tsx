import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { CalendarBlank, CaretRight, Check, Moon, X } from 'phosphor-react-native';
import { useCalendarView } from '../../hooks/useCalendarView';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { Child } from '../../types';
import type { CountdownEvent, DayTimelineItem } from '../../types/calendar';
import type { ThemeColors } from '../../constants/theme';
import { CONTENT_MAX_WIDTH, FONT_SIZE, SHADOWS, SPACING } from '../../constants/theme';
import { formatTimelineTime } from '../../utils/calendar';
import { formatChildName } from '../../utils/children';
import { Avatar } from '../ui/Avatar';
import { PastelOrbs } from '../ui/PastelOrbs';
import { activities } from '../../features/activities/activities';
import type { Activity } from '../../features/activities/types';
import { ActivityDetailOverlay } from '../../features/activities/components/ActivityDetailOverlay';

type CalendarMode = 'today' | 'tomorrow' | 'dodos' | 'week';

const MODES: Array<{ id: CalendarMode; label: string; icon: string }> = [
  { id: 'today', label: 'Maintenant', icon: '☀️' },
  { id: 'tomorrow', label: 'Demain', icon: '⭐' },
  { id: 'dodos', label: 'Dodos', icon: '🌙' },
  { id: 'week', label: 'Semaine', icon: '📅' },
];

export function AccompaniedCalendarExperience({ initialMode = 'today' }: { initialMode?: CalendarMode } = {}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const [mode, setMode] = useState<CalendarMode>(initialMode);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const activeDate = mode === 'tomorrow' ? addDays(new Date(), 1) : new Date();
  const calendar = useCalendarView({ date: activeDate, childId: null });

  useEffect(() => {
    setSelectedIds((current) => {
      const available = new Set(calendar.children.map((child) => child.id));
      const kept = current.filter((id) => available.has(id));
      return kept.length ? kept : calendar.children.map((child) => child.id);
    });
  }, [calendar.children]);

  const selectedChildren = calendar.children.filter((child) => selectedIds.includes(child.id));
  const youngestAge = Math.min(...selectedChildren.map((child) => child.age ?? 99), 99);
  const readingLevel: 'picture' | 'reader' = youngestAge <= 5 ? 'picture' : 'reader';
  const belongs = (ids: string[]) => ids.length === 0 || ids.some((id) => selectedIds.includes(id));
  const timeline = calendar.timeline.filter((item) => item.type !== 'day-marker' && belongs(item.childIds));
  const dayEvents = calendar.dayEvents.filter((event) => belongs(event.childIds));
  const countdowns = calendar.countdowns.filter((event) => belongs(event.childIds));
  const moments = useMemo(() => getNowAndAfter(timeline), [timeline]);
  const contentWidth = Math.min(width - SPACING.lg * 2, CONTENT_MAX_WIDTH.lg);

  const toggleChild = (childId: string) => setSelectedIds((current) => {
    if (!current.includes(childId)) return [...current, childId];
    return current.length === 1 ? current : current.filter((id) => id !== childId);
  });

  const openItem = (item?: DayTimelineItem | null) => {
    if (item?.routineId) {
      router.push({ pathname: '/child/summary', params: { routineId: item.routineId, childIds: selectedIds.join(',') } });
    } else if (item?.activityId) {
      setSelectedActivity(activities.find((activity) => activity.id === item.activityId) ?? null);
    }
  };

  if (calendar.children.length === 0) {
    return <EmptyCalendar colors={colors} onClose={() => router.replace('/routines')} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PastelOrbs quiet />
      <ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'center' }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
          <View style={styles.topBar}>
            <View style={styles.topCopy}>
              <Text style={[styles.eyebrow, { color: colors.time }]}>ON REGARDE ENSEMBLE</Text>
              <Text style={[styles.title, { color: colors.text }]}>Où en est la journée ?</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Des repères simples, sans retard ni course contre le temps.</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fermer le calendrier" onPress={() => router.replace('/routines')} style={[styles.close, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <X size={22} weight="bold" color={colors.text} />
            </Pressable>
          </View>

          <ParticipantPicker children={calendar.children} selectedIds={selectedIds} onToggle={toggleChild} colors={colors} />

          <View style={[styles.modeBar, { backgroundColor: colors.surfaceSecondary }]}>
            {MODES.map((item) => {
              const selected = item.id === mode;
              return (
                <Pressable aria-pressed={selected} key={item.id} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setMode(item.id)} style={[styles.modeButton, selected && { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={styles.modeEmoji}>{item.icon}</Text>
                  <Text style={[styles.modeLabel, { color: selected ? colors.time : colors.textSecondary }]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {mode === 'today' ? (
            <View style={styles.nowGrid}>
              <MomentCard label="MAINTENANT" item={moments.now} fallback={getCurrentDayPhase()} accent={colors.time} background={colors.timeSoft} readingLevel={readingLevel} colors={colors} onPress={() => openItem(moments.now)} />
              <MomentCard label="APRÈS" item={moments.after} fallback={{ title: 'La suite viendra doucement', icon: '🌱' }} accent={colors.action} background={colors.actionSoft} readingLevel={readingLevel} colors={colors} onPress={() => openItem(moments.after)} />
            </View>
          ) : null}

          {mode === 'today' && timeline.some((item) => item.routineId || item.activityId) ? <DayPreview title="À faire ensemble" date={activeDate} items={timeline.filter((item) => item.routineId || item.activityId)} eventsCount={dayEvents.length} readingLevel={readingLevel} colors={colors} onOpen={openItem} /> : null}
          {mode === 'tomorrow' ? <DayPreview date={activeDate} items={timeline} eventsCount={dayEvents.length} readingLevel={readingLevel} colors={colors} onOpen={openItem} /> : null}
          {mode === 'dodos' ? <DodosPreview countdowns={countdowns} colors={colors} /> : null}
          {mode === 'week' ? (
            <View style={styles.weekGrid}>
              {calendar.weekDays.map(({ date, events }) => {
                const visible = events.filter((event) => belongs(event.childIds));
                const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                return (
                  <View key={date.toISOString()} style={[styles.dayCard, { backgroundColor: isToday ? colors.timeSoft : colors.surface, borderColor: isToday ? colors.time : colors.border }]}>
                    <Text style={[styles.dayName, { color: colors.text }]}>{format(date, 'EEE', { locale: fr })}</Text>
                    <Text style={[styles.dayNumber, { color: isToday ? colors.time : colors.textSecondary }]}>{format(date, 'd')}</Text>
                    <View style={styles.dayIcons}>{visible.slice(0, 3).map((event) => <Text key={event.id} style={styles.dayIcon}>{event.icon}</Text>)}</View>
                    <Text style={[styles.dayHint, { color: colors.textSecondary }]}>{visible.length ? `${visible.length} repère${visible.length > 1 ? 's' : ''}` : 'Calme'}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          <Text style={[styles.adultDate, { color: colors.textLight }]}>Pour l’adulte · {format(activeDate, 'EEEE d MMMM yyyy', { locale: fr })}</Text>
        </View>
      </ScrollView>
      <ActivityDetailOverlay activity={selectedActivity} visible={Boolean(selectedActivity)} onClose={() => setSelectedActivity(null)} />
    </SafeAreaView>
  );
}

function ParticipantPicker({ children, selectedIds, onToggle, colors }: { children: Child[]; selectedIds: string[]; onToggle: (id: string) => void; colors: ThemeColors }) {
  return (
    <View style={[styles.participantPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.participantHeading}><Text style={[styles.participantTitle, { color: colors.text }]}>Qui regarde avec vous ?</Text><Text style={[styles.participantHint, { color: colors.textSecondary }]}>Plusieurs choix possibles</Text></View>
      <View style={styles.participantRow}>{children.map((child) => {
        const selected = selectedIds.includes(child.id);
        return (
          <Pressable aria-pressed={selected} key={child.id} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => onToggle(child.id)} style={[styles.childChip, { backgroundColor: selected ? colors.actionSoft : colors.surfaceSecondary, borderColor: selected ? colors.action : colors.border }]}>
            <Avatar emoji={child.avatar} color={child.color} size={28} avatarConfig={child.avatarConfig} /><Text style={[styles.childName, { color: colors.text }]}>{formatChildName(child.name)}</Text>{selected ? <Check size={16} weight="bold" color={colors.action} /> : null}
          </Pressable>
        );
      })}</View>
    </View>
  );
}

function MomentCard({ label, item, fallback, accent, background, readingLevel, colors, onPress }: { label: string; item?: DayTimelineItem | null; fallback: { title: string; icon: string }; accent: string; background: string; readingLevel: 'picture' | 'reader'; colors: ThemeColors; onPress: () => void }) {
  const content = item ?? fallback;
  const actionable = Boolean(item?.routineId || item?.activityId);
  return (
    <Pressable accessibilityRole="button" disabled={!actionable} onPress={onPress} style={({ pressed }) => [styles.momentCard, { backgroundColor: background, borderColor: accent, opacity: pressed ? 0.82 : 1 }]}>
      <Text style={[styles.momentLabel, { color: accent }]}>{label}</Text><Text style={[styles.momentEmoji, readingLevel === 'picture' && styles.momentEmojiLarge]}>{content.icon}</Text>
      <Text style={[styles.momentTitle, readingLevel === 'picture' && styles.momentTitleLarge, { color: colors.text }]} numberOfLines={2}>{content.title}</Text>
      {item ? <Text style={[styles.momentTime, { color: colors.textSecondary }]}>{friendlyTime(item.startMinutes, readingLevel)}</Text> : null}
      {actionable ? <View style={styles.openHint}><Text style={[styles.openHintText, { color: accent }]}>{item?.routineId ? 'Lancer ensemble' : 'Voir ensemble'}</Text><CaretRight size={17} weight="bold" color={accent} /></View> : null}
    </Pressable>
  );
}

function DayPreview({ date, items, eventsCount, readingLevel, colors, onOpen, title = 'Demain arrive doucement.' }: { title?: string; date: Date; items: DayTimelineItem[]; eventsCount: number; readingLevel: 'picture' | 'reader'; colors: ThemeColors; onOpen: (item: DayTimelineItem) => void }) {
  return (
    <View style={[styles.previewPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.eyebrow, { color: colors.time }]}>{format(date, 'EEEE d MMMM', { locale: fr }).toUpperCase()}</Text><Text style={[styles.previewTitle, { color: colors.text }]}>{title}</Text>
      {items.length === 0 ? <Text style={[styles.quietText, { color: colors.textSecondary }]}>🌤️ Rien de particulier. Une journée simple.</Text> : items.map((item) => (
        <Pressable accessibilityRole="button" key={item.id} disabled={!item.routineId && !item.activityId} onPress={() => onOpen(item)} style={[styles.previewRow, { backgroundColor: colors.timeSoft }]}>
          <Text style={styles.previewIcon}>{item.icon}</Text><View style={styles.previewCopy}><Text style={[styles.previewRowTitle, { color: colors.text }]}>{item.title}</Text><Text style={[styles.previewRowTime, { color: colors.textSecondary }]}>{friendlyTime(item.startMinutes, readingLevel)}</Text></View>{(item.routineId || item.activityId) ? <CaretRight size={18} color={colors.time} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

function DodosPreview({ countdowns, colors }: { countdowns: CountdownEvent[]; colors: ThemeColors }) {
  return (
    <View style={[styles.previewPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.dodosIcon, { backgroundColor: colors.timeSoft }]}><Moon size={30} weight="fill" color={colors.time} /></View><Text style={[styles.previewTitle, { color: colors.text }]}>Combien de dodos ?</Text><Text style={[styles.quietText, { color: colors.textSecondary }]}>Une lune représente une nuit de sommeil.</Text>
      {countdowns.length === 0 ? <Text style={[styles.quietState, { color: colors.textSecondary }]}>Aucun grand moment à attendre pour l’instant.</Text> : countdowns.map((item) => (
        <View key={item.id} style={[styles.countdownRow, { backgroundColor: colors.timeSoft }]}>
          <Text style={styles.countdownEventIcon}>{item.icon}</Text><View style={styles.previewCopy}><Text style={[styles.previewRowTitle, { color: colors.text }]}>{item.title}</Text><Text style={[styles.moons, { color: colors.time }]}>{item.isToday ? 'C’est aujourd’hui !' : moonLabel(item.sleepCount)}</Text><Text style={[styles.previewRowTime, { color: colors.textSecondary }]}>{format(new Date(`${item.date}T12:00:00`), 'EEEE d MMMM', { locale: fr })}</Text></View>
        </View>
      ))}
    </View>
  );
}

function EmptyCalendar({ colors, onClose }: { colors: ThemeColors; onClose: () => void }) {
  return <SafeAreaView style={styles.safe}><View style={styles.emptyPage}><View style={[styles.emptyIcon, { backgroundColor: colors.timeSoft }]}><CalendarBlank size={34} color={colors.time} /></View><Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun repère pour le moment</Text><Text style={[styles.emptyText, { color: colors.textSecondary }]}>Un parent peut d’abord ajouter un enfant et quelques repères.</Text><Pressable accessibilityRole="button" onPress={onClose} style={[styles.secondaryAction, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.secondaryActionText, { color: colors.text }]}>Retour aux routines</Text></Pressable></View></SafeAreaView>;
}

function getNowAndAfter(items: DayTimelineItem[]) {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const currentIndex = items.findLastIndex((item) => item.startMinutes <= minutes && (item.endMinutes ?? item.startMinutes + 75) >= minutes);
  const current = currentIndex >= 0 ? items[currentIndex] : null;
  return { now: current, after: items.find((item) => item.startMinutes > (current?.startMinutes ?? minutes)) ?? null };
}

function getCurrentDayPhase() {
  const hour = new Date().getHours();
  if (hour < 9) return { title: 'Le matin commence', icon: '🌤️' };
  if (hour < 12) return { title: 'C’est encore le matin', icon: '☀️' };
  if (hour < 14) return { title: 'C’est le moment du midi', icon: '🍽️' };
  if (hour < 18) return { title: 'C’est l’après-midi', icon: '🌿' };
  if (hour < 21) return { title: 'Le soir arrive', icon: '🌆' };
  return { title: 'C’est bientôt la nuit', icon: '🌙' };
}

function friendlyTime(minutes: number, level: 'picture' | 'reader') {
  if (level === 'reader') return formatTimelineTime(minutes);
  if (minutes < 12 * 60) return 'Ce matin';
  if (minutes < 14 * 60) return 'À midi';
  if (minutes < 18 * 60) return 'Cet après-midi';
  return 'Ce soir';
}

function moonLabel(count: number) {
  return count <= 5 ? `${'🌙 '.repeat(count).trim()} · ${count} dodo${count > 1 ? 's' : ''}` : `🌙 🌙 🌙 🌙 🌙 + ${count - 5} · ${count} dodos`;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl }, content: { gap: SPACING.lg },
  topBar: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md }, topCopy: { flex: 1, gap: 5 }, eyebrow: { fontSize: FONT_SIZE.xs, lineHeight: 17, fontWeight: '800', letterSpacing: 0.8 }, title: { fontSize: FONT_SIZE.xxl, lineHeight: 39, fontWeight: '700', letterSpacing: -0.7 }, subtitle: { maxWidth: 620, fontSize: FONT_SIZE.sm, lineHeight: 21 }, close: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  participantPanel: { borderRadius: 18, borderWidth: 1, padding: SPACING.md, gap: SPACING.sm, ...SHADOWS.sm }, participantHeading: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: SPACING.xs }, participantTitle: { fontSize: FONT_SIZE.sm, fontWeight: '700' }, participantHint: { fontSize: FONT_SIZE.xs }, participantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }, childChip: { minHeight: 46, borderRadius: 14, borderWidth: 1, paddingHorizontal: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: 7 }, childName: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  modeBar: { borderRadius: 18, padding: 5, flexDirection: 'row', flexWrap: 'wrap', gap: 4 }, modeButton: { flexGrow: 1, flexBasis: 120, minHeight: 54, borderRadius: 14, borderWidth: 1, borderColor: 'transparent', paddingHorizontal: SPACING.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, modeEmoji: { fontSize: 19 }, modeLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  nowGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }, momentCard: { flexGrow: 1, flexBasis: 300, minHeight: 300, borderRadius: 22, borderWidth: 1, padding: SPACING.lg, alignItems: 'flex-start' }, momentLabel: { fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 0.8 }, momentEmoji: { fontSize: 58, marginTop: SPACING.lg }, momentEmojiLarge: { fontSize: 72 }, momentTitle: { maxWidth: 420, marginTop: SPACING.md, fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.5 }, momentTitleLarge: { fontSize: 32, lineHeight: 38 }, momentTime: { marginTop: SPACING.sm, fontSize: FONT_SIZE.md, fontWeight: '600' }, openHint: { marginTop: 'auto', paddingTop: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: 3 }, openHintText: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  previewPanel: { borderRadius: 22, borderWidth: 1, padding: SPACING.lg, gap: SPACING.md, ...SHADOWS.sm }, previewTitle: { fontSize: FONT_SIZE.xl, lineHeight: 31, fontWeight: '700' }, quietText: { fontSize: FONT_SIZE.sm, lineHeight: 21 }, quietState: { paddingVertical: SPACING.lg, fontSize: FONT_SIZE.md, lineHeight: 24, fontWeight: '600' }, previewRow: { minHeight: 72, borderRadius: 18, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md }, previewIcon: { fontSize: 30 }, previewCopy: { flex: 1, minWidth: 0, gap: 3 }, previewRowTitle: { fontSize: FONT_SIZE.md, fontWeight: '700' }, previewRowTime: { fontSize: FONT_SIZE.xs, fontWeight: '600' }, moreHint: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  dodosIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, countdownRow: { minHeight: 92, borderRadius: 18, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md }, countdownEventIcon: { fontSize: 38 }, moons: { fontSize: FONT_SIZE.md, lineHeight: 22, fontWeight: '700' },
  weekGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }, dayCard: { flexGrow: 1, flexBasis: 120, minHeight: 154, borderRadius: 18, borderWidth: 1, padding: SPACING.md, gap: 4 }, dayName: { fontSize: FONT_SIZE.sm, fontWeight: '700', textTransform: 'capitalize' }, dayNumber: { fontSize: FONT_SIZE.xl, lineHeight: 30, fontWeight: '700' }, dayIcons: { minHeight: 30, flexDirection: 'row', gap: 2 }, dayIcon: { fontSize: 20 }, dayHint: { marginTop: 'auto', fontSize: FONT_SIZE.xs, fontWeight: '600' }, adultDate: { alignSelf: 'center', fontSize: FONT_SIZE.xs },
  emptyPage: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, gap: SPACING.md }, emptyIcon: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', textAlign: 'center' }, emptyText: { maxWidth: 380, fontSize: FONT_SIZE.sm, lineHeight: 21, textAlign: 'center' }, secondaryAction: { minHeight: 48, borderRadius: 14, borderWidth: 1, paddingHorizontal: SPACING.lg, alignItems: 'center', justifyContent: 'center' }, secondaryActionText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
});
