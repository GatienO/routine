import { router } from "expo-router";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { ActivityCard } from "../components/ActivityCard";
import { AppScaffold } from "../components/AppScaffold";
import { PrimaryButton } from "../components/PrimaryButton";
import { activities } from "../activities";
import { useActivityStore } from "../activity-store";
import type { Activity, ActivityWeather } from "../types";
import { activityTypeLabel } from "../labels";
import { colors, radius } from "../mini-theme";

type EnergyChoice = "calm" | "energy";
type FormatChoice = "solo" | "group";
type PlaceChoice = "indoor" | "outdoor";

export default function SurpriseScreen() {
  const [energy, setEnergy] = useState<EnergyChoice>("calm");
  const [format, setFormat] = useState<FormatChoice>("solo");
  const [place, setPlace] = useState<PlaceChoice>("indoor");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const favoriteIds = useActivityStore((state) => state.favoriteIds);
  const toggleFavorite = useActivityStore((state) => state.toggleFavorite);
  const saveToHistory = useActivityStore((state) => state.saveToHistory);

  const candidates = useMemo(() => {
    return activities.filter((activity) => {
      const energyMatch =
        energy === "calm"
          ? activity.noiseLevel === "low" || activity.activityType === "calm" || activity.activityType === "story"
          : activity.noiseLevel !== "low" || activity.activityType === "motor" || activity.activityType === "challenge";
      const formatMatch = format === "group" ? activity.groupActivity : !activity.groupActivity || activity.playerCountMin <= 1;
      const placeMatch = matchesPlace(activity.weather, place);
      return energyMatch && formatMatch && placeMatch;
    });
  }, [energy, format, place]);

  const pickActivity = () => {
    const pool = candidates.length > 0 ? candidates : activities;
    const nextActivity = pool[Math.floor(Math.random() * pool.length)];
    setSelectedActivity(nextActivity);
    saveToHistory(nextActivity);
  };

  return (
    <AppScaffold
      title="Surprise"
      subtitle="Trois choix rapides, puis une idee qui a deja une ambiance."
      icon="✨"
      screenTitle="Surprise"
    >
      <View style={{ gap: 16 }}>
        <ChoiceGroup title="Ambiance">
          <ChoicePill label="Calme" selected={energy === "calm"} onPress={() => setEnergy("calm")} />
          <ChoicePill label="Energie" selected={energy === "energy"} onPress={() => setEnergy("energy")} />
        </ChoiceGroup>

        <ChoiceGroup title="Format">
          <ChoicePill label="Solo" selected={format === "solo"} onPress={() => setFormat("solo")} />
          <ChoicePill label="Groupe" selected={format === "group"} onPress={() => setFormat("group")} />
        </ChoiceGroup>

        <ChoiceGroup title="Lieu">
          <ChoicePill label="Interieur" selected={place === "indoor"} onPress={() => setPlace("indoor")} />
          <ChoicePill label="Exterieur" selected={place === "outdoor"} onPress={() => setPlace("outdoor")} />
        </ChoiceGroup>

        <PrimaryButton title="Trouver une surprise" onPress={pickActivity} />
      </View>

      {selectedActivity ? (
        <View style={{ gap: 14 }}>
          <View
            style={{
              padding: 18,
              borderRadius: radius.lg,
              borderCurve: "continuous",
              backgroundColor: colors.primarySoft,
              gap: 8
            }}
          >
            <Text selectable style={{ color: colors.primaryDark, fontSize: 14, lineHeight: 20, fontWeight: "900" }}>
              Mission prete
            </Text>
            <Text selectable style={{ color: colors.text, fontSize: 20, lineHeight: 26, fontWeight: "900" }}>
              {selectedActivity.groupActivity ? "Une petite equipe" : "Un enfant"} part pour une experience {activityTypeLabel(selectedActivity.activityType).toLocaleLowerCase("fr-FR")}.
            </Text>
            <Text selectable style={{ color: colors.muted, fontSize: 14, lineHeight: 20, fontWeight: "700" }}>
              {selectedActivity.playerCountMin}-{selectedActivity.playerCountMax} joueurs · {selectedActivity.duration} min · {selectedActivity.description}
            </Text>
          </View>

          <ActivityCard
            activity={selectedActivity}
            favorite={favoriteIds.includes(selectedActivity.id)}
            onPress={() => router.push(`/activities/activity/${selectedActivity.id}`)}
            onToggleFavorite={() => toggleFavorite(selectedActivity.id)}
          />
        </View>
      ) : null}
    </AppScaffold>
  );
}

function matchesPlace(weather: ActivityWeather, place: PlaceChoice) {
  if (place === "indoor") {
    return weather === "indoor" || weather === "rainy" || weather === "any";
  }
  return weather === "outdoor" || weather === "sunny" || weather === "any";
}

function ChoiceGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text selectable style={{ color: colors.text, fontSize: 16, fontWeight: "900" }}>
        {title}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>{children}</View>
    </View>
  );
}

function ChoicePill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 46,
        borderRadius: 999,
        paddingHorizontal: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: selected ? colors.primary : colors.primarySoft,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        opacity: pressed ? 0.78 : 1
      })}
    >
      <Text selectable={false} style={{ color: selected ? colors.surface : colors.primaryDark, fontSize: 14, fontWeight: "900" }}>
        {label}
      </Text>
    </Pressable>
  );
}
