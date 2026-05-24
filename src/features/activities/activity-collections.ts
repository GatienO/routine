import { activities } from "./activities";
import { Activity } from "./types";

export type ActivityCollectionId =
  | "five-minutes"
  | "parent-ko"
  | "no-mess"
  | "before-bath"
  | "rainy-day"
  | "autonomy"
  | "emergency"
  | "group"
  | "challenges"
  | "older-kids"
  | "quiet-games"
  | "creativity"
  | "investigations"
  | "outdoor"
  | "cooperation";

export type ActivityCollection = {
  id: ActivityCollectionId;
  title: string;
  description: string;
  predicate: (activity: Activity) => boolean;
};

export const activityCollections: ActivityCollection[] = [
  {
    id: "five-minutes",
    title: "5 minutes",
    description: "Quand il faut une idee minuscule.",
    predicate: (activity) => activity.duration <= 5
  },
  {
    id: "parent-ko",
    title: "Parent KO",
    description: "Faible energie adulte, preparation courte.",
    predicate: (activity) => activity.parentEnergy === "ko" && activity.setupTime <= 2
  },
  {
    id: "no-mess",
    title: "Sans bazar",
    description: "Peu de bruit, peu de rangement.",
    predicate: (activity) => activity.messLevel === "low" && activity.cleanupTime <= 2
  },
  {
    id: "before-bath",
    title: "Avant le bain",
    description: "Le petit bazar est acceptable.",
    predicate: (activity) => activity.materials.includes("eau") || activity.messLevel === "medium"
  },
  {
    id: "rainy-day",
    title: "Pendant la pluie",
    description: "Idees compatibles interieur et pluie.",
    predicate: (activity) => activity.weather === "rainy" || activity.weather === "indoor"
  },
  {
    id: "autonomy",
    title: "Autonomie",
    description: "Pour recuperer quelques minutes.",
    predicate: (activity) => activity.independenceLevel === "high" && !activity.requiresSupervision
  },
  {
    id: "emergency",
    title: "Urgence",
    description: "Occuper maintenant, sans preparation mentale.",
    predicate: (activity) =>
      activity.setupTime <= 1 &&
      activity.cleanupTime <= 2 &&
      activity.parentEnergy === "ko" &&
      activity.noiseLevel !== "high"
  },
  {
    id: "group",
    title: "Activites de groupe",
    description: "Pour jouer a plusieurs sans transformer la maison en foire.",
    predicate: (activity) => activity.groupActivity
  },
  {
    id: "challenges",
    title: "Defis",
    description: "Missions, points, chrono doux et petites victoires.",
    predicate: (activity) => activity.activityType === "challenge"
  },
  {
    id: "older-kids",
    title: "Grands enfants",
    description: "Idees qui tiennent aussi pour les 6-12 ans.",
    predicate: (activity) => activity.ageMax >= 8
  },
  {
    id: "quiet-games",
    title: "Jeux calmes",
    description: "Quand il faut descendre le volume sans couper l'imaginaire.",
    predicate: (activity) => activity.activityType === "calm" || activity.noiseLevel === "low"
  },
  {
    id: "creativity",
    title: "Creativite",
    description: "Fabriquer, inventer, dessiner, raconter.",
    predicate: (activity) => activity.activityType === "creative" || activity.activityType === "construction" || activity.activityType === "story"
  },
  {
    id: "investigations",
    title: "Enquetes",
    description: "Indices, mysteres et petites missions secretes.",
    predicate: (activity) => activity.activityType === "investigation"
  },
  {
    id: "outdoor",
    title: "Activites exterieures",
    description: "Pour sortir vite, meme avec peu de preparation.",
    predicate: (activity) => activity.activityType === "outdoor" || activity.weather === "outdoor" || activity.weather === "sunny"
  },
  {
    id: "cooperation",
    title: "Cooperation",
    description: "Des jeux ou chacun compte, sans reseau social autour.",
    predicate: (activity) => activity.developmentGoals.includes("cooperation") || activity.skills.includes("social")
  }
];

export const getActivitiesForCollection = (
  collectionId: ActivityCollectionId,
  sourceActivities: Activity[] = activities
) => {
  const collection = activityCollections.find((item) => item.id === collectionId);
  if (!collection) return [];
  return sourceActivities.filter(collection.predicate);
};
