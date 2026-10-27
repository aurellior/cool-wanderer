"use client";

import React, { useState } from "react";

interface ItineraryScreenProps {
  forceMode?: "auto" | "desktop" | "mobile";
  onNavigate?: (tab: "import" | "itinerary" | "explore" | "checklist") => void;
}

export default function ItineraryScreen({
  forceMode = "auto",
  onNavigate,
}: ItineraryScreenProps) {
  const [activeDay, setActiveDay] = useState<number>(2);
  const [optimizing, setOptimizing] = useState<"idle" | "loading" | "done">(
    "idle"
  );
  const [selectedPin, setSelectedPin] = useState<number | null>(4);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  const handleOptimize = () => {
    if (optimizing !== "idle") return;
    setOptimizing("loading");
    setTimeout(() => {
      setOptimizing("done");
      setTimeout(() => setOptimizing("idle"), 3000);
    }, 1000);
  };

  const days = [
    { id: 0, label: "Semua Hari", short: "Semua" },
    { id: 1, label: "Day 1: Tiba & Shinjuku", short: "Hari 1 • 15 Nov" },
    { id: 2, label: "Day 2: Asakusa & Shibuya", short: "Hari 2 • 16 Nov" },
    { id: 3, label: "Day 3: Akihabara & Ginza", short: "Hari 3 • 17 Nov" },
    { id: 4, label: "Day 4: Shinkansen ke Kyoto", short: "Hari 4 • 18 Nov" },
    { id: 5, label: "Day 5: Arashiyama Bamboo", short: "Hari 5 • 19 Nov" },
  ];

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
      {/* ==================== DESKTOP VIEW (Stitch: Itinerary & Smart Map Builder) ==================== */}
      <div className={showDesktopClass}>
        <div className="flex flex-col w-full">
          {/* Trip Header & Control Surface */}
          <section className="w-full px-gutter py-space-md bg-surface-container-lowest shadow-sm">
            <div className="max-w-[1720px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
              {/* Title & Trip Meta */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-space-sm flex-wrap">
                  <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm">
                    Trip Musim Gugur 🍁
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      calendar_today
                    </span>
                    15 - 21 November 2025 • 7 Hari 6 Malam
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">
                      group
                    </span>
                    2 Traveler (Rian &amp; Maya)
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  Eksplorasi Tokyo &amp; Kyoto Musim Gugur
                </h1>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-space-sm flex-wrap">
                <button
                  onClick={handleOptimize}
                  className="flex items-center gap-space-xs px-4 py-2.5 rounded-xl bg-primary-container text-on-primary font-title-md text-title-md hover:bg-tertiary-container shadow-sm transition-all transform active:scale-95"
                  type="button"
                >
                  {optimizing === "loading" ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin text-on-primary-container">
                        sync
                      </span>
                      <span>Menghitung Rute Terbaik...</span>
                    </>
                  ) : optimizing === "done" ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] text-primary-fixed">
                        check_circle
                      </span>
                      <span>Rute Hemat 22 Mnt Berhasil Diterapkan!</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px] text-on-primary-container animate-pulse">
                        auto_fix_high
                      </span>
                      <span>Optimalkan Rute Otomatis (AI)</span>
                    </>
                  )}
                </button>
                <button
                  className="flex items-center gap-space-xs px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-title-md text-title-md hover:bg-surface-container transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    map
                  </span>
                  <span>Ekspor Google Maps &amp; PDF</span>
                </button>
                <button
                  className="flex items-center gap-space-xs px-3 py-2.5 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    share
                  </span>
                  <span className="font-title-md text-title-md">Bagikan</span>
                </button>
              </div>
            </div>

            {/* Day Navigation Bar */}
            <div className="max-w-[1720px] mx-auto mt-space-md pt-space-sm flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {days.map((day) => {
                const isActive = activeDay === day.id;
                return isActive ? (
                  <button
                    key={day.id}
                    onClick={() => setActiveDay(day.id)}
                    className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-title-md text-title-md shadow-sm flex items-center gap-2 whitespace-nowrap"
                  >
                    <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                    <span>{day.label}</span>
                    <span className="px-2 py-0.5 rounded-md bg-tertiary-container text-on-tertiary font-label-sm text-label-sm">
                      Aktif
                    </span>
                  </button>
                ) : (
                  <button
                    key={day.id}
                    onClick={() => setActiveDay(day.id)}
                    className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors whitespace-nowrap"
                  >
                    {day.label}
                  </button>
                );
              })}
              <button className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-surface-container-highest text-primary font-label-md text-label-md hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                <span>Tambah Hari</span>
              </button>
            </div>
          </section>

          {/* Dual-Pane Architecture */}
          <div className="w-full px-gutter py-space-md max-w-[1720px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* LEFT SIDE (58%): Interactive Timeline Day 2 */}
              <div className="lg:col-span-7 flex flex-col gap-space-md">
                {/* Day Overview & Weather Strip */}
                <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                      <span className="material-symbols-outlined text-[26px]">
                        wb_sunny
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-headline-sm text-on-surface">
                          Selasa, 16 November 2025
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                          4 Destinasi
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Cerah Berawan 16°C • Waktu jalan kaki optimal • Jam
                        matahari terbenam: 16:34
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-numeric-metric text-numeric-metric">
                      Total Budget: ¥3,310 (~Rp 345.000)
                    </span>
                  </div>
                </div>

                {/* Vertical Timeline Stream */}
                <div className="relative flex flex-col pl-4">
                  {/* Continuous Guideline Background */}
                  <div className="absolute left-[35px] top-6 bottom-6 w-0.5 bg-surface-container-high z-0"></div>

                  {/* POI 1: Kuil Senso-ji */}
                  <div
                    onClick={() => setSelectedPin(1)}
                    className="relative z-10 flex items-start gap-space-md mb-space-md group cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-numeric-metric text-numeric-metric flex items-center justify-center shadow-md">
                        1
                      </div>
                      <span className="font-label-sm text-label-sm text-primary font-bold mt-1">
                        09:00
                      </span>
                    </div>
                    <div
                      className={`flex-1 p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all ${
                        selectedPin === 1 ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-space-md justify-between">
                        <div className="flex gap-space-md flex-1">
                          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                            <img
                              alt="Kuil Senso-ji"
                              className="w-full h-full object-cover"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyEXDlJVZaM9TMb5lgZJhIcb8Zudx_gPk8oyBHN3_VGAz2huugg_O4cIqWhrCsciFz_mQuLG3XfIbFbec_dYE9D0zL110-doEjLzgu68g7rDCUb52PyXIxGdIWkHOWJq0pbsmsXMnhApBnPdGwL0SZZoPugaCmEJFw1Q16aRKHQqLau0uz-KmFIysosYmmEWeLqrOInoRgogK8UQCMBUL1yWtoNIPy2w8F4bKe9o0T6YBKag_7vnchOw"
                            />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm">
                                Budaya &amp; Sejarah
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-label-sm text-label-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">
                                  smart_display
                                </span>{" "}
                                @kelanajepang (TikTok)
                              </span>
                              <span className="font-label-sm text-label-sm text-on-surface-variant">
                                09:00 - 11:30 (2.5 jam)
                              </span>
                            </div>
                            <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">
                              Kuil Senso-ji, Asakusa
                            </h2>
                            <div className="flex items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm flex-wrap mt-0.5">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-tertiary">
                                  schedule
                                </span>
                                06:00 - 17:00 (Gratis masuk area kuil)
                              </span>
                              <span className="flex items-center gap-1 font-semibold text-on-surface">
                                <span className="material-symbols-outlined text-[16px] text-primary">
                                  payments
                                </span>
                                Gratis (Omikuji ¥100)
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-surface-container-low text-primary font-numeric-metric text-numeric-metric">
                            Gratis
                          </span>
                          <button
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              more_vert
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="mt-space-sm p-2.5 rounded-xl bg-surface-container-low flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 flex-shrink-0">
                          lightbulb
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          <span className="font-semibold text-on-surface">
                            Saran Voyage AI:
                          </span>{" "}
                          Tiba sebelum jam 09:30 untuk foto gerbang Kaminarimon
                          yang jernih sebelum bus wisata rombongan tiba. Coba
                          melonpan hangat di Nakamise Dori!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Route Connector 1 -> 2 */}
                  <div className="relative z-10 ml-12 my-1 flex items-center gap-3 py-1">
                    <div className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface flex items-center gap-2 shadow-sm font-label-md text-label-md">
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        subway
                      </span>
                      <span className="font-semibold">Subway Ginza Line</span>
                      <span className="text-on-surface-variant">
                        • 4.2 km • 18 mnt
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-container-lowest text-primary font-bold">
                        ¥210
                      </span>
                    </div>
                    <span className="text-on-surface-variant font-body-sm text-body-sm hidden sm:inline">
                      Transit langsung tanpa ganti gerbong
                    </span>
                  </div>

                  {/* POI 2: Ichiran Ramen Shinjuku */}
                  <div
                    onClick={() => setSelectedPin(2)}
                    className="relative z-10 flex items-start gap-space-md mb-space-md group cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-numeric-metric text-numeric-metric flex items-center justify-center shadow-md">
                        2
                      </div>
                      <span className="font-label-sm text-label-sm text-primary font-bold mt-1">
                        12:00
                      </span>
                    </div>
                    <div
                      className={`flex-1 p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all ${
                        selectedPin === 2 ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-space-md justify-between">
                        <div className="flex gap-space-md flex-1">
                          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                            <img
                              alt="Ichiran Ramen Shinjuku"
                              className="w-full h-full object-cover"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVywHfvjpgNd-H0YhB_bRGDJwFxkrj45qszHg3F8tPXR8pddIpdLoHeqCGkRk9aQdbXeUjpBnU1sXhonbOVA83p4LEVyyG79R5XHoC01RUSek6NbI14h0Fuy5RPMQ9l2xmQzkIxagEvliie_X-bueWTJPCCrXxe204P4waOxumQ80pL-f-P7GyI_Tn8bgxB8XHRd7l1gT4ASkxlLtOAull5zIRwei7DM0Kjs3fsm-1nUcVdDiZ5sZ_4Q"
                            />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm">
                                Kuliner Siang
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-label-sm text-label-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">
                                  play_circle
                                </span>{" "}
                                Viral IG Reels
                              </span>
                              <span className="font-label-sm text-label-sm text-on-surface-variant">
                                12:00 - 13:30 (1.5 jam)
                              </span>
                            </div>
                            <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">
                              Ichiran Ramen Shinjuku Chuo
                            </h2>
                            <div className="flex items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm flex-wrap mt-0.5">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-tertiary">
                                  store
                                </span>
                                Buka 24 Jam (Kursi Booth Pribadi)
                              </span>
                              <span className="flex items-center gap-1 font-semibold text-on-surface">
                                <span className="material-symbols-outlined text-[16px] text-secondary">
                                  lunch_dining
                                </span>
                                Rp 145.000 / porsi (~¥1,380)
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-surface-container-low text-secondary font-numeric-metric text-numeric-metric">
                            ~¥1,380
                          </span>
                          <button
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              more_vert
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="mt-space-sm p-2.5 rounded-xl bg-surface-container-low flex items-start gap-2">
                        <span className="material-symbols-outlined text-secondary-container text-[18px] mt-0.5 flex-shrink-0">
                          info
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          <span className="font-semibold text-on-surface">
                            Tips Antrean:
                          </span>{" "}
                          Antrean reguler rata-rata 25 menit saat jam makan
                          siang. Pilih kuah medium rich &amp; cabai level 2
                          untuk cita rasa original.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Route Connector 2 -> 3 */}
                  <div className="relative z-10 ml-12 my-1 flex items-center gap-3 py-1">
                    <div className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface flex items-center gap-2 shadow-sm font-label-md text-label-md">
                      <span className="material-symbols-outlined text-[18px] text-tertiary">
                        directions_walk
                      </span>
                      <span className="font-semibold">Jalan Kaki Santai</span>
                      <span className="text-on-surface-variant">
                        • 650 m • 8 menit
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-container-lowest text-tertiary font-bold">
                        Gratis
                      </span>
                    </div>
                    <span className="text-on-surface-variant font-body-sm text-body-sm hidden sm:inline">
                      Melewati pertokoan Shinjuku San-chome
                    </span>
                  </div>

                  {/* POI 3: Taman Nasional Shinjuku Gyoen */}
                  <div
                    onClick={() => setSelectedPin(3)}
                    className="relative z-10 flex items-start gap-space-md mb-space-md group cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-numeric-metric text-numeric-metric flex items-center justify-center shadow-md">
                        3
                      </div>
                      <span className="font-label-sm text-label-sm text-primary font-bold mt-1">
                        14:00
                      </span>
                    </div>
                    <div
                      className={`flex-1 p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all ${
                        selectedPin === 3 ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-space-md justify-between">
                        <div className="flex gap-space-md flex-1">
                          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                            <img
                              alt="Shinjuku Gyoen"
                              className="w-full h-full object-cover"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1qIizGdpunyOVcR7dBETghEpRFs5FMqdhYiuRmGdUZAPTSLzbaCw92HTiEPH6jRgFwVu7BILsAlLcxnsnpvbK_oaO0cRz4Tpk84i6fSVX9eZFHx_pArXH3-MF-KORBZzbrlOnP1ipXUW6K8h30wCrl0WbkTOgDmZVsaixYmYzqBXHOVSx7ThZddffXFYh6asMbQXcIIflfmDhmX_Md5mtNcEDQoIqjC8xL7WQqieSRtQR-8KhHt8Rfg"
                            />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                                Alam &amp; Piknik
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm">
                                Spot Momiji Populer
                              </span>
                              <span className="font-label-sm text-label-sm text-on-surface-variant">
                                14:00 - 16:30 (2.5 jam)
                              </span>
                            </div>
                            <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">
                              Taman Nasional Shinjuku Gyoen
                            </h2>
                            <div className="flex items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm flex-wrap mt-0.5">
                              <span className="flex items-center gap-1 text-error font-medium">
                                <span className="material-symbols-outlined text-[16px]">
                                  alarm
                                </span>
                                09:00 - 16:30 (Tutup Senin)
                              </span>
                              <span className="flex items-center gap-1 font-semibold text-on-surface">
                                <span className="material-symbols-outlined text-[16px] text-primary">
                                  confirmation_number
                                </span>
                                Tiket Masuk: ¥500 (Rp 52.000)
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-surface-container-low text-primary font-numeric-metric text-numeric-metric">
                            ¥500
                          </span>
                          <button
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              more_vert
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="mt-space-sm p-2.5 rounded-xl bg-error-container text-on-error-container flex items-start gap-2">
                        <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">
                          warning
                        </span>
                        <p className="font-body-sm text-body-sm">
                          <span className="font-semibold">
                            Perhatian Jadwal:
                          </span>{" "}
                          Gerbang masuk terakhir pukul 16:00. Tiket sudah bisa
                          dibeli menggunakan kartu IC (Suica/Pasmo) di pintu
                          gerbang Shinjuku Gate.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Route Connector 3 -> 4 */}
                  <div className="relative z-10 ml-12 my-1 flex items-center gap-3 py-1">
                    <div className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface flex items-center gap-2 shadow-sm font-label-md text-label-md">
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        local_taxi
                      </span>
                      <span className="font-semibold">Taxi / JR Yamanote</span>
                      <span className="text-on-surface-variant">
                        • 3.1 km • 12 mnt
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-container-lowest text-primary font-bold">
                        ¥170
                      </span>
                    </div>
                    <span className="text-on-surface-variant font-body-sm text-body-sm hidden sm:inline">
                      Naik kereta dari Stasiun Shinjuku ke Stasiun Shibuya
                    </span>
                  </div>

                  {/* POI 4: Shibuya Sky Deck */}
                  <div
                    onClick={() => setSelectedPin(4)}
                    className="relative z-10 flex items-start gap-space-md mb-space-md group cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-numeric-metric text-numeric-metric flex items-center justify-center shadow-md">
                        4
                      </div>
                      <span className="font-label-sm text-label-sm text-primary font-bold mt-1">
                        17:30
                      </span>
                    </div>
                    <div
                      className={`flex-1 p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all ${
                        selectedPin === 4 ? "ring-2 ring-secondary-container" : ""
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-space-md justify-between">
                        <div className="flex gap-space-md flex-1">
                          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                            <img
                              alt="Shibuya Sky Deck"
                              className="w-full h-full object-cover"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKMlPOWCo-VQaVPwzYyIunn7LeUz334v1ALKtHZcBCiMH-T3v75-J4j2nq-YxmZvsY0AJNIrahonw5gpFTWEJiRlvwtQ_KlEQcIa_zUqjhd3yIpKGerQItOfuW0jq_6FJbHzouvRkc7gLJikQkCLNvSQ4btLpfN5uJNTtjTqh57izo29LqkUb7daHgVpNTD2ibENglPDj6FjWoIZN_gmRhNcmDLYMFWNaIfRklhqYHTGN9ZIz9iW87DQ"
                            />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                                Pemandangan Malam
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">
                                  verified
                                </span>{" "}
                                Tiket Terkonfirmasi (17:20)
                              </span>
                              <span className="font-label-sm text-label-sm text-on-surface-variant">
                                17:30 - 20:00 (2.5 jam)
                              </span>
                            </div>
                            <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">
                              Shibuya Sky Deck (Sunset &amp; Night View)
                            </h2>
                            <div className="flex items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm flex-wrap mt-0.5">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-tertiary">
                                  schedule
                                </span>
                                10:00 - 22:30 (Last Entry 21:20)
                              </span>
                              <span className="flex items-center gap-1 font-semibold text-on-surface">
                                <span className="material-symbols-outlined text-[16px] text-secondary">
                                  airplane_ticket
                                </span>
                                ¥2,500 (Rp 260.000)
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-surface-container-low text-secondary-container font-numeric-metric text-numeric-metric">
                            ¥2,500
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTicketModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container transition-colors"
                            type="button"
                          >
                            E-Ticket
                          </button>
                        </div>
                      </div>
                      <div className="mt-space-sm p-2.5 rounded-xl bg-surface-container-low flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 flex-shrink-0">
                          photo_camera
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          <span className="font-semibold text-on-surface">
                            Golden Hour:
                          </span>{" "}
                          Sunset diperkirakan pukul 16:34 - 17:15. Slot 17:20
                          memberikan transisi sunset magis menuju gemerlap lampu
                          malam Tokyo. Tas ransel harus disimpan di loker koin
                          (¥100).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Add Destination Button & Social Drop Slot */}
                  <div className="relative z-10 ml-12 mt-2">
                    <button
                      onClick={() => onNavigate?.("import")}
                      className="w-full py-4 px-6 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-2 transition-all group"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                        add_circle
                      </span>
                      <span className="font-title-md text-title-md font-semibold">
                        + Tambah Destinasi Baru atau Drag-and-drop link video ke
                        sini
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE (42%): Smart Map Canvas & Spatial HUD */}
              <div className="lg:col-span-5 flex flex-col gap-space-md sticky top-28">
                {/* Interactive Map Container */}
                <div className="relative w-full h-[480px] rounded-3xl overflow-hidden shadow-md bg-surface-container-highest">
                  {/* Static/Vector Visual Map Layer */}
                  <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDtHnR0S-vRjG0ffX-thxMI9DKfLljr5K0fPhg77XxXF2UPDoh2tAhizHNDVs6POq2x3fDcLkI1njkpW97qKOMjS5pboHWTjsHcfdsGKGws6nwvX457ZDDlftPth-JNA10E6vuwu4MEaG-cLSJwgo_uJtb3YjXApPRCBJmvj_9UhfYfBSfcpqdrnnXFBIK5HzwwEH95s1yV88Fvk57T5Vy3Np_BdFYz8s-6i9snuQv6ebPf4O01v2YhoA')",
                    }}
                  >
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      fill="none"
                      viewBox="0 0 500 500"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 370 110 Q 300 180 230 250"
                        stroke="#005c55"
                        strokeDasharray="6 6"
                        strokeLinecap="round"
                        strokeWidth="4"
                      />
                      <path
                        d="M 230 250 L 210 290"
                        stroke="#005c55"
                        strokeLinecap="round"
                        strokeWidth="4"
                      />
                      <path
                        d="M 210 290 Q 180 340 160 410"
                        stroke="#005c55"
                        strokeDasharray="6 6"
                        strokeLinecap="round"
                        strokeWidth="4"
                      />
                    </svg>
                  </div>

                  {/* Map Overlaid Floating Nodes / Interactive Markers */}
                  <div className="absolute inset-0 p-6 pointer-events-none flex flex-col justify-between">
                    {/* Pin 1: Senso-ji */}
                    <div
                      onClick={() => setSelectedPin(1)}
                      className="absolute top-[80px] right-[100px] pointer-events-auto transform hover:scale-110 transition-transform cursor-pointer"
                    >
                      <div
                        className={`flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md ${
                          selectedPin === 1 ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-[12px] flex items-center justify-center">
                          1
                        </span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                          Senso-ji Asakusa
                        </span>
                      </div>
                    </div>

                    {/* Pin 2: Ichiran Ramen */}
                    <div
                      onClick={() => setSelectedPin(2)}
                      className="absolute top-[225px] left-[170px] pointer-events-auto transform hover:scale-110 transition-transform cursor-pointer"
                    >
                      <div
                        className={`flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md ${
                          selectedPin === 2 ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-[12px] flex items-center justify-center">
                          2
                        </span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                          Ichiran Shinjuku
                        </span>
                      </div>
                    </div>

                    {/* Pin 3: Shinjuku Gyoen */}
                    <div
                      onClick={() => setSelectedPin(3)}
                      className="absolute top-[280px] left-[150px] pointer-events-auto transform hover:scale-110 transition-transform cursor-pointer"
                    >
                      <div
                        className={`flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md ${
                          selectedPin === 3 ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-[12px] flex items-center justify-center">
                          3
                        </span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                          Shinjuku Gyoen
                        </span>
                      </div>
                    </div>

                    {/* Pin 4: Shibuya Sky */}
                    <div
                      onClick={() => setSelectedPin(4)}
                      className="absolute bottom-[70px] left-[90px] pointer-events-auto transform hover:scale-110 transition-transform cursor-pointer"
                    >
                      <div
                        className={`flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md ${
                          selectedPin === 4 ? "ring-2 ring-secondary-container" : ""
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-secondary-container text-on-primary font-bold text-[12px] flex items-center justify-center">
                          4
                        </span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                          Shibuya Sky
                        </span>
                      </div>
                    </div>

                    {/* Map View Layer Controls */}
                    <div className="self-end flex flex-col gap-2 pointer-events-auto">
                      <button
                        className="w-9 h-9 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md text-on-surface flex items-center justify-center shadow-md hover:bg-surface-container transition-colors"
                        title="Zoom in"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          add
                        </span>
                      </button>
                      <button
                        className="w-9 h-9 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md text-on-surface flex items-center justify-center shadow-md hover:bg-surface-container transition-colors"
                        title="Zoom out"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          remove
                        </span>
                      </button>
                      <button
                        className="w-9 h-9 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md text-on-surface flex items-center justify-center shadow-md hover:bg-surface-container transition-colors"
                        title="Center Route"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          my_location
                        </span>
                      </button>
                    </div>

                    {/* Map Status Chips */}
                    <div className="self-start pointer-events-auto">
                      <div className="px-3 py-1.5 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md shadow-md flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                          Lalu Lintas Tokyo: Lancar
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Route Metrics Summary Bento Card */}
                <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm text-on-surface">
                      Metrik Rute Hari Ini
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">
                      Rute Terpendek
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-space-sm pt-1">
                    <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-0.5">
                      <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          straighten
                        </span>{" "}
                        Total Jarak
                      </span>
                      <span className="font-headline-sm text-headline-sm text-primary font-bold">
                        8.6 km
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Efisiensi 94%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-0.5">
                      <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          commute
                        </span>{" "}
                        Transit
                      </span>
                      <span className="font-headline-sm text-headline-sm text-primary font-bold">
                        45 Menit
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        2x Subway, 1x Taxi
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-0.5">
                      <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          receipt_long
                        </span>{" "}
                        Pengeluaran
                      </span>
                      <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                        Rp 457rb
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Per orang / hari
                      </span>
                    </div>
                  </div>
                </div>

                {/* Smart Nearby Alert Banner */}
                <div className="p-4 rounded-2xl bg-amber-50 text-amber-900 shadow-sm flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-[22px] flex-shrink-0 mt-0.5">
                    warning
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-title-md text-title-md font-bold text-amber-950">
                      AI Warning: Shinjuku Gyoen Tutup 16:30
                    </span>
                    <p className="font-body-sm text-body-sm text-amber-900">
                      Sistem mendeteksi kemungkinan keterlambatan jika istirahat
                      makan siang melebihi 75 menit. VoyageAI menyarankan tiba
                      di Shinjuku Gyoen paling lambat pukul{" "}
                      <strong>14:30</strong> agar tidak terburu-buru.
                    </p>
                  </div>
                </div>

                {/* Nearby Recommendations Around Destination 4 */}
                <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        explore
                      </span>
                      <span className="font-title-md text-title-md font-semibold text-on-surface">
                        Rekomendasi Sekitar Shibuya Sky
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      &lt; 500m
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div
                      onClick={() => onNavigate?.("explore")}
                      className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between gap-3 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[20px]">
                            local_cafe
                          </span>
                        </div>
                        <div>
                          <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                            Cafe Reissue (3D Latte Art)
                          </h4>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            450m • Harajuku/Shibuya border • Buka s/d 21:00
                          </p>
                        </div>
                      </div>
                      <button
                        className="px-2.5 py-1 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-on-primary text-primary font-label-md text-label-md transition-colors"
                        type="button"
                      >
                        + Jadwal
                      </button>
                    </div>

                    <div
                      onClick={() => onNavigate?.("explore")}
                      className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between gap-3 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[20px]">
                            hotel
                          </span>
                        </div>
                        <div>
                          <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                            Hotel Granbell Shibuya
                          </h4>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            300m • Tempat drop-off koper terdekat
                          </p>
                        </div>
                      </div>
                      <button
                        className="px-2.5 py-1 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-on-primary text-primary font-label-md text-label-md transition-colors"
                        type="button"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE VIEW (Stitch: Itinerary Rute Mobile) ==================== */}
      <div className={showMobileClass}>
        <div className="flex flex-col w-full bg-surface-container-lowest">
          {/* Interactive Sticky Day Selector Filter */}
          <div className="sticky top-16 z-30 bg-surface-container-lowest/90 backdrop-blur-md px-margin-mobile py-space-sm shadow-sm">
            <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar scroll-smooth py-1">
              {[1, 2, 3, 4, 5].map((dayNum) => {
                const isSelected = activeDay === dayNum;
                return (
                  <button
                    key={dayNum}
                    onClick={() => setActiveDay(dayNum)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-all ${
                      isSelected
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-ping"></span>
                        Hari {dayNum} (Aktif)
                      </span>
                    ) : (
                      `Hari ${dayNum} • ${14 + dayNum} Nov`
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-margin-mobile pt-space-md pb-space-xl flex flex-col gap-space-lg">
            {/* Day Overview / Context Capsule */}
            <div className="bg-surface-container-low rounded-2xl p-space-md shadow-sm">
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Eksplorasi Kota &amp; Tradisi
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest font-label-sm text-label-sm text-primary">
                  <span className="material-symbols-outlined text-[14px]">
                    routine
                  </span>{" "}
                  Efisien 98%
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-on-surface-variant font-body-sm text-body-sm">
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    calendar_today
                  </span>
                  Selasa, 16 Nov
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    place
                  </span>
                  4 Tempat
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    payments
                  </span>
                  Est. ¥3.310
                </span>
                <span className="inline-flex items-center gap-1 text-secondary-container">
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    wb_sunny
                  </span>
                  16°C Cerah
                </span>
              </div>
            </div>

            {/* Vertical Timeline Feed */}
            <div className="relative flex flex-col pl-4">
              <div className="absolute top-6 bottom-8 left-[23px] w-0.5 bg-surface-container-high -translate-x-1/2 z-0"></div>

              {/* ITEM 1: Kuil Senso-ji */}
              <div className="relative z-10 flex items-start gap-space-md pb-space-lg group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                  <span className="font-label-sm text-label-sm font-bold">
                    1
                  </span>
                </div>
                <div className="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container p-4 flex flex-col gap-3 transition-transform active:scale-[0.99]">
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                      <img
                        alt="Kuil Senso-ji"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB07u6Ix2lcJXoieNOGUrkplOD51cAJ6_IfcqzAkgfTkxfJ8X_B95jUoBGt6Ujn7TdOHbtf-odaSxkIkLSfUXdiCp8QlXT2goRNVohTk7I6EK4peTv63K6Zf26WsEhIk_7DhjrbR8cSNKZVDJ_DrYIVYTObBiJ5B99iy1UdBgyhSMWGi6jACVzATfvYi-THJBu4E-MN2jAT2hxKGoh8nfC-CydrbbkURVR7HnGBrxd7BApFg6SwwjkZQQ"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-label-md text-label-md text-primary font-bold">
                          09:00 - 11:30
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant">
                          Budaya
                        </span>
                      </div>
                      <h2 className="font-title-md text-title-md text-on-surface truncate">
                        Kuil Senso-ji, Asakusa
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
                        Tiket Gratis • Buka 06:00 - 17:00
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">
                        check_circle
                      </span>
                      Prioritas Utama
                    </span>
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container font-label-md text-label-md text-on-surface transition-colors">
                      <span className="material-symbols-outlined text-[16px]">
                        navigation
                      </span>{" "}
                      Petunjuk
                    </button>
                  </div>
                </div>
              </div>

              {/* TRANSIT PILL 1 */}
              <div className="relative z-10 flex items-center gap-space-md py-1 pb-space-lg">
                <div className="flex-shrink-0 w-8 flex justify-center">
                  <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container font-label-md text-label-md text-on-surface-variant shadow-sm">
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      subway
                    </span>
                    <span>Subway Ginza Line</span>
                    <span className="text-outline">•</span>
                    <span>18 mnt (4.2 km)</span>
                  </div>
                </div>
              </div>

              {/* ITEM 2: Ichiran Ramen */}
              <div className="relative z-10 flex items-start gap-space-md pb-space-lg group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                  <span className="font-label-sm text-label-sm font-bold">
                    2
                  </span>
                </div>
                <div className="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container p-4 flex flex-col gap-3 transition-transform active:scale-[0.99]">
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                      <img
                        alt="Ichiran Ramen"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuABOdK_qLtzEwiN0Qm0HMqDXFgfgDWnDfWg7kHFBvlPARVPduuRN8ocEIU7EsS80UCI3o2tFBpzqPGY_-4-QANbw9Vhx8Drd3DfF95cXG3JfW6ZjFv3seMTDyT1XBGsWUKM6V0icz4xmnmWZWDHcuMKY2GH9X3lkznVgAOhbV3YPdZfMheocfu1vh60CavV9JXPtYsU5sdaDWBHt13Wm-IS6TiO7b1mCBvMzronHNxwMqLdYGPnBNYabQ"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-label-md text-label-md text-primary font-bold">
                          12:00 - 13:15
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
                          ¥1.380
                        </span>
                      </div>
                      <h2 className="font-title-md text-title-md text-on-surface truncate">
                        Ichiran Ramen Shinjuku
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                        Makan siang booth privat legendaris
                      </p>
                    </div>
                  </div>
                  <div className="bg-surface-container-low rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-secondary-container flex-shrink-0">
                      lightbulb
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface truncate">
                      Tips: Antrean lebih santai pk 14:00
                    </p>
                  </div>
                </div>
              </div>

              {/* TRANSIT PILL 2 */}
              <div className="relative z-10 flex items-center gap-space-md py-1 pb-space-lg">
                <div className="flex-shrink-0 w-8 flex justify-center">
                  <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container font-label-md text-label-md text-on-surface-variant shadow-sm">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">
                      directions_walk
                    </span>
                    <span>Jalan Kaki</span>
                    <span className="text-outline">•</span>
                    <span>8 mnt (650m)</span>
                  </div>
                </div>
              </div>

              {/* ITEM 3: Shinjuku Gyoen */}
              <div className="relative z-10 flex items-start gap-space-md pb-space-lg group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                  <span className="font-label-sm text-label-sm font-bold">
                    3
                  </span>
                </div>
                <div className="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container p-4 flex flex-col gap-3 transition-transform active:scale-[0.99]">
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                      <img
                        alt="Shinjuku Gyoen"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRdtgaiQ9dzgYDw-Uy8I2ZKgG0BHHJZjw1Zze67qIIam4DibA-jkgeJ5cTwxrZKFtJq0QDJBCLsq8-deD7txmiFy78c6e2UGZsWmggjwZwwmiUkCXnDgJ7MVBzrrz-xfVg-8hEPuHJzHQl8WMqH4tGBYWC-iFSMUYz7Dt1fL-QU3rN4Nz2ZCBSuWY18NM5QT8wak4S80caa12_ce3uK2IccjpaZbju9KWtW7G_QLW2bR4CjRk79Ch_HA"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-label-md text-label-md text-primary font-bold">
                          14:00 - 16:00
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant">
                          Taman Kota
                        </span>
                      </div>
                      <h2 className="font-title-md text-title-md text-on-surface truncate">
                        Shinjuku Gyoen
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
                        Tiket ¥500 • Relaksasi Alam
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex items-center gap-1.5 font-body-sm text-body-sm text-error">
                      <span className="material-symbols-outlined text-[16px]">
                        schedule
                      </span>{" "}
                      Catatan: Tutup pk 16:30
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant px-2.5 py-1 rounded-md bg-surface-container-low">
                      Gate Shinjuku
                    </span>
                  </div>
                </div>
              </div>

              {/* TRANSIT PILL 3 */}
              <div className="relative z-10 flex items-center gap-space-md py-1 pb-space-lg">
                <div className="flex-shrink-0 w-8 flex justify-center">
                  <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container font-label-md text-label-md text-on-surface-variant shadow-sm">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      local_taxi
                    </span>
                    <span>Taxi</span>
                    <span className="text-outline">•</span>
                    <span>12 mnt (Rekomendasi Hemat Waktu)</span>
                  </div>
                </div>
              </div>

              {/* ITEM 4: Shibuya Sky Deck */}
              <div className="relative z-10 flex items-start gap-space-md group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center shadow-md">
                  <span className="font-label-sm text-label-sm font-bold">
                    4
                  </span>
                </div>
                <div className="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container p-4 flex flex-col gap-3 transition-transform active:scale-[0.99]">
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                      <img
                        alt="Shibuya Sky Deck"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoGBTJ9b7AfU0JCcJm5MHD30m9c9cOeelnT2jG2X6-AqibIM2ai62jqIpT4J5Yv4zq7Lg9KSoQMVTYmUQeRjeCWzVG-Yu27GHXlsWhOTxLeyCUOoagxn8jQLQeN_5GC7nSDV0g0TYkCkpWSYRa5T4w8CQf1DyXq5T1xOwwbt25-lRzG6e7OpFrbHsZuXqHzt_8HdqVmJAQrw-DVvMUTxa3NN8I41vStH9uka2UEy1zCJYdxqm6-BdQDg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-label-md text-label-md text-secondary-container font-bold">
                          17:30 - 19:30
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-[12px]">
                            sunny
                          </span>{" "}
                          Golden Sunset
                        </span>
                      </div>
                      <h2 className="font-title-md text-title-md text-on-surface truncate">
                        Shibuya Sky Deck
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
                        Tiket Terkonfirmasi • Slot 17:40
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex items-center gap-1 font-body-sm text-body-sm text-primary font-medium">
                      <span className="material-symbols-outlined text-[16px]">
                        qr_code_2
                      </span>{" "}
                      E-Ticket Siap
                    </span>
                    <button
                      onClick={() => setTicketModalOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-sm transition-transform active:scale-95"
                    >
                      Buka Tiket
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Action Button / Quick Addition */}
            <div className="pt-space-xs flex justify-center">
              <button
                onClick={() => onNavigate?.("import")}
                className="w-full max-w-xs flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm shadow-md transition-all active:scale-95 hover:bg-surface-tint"
              >
                <span className="material-symbols-outlined text-[20px]">
                  add_circle
                </span>
                <span>+ Tambah Destinasi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* E-Ticket Modal */}
      {ticketModalOpen && (
        <div
          onClick={() => setTicketModalOpen(false)}
          className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">
                qr_code_2
              </span>
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                Terkonfirmasi • Klook
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-2">
                Shibuya Sky Observation Deck
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Selasa, 16 Nov 2025 • Slot Masuk 17:20 - 17:40 JST
              </p>
            </div>
            <div className="w-44 h-44 rounded-xl bg-surface-container-low border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 p-4">
              <span className="material-symbols-outlined text-[96px] text-on-surface">
                qr_code_2
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                SHIBUYA-2025-88412
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              2 Dewasa (Rian &amp; Maya) • Lantai 14 Shibuya Scramble Square
            </p>
            <button
              onClick={() => setTicketModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary font-title-md text-title-md"
            >
              Tutup E-Ticket
            </button>
          </div>
        </div>
      )}
    </>
  );
}
