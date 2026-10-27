"use client";

import dynamic from "next/dynamic";
import React from "react";

const DynamicLeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] bg-surface-container-low flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
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
