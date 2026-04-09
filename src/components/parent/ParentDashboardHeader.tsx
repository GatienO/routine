import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { MagnifyingGlass, SlidersHorizontal } from 'phosphor-react-native';
import { Avatar } from '../ui/Avatar';
import { OpenMoji } from '../ui/OpenMoji';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { Child, RoutineCategory } from '../../types';
import { HomeIcon, CatalogIcon, AddIcon, ChildProfileIcon, GiftIcon, StatsIcon, ImportIcon, TrashIcon } from '../ui/ModernIcons';

const WEB_SEARCH_INPUT_RESET = Platform.OS === 'web'
  ? ({ outlineWidth: 0, borderWidth: 0 } as const)
  : undefined;

export type ChildScope = 'all' | string;
export type StatusFilter = 'all' | 'active' | 'inactive';
export type CategoryFilter = 'all' | RoutineCategory;

const STATUS_FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: 'Toutes' },
  { key: 'active', label: 'Actives' },
  { key: 'inactive', label: 'Inactives' },
];

const CATEGORY_FILTERS: Array<{ key: CategoryFilter; label: string }> = [
  { key: 'all', label: 'Toutes' },
  { key: 'morning', label: 'Matin' },
  { key: 'evening', label: 'Soir' },
  { key: 'school', label: 'Ecole' },
  { key: 'home', label: 'Maison' },
  { key: 'weekend', label: 'Week-end' },
  { key: 'custom', label: 'Custom' },
];

export const ParentDashboardHeader = memo(function ParentDashboardHeader({
  children,
  selectedChildScope,
  onSelectChildScope,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onLogout,
  onGoToCatalog,
  onGoToAddRoutine,
  onGoToChildren,
  onGoToRewards,
  onGoToStats,
  onGoToImport,
  onGoToTrash,
}: {
  children: Child[];
  selectedChildScope: ChildScope;
  onSelectChildScope: (scope: ChildScope) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  categoryFilter: CategoryFilter;
  onCategoryFilterChange: (value: CategoryFilter) => void;
  onLogout: () => void;
  onGoToCatalog: () => void;
  onGoToAddRoutine: () => void;
  onGoToChildren: () => void;
  onGoToRewards: () => void;
  onGoToStats: () => void;
  onGoToImport: () => void;
  onGoToTrash: () => void;
}) {
  return (
    <View>
      <View style={styles.header}>
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
          label="Recompenses"
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
      </View>

      <View style={styles.sectionHeaderCompact}>
        <Text style={styles.sectionTitle}>Routines</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.focusChips}>
        <FocusChip
          label="Tous"
          selected={selectedChildScope === 'all'}
          onPress={() => onSelectChildScope('all')}
        />
        {children.map((child) => (
          <FocusChip
            key={child.id}
            label={child.name}
            child={child}
            selected={selectedChildScope === child.id}
            onPress={() => onSelectChildScope(child.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.searchBox}>
        <MagnifyingGlass size={18} weight="bold" color={COLORS.textLight} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Rechercher une routine, une etape..."
          placeholderTextColor={COLORS.textLight}
          style={[styles.searchInput, WEB_SEARCH_INPUT_RESET]}
        />
      </View>

      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <SlidersHorizontal size={16} weight="bold" color={COLORS.textSecondary} />
          <Text style={styles.filterHeaderText}>Filtres</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {STATUS_FILTERS.map((filter) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              selected={statusFilter === filter.key}
              onPress={() => onStatusFilterChange(filter.key)}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {CATEGORY_FILTERS.map((filter) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              selected={categoryFilter === filter.key}
              onPress={() => onCategoryFilterChange(filter.key)}
            />
          ))}
        </ScrollView>
      </View>
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
          backgroundColor: child ? child.color + '22' : COLORS.secondary + '22',
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

const FilterChip = memo(function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.filterChip, selected && styles.filterChipSelected]}>
      <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  title: {
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
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
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
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    paddingVertical: 0,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  filterHeaderText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterRow: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  filterChip: {
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  filterChipSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  filterChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterChipTextSelected: {
    color: '#FFF',
  },
});
