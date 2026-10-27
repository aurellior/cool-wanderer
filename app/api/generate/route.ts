import { NextRequest, NextResponse } from "next/server";
import { extractSocialMetadata } from "@/lib/extractor";
import {
  generateMultiLinkItinerary,
  MultiSourceExtractionItem,
} from "@/lib/gemini";
import { ITINERARY_PRESETS } from "@/lib/presets";
import { ItinerarySchema } from "@/lib/schema";
import { saveItineraryToDb } from "@/lib/db";

interface LinkEntryInput {
  url?: string;
  caption?: string;
}

interface CityGroupInput {
  cityName?: string;
  links?: LinkEntryInput[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      url,
      rawCaption,
      presetId,
      country,
      cityGroups,
      startWithEmptyDays = true,
    } = body as {
      url?: string;
      rawCaption?: string;
      presetId?: string;
      country?: string;
      cityGroups?: CityGroupInput[];
      startWithEmptyDays?: boolean;
    };

    // 1. If a preset ID is explicitly requested, validate & save to DB with a new unique ID
    if (presetId && ITINERARY_PRESETS[presetId]) {
      const basePreset = ITINERARY_PRESETS[presetId];
      const preset = ItinerarySchema.parse({
        ...basePreset,
        id: undefined,
      });
      const savedRecord = await saveItineraryToDb(preset);

      return NextResponse.json({
        id: savedRecord.id,
        createdAt: savedRecord.createdAt,
        itinerary: savedRecord.itinerary,
        metadata: {
          url: preset.sourceUrl || "",
          platform: preset.sourcePlatform || "custom",
          title: preset.tripTitle,
          author: preset.sourceAuthor || "@coolwanderer",
          caption: preset.summary,
          tags: ["#CoolWanderer", "#AIItinerary"],
          rawText: preset.summary,
        },
        usedAi: false,
      });
    }

    // 2. Normalize multi-city / multi-link inputs or single link input
    const flatLinksToExtract: Array<{
      cityHint: string;
      url: string;
      caption: string;
    }> = [];

    if (Array.isArray(cityGroups) && cityGroups.length > 0) {
      for (const group of cityGroups) {
        const cityHint = (group.cityName || "").trim();
        const groupLinks = Array.isArray(group.links) ? group.links : [];
        for (const linkObj of groupLinks) {
          const linkUrl = (linkObj.url || "").trim();
          const linkCap = (linkObj.caption || "").trim();
          if (linkUrl || linkCap) {
            flatLinksToExtract.push({
              cityHint,
              url: linkUrl,
              caption: linkCap,
            });
          }
        }
        // If user entered a city name without a link yet, allow AI to curate places for that city
        if (
          cityHint &&
          groupLinks.every(
            (l) => !(l.url || "").trim() && !(l.caption || "").trim()
          )
        ) {
          flatLinksToExtract.push({
            cityHint,
            url: `https://coolwanderer.local/city/${encodeURIComponent(
              cityHint
            )}`,
            caption: `Rekomendasi destinasi wisata & kuliner populer di kota ${cityHint}${
              country ? `, ${country}` : ""
            }`,
          });
        }
      }
    } else if (url?.trim() || rawCaption?.trim()) {
      // Also support pasting multiple URLs separated by newlines in the single URL field
      const urlLines = (url || "")
        .split(/[\r\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (urlLines.length > 1) {
        urlLines.forEach((u, idx) => {
          flatLinksToExtract.push({
            cityHint: "",
            url: u,
            caption: idx === 0 ? (rawCaption || "").trim() : "",
          });
        });
      } else {
        flatLinksToExtract.push({
          cityHint: "",
          url: (url || "").trim(),
          caption: (rawCaption || "").trim(),
        });
      }
    }

    if (flatLinksToExtract.length === 0) {
      return NextResponse.json(
        {
          error:
            "Mohon masukkan minimal satu link TikTok, Instagram, atau YouTube, atau isi nama kota & catatan destinasi.",
        },
        { status: 400 }
      );
    }

    // 3. Extract social media metadata for all links in parallel
    const extractedItems: MultiSourceExtractionItem[] = await Promise.all(
      flatLinksToExtract.map(async (entry) => {
        const enrichedFallback = [
          entry.cityHint ? `Kota Tujuan: ${entry.cityHint}` : "",
          country?.trim() ? `Negara: ${country.trim()}` : "",
          entry.caption,
        ]
          .filter(Boolean)
          .join(" | ");

        const metadata = await extractSocialMetadata(
          entry.url || "https://coolwanderer.local/custom",
          enrichedFallback || undefined
        );

        return {
          cityHint: entry.cityHint,
          metadata,
        };
      })
    );

    // 4. Generate structured itinerary & selectable destination pool via Gemini AI
    const { itinerary, usedAi } = await generateMultiLinkItinerary({
      countryHint: country?.trim(),
      items: extractedItems,
      startWithEmptyDays,
    });

    // 5. Save generated itinerary to persistent DB and return the DB record ID
    const savedRecord = await saveItineraryToDb({
      ...itinerary,
      id: undefined,
    });

    const firstMeta = extractedItems[0]?.metadata;
    return NextResponse.json({
      id: savedRecord.id,
      createdAt: savedRecord.createdAt,
      itinerary: savedRecord.itinerary,
      metadata: {
        url: firstMeta?.url || "",
        platform: firstMeta?.platform || "custom",
        title: firstMeta?.title || savedRecord.itinerary.tripTitle,
        author: firstMeta?.author || "@coolwanderer",
        caption: firstMeta?.caption || savedRecord.itinerary.summary,
        tags: firstMeta?.tags || [],
      },
      usedAi,
    });
  } catch (error) {
    console.error("Error in /api/generate:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengekstrak dan menyusun itinerary.",
      },
      { status: 500 }
    );
  }
}
