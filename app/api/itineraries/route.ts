import { NextRequest, NextResponse } from "next/server";
import {
  deleteItineraryFromDb,
  getItinerariesByIdsFromDb,
  getItineraryByIdFromDb,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const singleId = searchParams.get("id");
    const multipleIdsParam = searchParams.get("ids");

    if (singleId) {
      const record = getItineraryByIdFromDb(singleId);
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
      const records = getItinerariesByIdsFromDb(ids);
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
    const deleted = deleteItineraryFromDb(id);
    return NextResponse.json({ deleted });
  } catch (error) {
    console.error("Error in DELETE /api/itineraries:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data dari database." },
      { status: 500 }
    );
  }
}
