import { GoogleGenAI, Type, Part } from "@google/genai";
import {
  ItinerarySchema,
  ItineraryData,
  ActivityItem,
  DayPlan,
  SourceLinkEntry,
} from "./schema";
import { ExtractedSocialMetadata } from "./extractor";
import { ITINERARY_PRESETS } from "./presets";

const CANDIDATE_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash",
];

export interface MultiSourceExtractionItem {
  cityHint: string;
  metadata: ExtractedSocialMetadata;
}

const MULTI_EXTRACTION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    tripTitle: { type: Type.STRING },
    country: { type: Type.STRING },
    destination: { type: Type.STRING },
    summary: { type: Type.STRING },
    estimatedBudget: { type: Type.STRING },
    cities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    extractedDestinations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          placeName: { type: Type.STRING },
          city: { type: Type.STRING },
          category: {
            type: Type.STRING,
            enum: ["food", "sightseeing", "activity", "stay"],
          },
          recommendedTime: { type: Type.STRING },
          description: { type: Type.STRING },
          tips: { type: Type.STRING },
          estimatedCost: { type: Type.STRING },
          badgeLabel: { type: Type.STRING },
          sourceIndex: { type: Type.INTEGER },
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
          "placeName",
          "city",
          "category",
          "description",
          "tips",
          "location",
        ],
      },
    },
  },
  required: [
    "tripTitle",
    "country",
    "destination",
    "summary",
    "cities",
    "extractedDestinations",
  ],
};

export async function generateMultiLinkItinerary(options: {
  countryHint?: string;
  items: MultiSourceExtractionItem[];
  startWithEmptyDays?: boolean;
}): Promise<{ itinerary: ItineraryData; usedAi: boolean }> {
  const { countryHint = "", items, startWithEmptyDays = true } = options;

  const hasAnyExtractedContent = items.some(
    (item) =>
      item.metadata.extractedSuccessfully ||
      item.cityHint.trim().length > 0 ||
      item.metadata.caption.trim().length > 0
  );

  if (!hasAnyExtractedContent) {
    const firstPlatform = items[0]?.metadata.platform || "sosial media";
    throw new Error(
      `Platform ${firstPlatform.toUpperCase()} membatasi akses otomatis ke konten video ini. Silakan isi Nama Kota atau tambahkan catatan/caption singkat pada link (misal "Kuliner & wisata di Tokyo"), lalu klik Proses kembali.`
    );
  }

  const sourceLinks: SourceLinkEntry[] = items.map((item) => ({
    url: item.metadata.url,
    city: item.cityHint || undefined,
    platform: item.metadata.platform,
    author: item.metadata.author,
    title: item.metadata.title,
    caption: item.metadata.caption,
  }));

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are Cool Wanderer AI, an expert travel architect and geospatial destination extractor.
The user has provided ${items.length} social media video link(s) across one country and one or more cities (1 country -> multiple cities, 1 city -> multiple video links).
${countryHint ? `Target Country / Region specified by user: ${countryHint}` : ""}

Your task:
1. Analyze ALL provided video links (visual frames, spoken audio, slide images, captions, chapters, and city hints).
2. Extract EVERY SINGLE recommended destination, tourist attraction, restaurant, cafe, street food stall, activity, or accommodation mentioned across the videos into "extractedDestinations".
3. STRICT FIDELITY TO SOURCE & CITIES:
   - Tag every destination with its exact "city" name (e.g., "Tokyo", "Kyoto", "Osaka", "Yogyakarta", "Solo", "Bandung", "Bali").
   - If a link has a specified City Hint, prioritize extracting places from that video that belong to that city. If a link only mentions a city generally without specific venue names, curate 3 to 4 iconic, authentic must-visit places in that exact city so the user has selectable items for that city.
   - If a single video is a "Top N / Rekomendasi" compilation, extract ALL places shown or mentioned in that video.
   - Set "sourceIndex" (1 to ${items.length}) to indicate which input link the destination came from.
4. DETAILS & GEOSPATIAL ACCURACY:
   - Write all descriptions, tips, and summaries in Indonesian (Bahasa Indonesia).
   - Provide "recommendedTime" (e.g. "08:00 - 10:00", "12:00 - 13:30", "16:30 - 18:30") as an optional suggested visit window.
   - Provide "estimatedCost" (e.g. "¥1.200", "Rp 35rb", "Gratis") and a short "badgeLabel" (e.g. "Kuliner Hits", "Warisan Budaya", "Spot Sunset").
   - Provide accurate real-world GPS coordinates (latitude and longitude in decimal degrees) and street/area address for OpenStreetMap.`;

    const mediaParts: Part[] = [];
    let totalInlineBytes = 0;
    const MAX_TOTAL_INLINE_BYTES = 14 * 1024 * 1024; // 14MB safety cap across multiple links

    const sourceDescriptions: string[] = [];

    items.forEach((item, index) => {
      const idxNum = index + 1;
      const meta = item.metadata;
      sourceDescriptions.push(
        `=== LINK #${idxNum} ===\n` +
          `Kota (City Hint): ${item.cityHint || "(Deteksi otomatis dari konten)"}\n` +
          `Platform: ${meta.platform}\n` +
          `URL: ${meta.url}\n` +
          `Author: ${meta.author}\n` +
          `Konten / Caption / Chapters:\n${meta.rawText}\n`
      );

      if (meta.mediaInlineList && meta.mediaInlineList.length > 0) {
        for (const slide of meta.mediaInlineList.slice(0, 6)) {
          const approxBytes = Math.ceil((slide.data.length * 3) / 4);
          if (totalInlineBytes + approxBytes <= MAX_TOTAL_INLINE_BYTES) {
            mediaParts.push({
              inlineData: {
                mimeType: slide.mimeType,
                data: slide.data,
              },
            });
            totalInlineBytes += approxBytes;
          }
        }
      } else if (meta.mediaInline) {
        const approxBytes = Math.ceil((meta.mediaInline.data.length * 3) / 4);
        if (totalInlineBytes + approxBytes <= MAX_TOTAL_INLINE_BYTES) {
          mediaParts.push({
            inlineData: {
              mimeType: meta.mediaInline.mimeType,
              data: meta.mediaInline.data,
            },
          });
          totalInlineBytes += approxBytes;
        }
      } else if (meta.youtubeWatchUrl && items.length === 1) {
        mediaParts.push({
          fileData: {
            fileUri: meta.youtubeWatchUrl,
            mimeType: "video/mp4",
          },
        });
      }
    });

    const textPart: Part = {
      text: `${systemPrompt}\n\nDAFTAR SUMBER LINK VIDEO:\n\n${sourceDescriptions.join(
        "\n"
      )}`,
    };

    let lastAiError: unknown = null;

    for (const modelName of CANDIDATE_MODELS) {
      const attemptPayloads: Part[][] =
        mediaParts.length > 0
          ? [[...mediaParts, textPart], [textPart]]
          : [[textPart]];

      for (const contentsPayload of attemptPayloads) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: contentsPayload,
            config: {
              responseMimeType: "application/json",
              responseSchema: MULTI_EXTRACTION_RESPONSE_SCHEMA,
            },
          });

          const rawJson = response.text;
          if (rawJson) {
            const parsed = JSON.parse(rawJson);
            const extractedList = Array.isArray(parsed.extractedDestinations)
              ? parsed.extractedDestinations
              : [];

            const candidatePlaces: ActivityItem[] = extractedList.map(
              (rawPlace: Record<string, unknown>, idx: number) => {
                const srcIdx =
                  typeof rawPlace.sourceIndex === "number" &&
                  rawPlace.sourceIndex >= 1 &&
                  rawPlace.sourceIndex <= items.length
                    ? rawPlace.sourceIndex - 1
                    : 0;
                const matchedItem = items[srcIdx] || items[0];
                const cityVal =
                  (typeof rawPlace.city === "string" && rawPlace.city.trim()) ||
                  matchedItem?.cityHint ||
                  "Destinasi Utama";
                const categoryVal =
                  rawPlace.category === "food" ||
                  rawPlace.category === "sightseeing" ||
                  rawPlace.category === "activity" ||
                  rawPlace.category === "stay"
                    ? rawPlace.category
                    : "sightseeing";
                const locObj =
                  (rawPlace.location as {
                    lat?: number;
                    lng?: number;
                    address?: string;
                  }) || {};

                return {
                  id: `dest-${Date.now()}-${idx + 1}`,
                  city: cityVal,
                  time: "",
                  recommendedTime:
                    typeof rawPlace.recommendedTime === "string"
                      ? rawPlace.recommendedTime
                      : "09:00 - 11:00",
                  placeName: String(rawPlace.placeName || `Destinasi #${idx + 1}`),
                  category: categoryVal,
                  description: String(
                    rawPlace.description || "Rekomendasi destinasi populer dari video"
                  ),
                  tips: String(
                    rawPlace.tips || "Cek jam operasional sebelum berkunjung."
                  ),
                  estimatedCost:
                    typeof rawPlace.estimatedCost === "string"
                      ? rawPlace.estimatedCost
                      : undefined,
                  badgeLabel:
                    typeof rawPlace.badgeLabel === "string"
                      ? rawPlace.badgeLabel
                      : typeof rawPlace.estimatedCost === "string"
                      ? rawPlace.estimatedCost
                      : cityVal,
                  badgeTone:
                    categoryVal === "food"
                      ? "orange"
                      : categoryVal === "activity"
                      ? "sunset"
                      : "neutral",
                  sourceUrl: matchedItem?.metadata.url,
                  sourcePlatform: matchedItem?.metadata.platform,
                  sourceAuthor: matchedItem?.metadata.author,
                  location: {
                    lat: Number(locObj.lat) || -7.7956,
                    lng: Number(locObj.lng) || 110.3695,
                    address: String(locObj.address || cityVal),
                  },
                };
              }
            );

            const hintCities = items
              .map((i) => i.cityHint.trim())
              .filter(Boolean);
            const extractedCities = candidatePlaces
              .map((p) => p.city?.trim() || "")
              .filter(Boolean);
            const parsedCities = Array.isArray(parsed.cities)
              ? parsed.cities.map((c: unknown) => String(c).trim()).filter(Boolean)
              : [];

            const uniqueCities = Array.from(
              new Set([...hintCities, ...extractedCities, ...parsedCities])
            );
            if (uniqueCities.length === 0) {
              uniqueCities.push(String(parsed.destination || " Eksplorasi"));
            }

            const initialDays: DayPlan[] = uniqueCities.map(
              (cityName, idx) => ({
                day: idx + 1,
                city: cityName,
                dateLabel: `Hari ${idx + 1} • ${cityName}`,
                fullDateLabel: `Hari ke-${idx + 1} • ${cityName}`,
                weatherLabel: "Cerah",
                efficiencyLabel: "Pilih & Susun Rute",
                title: `Eksplorasi ${cityName}`,
                activities: startWithEmptyDays
                  ? []
                  : candidatePlaces
                      .filter(
                        (p) =>
                          p.city?.toLowerCase() === cityName.toLowerCase()
                      )
                      .map((p) => ({
                        ...p,
                        time: p.recommendedTime || "",
                      })),
              })
            );

            const firstMeta = items[0]?.metadata;
            const validated = ItinerarySchema.parse({
              id: `trip-${Date.now()}`,
              tripTitle:
                parsed.tripTitle ||
                `Eksplorasi ${uniqueCities.join(", ")}${
                  countryHint ? ` (${countryHint})` : ""
                }`,
              country:
                parsed.country || countryHint || uniqueCities[0] || "Internasional",
              cities: uniqueCities,
              destination:
                parsed.destination ||
                `${uniqueCities.join(" & ")}${
                  countryHint ? `, ${countryHint}` : ""
                }`,
              durationDays: initialDays.length,
              summary:
                parsed.summary ||
                `Berhasil mengekstrak ${candidatePlaces.length} destinasi dari ${items.length} link video di ${uniqueCities.join(", ")}. Pilih destinasi di bawah untuk dimasukkan ke jadwal harian Anda.`,
              estimatedBudget: parsed.estimatedBudget || undefined,
              sourceUrl: firstMeta?.url,
              sourcePlatform: firstMeta?.platform,
              sourceAuthor:
                items.length > 1
                  ? `${firstMeta?.author || "@creator"} (+${items.length - 1} link)`
                  : firstMeta?.author,
              sourceLinks,
              candidatePlaces,
              days: initialDays,
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
  const combinedText = items
    .map(
      (i) =>
        `${i.cityHint} ${i.metadata.url} ${i.metadata.title} ${i.metadata.caption}`
    )
    .join(" ")
    .toLowerCase();

  let basePreset = ITINERARY_PRESETS["jogja-2d"];
  if (
    combinedText.includes("tokyo") ||
    combinedText.includes("kyoto") ||
    combinedText.includes("osaka") ||
    combinedText.includes("jepang") ||
    combinedText.includes("japan")
  ) {
    basePreset = ITINERARY_PRESETS["tokyo-48h"];
  } else if (
    combinedText.includes("bali") ||
    combinedText.includes("ubud") ||
    combinedText.includes("canggu") ||
    combinedText.includes("uluwatu")
  ) {
    basePreset = ITINERARY_PRESETS["bali-3d"];
  }

  const candidatePlaces =
    basePreset.candidatePlaces ||
    basePreset.days.flatMap((d) =>
      d.activities.map((a, idx) => ({
        ...a,
        id: a.id || `fallback-${d.day}-${idx}`,
        city: a.city || d.city || basePreset.destination,
        recommendedTime: a.recommendedTime || a.time,
        time: "",
      }))
    );

  const uniqueCities =
    basePreset.cities && basePreset.cities.length > 0
      ? basePreset.cities
      : [basePreset.destination];

  const initialDays: DayPlan[] = startWithEmptyDays
    ? uniqueCities.map((city, idx) => ({
        day: idx + 1,
        city,
        dateLabel: `Hari ${idx + 1} • ${city}`,
        fullDateLabel: `Hari ke-${idx + 1} • ${city}`,
        weatherLabel: "Cerah",
        efficiencyLabel: "Pilih & Susun Rute",
        title: `Eksplorasi ${city}`,
        activities: [],
      }))
    : basePreset.days;

  const firstMeta = items[0]?.metadata;
  const customized: ItineraryData = {
    ...basePreset,
    id: `trip-${Date.now()}`,
    country: countryHint || basePreset.country,
    sourceUrl: firstMeta?.url || basePreset.sourceUrl,
    sourcePlatform: firstMeta?.platform || basePreset.sourcePlatform,
    sourceAuthor: firstMeta?.author || basePreset.sourceAuthor,
    sourceLinks: sourceLinks.length > 0 ? sourceLinks : basePreset.sourceLinks,
    candidatePlaces,
    days: initialDays,
    durationDays: initialDays.length,
  };

  return { itinerary: ItinerarySchema.parse(customized), usedAi: false };
}

export async function generateItineraryFromMetadata(
  metadata: ExtractedSocialMetadata
): Promise<{ itinerary: ItineraryData; usedAi: boolean }> {
  return generateMultiLinkItinerary({
    items: [{ cityHint: "", metadata }],
    startWithEmptyDays: true,
  });
}
