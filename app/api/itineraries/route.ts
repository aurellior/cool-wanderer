import { NextRequest, NextResponse } from "next/server";
import {
  deleteItineraryFromDb,
  getItinerariesByIdsFromDb,
  getItineraryByIdFromDb,
  saveItineraryToDb,
} from "@/lib/db";
import { ItinerarySchema } from "@/lib/schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const singleId = searchParams.get("id");
    const multipleIdsParam = searchParams.get("ids");

    if (singleId) {
      const record = await getItineraryByIdFromDb(singleId);
      if (!record) {
        return NextResponse.json(
          { error: "Itinerary tidak ditemukan di database." },
          { status: 404 }
        );
      }
      return NextResponse.json({ record });
    }

    if (multipleIdsParam !== null) {
      const ids = multipleIdsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const records = await getItinerariesByIdsFromDb(ids);
      return NextResponse.json({ records });
    }

    return NextResponse.json({ records: [] });
  } catch (error) {
    console.error("Error in GET /api/itineraries:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data riwayat dari database." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { itinerary } = body as { itinerary?: unknown };
    if (!itinerary) {
      return NextResponse.json(
        { error: "Data itinerary diperlukan." },
        { status: 400 }
      );
    }

    const validated = ItinerarySchema.parse(itinerary);
    const saved = await saveItineraryToDb(validated);
    return NextResponse.json({ record: saved });
  } catch (error) {
    console.error("Error in PUT /api/itineraries:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan perubahan itinerary ke database." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Parameter id diperlukan." },
        { status: 400 }
      );
    }
    const deleted = await deleteItineraryFromDb(id);
    return NextResponse.json({ deleted });
  } catch (error) {
    console.error("Error in DELETE /api/itineraries:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data dari database." },
      { status: 500 }
    );
  }
}
