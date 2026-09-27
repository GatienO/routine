import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { addDays, format, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { ArrowLeft, CalendarPlus, CaretRight, PencilSimple, Plus, Repeat, Trash } from 'phosphor-react-native';
import { ResponsiveOverlay } from '../../../components/ui/ResponsiveOverlay';
import { PastelOrbs } from '../../../components/ui/PastelOrbs';
import { CalendarLinkPicker } from '../../../components/calendar/CalendarLinkPicker';
import { showAppConfirm, showAppToast } from '../../../components/feedback/AppFeedbackProvider';
import { activities } from '../../activities/activities';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useCalendarStore } from '../../../stores/calendarStore';
import { useChildrenStore } from '../../../stores/childrenStore';
import { useRoutineStore } from '../../../stores/routineStore';
import type { CalendarEvent, CalendarEventKind } from '../../../types/calendar';
import type { ThemeColors } from '../../../constants/theme';
import { CONTENT_MAX_WIDTH, FONT_SIZE, SHADOWS, SPACING } from '../../../constants/theme';
import { normalizeCalendarDate, parseCalendarDate } from '../../../utils/calendar';
import { formatChildName } from '../../../utils/children';

const ICONS = ['🌿', '🎒', '🏠', '🎂', '⭐', '🩺', '🎈', '🌙'];
const MOMENTS = [
  { id: 'morning', label: 'Matin', time: '08:00', color: 'transitionSoft' },
  { id: 'noon', label: 'Midi', time: '12:00', color: 'informationSoft' },
  { id: 'afternoon', label: 'Après-midi', time: '15:30', color: 'actionSoft' },
  { id: 'evening', label: 'Soir', time: '18:30', color: 'timeSoft' },
] as const;
const KINDS: Array<{ id: CalendarEventKind; label: string }> = [
  { id: 'home', label: 'Maison' }, { id: 'school', label: 'École' }, { id: 'special', label: 'Moment spécial' }, { id: 'birthday', label: 'Anniversaire' }, { id: 'holiday', label: 'Sortie' },
];

export function ParentCalendarScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const events = useCalendarStore((state) => state.events);
  const removeEvent = useCalendarStore((state) => state.removeEvent);
  const children = useChildrenStore((state) => state.children);
  const [editedEvent, setEditedEvent] = useState<CalendarEvent | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const contentWidth = Math.min(width - SPACING.lg * 2, CONTENT_MAX_WIDTH.lg);
  const visibleEvents = useMemo(() => {
    const today = startOfDay(new Date());
    return events
      .filter((event) => event.recurrence === 'weekly' || !isBefore(parseCalendarDate(event.date), today))
      .map((event) => {
        const firstDate = parseCalendarDate(event.date);
        if (event.recurrence !== 'weekly' || !isBefore(firstDate, today)) return { event, displayDate: firstDate };
        const daysUntilNext = (firstDate.getDay() - today.getDay() + 7) % 7;
        return { event, displayDate: addDays(today, daysUntilNext) };
      })
      .sort((left, right) => left.displayDate.getTime() - right.displayDate.getTime()
        || (left.event.startTime ?? '').localeCompare(right.event.startTime ?? ''));
  }, [events]);

  const openCreate = () => { setEditedEvent(null); setEditorOpen(true); };
  const openEdit = (event: CalendarEvent) => { setEditedEvent(event); setEditorOpen(true); };
  const deleteEvent = async (event: CalendarEvent) => {
    const confirmed = await showAppConfirm({ title: 'Supprimer ce repère ?', message: event.title, tone: 'warning', icon: event.icon, confirmLabel: 'Supprimer', cancelLabel: 'Garder', confirmKind: 'danger' });
    if (confirmed) removeEvent(event.id);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <PastelOrbs quiet />
      <ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'center' }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
          <View style={styles.headingRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Retour à Parent" onPress={() => router.replace('/parent')} style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}><ArrowLeft size={21} weight="bold" color={colors.text} /></Pressable>
            <View style={styles.headingCopy}><Text style={[styles.eyebrow, { color: colors.time }]}>REPÈRES TEMPORELS</Text><Text style={[styles.title, { color: colors.text }]}>Préparer ce qui compte.</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>Quelques moments utiles à expliquer aux enfants, pas un planning familial.</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Créer un repère" onPress={openCreate} style={[styles.createButton, { backgroundColor: colors.action }]}><Plus size={19} weight="bold" color={colors.surface} /><Text style={[styles.createText, { color: colors.surface }]}>Nouveau repère</Text></Pressable>
          </View>

          <View style={styles.listHeading}><Text style={[styles.sectionTitle, { color: colors.text }]}>À venir</Text><Text style={[styles.count, { color: colors.textSecondary }]}>{visibleEvents.length} repère{visibleEvents.length > 1 ? 's' : ''}</Text></View>

          {visibleEvents.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.emptyIcon, { backgroundColor: colors.timeSoft }]}><CalendarPlus size={31} color={colors.time} /></View><Text style={[styles.emptyTitle, { color: colors.text }]}>La semaine est encore vide</Text><Text style={[styles.emptyText, { color: colors.textSecondary }]}>Ajoutez seulement les moments qui aideront les enfants à comprendre aujourd’hui, demain ou les prochains dodos.</Text><Pressable accessibilityRole="button" onPress={openCreate} style={[styles.emptyAction, { backgroundColor: colors.actionSoft }]}><Text style={[styles.emptyActionText, { color: colors.action }]}>Créer le premier repère</Text></Pressable></View>
          ) : (
            <View style={styles.eventList}>{visibleEvents.map(({ event, displayDate }) => <EventRow key={event.id} event={event} displayDate={displayDate} childrenNames={children.filter((child) => event.childIds.includes(child.id)).map((child) => formatChildName(child.name))} colors={colors} onEdit={() => openEdit(event)} onDelete={() => void deleteEvent(event)} />)}</View>
          )}
        </View>
      </ScrollView>
      <EventEditor visible={editorOpen} event={editedEvent} onClose={() => setEditorOpen(false)} />
    </SafeAreaView>
  );
}

function EventRow({ event, displayDate, childrenNames, colors, onEdit, onDelete }: { event: CalendarEvent; displayDate: Date; childrenNames: string[]; colors: ThemeColors; onEdit: () => void; onDelete: () => void }) {
  const linkedCount = event.suggestedRoutineIds.length + (event.suggestedActivityIds?.length ?? 0);
  return (
    <View style={[styles.eventRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.eventIcon, { backgroundColor: colors.timeSoft }]}><Text style={styles.eventEmoji}>{event.icon}</Text></View>
      <View style={styles.eventCopy}><Text style={[styles.eventDate, { color: colors.time }]}>{format(displayDate, 'EEEE d MMMM', { locale: fr })}{event.recurrence === 'weekly' ? ' · chaque semaine' : ''}</Text><Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text><Text style={[styles.eventMeta, { color: colors.textSecondary }]}>{momentLabel(event.startTime)} · {childrenNames.join(', ') || 'Tous les enfants'}{linkedCount ? ` · ${linkedCount} lien${linkedCount > 1 ? 's' : ''}` : ''}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Modifier ${event.title}`} onPress={onEdit} style={[styles.rowAction, { backgroundColor: colors.surfaceSecondary }]}><PencilSimple size={18} color={colors.text} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Supprimer ${event.title}`} onPress={onDelete} style={[styles.rowAction, { backgroundColor: colors.attentionSoft }]}><Trash size={18} color={colors.attention} /></Pressable>
    </View>
  );
}

function EventEditor({ visible, event, onClose }: { visible: boolean; event: CalendarEvent | null; onClose: () => void }) {
  const { colors } = useAppTheme();
  const children = useChildrenStore((state) => state.children);
  const allRoutines = useRoutineStore((state) => state.routines);
  const routines = useMemo(() => allRoutines.filter((routine) => routine.isActive), [allRoutines]);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const [title, setTitle] = useState(''); const [icon, setIcon] = useState('🌿'); const [date, setDate] = useState(normalizeCalendarDate(new Date()));
  const [time, setTime] = useState('08:00'); const [kind, setKind] = useState<CalendarEventKind>('home'); const [childIds, setChildIds] = useState<string[]>([]); const [weekly, setWeekly] = useState(false);
  const [routineIds, setRoutineIds] = useState<string[]>([]); const [activityIds, setActivityIds] = useState<string[]>([]); const [linkPickerOpen, setLinkPickerOpen] = useState(false);
  const dayOptions = useMemo(() => Array.from({ length: 8 }, (_, index) => addDays(new Date(), index)), [visible]);

  useEffect(() => {
    if (!visible) return;
    setTitle(event?.title ?? ''); setIcon(event?.icon ?? '🌿'); setDate(event?.date ?? normalizeCalendarDate(new Date())); setTime(event?.startTime ?? '08:00'); setKind(event?.kind ?? 'home'); setChildIds(event?.childIds.length ? event.childIds : children.map((child) => child.id)); setWeekly(event?.recurrence === 'weekly'); setRoutineIds(event?.suggestedRoutineIds ?? []); setActivityIds(event?.suggestedActivityIds ?? []);
  }, [children, event, visible]);

  const toggle = (items: string[], id: string, setter: (ids: string[]) => void) => setter(items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const toggleRoutine = (id: string) => {
    const adding = !routineIds.includes(id);
    toggle(routineIds, id, setRoutineIds);
    const routine = routines.find((item) => item.id === id);
    if (adding && routine && !title.trim()) {
      setTitle(routine.name);
      setIcon(routine.icon);
      setKind('routine');
    }
  };
  const toggleActivity = (id: string) => {
    const adding = !activityIds.includes(id);
    toggle(activityIds, id, setActivityIds);
    const activity = activities.find((item) => item.id === id);
    if (adding && activity && !title.trim()) {
      setTitle(activity.title);
      setIcon(activity.thumbnail);
      setKind('activity');
    }
  };
  const save = () => {
    if (!title.trim() || childIds.length === 0) { showAppToast({ title: 'Repère incomplet', message: 'Ajoutez un titre et au moins un enfant.', tone: 'warning', icon: '🌿' }); return; }
    const payload = { title: title.trim(), description: '', childIds, color: colors.time, icon, date, startTime: time, allDay: false, kind, suggestedRoutineIds: routineIds, suggestedActivityIds: activityIds, recurrence: weekly ? 'weekly' as const : 'none' as const };
    if (event) updateEvent(event.id, payload); else addEvent(payload);
    showAppToast({ title: event ? 'Repère modifié' : 'Repère ajouté', message: title.trim(), tone: 'success', icon }); onClose();
  };

  return (
    <><ResponsiveOverlay visible={visible && !linkPickerOpen} title={event ? 'Modifier le repère' : 'Nouveau repère'} subtitle="Une information saisie une fois, expliquée simplement aux enfants." onClose={onClose} footer={<View style={styles.footer}><Pressable accessibilityRole="button" onPress={onClose} style={[styles.footerSecondary, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.footerText, { color: colors.text }]}>Annuler</Text></Pressable><Pressable accessibilityRole="button" onPress={save} style={[styles.footerPrimary, { backgroundColor: colors.action }]}><Text style={[styles.footerText, { color: colors.surface }]}>{event ? 'Enregistrer' : 'Ajouter le repère'}</Text></Pressable></View>}>
      <FieldLabel text="Comment l’appeler ?" colors={colors} /><TextInput value={title} onChangeText={setTitle} placeholder="Ex. École, anniversaire, piscine" placeholderTextColor={colors.textLight} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} />
      <FieldLabel text="Pictogramme" colors={colors} /><View style={styles.choiceRow}>{ICONS.map((item) => <Choice key={item} label={item} selected={icon === item} onPress={() => setIcon(item)} colors={colors} compact />)}</View>
      <FieldLabel text="Jour" colors={colors} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>{dayOptions.map((day, index) => { const key = normalizeCalendarDate(day); return <Choice key={key} label={index === 0 ? 'Aujourd’hui' : format(day, 'EEE d', { locale: fr })} selected={date === key} onPress={() => setDate(key)} colors={colors} />; })}</ScrollView>
      <FieldLabel text="Moment" colors={colors} /><View style={styles.choiceRow}>{MOMENTS.map((item) => <Choice key={item.id} label={item.label} selected={time === item.time} onPress={() => setTime(item.time)} colors={colors} />)}</View>
      <FieldLabel text="Pour qui ?" colors={colors} /><View style={styles.choiceRow}>{children.map((child) => <Choice key={child.id} label={formatChildName(child.name)} selected={childIds.includes(child.id)} onPress={() => toggle(childIds, child.id, setChildIds)} colors={colors} />)}</View>
      <FieldLabel text="Type de repère" colors={colors} /><View style={styles.choiceRow}>{KINDS.map((item) => <Choice key={item.id} label={item.label} selected={kind === item.id} onPress={() => setKind(item.id)} colors={colors} />)}</View>
      <Pressable aria-checked={weekly} accessibilityRole="checkbox" accessibilityState={{ checked: weekly }} onPress={() => setWeekly((value) => !value)} style={[styles.repeatRow, { backgroundColor: weekly ? colors.timeSoft : colors.surface, borderColor: weekly ? colors.time : colors.border }]}><Repeat size={20} color={weekly ? colors.time : colors.textSecondary} /><View style={styles.repeatCopy}><Text style={[styles.repeatTitle, { color: colors.text }]}>Chaque semaine</Text><Text style={[styles.repeatHint, { color: colors.textSecondary }]}>Le même jour et au même moment.</Text></View><Text style={[styles.repeatCheck, { color: colors.time }]}>{weekly ? '✓' : ''}</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => setLinkPickerOpen(true)} style={[styles.linkRow, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.linkCopy}><Text style={[styles.repeatTitle, { color: colors.text }]}>Routine ou activité liée</Text><Text style={[styles.repeatHint, { color: colors.textSecondary }]}>{routineIds.length + activityIds.length ? `${routineIds.length + activityIds.length} élément${routineIds.length + activityIds.length > 1 ? 's' : ''} lié${routineIds.length + activityIds.length > 1 ? 's' : ''}` : 'Facultatif'}</Text></View><CaretRight size={19} color={colors.textSecondary} /></Pressable>
    </ResponsiveOverlay><CalendarLinkPicker visible={linkPickerOpen} routines={routines} activities={activities} selectedRoutineIds={routineIds} selectedActivityIds={activityIds} title="Lier un contenu" onClose={() => setLinkPickerOpen(false)} onToggleRoutine={toggleRoutine} onToggleActivity={toggleActivity} /></>
  );
}

function FieldLabel({ text, colors }: { text: string; colors: ThemeColors }) { return <Text style={[styles.fieldLabel, { color: colors.text }]}>{text}</Text>; }
function Choice({ label, selected, onPress, colors, compact = false }: { label: string; selected: boolean; onPress: () => void; colors: ThemeColors; compact?: boolean }) { return <Pressable aria-pressed={selected} accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.choice, compact && styles.choiceCompact, { backgroundColor: selected ? colors.timeSoft : colors.surface, borderColor: selected ? colors.time : colors.border }]}><Text style={[compact ? styles.choiceEmoji : styles.choiceText, { color: colors.text }]}>{label}</Text></Pressable>; }
function momentLabel(time?: string) { return MOMENTS.find((item) => item.time === time)?.label ?? 'Toute la journée'; }

const styles = StyleSheet.create({
  safe: { flex: 1 }, scroll: { padding: SPACING.lg, paddingBottom: 120 }, content: { gap: SPACING.lg }, headingRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: SPACING.md }, headingCopy: { flex: 1, minWidth: 260, gap: 5 }, eyebrow: { fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 0.8 }, title: { fontSize: FONT_SIZE.xxl, lineHeight: 39, fontWeight: '700', letterSpacing: -0.7 }, subtitle: { maxWidth: 620, fontSize: FONT_SIZE.sm, lineHeight: 21 }, iconButton: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, createButton: { minHeight: 50, borderRadius: 14, paddingHorizontal: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm }, createText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  listHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: SPACING.md }, sectionTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700' }, count: { fontSize: FONT_SIZE.xs }, eventList: { gap: SPACING.sm }, eventRow: { minHeight: 92, borderRadius: 18, borderWidth: 1, padding: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, ...SHADOWS.sm }, eventIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, eventEmoji: { fontSize: 30 }, eventCopy: { flex: 1, minWidth: 0 }, eventDate: { fontSize: FONT_SIZE.xs, fontWeight: '700', textTransform: 'capitalize' }, eventTitle: { marginTop: 3, fontSize: FONT_SIZE.md, fontWeight: '700' }, eventMeta: { marginTop: 4, fontSize: FONT_SIZE.xs, lineHeight: 17 }, rowAction: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  empty: { minHeight: 330, borderRadius: 22, borderWidth: 1, padding: SPACING.xl, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, ...SHADOWS.sm }, emptyIcon: { width: 66, height: 66, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', textAlign: 'center' }, emptyText: { maxWidth: 500, fontSize: FONT_SIZE.sm, lineHeight: 21, textAlign: 'center' }, emptyAction: { minHeight: 48, marginTop: SPACING.sm, borderRadius: 14, paddingHorizontal: SPACING.lg, alignItems: 'center', justifyContent: 'center' }, emptyActionText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  fieldLabel: { marginTop: SPACING.xs, fontSize: FONT_SIZE.sm, fontWeight: '700' }, input: { minHeight: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: SPACING.md, fontSize: FONT_SIZE.md }, choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }, choice: { minHeight: 44, borderRadius: 14, borderWidth: 1, paddingHorizontal: SPACING.md, alignItems: 'center', justifyContent: 'center' }, choiceCompact: { width: 48, paddingHorizontal: 0 }, choiceText: { fontSize: FONT_SIZE.sm, fontWeight: '700' }, choiceEmoji: { fontSize: 23 }, repeatRow: { minHeight: 68, borderRadius: 18, borderWidth: 1, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }, repeatCopy: { flex: 1, minWidth: 0 }, repeatTitle: { fontSize: FONT_SIZE.sm, fontWeight: '700' }, repeatHint: { marginTop: 3, fontSize: FONT_SIZE.xs }, repeatCheck: { width: 20, fontSize: FONT_SIZE.lg, fontWeight: '800' }, linkRow: { minHeight: 68, borderRadius: 18, borderWidth: 1, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }, linkCopy: { flex: 1, minWidth: 0 }, footer: { flexDirection: 'row', gap: SPACING.sm }, footerSecondary: { minHeight: 50, flex: 1, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, footerPrimary: { minHeight: 50, flex: 2, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, footerText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
});
