import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Gift,
  Plus,
  Star,
  Trash,
  TrendUp,
} from "phosphor-react-native";
import { ResponsiveOverlay } from "../../../components/ui/ResponsiveOverlay";
import { Avatar } from "../../../components/ui/Avatar";
import { OpenMoji } from "../../../components/ui/OpenMoji";
import {
  showAppConfirm,
  showAppToast,
} from "../../../components/feedback/AppFeedbackProvider";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { useChildrenStore } from "../../../stores/childrenStore";
import { useRoutineStore } from "../../../stores/routineStore";
import { useRewardStore } from "../../../stores/rewardStore";
import { useRealRewardStore } from "../../../stores/realRewardStore";
import { BADGES } from "../../../constants/badges";
import {
  CONTENT_MAX_WIDTH,
  FONT_SIZE,
  SHADOWS,
  SPACING,
  type ThemeColors,
} from "../../../constants/theme";
import type { RealReward, RealRewardCooldownUnit } from "../../../types";
import { formatChildName } from "../../../utils/children";
import {
  formatRemainingCooldown,
  formatRewardCooldownLabel,
  getRewardAvailabilityForChild,
} from "../../../utils/realRewardAvailability";

type ProgressTab = "overview" | "rewards";
const UNITS: Array<{ id: RealRewardCooldownUnit; label: string }> = [
  { id: "minute", label: "Minutes" },
  { id: "hour", label: "Heures" },
  { id: "day", label: "Jours" },
  { id: "week", label: "Semaines" },
];

export function ProgressScreen({
  initialTab = "overview",
}: {
  initialTab?: ProgressTab;
}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const children = useChildrenStore((state) => state.children);
  const executions = useRoutineStore((state) => state.executions);
  const routines = useRoutineStore((state) => state.routines);
  const rewardState = useRewardStore((state) => state.rewards);
  const getRewards = useRewardStore((state) => state.getRewards);
  const spendStars = useRewardStore((state) => state.spendStars);
  const realRewards = useRealRewardStore((state) => state.realRewards);
  const removeRealReward = useRealRewardStore(
    (state) => state.removeRealReward,
  );
  const claimReward = useRealRewardStore((state) => state.claimReward);
  const [tab, setTab] = useState<ProgressTab>(initialTab);
  const [childId, setChildId] = useState<string | null>(
    children[0]?.id ?? null,
  );
  const [creatorOpen, setCreatorOpen] = useState(false);
  const contentWidth = Math.min(width - SPACING.lg * 2, CONTENT_MAX_WIDTH.lg);
  const child = children.find((item) => item.id === childId);
  const rewards = childId ? getRewards(childId) : null;
  const childExecutions = useMemo(
    () =>
      executions.filter(
        (execution) => execution.childId === childId && execution.completedAt,
      ),
    [childId, executions],
  );
  const recent = useMemo(
    () =>
      [...childExecutions]
        .sort((a, b) =>
          (b.completedAt ?? "").localeCompare(a.completedAt ?? ""),
        )
        .slice(0, 6),
    [childExecutions],
  );

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);
  useEffect(() => {
    if (!childId && children[0]) setChildId(children[0].id);
    if (childId && !children.some((item) => item.id === childId))
      setChildId(children[0]?.id ?? null);
  }, [childId, children]);

  const removeReward = async (reward: RealReward) => {
    const confirmed = await showAppConfirm({
      title: "Supprimer cette récompense ?",
      message: reward.description,
      tone: "warning",
      icon: "🎁",
      confirmLabel: "Supprimer",
      cancelLabel: "Garder",
      confirmKind: "danger",
    });
    if (confirmed) removeRealReward(reward.id);
  };
  const claim = async (reward: RealReward, targetChildId: string) => {
    const target = children.find((item) => item.id === targetChildId);
    const balance = getRewards(targetChildId).totalStars;
    const availability = getRewardAvailabilityForChild(reward, targetChildId);
    if (availability.isCoolingDown) {
      showAppToast({
        title: "Encore un peu de patience",
        message: formatRemainingCooldown(availability.remainingCooldownMs),
        tone: "warning",
        icon: "⏳",
      });
      return;
    }
    if (balance < reward.requiredStars) {
      showAppToast({
        title: "Pas encore assez d’étoiles",
        message: `${reward.requiredStars - balance} étoile${reward.requiredStars - balance > 1 ? "s" : ""} à gagner.`,
        tone: "warning",
        icon: "⭐",
      });
      return;
    }
    const confirmed = await showAppConfirm({
      title: `Donner à ${formatChildName(target?.name ?? "l’enfant")} ?`,
      message: `${reward.description} utilisera ${reward.requiredStars} étoiles.`,
      tone: "success",
      icon: "🎁",
      confirmLabel: "Donner",
      cancelLabel: "Plus tard",
      confirmKind: "primary",
    });
    if (confirmed && spendStars(targetChildId, reward.requiredStars)) {
      claimReward(reward.id, targetChildId);
      showAppToast({
        title: "Récompense donnée",
        message: reward.description,
        tone: "success",
        icon: "🎁",
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>

      <ScrollView
        contentContainerStyle={[styles.scroll, { alignItems: "center" }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[styles.content, { width: contentWidth, maxWidth: "100%" }]}
        >
          <View style={styles.headingRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour à Parent"
              onPress={() => router.replace("/parent")}
              style={[
                styles.back,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <ArrowLeft size={21} weight="bold" color={colors.text} />
            </Pressable>
            <View style={styles.headingCopy}>
              <Text style={[styles.eyebrow, { color: colors.time }]}>
                PROGRÈS
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>
                Voir les petits pas.
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Les étoiles et badges sont une progression symbolique. Les
                récompenses réelles restent une décision du parent.
              </Text>
            </View>
            {tab === "rewards" ? (
              <Pressable accessibilityRole="button"
                onPress={() => setCreatorOpen(true)}
                style={[styles.create, { backgroundColor: colors.time }]}
              >
                <Plus size={19} weight="bold" color={colors.background} />
                <Text style={[styles.createText, { color: colors.background }]}>
                  Récompense
                </Text>
              </Pressable>
            ) : null}
          </View>
          <View
            style={[styles.tabs, { backgroundColor: colors.surfaceSecondary }]}
          >
            <TabButton
              label="Vue d’ensemble"
              icon={
                <TrendUp
                  size={18}
                  color={
                    tab === "overview" ? colors.time : colors.textSecondary
                  }
                />
              }
              active={tab === "overview"}
              onPress={() => setTab("overview")}
              colors={colors}
            />
            <TabButton
              label="Récompenses réelles"
              icon={
                <Gift
                  size={18}
                  color={
                    tab === "rewards" ? colors.transition : colors.textSecondary
                  }
                />
              }
              active={tab === "rewards"}
              onPress={() => setTab("rewards")}
              colors={colors}
            />
          </View>
          {children.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.childTabs}
            >
              {children.map((item) => (
                <Pressable accessibilityRole="button"
                  key={item.id}
                  onPress={() => setChildId(item.id)}
                  style={[
                    styles.childTab,
                    {
                      backgroundColor:
                        childId === item.id
                          ? colors.actionSoft
                          : colors.surface,
                      borderColor:
                        childId === item.id ? colors.action : colors.border,
                    },
                  ]}
                >
                  <Avatar
                    emoji={item.avatar}
                    color={item.color}
                    size={34}
                    avatarConfig={item.avatarConfig}
                  />
                  <Text style={[styles.childTabText, { color: colors.text }]}>
                    {formatChildName(item.name)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
          {!child || !rewards ? (
            <View
              style={[
                styles.empty,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={styles.emptyEmoji}>🌿</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Aucun profil à suivre
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Ajoutez un enfant depuis la section Famille.
              </Text>
            </View>
          ) : tab === "overview" ? (
            <Overview
              childName={child.name}
              rewards={rewards}
              routines={routines.filter(
                (routine) => routine.childId === child.id,
              )}
              executions={childExecutions}
              recent={recent}
              colors={colors}
            />
          ) : (
            <RewardList
              rewards={realRewards}
              children={children}
              getBalance={(id) => getRewards(id).totalStars}
              onClaim={(reward, id) => void claim(reward, id)}
              onDelete={(reward) => void removeReward(reward)}
              onCreate={() => setCreatorOpen(true)}
              colors={colors}
            />
          )}
        </View>
      </ScrollView>
      <RewardCreator
        visible={creatorOpen}
        onClose={() => setCreatorOpen(false)}
      />
    </SafeAreaView>
  );
}

function Overview({
  childName,
  rewards,
  routines,
  executions,
  recent,
  colors,
}: {
  childName: string;
  rewards: ReturnType<typeof useRewardStore.getState>["rewards"][string];
  routines: ReturnType<typeof useRoutineStore.getState>["routines"];
  executions: ReturnType<typeof useRoutineStore.getState>["executions"];
  recent: ReturnType<typeof useRoutineStore.getState>["executions"];
  colors: ThemeColors;
}) {
  const unlocked = BADGES.filter((badge) =>
    rewards.unlockedBadges.includes(badge.id),
  );
  return (
    <>
      <View style={styles.summaryGrid}>
        <Metric
          icon="⭐"
          value={rewards.totalStars}
          label="Étoiles disponibles"
          tone={colors.transitionSoft}
          colors={colors}
        />
        <Metric
          icon="✓"
          value={rewards.completedRoutines}
          label="Routines terminées"
          tone={colors.actionSoft}
          colors={colors}
        />
        <Metric
          icon="🌱"
          value={rewards.completedActivities ?? 0}
          label="Activités ensemble"
          tone={colors.informationSoft}
          colors={colors}
        />
        <Metric
          icon="🔥"
          value={rewards.currentStreak}
          label="Jours de suite"
          tone={colors.attentionSoft}
          colors={colors}
        />
        <Metric
          icon="🏅"
          value={`${unlocked.length}/${BADGES.length}`}
          label="Badges obtenus"
          tone={colors.timeSoft}
          colors={colors}
        />
      </View>
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Badges de {formatChildName(childName)}
        </Text>
        <Text style={[styles.sectionHelp, { color: colors.textSecondary }]}>
          Chaque badge explique le prochain repère, sans classement entre
          enfants.
        </Text>
        <View style={styles.badges}>
          {BADGES.map((badge) => {
            const earned = rewards.unlockedBadges.includes(badge.id);
            const value =
              badge.requirementType === "stars"
                ? rewards.totalStars
                : badge.requirementType === "streak"
                  ? rewards.currentStreak
                  : badge.requirementType === "activities"
                    ? (rewards.completedActivities ?? 0)
                    : badge.requirementType === "autonomy"
                      ? (rewards.completedIndependentActivities ?? 0)
                      : rewards.completedRoutines;
            return (
              <View
                key={badge.id}
                style={[
                  styles.badge,
                  {
                    backgroundColor: earned
                      ? colors.timeSoft
                      : colors.surfaceSecondary,
                    borderColor: earned ? colors.time : colors.border,
                  },
                ]}
              >
                <OpenMoji emoji={badge.icon} size={34} />
                <View style={styles.badgeCopy}>
                  <Text style={[styles.badgeTitle, { color: colors.text }]}>
                    {badge.name}
                  </Text>
                  <Text
                    style={[styles.badgeText, { color: colors.textSecondary }]}
                  >
                    {earned
                      ? "Obtenu"
                      : `${Math.min(value, badge.requirement)}/${badge.requirement} · ${badge.description}`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Dernières routines
        </Text>
        {recent.length ? (
          recent.map((execution) => {
            const routine = routines.find((item) => item.id === execution.routineId);
            return (
              <View
                key={execution.id}
                style={[styles.historyRow, { borderColor: colors.divider }]}
              >
                <OpenMoji emoji={routine?.icon ?? "🌿"} size={28} />
                <View style={styles.historyCopy}>
                  <Text style={[styles.historyTitle, { color: colors.text }]}>
                    {routine?.name ?? "Routine terminée"}
                  </Text>
                  <Text
                    style={[
                      styles.historyMeta,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {execution.completedAt
                      ? new Date(execution.completedAt).toLocaleDateString(
                          "fr-FR",
                        )
                      : ""}
                  </Text>
                </View>
                <Text
                  style={[styles.historyStars, { color: colors.transition }]}
                >
                  +{execution.earnedStars} ⭐
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            La première routine terminée apparaîtra ici.
          </Text>
        )}
      </View>
    </>
  );
}

function RewardList({
  rewards,
  children,
  getBalance,
  onClaim,
  onDelete,
  onCreate,
  colors,
}: {
  rewards: RealReward[];
  children: ReturnType<typeof useChildrenStore.getState>["children"];
  getBalance: (id: string) => number;
  onClaim: (reward: RealReward, childId: string) => void;
  onDelete: (reward: RealReward) => void;
  onCreate: () => void;
  colors: ThemeColors;
}) {
  return rewards.length ? (
    <View style={styles.rewardList}>
      {rewards.map((reward) => (
        <View
          key={reward.id}
          style={[
            styles.rewardCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.giftIcon,
              { backgroundColor: colors.transitionSoft },
            ]}
          >
            <Gift size={27} color={colors.transition} />
          </View>
          <View style={styles.rewardCopy}>
            <View style={styles.rewardHeading}>
              <Text style={[styles.rewardTitle, { color: colors.text }]}>
                {reward.description}
              </Text>
              <Pressable accessibilityRole="button"
                accessibilityLabel={`Supprimer ${reward.description}`}
                onPress={() => onDelete(reward)}
                style={styles.iconAction}
              >
                <Trash size={18} color={colors.attention} />
              </Pressable>
            </View>
            <Text style={[styles.rewardMeta, { color: colors.textSecondary }]}>
              {reward.requiredStars} étoiles ·{" "}
              {formatRewardCooldownLabel(reward)}
            </Text>
            <View style={styles.claimRows}>
              {children.map((child) => {
                const availability = getRewardAvailabilityForChild(
                  reward,
                  child.id,
                );
                const balance = getBalance(child.id);
                return (
                  <Pressable accessibilityRole="button"
                    key={child.id}
                    onPress={() => onClaim(reward, child.id)}
                    style={[
                      styles.claimRow,
                      {
                        backgroundColor: availability.isCoolingDown
                          ? colors.surfaceSecondary
                          : colors.actionSoft,
                      },
                    ]}
                  >
                    <Text style={[styles.claimName, { color: colors.text }]}>
                      {formatChildName(child.name)}
                    </Text>
                    <Text
                      style={[
                        styles.claimState,
                        {
                          color: availability.isCoolingDown
                            ? colors.textSecondary
                            : balance >= reward.requiredStars
                              ? colors.action
                              : colors.attention,
                        },
                      ]}
                    >
                      {availability.isCoolingDown
                        ? formatRemainingCooldown(
                            availability.remainingCooldownMs,
                          )
                        : balance >= reward.requiredStars
                          ? "Donner"
                          : `${balance}/${reward.requiredStars} ⭐`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      ))}
    </View>
  ) : (
    <View
      style={[
        styles.empty,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View
        style={[styles.giftIcon, { backgroundColor: colors.transitionSoft }]}
      >
        <Gift size={27} color={colors.transition} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Aucune récompense réelle
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Le parent peut proposer un moment simple, puis choisir quand le donner.
      </Text>
      <Pressable accessibilityRole="button"
        onPress={onCreate}
        style={[styles.emptyAction, { backgroundColor: colors.transitionSoft }]}
      >
        <Text style={[styles.emptyActionText, { color: colors.transition }]}>
          Créer une récompense
        </Text>
      </Pressable>
    </View>
  );
}

function RewardCreator({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useAppTheme();
  const addReward = useRealRewardStore((state) => state.addRealReward);
  const [description, setDescription] = useState("");
  const [stars, setStars] = useState("10");
  const [cooldown, setCooldown] = useState("1");
  const [unit, setUnit] = useState<RealRewardCooldownUnit>("week");
  useEffect(() => {
    if (visible) {
      setDescription("");
      setStars("10");
      setCooldown("1");
      setUnit("week");
    }
  }, [visible]);
  const save = () => {
    const starCount = Number(stars);
    const cooldownCount = Number(cooldown);
    if (
      !description.trim() ||
      !Number.isInteger(starCount) ||
      starCount < 1 ||
      !Number.isInteger(cooldownCount) ||
      cooldownCount < 1
    ) {
      showAppToast({
        title: "Récompense incomplète",
        message: "Ajoutez une description, un coût et un délai valides.",
        tone: "warning",
        icon: "🎁",
      });
      return;
    }
    addReward(description.trim(), starCount, cooldownCount, unit);
    showAppToast({
      title: "Récompense ajoutée",
      message: description.trim(),
      tone: "success",
      icon: "🎁",
    });
    onClose();
  };
  return (
    <ResponsiveOverlay
      visible={visible}
      title="Nouvelle récompense réelle"
      subtitle="Une décision du parent, distincte des badges virtuels."
      onClose={onClose}
      footer={
        <Pressable accessibilityRole="button"
          onPress={save}
          style={[styles.overlaySave, { backgroundColor: colors.transition }]}
        >
          <Text style={[styles.createText, { color: colors.background }]}>
            Ajouter
          </Text>
        </Pressable>
      }
    >
      <Field label="Proposition" colors={colors}>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Ex. Choisir le dessert"
          placeholderTextColor={colors.textLight}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
      </Field>
      <Field label="Étoiles nécessaires" colors={colors}>
        <TextInput
          value={stars}
          onChangeText={setStars}
          keyboardType="number-pad"
          placeholder="10"
          placeholderTextColor={colors.textLight}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
      </Field>
      <Field label="Disponible à nouveau après" colors={colors}>
        <TextInput
          value={cooldown}
          onChangeText={setCooldown}
          keyboardType="number-pad"
          placeholder="1"
          placeholderTextColor={colors.textLight}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
        <View style={styles.unitRow}>
          {UNITS.map((item) => (
            <Pressable accessibilityRole="button"
              key={item.id}
              onPress={() => setUnit(item.id)}
              style={[
                styles.unit,
                {
                  backgroundColor:
                    unit === item.id
                      ? colors.transitionSoft
                      : colors.surfaceSecondary,
                  borderColor:
                    unit === item.id
                      ? colors.transition
                      : colors.surfaceSecondary,
                },
              ]}
            >
              <Text style={[styles.unitText, { color: colors.text }]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Field>
    </ResponsiveOverlay>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress,
  colors,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
  colors: ThemeColors;
}) {
  return (
    <Pressable aria-selected={active}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.tab,
        active && { backgroundColor: colors.surface, ...SHADOWS.sm },
      ]}
    >
      {icon}
      <Text
        style={[
          styles.tabText,
          { color: active ? colors.text : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
function Metric({
  icon,
  value,
  label,
  tone,
  colors,
}: {
  icon: string;
  value: string | number;
  label: string;
  tone: string;
  colors: ThemeColors;
}) {
  return (
    <View
      style={[
        styles.metric,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.metricIcon, { backgroundColor: tone }]}>
        <Text style={styles.metricEmoji}>{icon}</Text>
      </View>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}
function Field({
  label,
  colors,
  children,
}: {
  label: string;
  colors: ThemeColors;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingBottom: 120 },
  content: { gap: SPACING.lg },
  headingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  back: {
    width: 48,
    height: 48,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headingCopy: { flex: 1, minWidth: 250, gap: 5 },
  eyebrow: { fontSize: FONT_SIZE.xs, fontWeight: "800", letterSpacing: 0.8 },
  title: {
    fontSize: FONT_SIZE.xxl,
    lineHeight: 39,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  subtitle: { maxWidth: 680, fontSize: FONT_SIZE.sm, lineHeight: 21 },
  create: {
    minHeight: 50,
    borderRadius: 15,
    paddingHorizontal: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  createText: { fontSize: FONT_SIZE.sm, fontWeight: "800" },
  tabs: {
    flexDirection: "row",
    alignSelf: "flex-start",
    padding: 5,
    borderRadius: 18,
    gap: 4,
  },
  tab: {
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: "700" },
  childTabs: { gap: SPACING.sm },
  childTab: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  childTabText: { fontSize: FONT_SIZE.sm, fontWeight: "700" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.md },
  metric: {
    flexGrow: 1,
    flexBasis: 190,
    minHeight: 150,
    borderRadius: 22,
    borderWidth: 1,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  metricIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  metricEmoji: { fontSize: 23 },
  metricValue: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "800",
  },
  metricLabel: { marginTop: 3, fontSize: FONT_SIZE.xs },
  section: {
    borderRadius: 22,
    borderWidth: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionTitle: { fontSize: FONT_SIZE.xl, fontWeight: "700" },
  sectionHelp: { marginTop: -8, fontSize: FONT_SIZE.sm, lineHeight: 20 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  badge: {
    flexGrow: 1,
    flexBasis: 230,
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    padding: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  badgeCopy: { flex: 1, minWidth: 0 },
  badgeTitle: { fontSize: FONT_SIZE.sm, fontWeight: "800" },
  badgeText: { marginTop: 3, fontSize: FONT_SIZE.xs, lineHeight: 17 },
  historyRow: {
    minHeight: 58,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  historyCopy: { flex: 1, minWidth: 0 },
  historyTitle: { fontSize: FONT_SIZE.sm, fontWeight: "700" },
  historyMeta: { marginTop: 2, fontSize: FONT_SIZE.xs },
  historyStars: { fontSize: FONT_SIZE.sm, fontWeight: "800" },
  rewardList: { gap: SPACING.md },
  rewardCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  giftIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardCopy: { flex: 1, minWidth: 0 },
  rewardHeading: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  rewardTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: FONT_SIZE.md,
    lineHeight: 22,
    fontWeight: "800",
  },
  rewardMeta: { marginTop: 4, fontSize: FONT_SIZE.xs, lineHeight: 18 },
  iconAction: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  claimRows: { marginTop: SPACING.md, gap: SPACING.xs },
  claimRow: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  claimName: {
    flex: 1,
    minWidth: 0,
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
  },
  claimState: { fontSize: FONT_SIZE.xs, fontWeight: "800" },
  empty: {
    minHeight: 320,
    borderRadius: 22,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  emptyEmoji: { fontSize: 42 },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    maxWidth: 480,
    fontSize: FONT_SIZE.sm,
    lineHeight: 21,
    textAlign: "center",
  },
  emptyAction: {
    minHeight: 48,
    marginTop: SPACING.sm,
    borderRadius: 14,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyActionText: { fontSize: FONT_SIZE.sm, fontWeight: "800" },
  field: { gap: SPACING.sm },
  fieldLabel: { fontSize: FONT_SIZE.sm, fontWeight: "800" },
  input: {
    minHeight: 52,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  unitRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  unit: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },
  unitText: { fontSize: FONT_SIZE.xs, fontWeight: "700" },
  overlaySave: {
    minHeight: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
