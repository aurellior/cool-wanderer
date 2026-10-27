"use client";

import React, { useState } from "react";

interface ExploreScreenProps {
  forceMode?: "auto" | "desktop" | "mobile";
  onNavigate?: (tab: "import" | "itinerary" | "explore" | "checklist") => void;
}

export default function ExploreScreen({
  forceMode = "auto",
  onNavigate,
}: ExploreScreenProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(
    "Shibuya & Shinjuku (Day 2)"
  );
  const [activeCategory, setActiveCategory] = useState("all");
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const toggleSave = (id: string) => {
    setSavedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const triggerAdd = (id: string) => {
    setAddedIds((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const showDesktopClass =
    forceMode === "desktop"
      ? "block"
      : forceMode === "mobile"
      ? "hidden"
      : "hidden md:block";

  const showMobileClass =
    forceMode === "mobile"
      ? "block"
      : forceMode === "desktop"
      ? "hidden"
      : "block md:hidden";

  return (
    <>
      {/* ==================== DESKTOP VIEW (Stitch: Eksplorasi & Sekitar POI) ==================== */}
      <div className={showDesktopClass}>
        <div className="flex flex-col w-full">
          {/* Interactive Feedback Banner (AI Context Status) */}
          <div className="w-full px-gutter py-space-sm bg-surface-container-low flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <span className="flex h-2.5 w-2.5 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-label-md text-label-md text-on-surface">
                Mode Eksplorasi Cerdas: Menyelaraskan rekomendasi dengan jadwal
                aktif Anda
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-primary">
                Day 2 • Tokyo Central
              </span>
            </div>
            <div className="flex items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-primary">
                  bolt
                </span>{" "}
                Sinkron 34 POI Terdekat
              </span>
              <span className="hidden sm:inline">
                Terakhir diperbarui: 2 mnt lalu
              </span>
            </div>
          </div>

          <div className="w-full px-gutter py-space-lg flex flex-col gap-space-xl max-w-[1720px] mx-auto">
            {/* SECTION 1: Master Header & Contextual POI Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
              <div className="flex flex-col gap-space-xs max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm uppercase tracking-wider">
                    AI Geospatial Discovery
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Radius Rekomendasi 1.2 KM
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline gap-space-sm">
                  <span className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    Eksplorasi Sekitar
                  </span>
                  <div className="relative inline-block">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-primary font-headline-md text-headline-md transition-all shadow-sm"
                    >
                      <span>{currentLocation}</span>
                      <span className="material-symbols-outlined text-[24px]">
                        arrow_drop_down
                      </span>
                    </button>

                    {/* Dropdown Options */}
                    {dropdownOpen && (
                      <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-surface-container-lowest shadow-xl z-30 p-2">
                        <div className="p-2 text-on-surface-variant font-label-sm text-label-sm uppercase">
                          Pilih Titik Acuan Rute
                        </div>
                        {[
                          {
                            label: "Shibuya & Shinjuku (Day 2)",
                            count: "34 POI teridentifikasi",
                          },
                          {
                            label: "Asakusa & Ueno (Day 3)",
                            count: "28 POI teridentifikasi",
                          },
                          {
                            label: "Ginza & Tsukiji (Day 4)",
                            count: "22 POI teridentifikasi",
                          },
                        ].map((loc) => (
                          <button
                            key={loc.label}
                            onClick={() => {
                              setCurrentLocation(loc.label);
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors"
                          >
                            <div>
                              <div className="font-title-md text-title-md text-on-surface">
                                {loc.label}
                              </div>
                              <div className="font-body-sm text-body-sm text-on-surface-variant">
                                {loc.count}
                              </div>
                            </div>
                            {currentLocation === loc.label && (
                              <span className="material-symbols-outlined text-primary text-[20px]">
                                check_circle
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Pilihan cerdas restoran tersembunyi, hotel jalan kaki, dan
                  kafe estetik yang cocok disisipkan di antara kunjungan Shibuya
                  Sky &amp; Taman Yoyogi tanpa membuang waktu tempuh.
                </p>
              </div>

              {/* Quick Action Stats */}
              <div className="flex items-center gap-space-md p-space-sm bg-surface-container-lowest rounded-2xl shadow-sm">
                <div className="flex items-center gap-space-sm px-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">
                      route
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Efisiensi Rute
                    </span>
                    <span className="font-numeric-metric text-numeric-metric text-on-surface">
                      +94% Optimal
                    </span>
                  </div>
                </div>
                <div className="w-[1px] h-8 bg-surface-container-highest"></div>
                <div className="flex items-center gap-space-sm px-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[22px]">
                      currency_yen
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Indeks Biaya
                    </span>
                    <span className="font-numeric-metric text-numeric-metric text-on-surface">
                      Terjangkau (¥¥)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Category Filter Bar & Secondary Attribute Filters */}
            <div className="flex flex-col gap-space-sm">
              {/* Primary Category Pills */}
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1 no-scrollbar">
                {[
                  {
                    key: "all",
                    icon: "stars",
                    label: "Semua Rekomendasi (34)",
                  },
                  {
                    key: "hotel",
                    icon: "hotel",
                    label: "Hotel & Penginapan (12)",
                  },
                  {
                    key: "cafe",
                    icon: "local_cafe",
                    label: "Kafe & Kopi Spesialisasi (8)",
                  },
                  {
                    key: "culinary",
                    icon: "restaurant",
                    label: "Restoran & Kuliner Lokal (10)",
                  },
                  {
                    key: "activity",
                    icon: "checkroom",
                    label: "Aktivitas & Rental Kimono (4)",
                  },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`px-4 py-2 rounded-xl font-label-md text-label-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      activeCategory === cat.key
                        ? "bg-primary-container text-on-primary shadow-sm"
                        : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {cat.icon}
                    </span>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Secondary Precision Filters */}
              <div className="flex flex-wrap items-center justify-between gap-space-sm p-space-sm bg-surface-container-lowest rounded-2xl shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      tune
                    </span>{" "}
                    Filter Cepat:
                  </span>
                  <button className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-sm text-label-sm flex items-center gap-1 transition-colors">
                    <span className="material-symbols-outlined text-[14px]">
                      near_me
                    </span>{" "}
                    Radius &lt; 1 km
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-sm text-label-sm flex items-center gap-1 transition-colors">
                    <span className="material-symbols-outlined text-[14px] text-amber-500">
                      star
                    </span>{" "}
                    Rating &gt; 4.5
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-sm text-label-sm flex items-center gap-1 transition-colors">
                    <span>Budget: ¥ - ¥¥</span>
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>{" "}
                    Buka Sekarang
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Urutkan:
                  </span>
                  <select className="bg-surface-container-low text-on-surface font-label-sm text-label-sm py-1 px-2.5 rounded-lg focus:outline-none">
                    <option>Paling Relevan untuk Jadwal Day 2</option>
                    <option>Jarak Terdekat (Meter)</option>
                    <option>Rating Tertinggi</option>
                    <option>Harga Paling Hemat</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: Content Split Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
              {/* Left Column: Recommendation Cards Grid (Span 8) */}
              <div className="xl:col-span-8 flex flex-col gap-space-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-title-md text-title-md text-on-surface">
                      Rekomendasi Terpilih Sekitar POI Anda
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-high font-label-sm text-label-sm text-primary">
                      Terkurasi AI
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Menampilkan 4 dari 34 lokasi
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  {/* Card 1: Hotel Indigo Tokyo Shibuya */}
                  {(activeCategory === "all" || activeCategory === "hotel") && (
                    <div className="flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                      <div className="relative w-full h-48 overflow-hidden">
                        <img
                          alt="Hotel Indigo Tokyo Shibuya"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmtQg2dWWtw3K__0ILS_GeTUc28lLV4z_KZL99ONRi26698jlzuZ5qBwlMKeZdTJOIhPeu1gKvFp5IYCGiHAFoc5zi7hQIB8-WZN4EMJFHuVcso1UCKOja-aO_uTDTZPzyKa4Da49E5rEdW7gj8SyAREvdWhW-CPD7qr3dWU_Au06gSogGeUBSWyCqCUmhFcqVfO9HfRmhHtMxL99eAEhAY-MCMCAp3A6zoWy6VJLixo4y2FuGOsTrhg"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md font-label-sm text-label-sm text-on-surface shadow-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-primary">
                              hotel
                            </span>{" "}
                            Hotel Rekomendasi
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm shadow-sm">
                            Langkah Santai
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-on-surface/85 backdrop-blur-sm text-surface font-label-sm text-label-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-amber-400">
                            star
                          </span>{" "}
                          4.8 (1.240)
                        </div>
                      </div>
                      <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
                        <div className="flex flex-col gap-space-xs">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                              Hotel Indigo Tokyo Shibuya
                            </h3>
                            <button
                              onClick={() => toggleSave("indigo")}
                              className={`p-1 rounded-lg hover:bg-surface-container-low transition-colors ${
                                savedIds["indigo"]
                                  ? "text-primary"
                                  : "text-on-surface-variant hover:text-secondary"
                              }`}
                              title="Simpan POI"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {savedIds["indigo"]
                                  ? "bookmark_added"
                                  : "bookmark"}
                              </span>
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              directions_walk
                            </span>
                            <span className="font-medium text-primary">
                              350m dari Shibuya Sky
                            </span>
                            <span>•</span>
                            <span>4 min jalan kaki</span>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                            <span className="material-symbols-outlined text-[16px]">
                              schedule
                            </span>
                            <span>24 Jam Front Desk • Check-in 15:00</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-surface-container-low flex items-start gap-2 mt-1">
                            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                              psychology
                            </span>
                            <p className="font-body-sm text-body-sm text-on-surface">
                              <span className="font-semibold text-primary">
                                AI Insight:
                              </span>{" "}
                              Cocok untuk istirahat setelah Shibuya Sky; dekat
                              stasiun tanpa perlu transit membawa bagasi.
                            </p>
                          </div>
                        </div>
                        <div className="pt-space-sm flex flex-col gap-space-sm">
                          <div className="flex items-baseline justify-between">
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              Tarif per malam
                            </span>
                            <div className="text-right">
                              <span className="font-title-md text-title-md text-secondary font-bold">
                                Rp 2.450.000
                              </span>
                              <span className="font-label-sm text-label-sm text-on-surface-variant">
                                / mlm
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => triggerAdd("indigo")}
                              className="w-full py-2 px-3 rounded-xl bg-primary-container text-on-primary hover:bg-tertiary-container font-label-md text-label-md transition-all shadow-sm flex items-center justify-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {addedIds["indigo"] ? "check" : "add"}
                              </span>{" "}
                              {addedIds["indigo"]
                                ? "Ditambahkan"
                                : "Tambah Rencana"}
                            </button>
                            <button className="w-full py-2 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">
                                open_in_new
                              </span>{" "}
                              Ketersediaan
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 2: Fuglen Tokyo */}
                  {(activeCategory === "all" || activeCategory === "cafe") && (
                    <div className="flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                      <div className="relative w-full h-48 overflow-hidden">
                        <img
                          alt="Fuglen Tokyo"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlZ2O0igRhzkCKsqTHZCpnXs553ZRVf_eZLeucU-gVEnC8hGaLXkdXd0_fgGJ30b91NJ2uPnNxlEQkJl8wfVkPEbDVzhsuhHhsfTJulYmJr4K1nXjHg3ahPko50mPo6xH5XyFoa_UpwMLmnno7H3hbPNogCcb7uaRKChpgRRoGluL8SZGNwiiJqHlpkNL8y8ApN28qZ8pePYGz16_emmDep7XjQVkxhyYI7e_8FcjJwGKC7XHyqJZc-g"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md font-label-sm text-label-sm text-on-surface shadow-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-secondary">
                              local_cafe
                            </span>{" "}
                            Kafe Spesialisasi
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary font-label-sm text-label-sm shadow-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">
                              local_fire_department
                            </span>{" "}
                            Viral TikTok
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-on-surface/85 backdrop-blur-sm text-surface font-label-sm text-label-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-amber-400">
                            star
                          </span>{" "}
                          4.7 (980)
                        </div>
                      </div>
                      <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
                        <div className="flex flex-col gap-space-xs">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                              Fuglen Tokyo (Nordic Vintage Cafe)
                            </h3>
                            <button
                              onClick={() => toggleSave("fuglen")}
                              className={`p-1 rounded-lg hover:bg-surface-container-low transition-colors ${
                                savedIds["fuglen"]
                                  ? "text-primary"
                                  : "text-on-surface-variant hover:text-secondary"
                              }`}
                              title="Simpan POI"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {savedIds["fuglen"]
                                  ? "bookmark_added"
                                  : "bookmark"}
                              </span>
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              directions_walk
                            </span>
                            <span className="font-medium text-primary">
                              600m dari Yoyogi Park
                            </span>
                            <span>•</span>
                            <span>7 min jalan kaki santai</span>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                            <span className="material-symbols-outlined text-[16px]">
                              schedule
                            </span>
                            <span>08:00 - 22:00 (Kopi terbaik pagi hari)</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-surface-container-low flex items-start gap-2 mt-1">
                            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                              psychology
                            </span>
                            <p className="font-body-sm text-body-sm text-on-surface">
                              <span className="font-semibold text-primary">
                                AI Insight:
                              </span>{" "}
                              Sering viral di TikTok @tokyocafehunt untuk iced
                              latte &amp; pastry kayu manis segar. Pas untuk
                              recharge.
                            </p>
                          </div>
                        </div>
                        <div className="pt-space-sm flex flex-col gap-space-sm">
                          <div className="flex items-baseline justify-between">
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              Rentang harga
                            </span>
                            <div className="text-right">
                              <span className="font-title-md text-title-md text-on-surface font-bold">
                                ¥650 - ¥1,200
                              </span>
                              <span className="font-label-sm text-label-sm text-on-surface-variant block">
                                ~Rp 68.000 - Rp 125.000
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => triggerAdd("fuglen")}
                            className="w-full py-2 px-3 rounded-xl bg-primary-container text-on-primary hover:bg-tertiary-container font-label-md text-label-md transition-all shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {addedIds["fuglen"] ? "check" : "add_circle"}
                            </span>{" "}
                            {addedIds["fuglen"]
                              ? "Berhasil Dimasukkan ke Day 2!"
                              : "Masukkan ke Day 2 (Break Santai)"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 3: Gyukatsu Motomura Shibuya */}
                  {(activeCategory === "all" ||
                    activeCategory === "culinary") && (
                    <div className="flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                      <div className="relative w-full h-48 overflow-hidden">
                        <img
                          alt="Gyukatsu Motomura Shibuya"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuChON9V7ZzDENfsbiNoWeupFN-AYjWaIRor9Ba6w-TZ4OWPRO_BE4n1r0Zcd4UDIBfpQO2UjSo_0z4zpnGgxqVYPQ-q0HkgKlQ-B6ntI0wqizT9nnmAHNkIGrZ4J6xfZBse1n8I2jvCPtJIuoyZhUQKT_hrkmoVELCbjegDv97cEMY4-zW_OzV-RQDFFiJczoJf6Fa8z_NZK94gGa7HzbaYghWueDVLGOesJs9fvmxH22igstbHi-K3jA"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md font-label-sm text-label-sm text-on-surface shadow-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-tertiary">
                              restaurant
                            </span>{" "}
                            Kuliner Unggulan
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                            Halal-Friendly Beef
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-on-surface/85 backdrop-blur-sm text-surface font-label-sm text-label-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-amber-400">
                            star
                          </span>{" "}
                          4.9 (3.110)
                        </div>
                      </div>
                      <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
                        <div className="flex flex-col gap-space-xs">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                              Gyukatsu Motomura Shibuya
                            </h3>
                            <button
                              onClick={() => toggleSave("gyukatsu")}
                              className={`p-1 rounded-lg hover:bg-surface-container-low transition-colors ${
                                savedIds["gyukatsu"]
                                  ? "text-primary"
                                  : "text-on-surface-variant hover:text-secondary"
                              }`}
                              title="Simpan POI"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {savedIds["gyukatsu"]
                                  ? "bookmark_added"
                                  : "bookmark"}
                              </span>
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              directions_walk
                            </span>
                            <span className="font-medium text-primary">
                              250m dari Stasiun Hachiko
                            </span>
                            <span>•</span>
                            <span>3 min jalan kaki</span>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                            <span className="material-symbols-outlined text-[16px]">
                              schedule
                            </span>
                            <span>11:00 - 22:00 (Antrean rata-rata 35 mnt)</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-surface-container-low flex items-start gap-2 mt-1">
                            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                              psychology
                            </span>
                            <p className="font-body-sm text-body-sm text-on-surface">
                              <span className="font-semibold text-primary">
                                AI Insight:
                              </span>{" "}
                              Daging sapi katsu panggang batu panas terbaik di
                              Shibuya. Saran tiba pkl 17:15 sebelum jam padat
                              malam.
                            </p>
                          </div>
                        </div>
                        <div className="pt-space-sm flex flex-col gap-space-sm">
                          <div className="flex items-baseline justify-between">
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              Estimasi menu set
                            </span>
                            <div className="text-right">
                              <span className="font-title-md text-title-md text-on-surface font-bold">
                                ¥1,900 - ¥2,600
                              </span>
                              <span className="font-label-sm text-label-sm text-on-surface-variant block">
                                Rp 200.000 - Rp 270.000
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => triggerAdd("gyukatsu")}
                            className="w-full py-2 px-3 rounded-xl bg-primary-container text-on-primary hover:bg-tertiary-container font-label-md text-label-md transition-all shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {addedIds["gyukatsu"] ? "check" : "add_circle"}
                            </span>{" "}
                            {addedIds["gyukatsu"]
                              ? "Ditambahkan ke Day 2!"
                              : "Tambahkan ke Day 2 (Makan Malam)"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 4: Yawaragi Kimono Rental Asakusa */}
                  {(activeCategory === "all" ||
                    activeCategory === "activity") && (
                    <div className="flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                      <div className="relative w-full h-48 overflow-hidden">
                        <img
                          alt="Yawaragi Kimono Rental"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCcLEto6yGhjFKu99rJQuYyvrcRxgkcebvrdxCASHB5Q_2rVZMq_MC4Hud5ndrqpZyHNqfp5byMmMpCn35ZkQjzdBPQj1o2Nj5RMlWdEHeV7Y4bTUx9Ah1MCyApjNKr-EuaRtlBEFI7Xn4E0Sj-5SCWyHNzgZnccdCbJHebnHjkwLTdgF45PfyTiZ8-oJq-s4zvWzLxIbIOcbHN0TxLinouiysYO8H5hLIVuPuBfeGy94Ku97tSyYnog"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md font-label-sm text-label-sm text-on-surface shadow-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-secondary">
                              checkroom
                            </span>{" "}
                            Rental Budaya
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                            Layanan Bahasa Inggris
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-on-surface/85 backdrop-blur-sm text-surface font-label-sm text-label-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-amber-400">
                            star
                          </span>{" "}
                          4.8 (520)
                        </div>
                      </div>
                      <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
                        <div className="flex flex-col gap-space-xs">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                              Yawaragi Kimono Rental Asakusa
                            </h3>
                            <button
                              onClick={() => toggleSave("kimono")}
                              className={`p-1 rounded-lg hover:bg-surface-container-low transition-colors ${
                                savedIds["kimono"]
                                  ? "text-primary"
                                  : "text-on-surface-variant hover:text-secondary"
                              }`}
                              title="Simpan POI"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {savedIds["kimono"]
                                  ? "bookmark_added"
                                  : "bookmark"}
                              </span>
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              directions_walk
                            </span>
                            <span className="font-medium text-primary">
                              150m dari Kuil Senso-ji
                            </span>
                            <span>•</span>
                            <span>2 min jalan kaki</span>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                            <span className="material-symbols-outlined text-[16px]">
                              schedule
                            </span>
                            <span>
                              09:00 - 18:00 (Booking via app disarankan)
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-surface-container-low flex items-start gap-2 mt-1">
                            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                              psychology
                            </span>
                            <p className="font-body-sm text-body-sm text-on-surface">
                              <span className="font-semibold text-primary">
                                AI Insight:
                              </span>{" "}
                              Sudah mencakup tata rambut, tas tradisional, dan
                              sandal geta. Sangat dekat gerbang Kaminarimon.
                            </p>
                          </div>
                        </div>
                        <div className="pt-space-sm flex flex-col gap-space-sm">
                          <div className="flex items-baseline justify-between">
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              Paket 4 jam
                            </span>
                            <div className="text-right">
                              <span className="font-title-md text-title-md text-secondary font-bold">
                                Rp 380.000
                              </span>
                              <span className="font-label-sm text-label-sm text-on-surface-variant block">
                                Lengkap + styling rambut
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => triggerAdd("kimono")}
                            className="w-full py-2 px-3 rounded-xl bg-primary-container text-on-primary hover:bg-tertiary-container font-label-md text-label-md transition-all shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {addedIds["kimono"] ? "check" : "add_circle"}
                            </span>{" "}
                            {addedIds["kimono"]
                              ? "Ditambahkan ke Day 2 Pagi!"
                              : "Masukkan ke Day 2 Pagi"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Inline Pagination & Infinite Discovery Prompt */}
                <div className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-md text-center sm:text-left">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                      <span className="material-symbols-outlined text-[20px]">
                        explore
                      </span>
                    </div>
                    <div>
                      <div className="font-title-md text-title-md text-on-surface">
                        Ingin Rekomendasi di Distrik Lain?
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">
                        Algoritma siap memindai kafe vintage di Shimokitazawa
                        &amp; Roppongi.
                      </div>
                    </div>
                  </div>
                  <button className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-variant text-primary font-label-md text-label-md whitespace-nowrap transition-colors flex items-center gap-2">
                    Muat 12 Tempat Lainnya{" "}
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_downward
                    </span>
                  </button>
                </div>
              </div>

              {/* Right Column: AI Proximity Matcher & Price Comparison Drawer (Span 4) */}
              <div className="xl:col-span-4 flex flex-col gap-space-lg sticky top-28">
                {/* Live Map Preview Segment */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-title-md text-title-md text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        map
                      </span>
                      Peta Sebaran Sekitar POI
                    </span>
                    <span className="font-label-sm text-label-sm text-primary">
                      Interaktif
                    </span>
                  </div>
                  <div
                    className="w-full h-44 rounded-xl bg-cover bg-center relative overflow-hidden flex items-end p-2.5"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC1_Jp_WBQ5_kuI-JTp18ie6QSOs6eA1izlkNZPeEata7TlIQnzwnFuSKmaXp-wmYpQrlZjooO1mnoeelM82s9D3E90DSurySPg1dQUeqHJADoBio5INPmpTJFWp7OGkFQtFaKz8zu4Xb35Onb6Erc8v5a2ggCcTlhOw6FhybnkFRTE3fhQpq-VRJlQbKCMk1iX8163g_bZJ_Xtlzy0jhFmfmf00-uorumTjGi7g5w79QlBu6FvGhavuA')",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-on-surface/70 via-transparent to-transparent"></div>
                    <div className="relative z-10 w-full flex items-center justify-between">
                      <div className="px-2.5 py-1 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-primary text-[14px]">
                          pin_drop
                        </span>{" "}
                        4 Titik Terpilih
                      </div>
                      <button
                        onClick={() => onNavigate?.("itinerary")}
                        className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm flex items-center gap-1 shadow-sm hover:bg-primary-container"
                      >
                        Perbesar Peta{" "}
                        <span className="material-symbols-outlined text-[12px]">
                          open_in_full
                        </span>
                      </button>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Semua titik berada dalam koridor jalan kaki maksimal 8 menit
                    dari Shibuya Crossing.
                  </p>
                </div>

                {/* Budget Estimator Widget */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                        AI Financial Forecaster
                      </span>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface">
                        Ringkasan Budget Day 2
                      </h4>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                      <span className="material-symbols-outlined text-[18px]">
                        account_balance_wallet
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-2">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-on-surface-variant">
                        Estimasi Makan Rata-rata / Hari:
                      </span>
                      <span className="font-semibold text-on-surface">
                        ¥4.500{" "}
                        <span className="text-on-surface-variant font-normal">
                          (~Rp 470rb)
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-on-surface-variant">
                        Tiket &amp; Aktivitas Berbayar:
                      </span>
                      <span className="font-semibold text-on-surface">
                        Rp 380.000
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-on-surface-variant">
                        Transportasi Lokal (Metro):
                      </span>
                      <span className="font-semibold text-on-surface">
                        ¥800 (~Rp 84rb)
                      </span>
                    </div>
                    <div className="h-[1px] bg-surface-container-highest my-1"></div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between font-label-sm text-label-sm">
                        <span className="text-on-surface-variant">
                          Realisasi dari Plafon Harian (Rp 1.5 Jt)
                        </span>
                        <span className="text-primary font-bold">
                          62% Terpakai
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: "62%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparative Hotel Matrix */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                        Perbandingan Langsung
                      </span>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface">
                        Hotel Sekitar Shibuya
                      </h4>
                    </div>
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      swap_vert
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-title-md text-title-md text-on-surface font-semibold">
                            Hotel Granbell
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                            3★
                          </span>
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Jarak: 400m dari stasiun
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-numeric-metric text-numeric-metric text-on-surface">
                          Rp 1.150.000
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          / malam
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-primary-fixed/30 hover:bg-primary-fixed/40 transition-colors flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-title-md text-title-md text-primary font-bold">
                            Hotel Indigo Tokyo
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary font-label-sm text-label-sm">
                            5★ AI Pick
                          </span>
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Jarak: 350m (Sangat Dekat)
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-numeric-metric text-numeric-metric text-secondary font-bold">
                          Rp 2.450.000
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          / malam
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-title-md text-title-md text-on-surface font-semibold">
                            Shibuya Stream Excel
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                            4★
                          </span>
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Terhubung langsung ke stasiun
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-numeric-metric text-numeric-metric text-on-surface">
                          Rp 1.850.000
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          / malam
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-space-xs flex flex-col gap-2">
                    <button
                      onClick={() => triggerAdd("all-draft")}
                      className="w-full py-3 px-4 rounded-xl bg-primary-container text-on-primary hover:bg-tertiary-container font-title-md text-title-md font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        bookmark_added
                      </span>
                      {addedIds["all-draft"]
                        ? "Tersimpan ke Draft!"
                        : "Simpan Semua Pilihan ke Draft"}
                    </button>
                    <p className="font-label-sm text-label-sm text-center text-on-surface-variant">
                      Perubahan otomatis disimpan ke profil trip &amp; tersinkron
                      ke offline map.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE VIEW (Stitch: Sekitar & POI Mobile) ==================== */}
      <div className={showMobileClass}>
        <div className="flex flex-col w-full bg-surface-container-lowest">
          {/* Context Header & Location Filter */}
          <section className="px-margin-mobile pt-space-sm pb-space-xs">
            <div className="flex items-center justify-between gap-space-xs">
              <div className="min-w-0">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                  Eksplorasi Area
                </span>
                <h1 className="font-headline-sm text-headline-sm text-on-surface truncate">
                  Rekomendasi di Sekitar
                </h1>
              </div>
              <button
                aria-label="Filter radius"
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors flex-shrink-0"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  tune
                </span>
              </button>
            </div>
            <div className="mt-space-sm">
              <button
                className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface shadow-sm active:scale-95 transition-all"
                type="button"
              >
                <span
                  className="material-symbols-outlined text-primary text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  location_on
                </span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Shibuya &amp; Shinjuku (Hari 2)
                </span>
                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
                  expand_more
                </span>
              </button>
            </div>
          </section>

          {/* Filter Chips Horizontal Scroll */}
          <section className="mt-space-sm">
            <div className="flex items-center gap-space-xs px-margin-mobile overflow-x-auto no-scrollbar py-1">
              {[
                { key: "all", label: "Semua" },
                { key: "hotel", label: "Hotel" },
                { key: "cafe", label: "Kafe & Kopi" },
                { key: "culinary", label: "Kuliner" },
                { key: "activity", label: "Budaya" },
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setActiveCategory(pill.key)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-all active:scale-95 ${
                    activeCategory === pill.key
                      ? "bg-primary text-on-primary font-semibold shadow-sm"
                      : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                  }`}
                  type="button"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </section>

          {/* Interactive Mini Map Snippet */}
          <section className="px-margin-mobile mt-space-md">
            <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-sm bg-surface-container group">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAmqInm8ZC93Dv2Dv_sJXNha99moqv5VvmBI_Fxs7Mse4TszIA8dMeMijK-3ezrHWXGIks61KetNVB6gSC1QguZpamUonaULP-1BCEu-Qqz7k3gGjgslMImzcevqBhhBXF0FFd_Viao8r8C9RvalUZJnlC_Vz9eh4YqLhm4AIw5n56VChLtyPRTRZauuCdLOpTxYkqukOeuvWsDkdxYtPBkFKNeGsLvRbvHWBUKfPcVLljdUR1DKjBIPw')",
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/40 via-transparent to-transparent pointer-events-none"></div>

              {/* Decorative Map Pins */}
              <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <span className="absolute w-8 h-8 rounded-full bg-primary/20 animate-ping"></span>
                <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                  <span
                    className="material-symbols-outlined text-[15px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    hotel
                  </span>
                </div>
              </div>
              <div className="absolute top-1/3 right-1/4 transform translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shadow-md">
                  <span
                    className="material-symbols-outlined text-[15px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    local_cafe
                  </span>
                </div>
              </div>
              <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 translate-y-1/2 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md">
                  <span
                    className="material-symbols-outlined text-[15px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    restaurant
                  </span>
                </div>
              </div>
              <div className="absolute top-2/3 right-1/3 transform -translate-x-1/2 translate-y-1/2 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-md ring-4 ring-tertiary/20">
                  <span className="w-2 h-2 rounded-full bg-on-tertiary"></span>
                </div>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Radius 800m
                </span>
                <button
                  onClick={() => onNavigate?.("itinerary")}
                  className="px-3.5 py-1.5 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-primary font-label-md text-label-md font-semibold shadow-md hover:bg-surface-container-lowest transition-all flex items-center gap-1.5 active:scale-95"
                  type="button"
                >
                  <span>Lihat di Peta</span>
                  <span className="material-symbols-outlined text-[16px]">
                    map
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Curated Cards Feed */}
          <section className="px-margin-mobile mt-space-lg flex flex-col gap-space-md pb-6">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
                3 Tempat Terpilih
              </span>
              <span className="font-body-sm text-body-sm text-primary flex items-center gap-0.5">
                <span>Diurutkan Jarak</span>
                <span className="material-symbols-outlined text-[16px]">
                  sort
                </span>
              </span>
            </div>

            {/* Mobile Card 1: Hotel Indigo */}
            <article className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-surface-container flex flex-col">
              <div className="relative w-full h-48 bg-surface-container">
                <img
                  alt="Hotel Indigo Tokyo Shibuya"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrl9ccdASyTKBVxyeBmpyYRdosBoj-NMqyQmFr7VGelKTbWSVlyohlJYUWhHuSEgO8bODk9NLBY4dIkubTomM64gFYKABZcNclmYuxeeOnrGxc5h2kUYnVCbuqj0_vj-KDaegM_wv4PvcSRmJCPhBoLvIAbXFRsum_l6Yf66Z2rfdVT9kdKv3CL5MhAjvI7RMidpcMaQeGVXB_dblQjQ93v6Jv9bRIcLY-Ahx2zpXnYq_i8gyQvva0rA"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-semibold shadow-sm">
                    Boutique Hotel
                  </span>
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-bold shadow-sm flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-secondary text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span>4.8</span>
                  <span className="text-on-surface-variant font-normal">
                    (420+)
                  </span>
                </div>
              </div>
              <div className="p-space-md flex flex-col gap-space-sm">
                <div>
                  <h2 className="font-title-md text-title-md text-on-surface font-bold">
                    Hotel Indigo Tokyo Shibuya
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      near_me
                    </span>
                    <span className="font-body-sm text-body-sm">
                      350m dari Shibuya Sky
                    </span>
                    <span className="text-outline">•</span>
                    <span className="font-body-sm text-body-sm">Dogenzaka</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-space-xs mt-space-xs">
                  <div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block">
                      Mulai dari
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-title-md text-title-md font-bold text-on-surface">
                        Rp 2.450.000
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        /mlm
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSave("m-indigo")}
                    className={`px-4 py-2 rounded-xl font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 active:scale-95 ${
                      savedIds["m-indigo"]
                        ? "bg-surface-container-high text-primary"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {savedIds["m-indigo"] ? "bookmark" : "bookmark_border"}
                    </span>
                    <span>{savedIds["m-indigo"] ? "Tersimpan" : "Simpan"}</span>
                  </button>
                </div>
              </div>
            </article>

            {/* Mobile Card 2: Fuglen Tokyo */}
            <article className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-surface-container flex flex-col">
              <div className="relative w-full h-48 bg-surface-container">
                <img
                  alt="Fuglen Tokyo"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbQeeyybCo6QOl_DaJQpQblt74UpJ5-BfK42mqS8ys-FSM68cVdcTsFHBc4JSlCQhAYHEDUAebOuhLksKa8rXEnu4TaWTsSCYrLatCig8Jo3PzrliOe8_4xjhN7-vxkiVQ2KcULD1bmg9766fxDIKnKU9UEYTpKK2RNuAHGArCk7i0QbpqzvuXE_oXP7DOuG4pDAXUF9Lf5_dASW1Xd5nfDFXPMhb5RHRqeXVHNSpxTVNzYx5GaNhUxg"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-semibold shadow-sm">
                    Kafe Nordic Vintage
                  </span>
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-bold shadow-sm flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-secondary text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span>4.7</span>
                  <span className="text-on-surface-variant font-normal">
                    (1.2k)
                  </span>
                </div>
              </div>
              <div className="p-space-md flex flex-col gap-space-sm">
                <div>
                  <h2 className="font-title-md text-title-md text-on-surface font-bold">
                    Fuglen Tokyo
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      directions_walk
                    </span>
                    <span className="font-body-sm text-body-sm">
                      600m dari Yoyogi Park
                    </span>
                    <span className="text-outline">•</span>
                    <span className="font-body-sm text-body-sm">Tomigaya</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-space-xs mt-space-xs">
                  <div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block">
                      Kisaran Harga
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-title-md text-title-md font-bold text-on-surface">
                        Rp 68.000
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        /kopi
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerAdd("m-fuglen")}
                    className={`px-4 py-2 rounded-xl font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                      addedIds["m-fuglen"]
                        ? "bg-surface-container-high text-primary"
                        : "bg-primary hover:bg-tertiary-container text-on-primary"
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {addedIds["m-fuglen"] ? "check" : "add"}
                    </span>
                    <span>
                      {addedIds["m-fuglen"] ? "Ditambahkan" : "Tambah"}
                    </span>
                  </button>
                </div>
              </div>
            </article>

            {/* Mobile Card 3: Gyukatsu Motomura */}
            <article className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-surface-container flex flex-col">
              <div className="relative w-full h-48 bg-surface-container">
                <img
                  alt="Gyukatsu Motomura"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAw4HadMapCS_InkXkDvndCheWn2X1mPQzhs6vEo6UepN8IlQ_O4d1FaKDFWEIxjFRkMIZ07mcGVqQQWOhtyOZq-P1sEbN7fz55Bl1lX_VYr9S4TC75Oj1Ar2gV4wPCs4c-peOvWPNmMW77sgQNxhIE62E1v5EomxXBOeNgXv5kE52H4-XpBuui24G4OMR2m0c3dDlOpaaGOAUzX0iMINhxj_dFN9ro5kdARCCPJ6-54evwVOeuQBnbfQ"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-semibold shadow-sm">
                    Kuliner Daging Sapi
                  </span>
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-bold shadow-sm flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-secondary text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span>4.9</span>
                  <span className="text-on-surface-variant font-normal">
                    (2.8k)
                  </span>
                </div>
              </div>
              <div className="p-space-md flex flex-col gap-space-sm">
                <div>
                  <h2 className="font-title-md text-title-md text-on-surface font-bold">
                    Gyukatsu Motomura Shibuya
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      train
                    </span>
                    <span className="font-body-sm text-body-sm">
                      250m dari Stasiun Shibuya
                    </span>
                    <span className="text-outline">•</span>
                    <span className="font-body-sm text-body-sm">
                      Panggang Batu
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-space-xs mt-space-xs">
                  <div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block">
                      Kisaran Harga
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-title-md text-title-md font-bold text-on-surface">
                        Rp 195.000
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        /porsi
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerAdd("m-gyukatsu")}
                    className={`px-4 py-2 rounded-xl font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                      addedIds["m-gyukatsu"]
                        ? "bg-surface-container-high text-primary"
                        : "bg-primary hover:bg-tertiary-container text-on-primary"
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {addedIds["m-gyukatsu"] ? "check" : "add"}
                    </span>
                    <span>
                      {addedIds["m-gyukatsu"] ? "Ditambahkan" : "Tambah"}
                    </span>
                  </button>
                </div>
              </div>
            </article>
          </section>
        </div>
      </div>
    </>
  );
}
