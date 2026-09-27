import { router } from "expo-router";
import { View, useWindowDimensions } from "react-native";
import { useState } from "react";
import { ActivityCard } from "./ActivityCard";
import { EmptyState } from "./EmptyState";
import { Activity } from "../types";

type ActivityListProps = {
  activities: Activity[];
  favoriteIds: string[];
  onToggleFavorite: (activityId: string) => void;
  onOpenActivity?: (activity: Activity) => void;
};

export function ActivityList({ activities, favoriteIds, onToggleFavorite, onOpenActivity }: ActivityListProps) {
  const { width } = useWindowDimensions();
  const columns = width >= 1100 ? 3 : width >= 720 ? 2 : 1;
  const [containerWidth, setContainerWidth] = useState(0);
  const cardWidth = containerWidth ? (containerWidth - (columns - 1) * 14) / columns : undefined;

  if (activities.length === 0) {
    return (
      <EmptyState
        title="Aucune activité parfaite"
        message="Essaie d’enlever un filtre. Une idée simple peut suffire."
      />
    );
  }

  const openActivity = (activity: Activity) => {
    if (onOpenActivity) {
      onOpenActivity(activity);
      return;
    }
    router.push(`/activities/activity/${activity.id}`);
  };

  return (
    <View onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)} style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, alignItems: "stretch" }}>
      {activities.map((activity) => (
        <View
          key={activity.id}
          style={{
            width: cardWidth ?? "100%"
          }}
        >
          <ActivityCard
            activity={activity}
            compact
            favorite={favoriteIds.includes(activity.id)}
            onPress={() => openActivity(activity)}
            onToggleFavorite={() => onToggleFavorite(activity.id)}
          />
        </View>
      ))}
    </View>
  );
}
