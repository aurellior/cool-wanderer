"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Compass } from "lucide-react";

const DynamicLeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] bg-surface-container-low flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="w-11 h-11 rounded-2xl bg-primary-fixed/60 text-primary flex items-center justify-center shadow-sm">
        <Compass className="w-6 h-6 animate-spin" />
      </div>
      <p className="font-title-md text-title-md text-on-surface font-semibold">
        Memuat Peta Interaktif Rute Perjalanan...
      </p>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Menyiapkan koordinat geospasial dan pin urutan kunjungan
      </p>
    </div>
  ),
});

export default DynamicLeafletMap;
