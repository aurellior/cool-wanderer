import { GoogleGenAI, Type, Part } from "@google/genai";
import { ItinerarySchema, ItineraryData } from "./schema";
import { ExtractedSocialMetadata } from "./extractor";
import { ITINERARY_PRESETS } from "./presets";

const CANDIDATE_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash",
];

const ITINERARY_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    tripTitle: { type: Type.STRING },
    destination: { type: Type.STRING },
    durationDays: { type: Type.INTEGER },
    summary: { type: Type.STRING },
    estimatedBudget: { type: Type.STRING },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          dateLabel: { type: Type.STRING },
          fullDateLabel: { type: Type.STRING },
          weatherLabel: { type: Type.STRING },
          efficiencyLabel: { type: Type.STRING },
          dayBudgetLabel: { type: Type.STRING },
          title: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                placeName: { type: Type.STRING },
                category: {
                  type: Type.STRING,
                  enum: ["food", "sightseeing", "activity", "stay"],
                },
                description: { type: Type.STRING },
                tips: { type: Type.STRING },
                estimatedCost: { type: Type.STRING },
                badgeLabel: { type: Type.STRING },
                transitToNext: {
                  type: Type.OBJECT,
                  properties: {
                    icon: {
                      type: Type.STRING,
                      enum: [
                        "subway",
                        "directions_walk",
                        "local_taxi",
                        "directions_car",
                      ],
                    },
                    mode: { type: Type.STRING },
                    duration: { type: Type.STRING },
                  },
                  required: ["icon", "mode", "duration"],
                },
                location: {
                  type: Type.OBJECT,
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER },
                    address: { type: Type.STRING },
                  },
                  required: ["lat", "lng", "address"],
                },
              },
              required: [
                "time",
                "placeName",
                "category",
                "description",
                "tips",
                "location",
              ],
            },
          },
        },
        required: ["day", "title", "activities"],
      },
    },
  },
  required: ["tripTitle", "destination", "durationDays", "summary", "days"],
};

export async function generateItineraryFromMetadata(
  metadata: ExtractedSocialMetadata
): Promise<{ itinerary: ItineraryData; usedAi: boolean }> {
  // If platform blocked anonymous scraping and user didn't provide manual caption,
  // do NOT guess a random country! Ask user to provide the caption/place names.
  if (!metadata.extractedSuccessfully) {
    throw new Error(
      `Platform ${metadata.platform.toUpperCase()} membatasi akses otomatis ke konten video ini. Silakan isi kolom "+ Tempel transkrip / caption manual" di bawah (misal copy-paste caption atau ketik topik videonya seperti "Top 10 tempat wisata di Jogja: ...") lalu klik Generate.`
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are Cool Wanderer AI, an expert travel architect and geospatial itinerary planner.
Analyze the provided social media video/slides (visuals, on-screen text overlays, spoken audio) AND the extracted caption/description/chapters, then generate a structured day-by-day travel itinerary in Indonesian (Bahasa Indonesia).

CRITICAL RULES:
1. STRICT FIDELITY TO SOURCE: You MUST generate the itinerary for the EXACT city/region and the EXACT venues/places mentioned or shown in the video, slides, or caption (for example, if the video is about Yogyakarta/Jogja, ALL stops MUST be in Yogyakarta and match the places recommended in the video). NEVER invent a trip to Tokyo or another city unrelated to the input.
2. COMPREHENSIVE EXTRACTION FOR "TOP N / REKOMENDASI" VIDEOS:
   - Extract EVERY SINGLE specific place/venue (restaurants, cafes, tourist attractions, beaches, temples, hotels, photo spots) recommended in the video (from spoken audio, on-screen text overlays, video chapters, or caption).
   - For example, if the video is "Top 10 Recommended Places in Jogja", include ALL 10 recommended places in the generated itinerary—do not skip them.
3. SMART MULTI-DAY GEOGRAPHIC CLUSTERING & ROUTE ORDERING:
   - If the video already specifies a day-by-day schedule (e.g., Day 1, Day 2), follow that exact schedule.
   - If the video is a list/compilation of recommendations (e.g., "Top 5 / Top 10 Places in Jogja" without day divisions), DO NOT cram 10 places into a single day! Automatically organize all extracted places into a realistic multi-day itinerary (ideally 3 to 4 places per day, or up to 5 if nearby; e.g., 3-4 places = 1 day, 5-8 places = 2 days, 9-12 places = 3 days).
   - Group places that are geographically close (same area/corridor, e.g., North Sleman/Kaliurang on Day 1, Central Kraton/Malioboro on Day 2, South Bantul/Gunungkidul on Day 3) onto the same day, and order them chronologically from morning to night (breakfast/morning nature -> lunch -> afternoon/sunset spot -> dinner/nightlife) so the route is efficient and avoids backtracking.
   - If the video only highlights 1-2 specific places in a city, feature those exact places as the main highlights and complement them with 1-2 nearby iconic stops in the same city to form a complete 1-day route.
   - If the input only mentions a city/theme without specific venue names (e.g., "Liburan di Jogja"), curate the best realistic itinerary for that exact city.
4. VIDEO-SPECIFIC DETAILS & TIPS:
   - In "description" and "tips", mention the specific highlights, signature dishes, ticket prices, or insider tips recommended by the creator in the video.
5. GEOSPATIAL ACCURACY & CATEGORIES:
   - Provide accurate real-world GPS coordinates (latitude and longitude) in decimal degrees and real street/area addresses for every venue so they plot accurately on an OpenStreetMap Leaflet map.
   - Classify each activity into one of: "food", "sightseeing", "activity", or "stay".
   - Provide badgeLabel (e.g. "Rekomendasi #1", "Kuliner Hits", "Rp 35rb", "Golden Sunset") and transitToNext (icon: "subway" | "directions_walk" | "local_taxi" | "directions_car", mode, duration) between stops.`;

    const mediaParts: Part[] = [];

    // Attach inline video or carousel slide images if extracted from Instagram or TikTok
    if (metadata.mediaInlineList && metadata.mediaInlineList.length > 0) {
      for (const item of metadata.mediaInlineList) {
        mediaParts.push({
          inlineData: {
            mimeType: item.mimeType,
            data: item.data,
          },
        });
      }
    } else if (metadata.mediaInline) {
      mediaParts.push({
        inlineData: {
          mimeType: metadata.mediaInline.mimeType,
          data: metadata.mediaInline.data,
        },
      });
    } else if (metadata.youtubeWatchUrl) {
      // Attach YouTube video stream directly for YouTube Shorts / Videos
      mediaParts.push({
        fileData: {
          fileUri: metadata.youtubeWatchUrl,
          mimeType: "video/mp4",
        },
      });
    }

    const textPart: Part = {
      text: `${systemPrompt}\n\nSocial Media Source Data:\n${metadata.rawText}`,
    };

    let lastAiError: unknown = null;

    for (const modelName of CANDIDATE_MODELS) {
      // Try with full multimodal payload first; if video stream fails (e.g. very long YouTube video),
      // fall back to text-only analysis on the same model if caption/title is available.
      const attemptPayloads: Part[][] =
        mediaParts.length > 0 && metadata.caption.trim().length > 5
          ? [[...mediaParts, textPart], [textPart]]
          : [[...mediaParts, textPart]];

      for (const contentsPayload of attemptPayloads) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: contentsPayload,
            config: {
              responseMimeType: "application/json",
              responseSchema: ITINERARY_RESPONSE_SCHEMA,
            },
          });

          const rawJson = response.text;
          if (rawJson) {
            const parsed = JSON.parse(rawJson);
            const validated = ItinerarySchema.parse({
              ...parsed,
              id: `trip-${Date.now()}`,
              sourceUrl: metadata.url,
              sourcePlatform: metadata.platform,
              sourceAuthor: metadata.author,
            });
            return { itinerary: validated, usedAi: true };
          }
        } catch (error) {
          lastAiError = error;
          console.warn(
            `Model ${modelName} attempt (${
              contentsPayload.length > 1 ? "multimodal" : "text"
            }) failed:`,
            error
          );
        }
      }
    }

    const errDetail =
      lastAiError instanceof Error ? lastAiError.message : String(lastAiError);
    throw new Error(
      `Gagal menganalisis video dengan Gemini AI (${errDetail.slice(
        0,
        140
      )}). Coba lagi beberapa saat atau tambahkan deskripsi singkat di kolom caption manual.`
    );
  }

  // Smart deterministic fallback when GEMINI_API_KEY is not set
  const textToAnalyze =
    `${metadata.url} ${metadata.title} ${metadata.caption}`.toLowerCase();

  let basePreset = ITINERARY_PRESETS["jogja-2d"];
  if (
    textToAnalyze.includes("jogja") ||
    textToAnalyze.includes("yogyakarta") ||
    textToAnalyze.includes("malioboro") ||
    textToAnalyze.includes("klotok") ||
    textToAnalyze.includes("prambanan")
  ) {
    basePreset = ITINERARY_PRESETS["jogja-2d"];
  } else if (
    textToAnalyze.includes("bali") ||
    textToAnalyze.includes("ubud") ||
    textToAnalyze.includes("canggu") ||
    textToAnalyze.includes("uluwatu")
  ) {
    basePreset = ITINERARY_PRESETS["bali-3d"];
  } else if (
    textToAnalyze.includes("kyoto") ||
    textToAnalyze.includes("arashiyama") ||
    textToAnalyze.includes("inari")
  ) {
    basePreset = ITINERARY_PRESETS["kyoto-2d"];
  } else if (
    textToAnalyze.includes("tokyo") ||
    textToAnalyze.includes("shibuya") ||
    textToAnalyze.includes("shinjuku")
  ) {
    basePreset = ITINERARY_PRESETS["tokyo-48h"];
  }

  const customized: ItineraryData = {
    ...basePreset,
    id: `trip-${Date.now()}`,
    sourceUrl: metadata.url || basePreset.sourceUrl,
    sourcePlatform: metadata.platform || basePreset.sourcePlatform,
    sourceAuthor: metadata.author || basePreset.sourceAuthor,
  };

  return { itinerary: ItinerarySchema.parse(customized), usedAi: false };
}
