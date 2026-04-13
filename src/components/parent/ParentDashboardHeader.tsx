import React, { memo, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  useWindowDimensions,
  Modal,
  Pressable,
} from 'react-native';
import { CaretDown, CaretLeft, CaretUp, Check, CloudSun, MagnifyingGlass } from 'phosphor-react-native';
import { Avatar } from '../ui/Avatar';
import { OpenMoji } from '../ui/OpenMoji';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { Child, RoutineCategory } from '../../types';
import {
  HomeIcon,
  CatalogIcon,
  AddIcon,
  ChildProfileIcon,
  GiftIcon,
  StatsIcon,
  ImportIcon,
  TrashIcon,
} from '../ui/ModernIcons';
import { formatChildName } from '../../utils/children';

const WEB_SEARCH_INPUT_RESET = Platform.OS === 'web'
  ? ({ outlineWidth: 0, borderWidth: 0 } as const)
  : undefined;

export type StatusFilterValue = 'active' | 'inactive';
export type CategoryFilterValue = RoutineCategory;
export type SortMode = 'recent' | 'alphabetical';

const STATUS_FILTERS: Array<{ key: StatusFilterValue; label: string }> = [
  { key: 'active', label: 'Actives' },
  { key: 'inactive', label: 'Inactives' },
];

const CATEGORY_FILTERS: Array<{ key: CategoryFilterValue; label: string }> = [
  { key: 'morning', label: 'Matin' },
  { key: 'evening', label: 'Soir' },
  { key: 'school', label: 'Ecole' },
  { key: 'home', label: 'Maison' },
  { key: 'weekend', label: 'Week-end' },
  { key: 'emotion', label: 'Emotions' },
  { key: 'custom', label: 'Custom' },
];

export const ParentDashboardHeader = memo(function ParentDashboardHeader({
  children,
  selectedChildIds,
  onToggleChild,
  onClearChildSelection,
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onToggleStatus,
  onClearStatuses,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  onGoBack,
  onLogout,
  onGoToCatalog,
  onGoToAddRoutine,
  onGoToChildren,
  onGoToRewards,
  onGoToStats,
  onGoToImport,
  onGoToTrash,
  onOpenProfile,
  onOpenWeatherSettings,
  routinesExpanded,
  onToggleRoutinesExpanded,
  sortMode,
  onToggleSortMode,
}: {
  children: Child[];
  selectedChildIds: string[];
  onToggleChild: (childId: string) => void;
  onClearChildSelection: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatuses: StatusFilterValue[];
  onToggleStatus: (value: StatusFilterValue) => void;
  onClearStatuses: () => void;
  selectedCategories: CategoryFilterValue[];
  onToggleCategory: (value: CategoryFilterValue) => void;
  onClearCategories: () => void;
  onGoBack: () => void;
  onLogout: () => void;
  onGoToCatalog: () => void;
  onGoToAddRoutine: () => void;
  onGoToChildren: () => void;
  onGoToRewards: () => void;
  onGoToStats: () => void;
  onGoToImport: () => void;
  onGoToTrash: () => void;
  onOpenProfile: () => void;
  onOpenWeatherSettings: () => void;
  routinesExpanded: boolean;
  onToggleRoutinesExpanded: () => void;
  sortMode: SortMode;
  onToggleSortMode: () => void;
}) {
  const { width } = useWindowDimensions();
  const [openDropdown, setOpenDropdown] = useState<'status' | 'category' | null>(null);
  const [dropdownAnchor, setDropdownAnchor] = useState<{ x: number; y: number; width: number } | null>(null);
  const statusButtonRef = useRef<any>(null);
  const categoryButtonRef = useRef<any>(null);
  const isCompactViewport = width < 1040;

  const openAnchoredDropdown = (key: 'status' | 'category') => {
    const targetRef = key === 'status' ? statusButtonRef : categoryButtonRef;
    const targetNode = targetRef.current as unknown as {
      measureInWindow?: (callback: (x: number, y: number, width: number, height: number) => void) => void;
    } | null;

    if (targetNode?.measureInWindow) {
      targetNode.measureInWindow((x, y, measuredWidth, measuredHeight) => {
        setDropdownAnchor({ x, y: y + measuredHeight + 8, width: measuredWidth });
        setOpenDropdown(key);
      });
      return;
    }

    setDropdownAnchor(null);
    setOpenDropdown(key);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
    setDropdownAnchor(null);
  };

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.homeButton}>
          <CaretLeft size={22} weight="bold" color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Espace Parent</Text>
        <TouchableOpacity onPress={onLogout} style={styles.homeButton}>
          <HomeIcon size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <QuickActionTile
          label="Catalogue routines"
          onPress={onGoToCatalog}
          icon={<CatalogIcon size={18} color="#A14D00" />}
          backgroundColor="#FFF3E0"
          color="#A14D00"
        />
        <QuickActionTile
          label="Créer une routine"
          onPress={onGoToAddRoutine}
          icon={<AddIcon size={18} color="#B3261E" />}
          backgroundColor="#FDECEC"
          color="#B3261E"
        />
        <QuickActionTile
          label="Enfants"
          onPress={onGoToChildren}
          icon={<ChildProfileIcon size={18} color="#C05A00" />}
          backgroundColor="#FFF1E6"
          color="#C05A00"
        />
        <QuickActionTile
          label="Récompenses"
          onPress={onGoToRewards}
          icon={<GiftIcon size={18} color="#2E7D32" />}
          backgroundColor="#E8F5E9"
          color="#2E7D32"
        />
        <QuickActionTile
          label="Statistiques"
          onPress={onGoToStats}
          icon={<StatsIcon size={18} color="#1565C0" />}
          backgroundColor="#E3F2FD"
          color="#1565C0"
        />
        <QuickActionTile
          label="Importer routine"
          onPress={onGoToImport}
          icon={<ImportIcon size={18} color="#6A1B9A" />}
          backgroundColor="#F3E5F5"
          color="#6A1B9A"
        />
        <QuickActionTile
          label="Corbeille"
          onPress={onGoToTrash}
          icon={<TrashIcon size={18} color="#B23A48" />}
          backgroundColor="#FDECEF"
          color="#B23A48"
        />
        <QuickActionTile
          label="Profil local"
          onPress={onOpenProfile}
          icon={<OpenMoji emoji="🪪" size={18} />}
          backgroundColor="#EEF6FF"
          color="#2D6A9F"
        />
        <QuickActionTile
          label="Météo"
          onPress={onOpenWeatherSettings}
          icon={<CloudSun size={18} color="#157A8A" weight="bold" />}
          backgroundColor="#E7F9FC"
          color="#157A8A"
        />
      </View>

      <View style={styles.sectionHeaderCompact}>
        <Text style={styles.sectionTitle}>Routines</Text>
        <View style={styles.sectionHeaderActions}>
          <TouchableOpacity
            onPress={onToggleRoutinesExpanded}
            style={styles.expandButton}
            activeOpacity={0.82}
          >
            <Text style={styles.expandButtonText}>{routinesExpanded ? 'Masquer' : 'Afficher'}</Text>
            {routinesExpanded ? (
              <CaretUp size={16} weight="bold" color={COLORS.textSecondary} />
            ) : (
              <CaretDown size={16} weight="bold" color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onToggleSortMode}
            style={styles.sortButton}
            activeOpacity={0.82}
          >
            <Text style={styles.sortButtonLabel}>Tri</Text>
            <Text style={styles.sortButtonValue}>
              {sortMode === 'recent' ? 'Recents' : 'Alphabetique'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {routinesExpanded ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.focusChips}>
            <FocusChip
              label="Tous"
              selected={selectedChildIds.length === 0}
              onPress={onClearChildSelection}
            />
            {children.map((child) => (
              <FocusChip
                key={child.id}
                label={formatChildName(child.name)}
                child={child}
                selected={selectedChildIds.includes(child.id)}
                onPress={() => onToggleChild(child.id)}
              />
            ))}
          </ScrollView>

          <View style={[styles.filterControlsRow, isCompactViewport && styles.filterControlsRowCompact]}>
            <View style={[styles.searchControl, isCompactViewport && styles.searchControlCompact]}>
              <View style={styles.searchBox}>
                <MagnifyingGlass size={18} weight="bold" color={COLORS.textLight} />
                <TextInput
                  value={searchQuery}
                  onChangeText={(value) => {
                    setOpenDropdown(null);
                    onSearchChange(value);
                  }}
                  placeholder="Rechercher une routine, une etape..."
                  placeholderTextColor={COLORS.textLight}
                  style={[styles.searchInput, WEB_SEARCH_INPUT_RESET]}
                />
              </View>
            </View>



            <MultiSelectDropdown
              title="Moment"
              options={CATEGORY_FILTERS}
              selectedValues={selectedCategories}
              isOpen={openDropdown === 'category'}
              allLabel="Moment de la journée"
              onToggleOpen={() => {
                if (openDropdown === 'category') {
                  closeDropdown();
                } else {
                  openAnchoredDropdown('category');
                }
              }}
              onToggleValue={(value) => onToggleCategory(value as CategoryFilterValue)}
              onClear={onClearCategories}
              style={[styles.dropdownControl, isCompactViewport && styles.dropdownControlCompact]}
              buttonRef={categoryButtonRef}
            />
            <MultiSelectDropdown
              title="Etat"
              options={STATUS_FILTERS}
              selectedValues={selectedStatuses}
              isOpen={openDropdown === 'status'}
              allLabel="Toutes les routines"
              onToggleOpen={() => {
                if (openDropdown === 'status') {
                  closeDropdown();
                } else {
                  openAnchoredDropdown('status');
                }
              }}
              onToggleValue={(value) => onToggleStatus(value as StatusFilterValue)}
              onClear={onClearStatuses}
              style={[styles.dropdownControl, isCompactViewport && styles.dropdownControlCompact]}
              buttonRef={statusButtonRef}
            />

          </View>
        </>
      ) : (
        <View style={styles.collapsedHint}>
          <Text style={styles.collapsedHintText}>Section routines reduite</Text>
        </View>
      )}

      <DropdownPortal
        visible={routinesExpanded && openDropdown !== null}
        anchor={dropdownAnchor}
        title={openDropdown === 'status' ? 'Etat' : 'Moment'}
        options={openDropdown === 'status' ? STATUS_FILTERS : CATEGORY_FILTERS}
        selectedValues={openDropdown === 'status' ? selectedStatuses : selectedCategories}
        allLabel={openDropdown === 'status' ? 'Tous les etats' : 'Tous les moments'}
        onToggleValue={(value) => {
          if (openDropdown === 'status') {
            onToggleStatus(value as StatusFilterValue);
          } else if (openDropdown === 'category') {
            onToggleCategory(value as CategoryFilterValue);
          }
        }}
        onClear={() => {
          if (openDropdown === 'status') {
            onClearStatuses();
          } else if (openDropdown === 'category') {
            onClearCategories();
          }
          closeDropdown();
        }}
        onClose={closeDropdown}
      />
    </View>
  );
});

const QuickActionTile = memo(function QuickActionTile({
  label,
  onPress,
  icon,
  backgroundColor,
  color,
}: {
  label: string;
  onPress: () => void;
  icon: React.ReactNode;
  backgroundColor: string;
  color: string;
}) {
  return (
    <TouchableOpacity style={[styles.actionTile, { backgroundColor }]} onPress={onPress} activeOpacity={0.75}>
      {icon}
      <Text style={[styles.actionTileLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
});

const FocusChip = memo(function FocusChip({
  label,
  child,
  selected,
  onPress,
}: {
  label: string;
  child?: Child;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.focusChip,
        selected && {
          backgroundColor: child ? `${child.color}22` : `${COLORS.secondary}22`,
          borderColor: child?.color ?? COLORS.secondary,
        },
      ]}
    >
      {child ? (
        <Avatar emoji={child.avatar} color={child.color} size={26} avatarConfig={child.avatarConfig} />
      ) : (
        <OpenMoji emoji="📚" size={18} />
      )}
      <Text style={[styles.focusChipText, selected && styles.focusChipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
});

const MultiSelectDropdown = memo(function MultiSelectDropdown({
  title,
  options,
  selectedValues,
  isOpen,
  allLabel,
  onToggleOpen,
  onToggleValue,
  onClear,
  style,
  buttonRef,
}: {
  title: string;
  options: Array<{ key: string; label: string }>;
  selectedValues: string[];
  isOpen: boolean;
  allLabel: string;
  onToggleOpen: () => void;
  onToggleValue: (value: string) => void;
  onClear: () => void;
  style?: object;
  buttonRef?: React.RefObject<any>;
}) {
  const summary = useMemo(() => {
    if (selectedValues.length === 0 || selectedValues.length === options.length) {
      return allLabel;
    }

    if (selectedValues.length === 1) {
      return options.find((option) => option.key === selectedValues[0])?.label ?? allLabel;
    }

    return `${selectedValues.length} selections`;
  }, [allLabel, options, selectedValues]);

  const allSelected = selectedValues.length === 0 || selectedValues.length === options.length;

  return (
    <View style={[styles.dropdownWrap, style, isOpen && styles.dropdownWrapOpen]}>
      <TouchableOpacity
        ref={buttonRef}
        style={[styles.dropdownButton, isOpen && styles.dropdownButtonOpen]}
        onPress={onToggleOpen}
        activeOpacity={0.85}
      >
        <Text style={styles.dropdownButtonLabel}>{title}</Text>
        <View style={styles.dropdownSummaryRow}>
          <Text style={styles.dropdownButtonValue} numberOfLines={1}>
            {summary}
          </Text>
          <CaretDown size={16} weight="bold" color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>
    </View>
  );
});

const DropdownPortal = memo(function DropdownPortal({
  visible,
  anchor,
  title,
  options,
  selectedValues,
  allLabel,
  onToggleValue,
  onClear,
  onClose,
}: {
  visible: boolean;
  anchor: { x: number; y: number; width: number } | null;
  title: string;
  options: Array<{ key: string; label: string }>;
  selectedValues: string[];
  allLabel: string;
  onToggleValue: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  if (!visible) {
    return null;
  }

  const menuWidth = Math.max(220, Math.min(anchor?.width ?? 260, 320));
  const menuLeft = anchor?.x ?? 0;
  const menuTop = anchor?.y ?? 0;
  const allSelected = selectedValues.length === 0 || selectedValues.length === options.length;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.dropdownBackdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.dropdownMenuPortal,
            {
              width: menuWidth,
              left: menuLeft,
              top: menuTop,
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={styles.dropdownMenuTitle}>{title}</Text>
          <DropdownOption label={allLabel} selected={allSelected} onPress={onClear} />
          {options.map((option) => (
            <DropdownOption
              key={option.key}
              label={option.label}
              selected={selectedValues.includes(option.key)}
              onPress={() => onToggleValue(option.key)}
            />
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const DropdownOption = memo(function DropdownOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.dropdownOption, selected && styles.dropdownOptionSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.dropdownOptionText, selected && styles.dropdownOptionTextSelected]}>{label}</Text>
      {selected ? <Check size={14} weight="bold" color="#FFF" /> : null}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.xl + 2,
    fontWeight: '900',
    color: COLORS.text,
  },
  homeButton: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  actionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  actionTileLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
  sectionHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  expandButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  sortButton: {
    minHeight: 34,
    borderRadius: RADIUS.full,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
  },
  sortButtonLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sortButtonValue: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  collapsedHint: {
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  collapsedHintText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  focusChips: {
    gap: SPACING.sm,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  focusChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  focusChipTextSelected: {
    color: COLORS.text,
  },
  filterControlsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  filterControlsRowCompact: {
    flexWrap: 'wrap',
  },
  searchControl: {
    flex: 1.6,
    minWidth: 280,
  },
  searchControlCompact: {
    minWidth: 220,
    flexBasis: '100%',
  },
  dropdownControl: {
    flex: 1,
    minWidth: 210,
  },
  dropdownControlCompact: {
    minWidth: 160,
    flexGrow: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 56,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    paddingVertical: 0,
  },
  dropdownWrap: {
    position: 'relative',
  },
  dropdownWrapOpen: {
    zIndex: 2,
  },
  dropdownButton: {
    minHeight: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    gap: 3,
  },
  dropdownButtonOpen: {
    borderColor: COLORS.secondary,
    backgroundColor: `${COLORS.secondary}08`,
  },
  dropdownButtonLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dropdownSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  dropdownButtonValue: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  dropdownBackdrop: {
    flex: 1,
  },
  dropdownMenuPortal: {
    position: 'absolute',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    paddingVertical: SPACING.xs,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    overflow: 'hidden',
  },
  dropdownMenuTitle: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dropdownOption: {
    minHeight: 40,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  dropdownOptionSelected: {
    backgroundColor: '#1FA8E0',
  },
  dropdownOptionText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  dropdownOptionTextSelected: {
    color: '#FFF',
  },
});
