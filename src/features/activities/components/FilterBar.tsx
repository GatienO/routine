import { useState } from "react";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useAppTheme } from "../../../hooks/useAppTheme";
import type {
  ActivityFilters,
  DevelopmentGoalGroup,
  MaterialGroup,
  ParentMood
} from "../types";
import {
  AGE_RANGES,
  ACTIVITY_TYPE_OPTIONS,
  CLEANUP_TIME_OPTIONS,
  DEVELOPMENT_GOAL_GROUP_OPTIONS,
  DURATION_OPTIONS,
  ENERGY_OPTIONS,
  MATERIAL_GROUP_OPTIONS,
  MESS_OPTIONS,
  NOISE_OPTIONS,
  PARENT_MOOD_OPTIONS,
  PLAYER_COUNT_OPTIONS,
  SEASON_OPTIONS,
  SETUP_TIME_OPTIONS,
  SKILL_OPTIONS,
  SMART_FILTER_OPTIONS,
  WEATHER_OPTIONS
} from "../options";
import { ResponsiveOverlay } from "../../../components/ui/ResponsiveOverlay";
import { SlidersHorizontal, Sparkle, CaretDown, CaretUp } from "phosphor-react-native";
import { useFocusRing } from "../../../hooks/useFocusRing";

type FilterBarProps = {
  filters: ActivityFilters;
  resultCount: number;
  onChange: (filters: Partial<ActivityFilters>) => void;
  onReset: () => void;
  onSurprise?: () => void;
};

type CategoryId =
  | "suggested"
  | "moment"
  | "format"
  | "type"
  | "age"
  | "time"
  | "materials"
  | "parent"
  | "weather"
  | "mess"
  | "autonomy"
  | "development";

type FilterCategory = {
  id: CategoryId;
  label: string;
  count: number;
};

const FILTER_GROUPS: { id: string; label: string; categories: CategoryId[] }[] = [
  { id: 'moment', label: 'Le moment', categories: ['moment', 'time', 'weather'] },
  { id: 'participants', label: 'Les participants', categories: ['format', 'age', 'autonomy'] },
  { id: 'parent', label: 'Le parent et le matériel', categories: ['parent', 'materials', 'mess'] },
  { id: 'envies', label: 'Envies et découvertes', categories: ['suggested', 'type', 'development'] },
];
export function FilterBar({ filters, resultCount, onChange, onReset, onSurprise }: FilterBarProps) {
  const { colors } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>('moment');
  const categories = getFilterCategories(filters);
  const count = getActiveFilterCount(filters);
  return <View style={{ gap: 12 }}>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <View style={{ flex: 1 }}><ToolbarButton label={count ? 'Filtres · ' + count : 'Filtres'} selected={expanded} icon={<SlidersHorizontal size={20} color={colors.text} />} onPress={() => setExpanded(true)} /></View>
      {onSurprise ? <View style={{ flex: 1 }}><ToolbarButton label="Surprise" icon={<Sparkle size={20} color={colors.text} />} onPress={onSurprise} /></View> : null}
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 20 }}>
      <Text accessibilityLiveRegion="polite" style={{ color: colors.textSecondary, fontSize: 13 }}>{resultCount} idée{resultCount > 1 ? 's' : ''}</Text>
      {count || filters.search ? <ToolbarButton label="Effacer" onPress={onReset} tone="ghost" /> : null}
    </View>
    <ResponsiveOverlay visible={expanded} title="Affiner les idées" onClose={() => setExpanded(false)} footer={<ToolbarButton label={'Voir ' + resultCount + ' idées'} onPress={() => setExpanded(false)} />}>
      <ToolbarButton label="Effacer les filtres" onPress={onReset} tone="ghost" />
      {FILTER_GROUPS.map(group => <View key={group.id} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' }}>
        <Pressable aria-expanded={openGroup === group.id} accessibilityRole="button" accessibilityState={{ expanded: openGroup === group.id }} onPress={() => setOpenGroup(openGroup === group.id ? null : group.id)} style={{ minHeight: 48, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: colors.text }}>{group.label}</Text>{openGroup === group.id ? <CaretUp color={colors.text} /> : <CaretDown color={colors.text} />}
        </Pressable>
        {openGroup === group.id ? <View style={{ padding: 14, gap: 24 }}>{group.categories.map(id => <View key={id} style={{ gap: 12 }}><Text accessibilityRole="header" style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{categories.find(category => category.id === id)?.label}</Text>{renderCategoryContent(id, filters, onChange)}</View>)}</View> : null}
      </View>)}
    </ResponsiveOverlay>
  </View>;
}

function renderCategoryContent(
  categoryId: CategoryId,
  filters: ActivityFilters,
  onChange: (filters: Partial<ActivityFilters>) => void
) {
  const toggleScalar = <K extends keyof ActivityFilters>(key: K, value: ActivityFilters[K]) => {
    const selected = filters[key] === value;
    onChange({ [key]: selected ? undefined : value } as Partial<ActivityFilters>);
  };

  const toggleArray = <K extends "materialGroups" | "parentMood" | "developmentGoalGroups" | "skills" | "activityTypes">(
    key: K,
    value: NonNullable<ActivityFilters[K]>[number]
  ) => {
    const current = filters[key] ?? [];
    const selected = current.includes(value as never);
    onChange({
      [key]: selected ? current.filter((item) => item !== value) : [...current, value]
    } as Partial<ActivityFilters>);
  };

  if (categoryId === "suggested") {
    return (
      <FilterContentGroup>
        <PillGrid>
          <SelectionPill
            label="Groupe"
            selected={filters.groupActivity === true}
            onPress={() => toggleScalar("groupActivity", true)}
          />
          <SelectionPill
            label="Solo"
            selected={filters.groupActivity === false}
            onPress={() => toggleScalar("groupActivity", false)}
          />
          <SelectionPill
            label="Sans préparation"
            selected={filters.setupTimeMax === 0}
            onPress={() => toggleScalar("setupTimeMax", 0)}
          />
          <SelectionPill
            label="Parent KO"
            selected={filters.parentEnergy === "ko"}
            onPress={() => toggleScalar("parentEnergy", "ko")}
          />
          <SelectionPill
            label="Autonome"
            selected={filters.independenceLevel === "high"}
            onPress={() => toggleScalar("independenceLevel", "high")}
          />
          <SelectionPill
            label="Adulte à proximité"
            selected={filters.requiresSupervision === false}
            onPress={() => toggleScalar("requiresSupervision", false)}
          />
          <SelectionPill
            label="Sans écran"
            selected={Boolean(filters.screenFree)}
            onPress={() => onChange({ screenFree: filters.screenFree ? undefined : true })}
          />
          <SelectionPill
            label="Favoris"
            selected={Boolean(filters.favoritesOnly)}
            onPress={() => onChange({ favoritesOnly: !filters.favoritesOnly })}
          />
        </PillGrid>
      </FilterContentGroup>
    );
  }

  if (categoryId === "moment") {
    return (
      <FilterContentGroup helper="Choisis le contexte principal, puis affine avec les autres catégories.">
        <PillGrid>
          {SMART_FILTER_OPTIONS.map((option) => (
            <SelectionPill
              key={option.id}
              label={option.label}
              helper={option.helper}
              selected={filters.need === option.id}
              onPress={() => onChange(getNeedChange(filters, option.id))}
            />
          ))}
        </PillGrid>
      </FilterContentGroup>
    );
  }

  if (categoryId === "format") {
    return (
      <>
        <FilterContentGroup title="Solo ou groupe" helper="Pour choisir sans reflechir au format.">
          <PillGrid>
            <SelectionPill
              label="Solo"
              helper="Un enfant peut lancer seul"
              selected={filters.groupActivity === false}
              onPress={() => toggleScalar("groupActivity", false)}
            />
            <SelectionPill
              label="Groupe"
              helper="Deux enfants ou plus"
              selected={filters.groupActivity === true}
              onPress={() => toggleScalar("groupActivity", true)}
            />
          </PillGrid>
        </FilterContentGroup>
        <FilterContentGroup title="Nombre de joueurs">
          <PillGrid>
            {PLAYER_COUNT_OPTIONS.map((count) => (
              <SelectionPill
                key={count}
                label={`${count} joueur${count > 1 ? "s" : ""}`}
                selected={filters.playerCount === count}
                onPress={() => toggleScalar("playerCount", count)}
              />
            ))}
          </PillGrid>
        </FilterContentGroup>
      </>
    );
  }

  if (categoryId === "type") {
    return (
      <FilterContentGroup helper="Tu peux combiner plusieurs ambiances.">
        <PillGrid>
          {ACTIVITY_TYPE_OPTIONS.map((option) => (
            <SelectionPill
              key={option.id}
              label={option.label}
              helper={option.helper}
              selected={(filters.activityTypes ?? []).includes(option.id)}
              onPress={() => toggleArray("activityTypes", option.id)}
            />
          ))}
        </PillGrid>
      </FilterContentGroup>
    );
  }

  if (categoryId === "age") {
    return (
      <FilterContentGroup helper="Les activités restent visibles si elles croisent la tranche choisie.">
        <PillGrid>
          {AGE_RANGES.map((range) => (
            <SelectionPill
              key={range.id}
              label={range.label}
              selected={filters.ageRange === range.id}
              onPress={() => toggleScalar("ageRange", range.id)}
            />
          ))}
        </PillGrid>
      </FilterContentGroup>
    );
  }

  if (categoryId === "time") {
    return (
      <>
        <FilterContentGroup title="Durée">
          <PillGrid>
            {DURATION_OPTIONS.map((duration) => (
              <SelectionPill
                key={duration}
                label={`${duration} min max`}
                selected={filters.duration === duration}
                onPress={() => toggleScalar("duration", duration)}
              />
            ))}
          </PillGrid>
        </FilterContentGroup>
        <FilterContentGroup title="Préparation">
          <PillGrid>
            {SETUP_TIME_OPTIONS.map((option) => (
              <SelectionPill
                key={option.value}
                label={option.label}
                selected={filters.setupTimeMax === option.value}
                onPress={() => toggleScalar("setupTimeMax", option.value)}
              />
            ))}
          </PillGrid>
        </FilterContentGroup>
        <FilterContentGroup title="Rangement">
          <PillGrid>
            {CLEANUP_TIME_OPTIONS.map((option) => (
              <SelectionPill
                key={option.value}
                label={option.label}
                selected={filters.cleanupTimeMax === option.value}
                onPress={() => toggleScalar("cleanupTimeMax", option.value)}
              />
            ))}
          </PillGrid>
        </FilterContentGroup>
      </>
    );
  }

  if (categoryId === "materials") {
    return (
      <FilterContentGroup helper="Tu peux sélectionner plusieurs familles.">
        <PillGrid>
          {MATERIAL_GROUP_OPTIONS.map((option) => (
            <SelectionPill
              key={option.id}
              label={option.label}
              selected={(filters.materialGroups ?? []).includes(option.id)}
              onPress={() => toggleArray("materialGroups", option.id as MaterialGroup)}
            />
          ))}
        </PillGrid>
      </FilterContentGroup>
    );
  }

  if (categoryId === "parent") {
    return (
      <>
        <FilterContentGroup title="Énergie">
          <PillGrid>
            {ENERGY_OPTIONS.map((option) => (
              <SelectionPill
                key={option.id}
                label={option.label}
                helper={option.helper}
                selected={filters.parentEnergy === option.id}
                onPress={() => toggleScalar("parentEnergy", option.id)}
              />
            ))}
          </PillGrid>
        </FilterContentGroup>
        <FilterContentGroup title="Humeur">
          <PillGrid>
            {PARENT_MOOD_OPTIONS.map((option) => (
              <SelectionPill
                key={option.id}
                label={option.label}
                selected={(filters.parentMood ?? []).includes(option.id)}
                onPress={() => toggleArray("parentMood", option.id as ParentMood)}
              />
            ))}
          </PillGrid>
        </FilterContentGroup>
      </>
    );
  }

  if (categoryId === "weather") {
    return (
      <>
        <FilterContentGroup title="Lieu et météo">
          <PillGrid>
            {WEATHER_OPTIONS.map((option) => (
              <SelectionPill
                key={option.id}
                label={option.label}
                selected={(filters.weather ?? "any") === option.id}
                onPress={() => onChange({ weather: option.id })}
              />
            ))}
          </PillGrid>
        </FilterContentGroup>
        <FilterContentGroup title="Saison">
          <PillGrid>
            {SEASON_OPTIONS.map((option) => (
              <SelectionPill
                key={option.id}
                label={option.label}
                selected={filters.season === option.id}
                onPress={() => toggleScalar("season", option.id)}
              />
            ))}
          </PillGrid>
        </FilterContentGroup>
      </>
    );
  }

  if (categoryId === "mess") {
    return (
      <>
        <FilterContentGroup title="Bazar maximum">
          <PillGrid>
            {MESS_OPTIONS.map((option) => (
              <SelectionPill
                key={option.id}
                label={option.label}
                selected={filters.messLevel === option.id}
                onPress={() => toggleScalar("messLevel", option.id)}
              />
            ))}
          </PillGrid>
        </FilterContentGroup>
        <FilterContentGroup title="Bruit maximum">
          <PillGrid>
            {NOISE_OPTIONS.map((option) => (
              <SelectionPill
                key={option.id}
                label={option.label}
                selected={filters.noiseLevel === option.id}
                onPress={() => toggleScalar("noiseLevel", option.id)}
              />
            ))}
          </PillGrid>
        </FilterContentGroup>
      </>
    );
  }

  if (categoryId === "autonomy") {
    return (
      <FilterContentGroup>
        <PillGrid>
          <SelectionPill
            label="Autonomie forte"
            selected={filters.independenceLevel === "high"}
            onPress={() => toggleScalar("independenceLevel", "high")}
          />
          <SelectionPill
            label="Autonomie moyenne ou plus"
            selected={filters.independenceLevel === "medium"}
            onPress={() => toggleScalar("independenceLevel", "medium")}
          />
          <SelectionPill
            label="Adulte à proximité"
            selected={filters.requiresSupervision === false}
            onPress={() => toggleScalar("requiresSupervision", false)}
          />
          <SelectionPill
            label="Adulte très présent"
            selected={filters.requiresSupervision === true}
            onPress={() => toggleScalar("requiresSupervision", true)}
          />
          <SelectionPill
            label="Sans écran"
            selected={Boolean(filters.screenFree)}
            onPress={() => onChange({ screenFree: filters.screenFree ? undefined : true })}
          />
        </PillGrid>
      </FilterContentGroup>
    );
  }

  return (
    <>
      <FilterContentGroup title="Objectifs">
        <PillGrid>
          {DEVELOPMENT_GOAL_GROUP_OPTIONS.map((option) => (
            <SelectionPill
              key={option.id}
              label={option.label}
              selected={(filters.developmentGoalGroups ?? []).includes(option.id)}
              onPress={() => toggleArray("developmentGoalGroups", option.id as DevelopmentGoalGroup)}
            />
          ))}
        </PillGrid>
      </FilterContentGroup>
      <FilterContentGroup title="Compétences">
        <PillGrid>
          {SKILL_OPTIONS.map((skill) => (
            <SelectionPill
              key={skill}
              label={skill}
              selected={(filters.skills ?? []).includes(skill)}
              onPress={() => toggleArray("skills", skill)}
            />
          ))}
        </PillGrid>
      </FilterContentGroup>
    </>
  );
}

function getFilterCategories(filters: ActivityFilters): FilterCategory[] {
  return [
    { id: "suggested", label: "Filtres suggérés", count: getSuggestedCount(filters) },
    { id: "moment", label: "Moment", count: Number(Boolean(filters.need)) },
    {
      id: "format",
      label: "Solo / groupe",
      count: Number(filters.groupActivity !== undefined) + Number(Boolean(filters.playerCount))
    },
    {
      id: "type",
      label: "Type",
      count: filters.activityTypes?.length ?? 0
    },
    { id: "age", label: "Âge", count: Number(Boolean(filters.ageRange)) },
    {
      id: "time",
      label: "Temps",
      count: Number(Boolean(filters.duration)) + Number(filters.setupTimeMax !== undefined) + Number(filters.cleanupTimeMax !== undefined)
    },
    {
      id: "materials",
      label: "Matériel",
      count: (filters.materialGroups?.length ?? 0) + (filters.materials?.length ?? 0)
    },
    {
      id: "parent",
      label: "Parent",
      count: Number(Boolean(filters.parentEnergy)) + (filters.parentMood?.length ?? 0)
    },
    {
      id: "weather",
      label: "Lieu et météo",
      count: Number(Boolean(filters.weather && filters.weather !== "any")) + Number(Boolean(filters.season && filters.season !== "all-season"))
    },
    {
      id: "mess",
      label: "Bazar et bruit",
      count: Number(Boolean(filters.messLevel)) + Number(Boolean(filters.noiseLevel)) + Number(Boolean(filters.messLevelMin)) + Number(Boolean(filters.noiseLevelMin))
    },
    {
      id: "autonomy",
      label: "Autonomie",
      count: Number(Boolean(filters.independenceLevel)) + Number(filters.requiresSupervision !== undefined) + Number(Boolean(filters.screenFree))
    },
    {
      id: "development",
      label: "Objectifs",
      count: (filters.developmentGoalGroups?.length ?? 0) + (filters.skills?.length ?? 0)
    }
  ];
}

function getSuggestedCount(filters: ActivityFilters) {
  return (
    Number(filters.setupTimeMax === 0) +
    Number(filters.parentEnergy === "ko") +
    Number(filters.independenceLevel === "high") +
    Number(filters.requiresSupervision === false) +
    Number(filters.groupActivity === true) +
    Number(filters.groupActivity === false) +
    Number(Boolean(filters.screenFree)) +
    Number(Boolean(filters.favoritesOnly))
  );
}

function getActiveFilterCount(filters: ActivityFilters) {
  return (
    Number(Boolean(filters.need)) +
    Number(Boolean(filters.ageRange)) +
    Number(Boolean(filters.duration)) +
    Number(filters.setupTimeMax !== undefined) +
    Number(filters.cleanupTimeMax !== undefined) +
    Number(Boolean(filters.parentEnergy)) +
    Number(Boolean(filters.weather && filters.weather !== "any")) +
    Number(Boolean(filters.messLevel)) +
    Number(Boolean(filters.messLevelMin)) +
    Number(Boolean(filters.noiseLevel)) +
    Number(Boolean(filters.noiseLevelMin)) +
    Number(Boolean(filters.independenceLevel)) +
    Number(filters.requiresSupervision !== undefined) +
    Number(Boolean(filters.screenFree)) +
    Number(filters.groupActivity !== undefined) +
    Number(Boolean(filters.playerCount)) +
    Number(Boolean(filters.season && filters.season !== "all-season")) +
    Number(Boolean(filters.favoritesOnly)) +
    (filters.activityTypes?.length ?? 0) +
    (filters.parentMood?.length ?? 0) +
    (filters.materialGroups?.length ?? 0) +
    (filters.materials?.length ?? 0) +
    (filters.skills?.length ?? 0) +
    (filters.developmentGoalGroups?.length ?? 0)
  );
}

function getNeedChange(filters: ActivityFilters, need: NonNullable<ActivityFilters["need"]>): Partial<ActivityFilters> {
  const nextNeed = filters.need === need ? undefined : need;

  return {
    need: nextNeed,
    setupTimeMax: undefined,
    cleanupTimeMax: undefined,
    parentEnergy: undefined,
    parentMood: [],
    weather: "any",
    materialGroups: [],
    materials: [],
    messLevel: undefined,
    messLevelMin: undefined,
    noiseLevel: undefined,
    noiseLevelMin: undefined,
    independenceLevel: undefined,
    requiresSupervision: undefined,
    screenFree: undefined,
    groupActivity: undefined,
    playerCount: undefined,
    activityTypes: [],
    skills: [],
    developmentGoalGroups: [],
    season: undefined
  };
}

function CategoryTab({
  category,
  selected,
  onPress
}: {
  category: FilterCategory;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable aria-pressed={selected}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 0,
        paddingHorizontal: 14,
        paddingVertical: 8,
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        borderLeftWidth: selected ? 5 : 0,
        borderLeftColor: colors.primary,
        backgroundColor: selected ? colors.surface : colors.surfaceSecondary,
        opacity: pressed ? 0.72 : 1
      })}
    >
      <Text selectable={false} numberOfLines={2} style={{ color: selected ? colors.primaryDark : colors.text, fontSize: 14, lineHeight: 18, fontWeight: "700" }}>
        {category.label}
      </Text>
      {category.count > 0 ? (
        <Text selectable={false} style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 16, fontWeight: "500", marginTop: 4 }}>
          {category.count} actif{category.count > 1 ? "s" : ""}
        </Text>
      ) : null}
    </Pressable>
  );
}

function FilterContentGroup({
  title,
  helper,
  children
}: {
  title?: string;
  helper?: string;
  children: ReactNode;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={{ gap: 12 }}>
      {title ? (
        <Text selectable style={{ color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: "700" }}>
          {title}
        </Text>
      ) : null}
      {helper ? (
        <Text selectable style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20, fontWeight: "500" }}>
          {helper}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

function PillGrid({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>{children}</View>;
}

function SelectionPill({
  label,
  helper,
  selected,
  onPress
}: {
  label: string;
  helper?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable aria-pressed={selected}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: helper ? 64 : 46,
        maxWidth: "100%",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: helper ? 10 : 9,
        justifyContent: "center",
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primarySoft : colors.surface,
        boxShadow: selected ? "0 8px 18px rgba(74, 63, 50, 0.08)" : undefined,
        opacity: pressed ? 0.72 : 1
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
        {selected ? (
          <Text selectable={false} style={{ color: colors.primaryDark, fontSize: 18, lineHeight: 20, fontWeight: "700" }}>
            ✓
          </Text>
        ) : null}
        <View style={{ minWidth: 0 }}>
          <Text selectable={false} style={{ color: selected ? colors.primaryDark : colors.text, fontSize: 16, lineHeight: 21, fontWeight: "700" }}>
            {label}
          </Text>
          {helper ? (
            <Text selectable={false} style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 16, fontWeight: "500", marginTop: 2 }}>
              {helper}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function TrendIcon() {
  const { colors } = useAppTheme();

  return (
    <View style={{ width: 16, height: 16 }}>
      <View
        style={{
          width: 13,
          height: 2,
          borderRadius: 999,
          backgroundColor: colors.primaryDark,
          position: "absolute",
          left: 1,
          top: 8,
          transform: [{ rotate: "-32deg" }]
        }}
      />
      <View
        style={{
          width: 6,
          height: 6,
          borderTopWidth: 2,
          borderRightWidth: 2,
          borderColor: colors.textSecondary,
          position: "absolute",
          right: 1,
          top: 3
        }}
      />
    </View>
  );
}

function FilterIcon() {
  const { colors } = useAppTheme();

  return (
    <View style={{ width: 14, height: 14 }}>
      {[3, 7, 11].map((top, index) => (
        <View
          key={top}
          style={{
            height: 2,
            borderRadius: 999,
            backgroundColor: colors.primary,
            position: "absolute",
            left: 0,
            right: 0,
            top
          }}
        >
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 999,
              backgroundColor: colors.primary,
              position: "absolute",
              top: -1,
              left: index === 1 ? 8 : 2
            }}
          />
        </View>
      ))}
    </View>
  );
}

function ToolbarButton({
  label,
  selected = false,
  icon,
  tone = "solid",
  onPress
}: {
  label: string;
  selected?: boolean;
  icon?: ReactNode;
  tone?: "solid" | "ghost";
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const isGhost = tone === "ghost";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={selected ? { selected } : undefined}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        minWidth: 44,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderCurve: "continuous",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        backgroundColor: isGhost ? 'transparent' : colors.surface,
        borderWidth: 1,
        borderColor: isGhost ? 'transparent' : colors.border,

        opacity: pressed ? 0.76 : 1
      })}
    >
      {icon}
      <Text selectable={false} style={{ color: colors.text, fontSize: 12, fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}
