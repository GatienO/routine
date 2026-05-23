import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Trash, CalendarPlus, Sparkle } from 'phosphor-react-native';
import { AppPageHeader } from '../../../src/components/ui/AppPageHeader';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { EventBubble, WeekStrip } from '../../../src/components/calendar';
import { useCalendarStore } from '../../../src/stores/calendarStore';
import { useChildrenStore } from '../../../src/stores/childrenStore';
import { useRoutineStore } from '../../../src/stores/routineStore';
import { CalendarEvent, CalendarEventKind } from '../../../src/types/calendar';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../../src/constants/theme';
import { getEventsForWeek, normalizeCalendarDate } from '../../../src/utils/calendar';
import { formatChildName } from '../../../src/utils/children';
import { showAppAlert, showAppConfirm, showAppToast } from '../../../src/components/feedback/AppFeedbackProvider';

const EVENT_KINDS: Array<{ key: CalendarEventKind; label: string; icon: string; color: string }> = [
  { key: 'special', label: 'Special', icon: '⭐', color: '#F0B86E' },
  { key: 'birthday', label: 'Anniversaire', icon: '🎂', color: '#E28383' },
  { key: 'holiday', label: 'Vacances', icon: '🏖️', color: '#74BBD5' },
  { key: 'school', label: 'Ecole', icon: '🎒', color: '#88BDD4' },
  { key: 'home', label: 'Maison', icon: '🏠', color: '#86C8B1' },
  { key: 'health', label: 'Sante', icon: '🩺', color: '#D96B6B' },
  { key: 'routine', label: 'Routine', icon: '🧩', color: '#9DC9D7' },
];

const ICON_CHOICES = ['⭐', '🎂', '🏖️', '🎒', '🏠', '🩺', '🧩', '🎉', '🚌', '🌙'];
const COLOR_CHOICES = ['#D96B6B', '#86C8B1', '#74BBD5', '#F0B86E', '#A98AD9', '#E8B89C', '#8BC9A5'];

export default function ParentCalendarScreen() {
  const { width } = useWindowDimensions();
  const events = useCalendarStore((state) => state.events);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const removeEvent = useCalendarStore((state) => state.removeEvent);
  const children = useChildrenStore((state) => state.children);
  const routines = useRoutineStore((state) => state.routines);

  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(normalizeCalendarDate(today));
  const [startTime, setStartTime] = useState('');
  const [selectedKind, setSelectedKind] = useState<CalendarEventKind>('special');
  const [selectedIcon, setSelectedIcon] = useState(EVENT_KINDS[0].icon);
  const [selectedColor, setSelectedColor] = useState(EVENT_KINDS[0].color);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>([]);

  const contentWidth = Math.min(width - SPACING.lg * 2, 1120);
  const selectedDateKey = normalizeCalendarDate(selectedDate);
  const eventsForSelectedDate = useMemo(
    () => events.filter((event) => normalizeCalendarDate(event.date) === selectedDateKey),
    [events, selectedDateKey],
  );
  const weekDays = useMemo(() => {
    return getEventsForWeek(events, selectedDate);
  }, [events, selectedDate]);

  const toggleChild = (childId: string) => {
    setSelectedChildIds((current) =>
      current.includes(childId)
        ? current.filter((id) => id !== childId)
        : [...current, childId],
    );
  };

  const toggleRoutine = (routineId: string) => {
    setSelectedRoutineIds((current) =>
      current.includes(routineId)
        ? current.filter((id) => id !== routineId)
        : [...current, routineId],
    );
  };

  const chooseKind = (kind: CalendarEventKind) => {
    const config = EVENT_KINDS.find((item) => item.key === kind);
    setSelectedKind(kind);
    if (config) {
      setSelectedIcon(config.icon);
      setSelectedColor(config.color);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(normalizeCalendarDate(today));
    setStartTime('');
    setSelectedKind('special');
    setSelectedIcon(EVENT_KINDS[0].icon);
    setSelectedColor(EVENT_KINDS[0].color);
    setSelectedChildIds([]);
    setSelectedRoutineIds([]);
  };

  const handleAddEvent = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      showAppAlert({
        title: 'Titre requis',
        message: 'Ajoute un nom court pour cet evenement.',
        tone: 'warning',
        icon: '⭐',
      });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      showAppAlert({
        title: 'Date invalide',
        message: 'Utilise le format AAAA-MM-JJ, par exemple 2026-06-12.',
        tone: 'warning',
        icon: '📅',
      });
      return;
    }

    if (children.length === 0) {
      showAppAlert({
        title: 'Aucun enfant',
        message: 'Cree un enfant avant de planifier un evenement.',
        tone: 'warning',
        icon: '👶',
      });
      return;
    }

    const eventChildIds = selectedChildIds.length > 0
      ? selectedChildIds
      : children.map((child) => child.id);

    const event = addEvent({
      title: trimmedTitle,
      description: description.trim() || undefined,
      childIds: eventChildIds,
      color: selectedColor,
      icon: selectedIcon,
      date: date.trim(),
      startTime: startTime.trim() || undefined,
      allDay: !startTime.trim(),
      kind: selectedKind,
      suggestedRoutineIds: selectedRoutineIds,
    });

    setSelectedDate(new Date(`${event.date}T12:00:00`));
    resetForm();
    showAppToast({
      title: 'Evenement ajoute',
      message: event.title,
      tone: 'success',
      icon: event.icon,
    });
  };

  const handleDelete = async (event: CalendarEvent) => {
    const confirmed = await showAppConfirm({
      title: 'Supprimer cet evenement ?',
      message: event.title,
      tone: 'warning',
      icon: event.icon,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Garder',
      confirmKind: 'danger',
    });

    if (confirmed) {
      removeEvent(event.id);
    }
  };

  return (
    <LinearGradient colors={['#C9E7DC', '#F4E8D8', '#FFF8EF']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { alignItems: 'center' }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
            <AppPageHeader title="Calendrier" />

            <Animated.View entering={FadeInDown.duration(260)} style={styles.hero}>
              <View style={styles.heroIcon}>
                <CalendarPlus size={32} weight="duotone" color={COLORS.secondaryDark} />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle} selectable={false}>Reperes visuels</Text>
                <Text style={styles.heroSubtitle} selectable={false}>
                  Evenements, dodos et routines suggerees restent sur cet appareil.
                </Text>
              </View>
            </Animated.View>

            <WeekStrip
              days={weekDays}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            <View style={styles.grid}>
              <Card style={styles.formCard} elevated>
                <View style={styles.sectionHeading}>
                  <Sparkle size={20} weight="fill" color={COLORS.primary} />
                  <Text style={styles.sectionTitle} selectable={false}>Nouvel evenement</Text>
                </View>

                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ex : Anniversaire de Lina"
                  placeholderTextColor={COLORS.textLight}
                  style={styles.input}
                />
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Petit detail pour les parents"
                  placeholderTextColor={COLORS.textLight}
                  style={[styles.input, styles.multiline]}
                  multiline
                />

                <View style={styles.inputRow}>
                  <TextInput
                    value={date}
                    onChangeText={setDate}
                    placeholder="AAAA-MM-JJ"
                    placeholderTextColor={COLORS.textLight}
                    style={[styles.input, styles.inputGrow]}
                  />
                  <TextInput
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="08:30"
                    placeholderTextColor={COLORS.textLight}
                    style={[styles.input, styles.timeInput]}
                  />
                </View>

                <ChipSection title="Type">
                  {EVENT_KINDS.map((kind) => (
                    <ChoiceChip
                      key={kind.key}
                      label={`${kind.icon} ${kind.label}`}
                      selected={selectedKind === kind.key}
                      color={kind.color}
                      onPress={() => chooseKind(kind.key)}
                    />
                  ))}
                </ChipSection>

                <ChipSection title="Enfants">
                  {children.map((child) => (
                    <ChoiceChip
                      key={child.id}
                      label={formatChildName(child.name)}
                      selected={selectedChildIds.includes(child.id)}
                      color={child.color}
                      onPress={() => toggleChild(child.id)}
                    />
                  ))}
                </ChipSection>

                <ChipSection title="Pictogramme">
                  {ICON_CHOICES.map((icon) => (
                    <ChoiceChip
                      key={icon}
                      label={icon}
                      selected={selectedIcon === icon}
                      color={selectedColor}
                      onPress={() => setSelectedIcon(icon)}
                      compact
                    />
                  ))}
                </ChipSection>

                <ChipSection title="Couleur">
                  {COLOR_CHOICES.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      activeOpacity={0.85}
                      style={[
                        styles.swatch,
                        { backgroundColor: color },
                        selectedColor === color && styles.swatchSelected,
                      ]}
                    />
                  ))}
                </ChipSection>

                <ChipSection title="Routines suggerees">
                  {routines.map((routine) => (
                    <ChoiceChip
                      key={routine.id}
                      label={`${routine.icon} ${routine.name}`}
                      selected={selectedRoutineIds.includes(routine.id)}
                      color={routine.color}
                      onPress={() => toggleRoutine(routine.id)}
                    />
                  ))}
                </ChipSection>

                <Button title="Ajouter au calendrier" icon="📅" onPress={handleAddEvent} color={COLORS.secondary} />
              </Card>

              <Card style={styles.listCard} elevated>
                <View style={styles.sectionHeading}>
                  <Text style={styles.sectionIcon} selectable={false}>🗓️</Text>
                  <Text style={styles.sectionTitle} selectable={false}>Jour selectionne</Text>
                </View>
                <View style={styles.eventList}>
                  {eventsForSelectedDate.length > 0 ? (
                    eventsForSelectedDate.map((event) => (
                      <View key={event.id} style={styles.eventRow}>
                        <View style={styles.eventBubbleWrap}>
                          <EventBubble event={event} compact />
                        </View>
                        <TouchableOpacity
                          onPress={() => void handleDelete(event)}
                          style={styles.deleteButton}
                          activeOpacity={0.82}
                        >
                          <Trash size={18} weight="bold" color={COLORS.error} />
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyDay}>
                      <Text style={styles.emptyIcon} selectable={false}>🌈</Text>
                      <Text style={styles.emptyText} selectable={false}>Aucun evenement ce jour.</Text>
                    </View>
                  )}
                </View>
              </Card>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function ChipSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.chipSection}>
      <Text style={styles.chipTitle} selectable={false}>{title}</Text>
      <View style={styles.chipRow}>{children}</View>
    </View>
  );
}

function ChoiceChip({
  label,
  selected,
  color,
  compact,
  onPress,
}: {
  label: string;
  selected: boolean;
  color: string;
  compact?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.84}
      style={[
        styles.chip,
        compact && styles.chipCompact,
        selected && { backgroundColor: color, borderColor: color },
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={1} selectable={false}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  content: {
    gap: SPACING.md,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.xl + 6,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.secondarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  heroTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  formCard: {
    flexGrow: 1,
    flexBasis: 420,
    gap: SPACING.md,
  },
  listCard: {
    flexGrow: 1,
    flexBasis: 320,
    gap: SPACING.md,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.text,
  },
  input: {
    minHeight: 54,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  multiline: {
    minHeight: 82,
    paddingTop: SPACING.md,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  inputGrow: {
    flex: 1,
    minWidth: 190,
  },
  timeInput: {
    width: 130,
  },
  chipSection: {
    gap: SPACING.xs,
  },
  chipTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    minHeight: 42,
    maxWidth: '100%',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipCompact: {
    minWidth: 44,
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  chipText: {
    maxWidth: 210,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  swatch: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  swatchSelected: {
    borderColor: COLORS.text,
    transform: [{ scale: 1.06 }],
  },
  eventList: {
    gap: SPACING.sm,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  eventBubbleWrap: {
    flex: 1,
  },
  deleteButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3CACA',
  },
  emptyDay: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.xl,
  },
  emptyIcon: {
    fontSize: 34,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
});
