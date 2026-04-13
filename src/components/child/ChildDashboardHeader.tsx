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
import { CaretDown, CaretUp, Check, MagnifyingGlass } from 'phosphor-react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { RoutineCategory } from '../../types';

const WEB_SEARCH_INPUT_RESET = Platform.OS === 'web'
  ? ({ outlineWidth: 0, borderWidth: 0 } as const)
  : undefined;

export type CategoryFilterValue = RoutineCategory;

const CATEGORY_FILTERS: Array<{ key: CategoryFilterValue; label: string }> = [
  { key: 'morning', label: 'Matin' },
  { key: 'evening', label: 'Soir' },
  { key: 'school', label: 'Ecole' },
  { key: 'home', label: 'Maison' },
  { key: 'weekend', label: 'Week-end' },
  { key: 'custom', label: 'Custom' },
];

export type StatusFilterValue = 'active' | 'inactive';
export type FavoriteFilterValue = 'all' | 'favorites' | 'others';

const STATUS_FILTERS: Array<{ key: StatusFilterValue; label: string }> = [
  { key: 'active', label: 'Actives' },
  { key: 'inactive', label: 'Inactives' },
];

const FAVORITE_FILTERS: Array<{ key: FavoriteFilterValue; label: string }> = [
  { key: 'all', label: 'Tous' },
  { key: 'favorites', label: 'Favoris' },
  { key: 'others', label: 'Non-favoris' },
];

export const ChildDashboardHeader = memo(function ChildDashboardHeader({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  selectedStatuses,
  onToggleStatus,
  onClearStatuses,
  selectedFavorite,
  onToggleFavorite,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategories: CategoryFilterValue[];
  onToggleCategory: (value: CategoryFilterValue) => void;
  onClearCategories: () => void;
  selectedStatuses: StatusFilterValue[];
  onToggleStatus: (value: StatusFilterValue) => void;
  onClearStatuses: () => void;
  selectedFavorite: FavoriteFilterValue;
  onToggleFavorite: (value: FavoriteFilterValue) => void;
}) {
  const { width } = useWindowDimensions();
  const [openDropdown, setOpenDropdown] = useState<'category' | 'status' | 'favorite' | null>(null);
  const [dropdownAnchor, setDropdownAnchor] = useState<{ x: number; y: number; width: number } | null>(null);
  const categoryButtonRef = useRef<any>(null);
  const statusButtonRef = useRef<any>(null);
  const favoriteButtonRef = useRef<any>(null);
  const isCompactViewport = width < 1040;

  const openAnchoredDropdown = (key: 'category' | 'status' | 'favorite') => {
    const targetRef = key === 'category' ? categoryButtonRef : key === 'status' ? statusButtonRef : favoriteButtonRef;
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
      <View style={styles.filterControlsRow}>
        <View style={styles.searchControl}>
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
          style={styles.dropdownControl}
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
          style={styles.dropdownControl}
          buttonRef={statusButtonRef}
        />

        <MultiSelectDropdown
          title="Favoris"
          options={FAVORITE_FILTERS}
          selectedValues={[selectedFavorite]}
          isOpen={openDropdown === 'favorite'}
          allLabel="Tous"
          isSingle={true}
          onToggleOpen={() => {
            if (openDropdown === 'favorite') {
              closeDropdown();
            } else {
              openAnchoredDropdown('favorite');
            }
          }}
          onToggleValue={(value) => {
            onToggleFavorite(value as FavoriteFilterValue);
            closeDropdown();
          }}
          onClear={() => {
            onToggleFavorite('all');
            closeDropdown();
          }}
          style={styles.dropdownControl}
          buttonRef={favoriteButtonRef}
        />
      </View>

      <DropdownPortal
        visible={openDropdown !== null}
        anchor={dropdownAnchor}
        title={openDropdown === 'status' ? 'Etat' : openDropdown === 'favorite' ? 'Favoris' : 'Moment'}
        options={
          openDropdown === 'status'
            ? STATUS_FILTERS
            : openDropdown === 'favorite'
            ? FAVORITE_FILTERS
            : CATEGORY_FILTERS
        }
        selectedValues={
          openDropdown === 'status'
            ? selectedStatuses
            : openDropdown === 'favorite'
            ? [selectedFavorite]
            : selectedCategories
        }
        allLabel={
          openDropdown === 'status'
            ? 'Toutes les routines'
            : openDropdown === 'favorite'
            ? 'Tous'
            : 'Tous les moments'
        }
        isSingle={openDropdown === 'favorite'}
        onToggleValue={(value) => {
          if (openDropdown === 'status') {
            onToggleStatus(value as StatusFilterValue);
          } else if (openDropdown === 'favorite') {
            onToggleFavorite(value as FavoriteFilterValue);
            closeDropdown();
          } else if (openDropdown === 'category') {
            onToggleCategory(value as CategoryFilterValue);
          }
        }}
        onClear={() => {
          if (openDropdown === 'status') {
            onClearStatuses();
          } else if (openDropdown === 'favorite') {
            onToggleFavorite('all');
            closeDropdown();
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
  isSingle,
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
  }, [allLabel, options, selectedValues, isSingle]);

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

  const menuWidth = Math.max(220, Math.min(anchor?.width ?? 260, 320));
  const menuLeft = anchor?.x ?? 0;
  const menuTop = anchor?.y ?? 0;
  const allSelected = isSingle ? false : selectedValues.length === 0 || selectedValues.length === options.length;

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
  filterControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
    marginTop: 0,
  },
  searchControl: {
    flex: 1.6,
    minWidth: 280,
  },
  dropdownControl: {
    flex: 1,
    minWidth: 210,
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
    minHeight: 44,
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
    minHeight: 44,
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
