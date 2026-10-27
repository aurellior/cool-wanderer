import { GoogleGenAI, Type, Part } from "@google/genai";
import { ItinerarySchema, ItineraryData } from "./schema";
import { ExtractedSocialMetadata } from "./extractor";
import { ITINERARY_PRESETS } from "./presets";

const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3-flash-preview",
  "gemini-2.5-pro",
];

export async function generateItineraryFromMetadata(
  metadata: ExtractedSocialMetadata
): Promise<{ itinerary: ItineraryData; usedAi: boolean }> {
  // If platform blocked anonymous scraping and user didn't provide manual caption,
  // do NOT guess a random country! Ask user to provide the caption/place names.
  if (!metadata.extractedSuccessfully) {
    throw new Error(
      `Platform ${metadata.platform.toUpperCase()} membatasi akses otomatis ke konten video ini. Silakan isi kolom "+ Tempel transkrip / caption manual" di bawah (misal copy-paste caption atau ketik topik videonya seperti "Itinerary Jogja 2 hari: Kopi Klotok, Tamansari, Malioboro") lalu klik Generate.`
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are Cool Wanderer AI, an expert travel architect and geospatial itinerary planner.
Analyze the provided social media video (visuals, on-screen text overlays, spoken audio) AND the extracted caption/description/transcript, then generate a structured day-by-day travel itinerary in Indonesian (Bahasa Indonesia).

CRITICAL RULES:
1. STRICT FIDELITY TO SOURCE: You MUST generate the itinerary for the EXACT city/region and the EXACT venues/places mentioned or shown in the video/caption (for example, if the video/caption is about Yogyakarta/Jogja, ALL stops MUST be in Yogyakarta and match the places in the video/caption). NEVER invent a trip to Tokyo or another city unrelated to the input.
2. If the video/caption mentions specific places (e.g., Kopi Klotok, Taman Sari, Malioboro, etc.), include EVERY single one of them in the exact logical order. If the caption only mentions the city/theme (e.g. "Liburan 2 hari di Jogja"), build the most iconic, realistic itinerary for that exact city.
3. Provide accurate real-world GPS coordinates (latitude and longitude) in decimal degrees for every venue so they plot accurately on an OpenStreetMap Leaflet map.
4. Classify each activity into one of: "food", "sightseeing", "activity", or "stay".
5. Provide concise description, insider tips, badgeLabel (e.g. "Budaya", "Rp 35rb", "Golden Sunset"), and transitToNext (icon: "subway" | "directions_walk" | "local_taxi", mode, duration) between stops.`;

    const parts: Part[] = [];

    // Attach inline video/image if extracted from Instagram Reels or TikTok
    if (metadata.mediaInline) {
      parts.push({
        inlineData: {
          mimeType: metadata.mediaInline.mimeType,
          data: metadata.mediaInline.data,
        },
      });
    } else if (metadata.youtubeWatchUrl) {
      // Attach YouTube video stream directly for YouTube Shorts / Videos
      parts.push({
        fileData: {
          fileUri: metadata.youtubeWatchUrl,
          mimeType: "video/mp4",
        },
      });
    }

    parts.push({
      text: `${systemPrompt}\n\nSocial Media Source Data:\n${metadata.rawText}`,
    });

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: parts,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
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
              required: [
                "tripTitle",
                "destination",
                "durationDays",
                "summary",
                "days",
              ],
            },
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
        console.warn(`Model ${modelName} failed:`, error);
      }
    }
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
