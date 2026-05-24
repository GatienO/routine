import React, { memo, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  useWindowDimensions,
  Modal,
  Pressable,
} from 'react-native';
import { CaretDown, Check, MagnifyingGlass, Plus, SlidersHorizontal } from 'phosphor-react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../../constants/theme';
import { Child, RoutineCategory } from '../../types';
import { formatChildName } from '../../utils/children';

const WEB_SEARCH_INPUT_RESET = Platform.OS === 'web'
  ? ({ outlineWidth: 0, borderWidth: 0 } as const)
  : undefined;

export type CategoryFilterValue = RoutineCategory;
export type StatusFilterValue = 'active' | 'inactive';
export type FavoriteFilterValue = 'all' | 'favorites' | 'others';

const CATEGORY_FILTERS: Array<{ key: CategoryFilterValue; label: string }> = [
  { key: 'morning', label: 'Matin' },
  { key: 'evening', label: 'Soir' },
  { key: 'school', label: 'Ecole' },
  { key: 'home', label: 'Maison' },
  { key: 'weekend', label: 'Week-end' },
  { key: 'emotion', label: 'Emotions' },
  { key: 'custom', label: 'Custom' },
];

const STATUS_FILTERS: Array<{ key: StatusFilterValue; label: string }> = [
  { key: 'active', label: 'Actives' },
  { key: 'inactive', label: 'Inactives' },
];

type DropdownKey = 'children' | 'category' | 'status';

export const ChildDashboardHeader = memo(function ChildDashboardHeader({
  children,
  selectedChildIds,
  onToggleChild,
  onClearChildSelection,
  searchQuery,
  onSearchChange,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  selectedStatuses,
  onToggleStatus,
  onClearStatuses,
  onCreateRoutine,
}: {
  children: Child[];
  selectedChildIds: string[];
  onToggleChild: (childId: string) => void;
  onClearChildSelection: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategories: CategoryFilterValue[];
  onToggleCategory: (value: CategoryFilterValue) => void;
  onClearCategories: () => void;
  selectedStatuses: StatusFilterValue[];
  onToggleStatus: (value: StatusFilterValue) => void;
  onClearStatuses: () => void;
  onCreateRoutine?: () => void;
}) {
  const { width } = useWindowDimensions();
  const [showFilters, setShowFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
  const [dropdownAnchor, setDropdownAnchor] = useState<{ x: number; y: number; width: number } | null>(null);
  const childButtonRef = useRef<any>(null);
  const categoryButtonRef = useRef<any>(null);
  const statusButtonRef = useRef<any>(null);
  const isCompactViewport = width < 980;

  const childOptions = useMemo(
    () => children.map((child) => ({ key: child.id, label: formatChildName(child.name) })),
    [children],
  );

  const openAnchoredDropdown = (key: DropdownKey) => {
    const targetRef = key === 'children'
      ? childButtonRef
      : key === 'category'
        ? categoryButtonRef
      : statusButtonRef;

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

  const handleToggleFilters = () => {
    if (showFilters) {
      closeDropdown();
    }
    setShowFilters((previous) => !previous);
  };

  const handleToggleDropdown = (key: DropdownKey) => {
    if (openDropdown === key) {
      closeDropdown();
      return;
    }
    openAnchoredDropdown(key);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.searchRow}>
        <View style={styles.searchShell}>
          <MagnifyingGlass size={18} weight="bold" color="#8CA3AC" />
          <TextInput
            value={searchQuery}
            onChangeText={(value) => {
              closeDropdown();
              onSearchChange(value);
            }}
            placeholder="Rechercher une routine, une etape..."
            placeholderTextColor="#A3B4BB"
            style={[styles.searchInput, WEB_SEARCH_INPUT_RESET]}
          />
        </View>

        <TouchableOpacity
          onPress={handleToggleFilters}
          activeOpacity={0.84}
          style={[styles.filtersButton, showFilters && styles.filtersButtonActive]}
        >
          <SlidersHorizontal
            size={18}
            weight="bold"
            color={showFilters ? '#FFFFFF' : '#5E7B86'}
          />
          <Text style={[styles.filtersButtonText, showFilters && styles.filtersButtonTextActive]}>
            Filtres
          </Text>
        </TouchableOpacity>

        {onCreateRoutine ? (
          <TouchableOpacity
            onPress={onCreateRoutine}
            activeOpacity={0.84}
            style={styles.createButton}
          >
            <Plus size={18} weight="bold" color="#FFFFFF" />
            <Text style={styles.createButtonText}>Creer</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {showFilters ? (
        <View style={[styles.filtersPanel, isCompactViewport && styles.filtersPanelCompact]}>
          <MultiSelectDropdown
            title="Enfants"
            options={childOptions}
            selectedValues={selectedChildIds}
            isOpen={openDropdown === 'children'}
            allLabel="Tous les enfants"
            onToggleOpen={() => handleToggleDropdown('children')}
            onToggleValue={onToggleChild}
            onClear={onClearChildSelection}
            style={styles.dropdownControl}
            buttonRef={childButtonRef}
          />
          <MultiSelectDropdown
            title="Moment"
            options={CATEGORY_FILTERS}
            selectedValues={selectedCategories}
            isOpen={openDropdown === 'category'}
            allLabel="Tous les moments"
            onToggleOpen={() => handleToggleDropdown('category')}
            onToggleValue={(value) => onToggleCategory(value as CategoryFilterValue)}
            onClear={onClearCategories}
            style={styles.dropdownControl}
            buttonRef={categoryButtonRef}
          />
          <MultiSelectDropdown
            title="Etat"
            options={STATUS_FILTERS}
            selectedValues={selectedStatuses}
            isOpen={openDropdown === 'status'}
            allLabel="Toutes les routines"
            onToggleOpen={() => handleToggleDropdown('status')}
            onToggleValue={(value) => onToggleStatus(value as StatusFilterValue)}
            onClear={onClearStatuses}
            style={styles.dropdownControl}
            buttonRef={statusButtonRef}
          />
        </View>
      ) : null}

      <DropdownPortal
        visible={showFilters && openDropdown !== null}
        anchor={dropdownAnchor}
        title={
          openDropdown === 'children'
            ? 'Enfants'
            : openDropdown === 'status'
              ? 'Etat'
              : 'Moment'
        }
        options={
          openDropdown === 'children'
            ? childOptions
            : openDropdown === 'status'
              ? STATUS_FILTERS
              : CATEGORY_FILTERS
        }
        selectedValues={
          openDropdown === 'children'
            ? selectedChildIds
            : openDropdown === 'status'
              ? selectedStatuses
              : selectedCategories
        }
        allLabel={
          openDropdown === 'children'
            ? 'Tous les enfants'
            : openDropdown === 'status'
              ? 'Toutes les routines'
              : 'Tous les moments'
        }
        onToggleValue={(value) => {
          if (openDropdown === 'children') {
            onToggleChild(value);
          } else if (openDropdown === 'status') {
            onToggleStatus(value as StatusFilterValue);
          } else if (openDropdown === 'category') {
            onToggleCategory(value as CategoryFilterValue);
          }
        }}
        onClear={() => {
          if (openDropdown === 'children') {
            onClearChildSelection();
          } else if (openDropdown === 'status') {
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

const MultiSelectDropdown = memo(function MultiSelectDropdown({
  title,
  options,
  selectedValues,
  isOpen,
  allLabel,
  isSingle = false,
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
  isSingle?: boolean;
  onToggleOpen: () => void;
  onToggleValue: (value: string) => void;
  onClear: () => void;
  style?: object;
  buttonRef?: React.RefObject<any>;
}) {
  const summary = useMemo(() => {
    if (isSingle) {
      return options.find((option) => option.key === selectedValues[0])?.label ?? allLabel;
    }

    if (selectedValues.length === 0 || selectedValues.length === options.length) {
      return allLabel;
    }

    if (selectedValues.length === 1) {
      return options.find((option) => option.key === selectedValues[0])?.label ?? allLabel;
    }

    return `${selectedValues.length} selections`;
  }, [allLabel, isSingle, options, selectedValues]);

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
          <CaretDown size={16} weight="bold" color="#6F8A93" />
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
  isSingle,
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
  isSingle?: boolean;
  onToggleValue: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  if (!visible) {
    return null;
  }

  const menuWidth = Math.max(220, Math.min(anchor?.width ?? 260, 340));
  const menuLeft = anchor?.x ?? 0;
  const menuTop = anchor?.y ?? 0;
  const allSelected = !isSingle && (selectedValues.length === 0 || selectedValues.length === options.length);

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
      <Text style={[styles.dropdownOptionText, selected && styles.dropdownOptionTextSelected]}>
        {label}
      </Text>
      {selected ? <Check size={14} weight="bold" color="#FFFFFF" /> : null}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchShell: {
    flex: 1,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 22,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#DCEAE3',
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    paddingVertical: 0,
  },
  filtersButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md + 2,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#DCEAE3',
  },
  filtersButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  filtersButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: '#5E7B86',
  },
  filtersButtonTextActive: {
    color: '#FFFFFF',
  },
  createButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md + 2,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  createButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  filtersPanel: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(220,234,227,0.92)',
  },
  filtersPanelCompact: {
    flexWrap: 'wrap',
  },
  dropdownControl: {
    flex: 1,
    minWidth: 200,
  },
  dropdownWrap: {
    position: 'relative',
  },
  dropdownWrapOpen: {
    zIndex: 2,
  },
  dropdownButton: {
    minHeight: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: '#DFEAE5',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    gap: 4,
  },
  dropdownButtonOpen: {
    borderColor: COLORS.secondary,
    backgroundColor: '#F4FBF8',
  },
  dropdownButtonLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#A3B4BB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCEAE3',
    paddingVertical: SPACING.xs,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  dropdownMenuTitle: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
    fontSize: 11,
    fontWeight: '900',
    color: '#A3B4BB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownOption: {
    minHeight: 44,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  dropdownOptionSelected: {
    backgroundColor: COLORS.secondary,
  },
  dropdownOptionText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  dropdownOptionTextSelected: {
    color: '#FFFFFF',
  },
});
