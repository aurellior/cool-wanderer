import { z } from "zod";

export const ActivityCategorySchema = z.enum([
  "food",
  "sightseeing",
  "activity",
  "stay",
]);

export type ActivityCategory = z.infer<typeof ActivityCategorySchema>;

export const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
});

export const TransitInfoSchema = z.object({
  icon: z.enum(["subway", "directions_walk", "local_taxi", "directions_car"]),
  mode: z.string(),
  duration: z.string(),
});

export const SourcePlatformSchema = z.enum([
  "tiktok",
  "instagram",
  "youtube",
  "custom",
]);

export type SourcePlatform = z.infer<typeof SourcePlatformSchema>;

export const ActivitySchema = z.object({
  id: z.string().optional(),
  time: z.string().optional().default(""),
  recommendedTime: z.string().optional(),
  city: z.string().optional(),
  placeName: z.string(),
  category: ActivityCategorySchema,
  description: z.string(),
  tips: z.string(),
  estimatedCost: z.string().optional(),
  imageUrl: z.string().optional(),
  badgeLabel: z.string().optional(),
  badgeTone: z.enum(["neutral", "orange", "sunset"]).optional(),
  footerType: z.enum(["priority", "tip", "warning", "ticket"]).optional(),
  footerText: z.string().optional(),
  footerActionLabel: z.string().optional(),
  isHighlightOrange: z.boolean().optional(),
  sourceUrl: z.string().optional(),
  sourcePlatform: SourcePlatformSchema.optional(),
  sourceAuthor: z.string().optional(),
  transitToNext: TransitInfoSchema.optional(),
  location: LocationSchema,
});

export type ActivityItem = z.infer<typeof ActivitySchema>;

export const DayPlanSchema = z.object({
  day: z.number(),
  city: z.string().optional(),
  dateLabel: z.string().optional(),
  fullDateLabel: z.string().optional(),
  weatherLabel: z.string().optional(),
  efficiencyLabel: z.string().optional(),
  dayBudgetLabel: z.string().optional(),
  title: z.string(),
  activities: z.array(ActivitySchema),
});

export type DayPlan = z.infer<typeof DayPlanSchema>;

export const SourceLinkEntrySchema = z.object({
  url: z.string(),
  city: z.string().optional(),
  platform: SourcePlatformSchema.optional(),
  author: z.string().optional(),
  title: z.string().optional(),
  caption: z.string().optional(),
});

export type SourceLinkEntry = z.infer<typeof SourceLinkEntrySchema>;

export const ItinerarySchema = z.object({
  id: z.string().optional(),
  tripTitle: z.string(),
  country: z.string().optional(),
  cities: z.array(z.string()).optional(),
  destination: z.string(),
  durationDays: z.number(),
  summary: z.string(),
  sourceUrl: z.string().optional(),
  sourcePlatform: SourcePlatformSchema.optional(),
  sourceAuthor: z.string().optional(),
  sourceLinks: z.array(SourceLinkEntrySchema).optional(),
  estimatedBudget: z.string().optional(),
  candidatePlaces: z.array(ActivitySchema).optional(),
  days: z.array(DayPlanSchema),
});

export type ItineraryData = z.infer<typeof ItinerarySchema>;
