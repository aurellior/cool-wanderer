import { NextRequest, NextResponse } from "next/server";
import { extractSocialMetadata } from "@/lib/extractor";
import { generateItineraryFromMetadata } from "@/lib/gemini";
import { ITINERARY_PRESETS } from "@/lib/presets";
import { ItinerarySchema } from "@/lib/schema";
import { generateItineraryId, saveItineraryToDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, rawCaption, presetId } = body as {
      url?: string;
      rawCaption?: string;
      presetId?: string;
    };

    // 1. If a preset ID is explicitly requested, validate & save to DB with a new unique ID
    if (presetId && ITINERARY_PRESETS[presetId]) {
      const preset = ItinerarySchema.parse({
        ...ITINERARY_PRESETS[presetId],
        id: generateItineraryId(),
      });
      const savedRecord = saveItineraryToDb(preset);

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

    if (!url?.trim() && !rawCaption?.trim()) {
      return NextResponse.json(
        {
          error:
            "Mohon masukkan URL TikTok, Instagram, atau YouTube, atau tempel transkrip/caption manual.",
        },
        { status: 400 }
      );
    }

    // 2. Extract social media metadata (Instagram Embed / TikWM / YouTube / OpenGraph)
    const metadata = await extractSocialMetadata(
      url?.trim() || "https://coolwanderer.local/custom",
      rawCaption?.trim()
    );

    // 3. Generate structured itinerary via Gemini API
    const { itinerary, usedAi } = await generateItineraryFromMetadata(metadata);

    // 4. Save generated itinerary to persistent DB and return the DB record ID
    const savedRecord = saveItineraryToDb({
      ...itinerary,
      id: generateItineraryId(),
    });

    return NextResponse.json({
      id: savedRecord.id,
      createdAt: savedRecord.createdAt,
      itinerary: savedRecord.itinerary,
      metadata: {
        url: metadata.url,
        platform: metadata.platform,
        title: metadata.title,
        author: metadata.author,
        caption: metadata.caption,
        tags: metadata.tags,
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
