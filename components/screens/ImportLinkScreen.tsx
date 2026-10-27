"use client";

import React, { useState } from "react";

interface ImportLinkScreenProps {
  forceMode?: "auto" | "desktop" | "mobile";
  onNavigate?: (tab: "import" | "itinerary" | "explore" | "checklist") => void;
}

export default function ImportLinkScreen({
  forceMode = "auto",
  onNavigate,
}: ImportLinkScreenProps) {
  const [urlInput, setUrlInput] = useState(
    "https://www.tiktok.com/@alvin_japanfoodie/video/73491823901"
  );
  const [mobileUrlInput, setMobileUrlInput] = useState(
    "https://vt.tiktok.com/ZSjR8A19k/"
  );
  const [extractState, setExtractState] = useState<"idle" | "loading" | "done">(
    "idle"
  );
  const [addedToDay2, setAddedToDay2] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const handleExtract = () => {
    if (extractState !== "idle") return;
    setExtractState("loading");
    setTimeout(() => {
      setExtractState("done");
      setTimeout(() => {
        setExtractState("idle");
      }, 2000);
    }, 1000);
  };

  const handlePasteMobile = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) setMobileUrlInput(text);
      }
    } catch {
      // Fallback if clipboard permission denied
    }
  };

  const handleAddItinerary = () => {
    setAddedToDay2(true);
    setTimeout(() => setAddedToDay2(false), 2200);
  };

  const historyItems = [
    {
      id: "youtube-1",
      platform: "youtube",
      platformLabel: "YouTube",
      badgeClass: "bg-error text-surface",
      icon: "play_circle",
      duration: "14:20",
      detectedText: "4 POI Terdeteksi Otomatis",
      detectedColor: "text-primary",
      title: "Vlog Tokyo 24 Jam: TeamLab Planets & Kafe Kucing Akihabara",
      desc: "Konten lengkap dengan panduan reservasi tiket TeamLab, akses Yurikamone Line, dan rekomendasi cafe santai.",
      statusLabel: "Tersinkronkan",
      statusColor: "text-primary",
      dayInfo: "Hari 3 • Toyosu & Akiba",
      btnText: "Detail (4 POI)",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAPWrVbf8ft1I0CLVcPORP311pK_HazpbOatwCt1PyVYukYn_j5H8Kh43I4PCvxsPLOQoN177wSuON2qliwlwc9QAypoIUqG9n4ffcEQjEoU5oVl8-qSXjupScP5bQ6WBZqnwyb1ufa9SRQcdba3f7F5EJtBTkyatZG6AeHjufWfg43XXe7LB8Ja-0J-JlfdvtXi300wQ1xlberoJLAbQh-c3QiqP8n47S_XF57xtPsEdNn8uSvjwftmg",
    },
    {
      id: "instagram-1",
      platform: "instagram",
      platformLabel: "Reels",
      badgeClass: "bg-secondary-container text-on-secondary",
      icon: "photo_camera",
      duration: "0:30",
      detectedText: "1 POI Utama • Waktu Khusus",
      detectedColor: "text-secondary",
      title: "Spot Sunset Terbaik di Shibuya Sky Deck & Tiket Masuk",
      desc: "AI merekomendasikan reservasi slot pukul 16:40 - 17:20 WIB untuk mendapatkan transisi golden hour dan night view.",
      statusLabel: "Perlu Booking Tiket",
      statusColor: "text-secondary",
      dayInfo: "Hari 1 • Shibuya",
      btnText: "Cek Ketersediaan",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB2bCYLH4K0f8Smkncmsc3hsm3EajtBo-f3iLsJrsv8HPEPWjNNGn7ReIcR4InSb5M5nlZuQ4KLkosfY5uuGaqyIgZpnXupIRwoM_MmsoBlFNbGdinVhAUWa_UPfrJiGm41fOkcyTFwEO4Y3iKvXqShyHteZp26ZhBU1PZ4m8sGg6nftLV50hRX77T2k2Qc8O5-Hty54fUDN05ywVfGX-eVNU4NIs9FtA3TK8eVT6TWLcRT-iyAnOmT3g",
    },
    {
      id: "facebook-1",
      platform: "facebook",
      platformLabel: "Facebook",
      badgeClass: "bg-primary text-on-primary",
      icon: "public",
      duration: "Postingan",
      detectedText: "2 Rekomendasi Ryokan Onsen",
      detectedColor: "text-tertiary",
      title: "Hidden Gems Onsen Tradisional dekat Danau Kawaguchiko",
      desc: "Termasuk opsi pemandian private onsen untuk keluarga serta paket makan malam Kaiseki khas lokal Yamanashi.",
      statusLabel: "Menunggu Tanggal",
      statusColor: "text-on-surface-variant",
      dayInfo: "Hari 5 • Kawaguchiko",
      btnText: "Tetapkan Jadwal",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAJ9C3McquW03i08Xb6OBaVRLk55-OlD-4F78XUSeh0L_CWoiRCJfZ4tlWD1XxixALkMXUb6NBESRv393VGl7T936qRzKc0f-UbaRce9E7cQ7w7Q91WHek-7gEl9xwLQA5musIxC1NSGPsQ-AL5SoQjvWYdSweA-HBjkZo1mVMFlV7manp18IwGIEvY3JnA8nqRx4_O6NGdotCdMQusE6t8re6Bvkz7Xr3AqQumaMh6xlQ4cyu4EPARgA",
    },
  ];

  const filteredHistory =
    activeFilter === "all"
      ? historyItems
      : historyItems.filter((item) => item.platform === activeFilter);

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
      {/* ==================== DESKTOP VIEW (Stitch: Import & AI Link Hub) ==================== */}
      <div className={showDesktopClass}>
        <div className="w-full px-gutter py-space-lg flex flex-col gap-space-xl max-w-7xl mx-auto">
          {/* Top Context & Stats Bar */}
          <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-space-md">
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Total POI Terurai
                </span>
                <span className="font-headline-md text-headline-md text-primary mt-0.5">
                  14{" "}
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                    Destinasi
                  </span>
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">
                  map
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Akurasi Deteksi AI
                </span>
                <span className="font-headline-md text-headline-md text-primary mt-0.5">
                  98.4%
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">
                  verified
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Estimasi Anggaran
                </span>
                <span className="font-headline-md text-headline-md text-on-surface mt-0.5">
                  Rp 18,45jt
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[24px]">
                  payments
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Hotel Terindeks
                </span>
                <span className="font-headline-md text-headline-md text-primary mt-0.5">
                  3{" "}
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                    Rekomendasi
                  </span>
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">
                  hotel
                </span>
              </div>
            </div>
          </div>

          {/* AI Universal Input Section */}
          <div className="w-full bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                  <span className="material-symbols-outlined text-[20px]">
                    link
                  </span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Universal Social Video Parser
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Ubah video kuliner, tempat wisata, atau rekomendasi hotel
                    menjadi rute siap jalan.
                  </p>
                </div>
              </div>

              {/* Platform Support Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-container-high text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    smart_display
                  </span>{" "}
                  TikTok
                </span>
                <span className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-container-high text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    movie
                  </span>{" "}
                  Reels
                </span>
                <span className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-container-high text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    play_circle
                  </span>{" "}
                  YouTube
                </span>
                <span className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-container-high text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    public
                  </span>{" "}
                  Facebook
                </span>
              </div>
            </div>

            {/* Main Input + Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm bg-surface-container-low p-2 rounded-2xl">
              <div className="flex-1 flex items-center gap-3 px-3">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  auto_awesome
                </span>
                <input
                  className="w-full bg-transparent border-0 focus:outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60"
                  placeholder="Tempel link video TikTok, Instagram Reels, YouTube, atau Facebook di sini..."
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
              </div>
              <button
                onClick={handleExtract}
                disabled={extractState === "loading"}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-container text-on-primary font-title-md text-title-md hover:bg-tertiary-container transition-all shadow-sm whitespace-nowrap active:scale-[0.99]"
              >
                {extractState === "loading" ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      sync
                    </span>
                    <span>Mengekstrak Objek...</span>
                  </>
                ) : extractState === "done" ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      check_circle
                    </span>
                    <span>Berhasil Terurai!</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      psychology
                    </span>
                    <span>Ekstrak dengan AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Toggles */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="font-label-md text-label-md text-on-surface-variant mr-1">
                Preferensi Ekstraksi:
              </span>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                <input
                  defaultChecked
                  className="accent-primary rounded w-3.5 h-3.5"
                  type="checkbox"
                />
                <span>Otomatis assign ke Hari ke-2</span>
              </label>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                <input
                  defaultChecked
                  className="accent-primary rounded w-3.5 h-3.5"
                  type="checkbox"
                />
                <span>Deteksi Jam Buka &amp; Tiket Masuk</span>
              </label>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                <input
                  className="accent-primary rounded w-3.5 h-3.5"
                  type="checkbox"
                />
                <span>Prioritaskan Kuliner Halal / No-Pork</span>
              </label>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                <input
                  className="accent-primary rounded w-3.5 h-3.5"
                  type="checkbox"
                />
                <span>Cari Stasiun Terdekat (Under 500m)</span>
              </label>
            </div>
          </div>

          {/* Live Parsing Card (The Hero Result) */}
          <div className="w-full flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-pulse"></span>
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Hasil Analisis Terakhir (Live)
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Diproses 24 detik yang lalu
              </span>
            </div>

            <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Left Video Meta Preview */}
              <div className="lg:col-span-4 bg-surface-container-low p-space-md flex flex-col justify-between gap-space-md">
                <div className="flex flex-col gap-space-sm">
                  <div className="relative w-full aspect-[9/13] max-h-[380px] rounded-xl overflow-hidden shadow-inner group">
                    <img
                      alt="Ichiran Ramen Shinjuku"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfmqkcJJvTn8wXph_xRyJlH7WJOVAaGnRINYCFIDLUVgpWZ-MzlEVkuEUY6e6E91aBV5hVBvE0KComG6wvAKuwA8OiwvtPgzXcBmyW4_mI9k0JWtisTpHJdslXLk01voE2gQm9wrf5zCaBBC7r5mYdvhio0wBRC-xkVwkI8zdgfzV0OIc7q-sBjxLp8Fe2as1ynMSwutb781FSqo0O3-C9fY0c6rVF_rU75s8YPAs9nUkt1HHJtKO_5Q"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent"></div>
                    {/* Video Controls Mock */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-error"></span>
                      <span className="font-label-sm text-label-sm text-on-surface font-bold">
                        TikTok Video
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-on-surface/70 backdrop-blur-md text-surface font-label-sm text-label-sm">
                      0:45
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-surface">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-sm text-label-sm font-bold">
                          A
                        </div>
                        <span className="font-label-md text-label-md text-surface font-semibold">
                          @alvin_japanfoodie
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-primary-fixed">
                          verified
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-surface-dim line-clamp-2 italic">
                        &ldquo;Ramen tersembunyi terenak di Shinjuku yang buka 24
                        jam! Kuah kaldunya super kental dan ada saus cabai
                        rahasianya...&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Parsed Extraction Confidence */}
                <div className="bg-surface-container rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      smart_toy
                    </span>
                    <span className="font-label-md text-label-md text-on-surface">
                      Skor Kepercayaan AI
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">
                    98% Sangat Akurat
                  </span>
                </div>
              </div>

              {/* Right Extracted Destination Details */}
              <div className="lg:col-span-8 p-space-lg flex flex-col justify-between gap-space-md">
                <div className="flex flex-col gap-space-md">
                  {/* Category and Tag Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-bold">
                        Kuliner Legendaris
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                        Ramen Tonkotsu
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
                        ★ Rating 4.8 (Google Maps)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px]">
                        visibility
                      </span>
                      <span>124.5k Views Terdeteksi</span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="flex flex-col gap-1">
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Ichiran Ramen Shinjuku Chuo
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Cabang khusus bumbu rahasia dengan booth makan individual
                      dan pemesanan via vending machine multibahasa.
                    </p>
                  </div>

                  {/* Data Specification Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm pt-2">
                    <div className="p-3 rounded-xl bg-surface-container-low flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-surface-container-lowest text-primary">
                        <span className="material-symbols-outlined text-[20px]">
                          schedule
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Jam Operasional
                        </span>
                        <span className="font-title-md text-title-md text-on-surface font-semibold">
                          Buka 24 Jam Setiap Hari
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Rekomendasi: 15:00 - 17:00 (Antrean sepi)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-surface-container-lowest text-secondary">
                        <span className="material-symbols-outlined text-[20px]">
                          payments
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Estimasi Biaya / Tiket
                        </span>
                        <span className="font-title-md text-title-md text-on-surface font-semibold">
                          ¥1.100 - ¥1.800
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          ~Rp 115.000 - Rp 190.000 / orang
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-surface-container-lowest text-primary">
                        <span className="material-symbols-outlined text-[20px]">
                          location_on
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Alamat &amp; Akses Transit
                        </span>
                        <span className="font-title-md text-title-md text-on-surface font-semibold">
                          Shinjuku 3-Chome, Tokyo
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          450m jalan kaki dari Stasiun JR Shinjuku Timur
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-surface-container-lowest text-tertiary">
                        <span className="material-symbols-outlined text-[20px]">
                          recommend
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Menu Unggulan dari Video
                        </span>
                        <span className="font-title-md text-title-md text-on-surface font-semibold">
                          Natural Tonkotsu + Half Boiled Egg
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Spiciness level: 2x, Richness: Medium
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Map Preview Context */}
                  <div className="w-full h-28 rounded-xl overflow-hidden shadow-inner relative">
                    <img
                      alt="Shinjuku Map"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtHnR0S-vRjG0ffX-thxMI9DKfLljr5K0fPhg77XxXF2UPDoh2tAhizHNDVs6POq2x3fDcLkI1njkpW97qKOMjS5pboHWTjsHcfdsGKGws6nwvX457ZDDlftPth-JNA10E6vuwu4MEaG-cLSJwgo_uJtb3YjXApPRCBJmvj_9UhfYfBSfcpqdrnnXFBIK5HzwwEH95s1yV88Fvk57T5Vy3Np_BdFYz8s-6i9snuQv6ebPf4O01v2YhoA"
                    />
                    <div className="absolute inset-0 bg-on-surface/20 flex items-center justify-between px-4">
                      <div className="bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">
                          near_me
                        </span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                          Terhubung dengan Rute Hari ke-2
                        </span>
                      </div>
                      <button
                        onClick={() => onNavigate?.("itinerary")}
                        className="bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-primary font-label-md text-label-md hover:bg-surface-container-lowest transition-colors flex items-center gap-1"
                      >
                        <span>Perbesar Peta</span>
                        <span className="material-symbols-outlined text-[16px]">
                          open_in_new
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBookmarked(!bookmarked)}
                      className={`px-4 py-2.5 rounded-xl font-label-md text-label-md transition-colors flex items-center gap-1.5 ${
                        bookmarked
                          ? "bg-primary-fixed text-on-primary-fixed"
                          : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {bookmarked ? "bookmark_added" : "bookmark"}
                      </span>
                      <span>
                        {bookmarked ? "Tersimpan di Bookmark" : "Simpan ke Bookmark"}
                      </span>
                    </button>
                    <button className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">
                        edit_note
                      </span>
                      <span>Edit Catatan</span>
                    </button>
                  </div>
                  <button
                    onClick={handleAddItinerary}
                    className={`px-6 py-2.5 rounded-xl font-title-md text-title-md transition-all flex items-center justify-center gap-2 shadow-sm ${
                      addedToDay2
                        ? "bg-tertiary text-on-tertiary"
                        : "bg-primary-container text-on-primary hover:bg-tertiary-container"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {addedToDay2 ? "check_circle" : "add_circle"}
                    </span>
                    <span>
                      {addedToDay2
                        ? "Berhasil Ditambahkan ke Day 2!"
                        : "+ Tambahkan ke Day 2 (Makan Siang)"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Batch Queue & Import History Section */}
          <div className="w-full flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Riwayat &amp; Antrean Link Terimpor
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Daftar tautan konten media sosial yang berhasil dipetakan ke
                  dalam rencana perjalanan.
                </p>
              </div>
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-lowest shadow-sm overflow-x-auto">
                {[
                  { key: "all", label: "Semua Link (12)" },
                  { key: "tiktok", label: "TikTok (5)" },
                  { key: "instagram", label: "Instagram (4)" },
                  { key: "youtube", label: "YouTube (2)" },
                  { key: "facebook", label: "Facebook (1)" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg font-label-md text-label-md whitespace-nowrap transition-colors ${
                      activeFilter === tab.key
                        ? "bg-primary-container text-on-primary"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* History Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              {filteredHistory.map((card) => (
                <div
                  key={card.id}
                  className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-space-sm">
                    <div className="relative w-full h-40 rounded-xl overflow-hidden">
                      <img
                        alt={card.title}
                        className="w-full h-full object-cover"
                        src={card.image}
                      />
                      <span
                        className={`absolute top-2 left-2 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1 ${card.badgeClass}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {card.icon}
                        </span>{" "}
                        {card.platformLabel}
                      </span>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-on-surface/80 text-surface font-label-sm text-label-sm">
                        {card.duration}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span
                        className={`font-label-sm text-label-sm font-bold ${card.detectedColor}`}
                      >
                        {card.detectedText}
                      </span>
                      <h4 className="font-title-md text-title-md text-on-surface font-semibold line-clamp-1">
                        {card.title}
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                      <span>
                        Status:{" "}
                        <strong className={`${card.statusColor} font-semibold`}>
                          {card.statusLabel}
                        </strong>
                      </span>
                      <span>{card.dayInfo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate?.("itinerary")}
                        className="flex-1 py-2 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                      >
                        {card.btnText}
                      </button>
                      <button className="p-2 rounded-xl bg-surface-container text-on-surface hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Automation Banner / Helper Tool */}
          <div className="w-full bg-primary-container text-on-primary rounded-2xl p-space-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-on-primary/10 flex items-center justify-center text-primary-fixed">
                <span className="material-symbols-outlined text-[28px]">
                  extension
                </span>
              </div>
              <div className="flex flex-col">
                <h4 className="font-headline-sm text-headline-sm font-bold">
                  Ekstensi Browser VoyageAI QuickClip
                </h4>
                <p className="font-body-sm text-body-sm text-on-primary/80">
                  Simpan video langsung dengan 1-klik saat berselancar di TikTok
                  Web atau Instagram tanpa copy-paste URL.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-sm whitespace-nowrap">
              <button className="px-5 py-2.5 rounded-xl bg-surface-container-lowest text-primary font-title-md text-title-md hover:bg-surface-container-low transition-colors shadow-sm">
                Pasang di Chrome / Safari
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE VIEW (Stitch: Import Link AI Mobile) ==================== */}
      <div className={showMobileClass}>
        <div className="px-margin-mobile pt-space-md pb-space-lg flex flex-col gap-space-md bg-surface-container-lowest">
          <div className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-1.5 self-start px-space-xs py-0.5 rounded-full bg-surface-container text-primary">
              <span
                className="material-symbols-outlined text-[15px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                magic_button
              </span>
              <span className="font-label-sm text-label-sm">Smart Parser</span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight">
              Tempel Link Video
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              AI merangkum tempat, jam buka, dan rute otomatis langsung ke
              rencana jalanmu.
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container flex flex-col gap-space-sm">
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">
                  link
                </span>
              </div>
              <input
                className="w-full bg-surface-container-low pl-10 pr-24 py-3 rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container transition-colors"
                placeholder="https://tiktok.com/@..."
                type="url"
                value={mobileUrlInput}
                onChange={(e) => setMobileUrlInput(e.target.value)}
              />
              <button
                onClick={handlePasteMobile}
                className="absolute right-1.5 px-3 py-1.5 rounded-md bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-dim transition-colors flex items-center gap-1"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">
                  content_paste
                </span>
                <span>Tempel</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
              <span className="font-label-sm text-label-sm text-outline flex-shrink-0 mr-1">
                Didukung:
              </span>
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FE2C55]/10 text-[#FE2C55] font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[13px]">
                  music_note
                </span>{" "}
                TikTok
              </span>
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C13584]/10 text-[#C13584] font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[13px]">
                  photo_camera
                </span>{" "}
                Reels
              </span>
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF0000]/10 text-[#FF0000] font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[13px]">
                  play_arrow
                </span>{" "}
                Shorts
              </span>
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1877F2]/10 text-[#1877F2] font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[13px]">
                  thumb_up
                </span>{" "}
                FB Watch
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
                  Hasil Ekstraksi AI
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px] text-tertiary">
                  check_circle
                </span>{" "}
                Terverifikasi
              </span>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md border border-surface-container flex flex-col gap-space-sm relative overflow-hidden">
              <div className="flex items-start gap-space-sm">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                  <img
                    alt="Ichiran Ramen Shinjuku"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdi3Izp5dAbjpUGb17DxyZKh-Fplxly53FcH7GbFZnFQFLOAsLSItJoA4fMyxJL2Dq-n1vArubMQqIPisW2U5CRb1WcQ6XLM-XzINdt0u-hs6_QUhsCkfwbTGTcfa8qDPtOhF_zpCUl4rBrBccBWGbjmsybEbMymwLK4k7-xrZOT_HOrEddulipbMYp4kiQQdJ2RGFdMhXgtN3sSsmHYJ153gd3tlVzxM4jyhfkw5AXWQDvQJe54oTKA"
                  />
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-[#FE2C55] font-label-sm text-label-sm flex items-center">
                    <span className="material-symbols-outlined text-[11px] mr-0.5">
                      music_note
                    </span>
                    TikTok
                  </span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">
                      Ichiran Ramen Shinjuku
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex items-center text-secondary">
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="font-numeric-metric text-numeric-metric ml-0.5">
                        4.8
                      </span>
                    </div>
                    <span className="text-outline">•</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      Tonkotsu Ramen Solo Booth
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-outline mt-1 line-clamp-1">
                    Bilik makan personal ikonik dengan kuah kaldu legendaris
                    khas Hakata.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container text-tertiary font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[15px]">
                    schedule
                  </span>
                  <span>Buka 24 Jam</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container text-on-surface font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[15px]">
                    payments
                  </span>
                  <span>¥1.100 - ¥1.800</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[15px]">
                    directions_walk
                  </span>
                  <span>450m dari stasiun</span>
                </div>
              </div>

              <button
                onClick={handleAddItinerary}
                className={`w-full mt-1 py-3 px-space-md rounded-lg text-on-primary font-title-md text-title-md shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${
                  addedToDay2 ? "bg-tertiary" : "bg-primary"
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {addedToDay2 ? "check" : "add_circle"}
                </span>
                <span>
                  {addedToDay2
                    ? "Ditambahkan ke Hari 2!"
                    : "+ Masukkan ke Hari 2"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-space-xs pt-space-xs">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="font-title-md text-title-md text-on-surface">
                Riwayat Link
              </h3>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                2 tautan tersimpan
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div
                onClick={() => onNavigate?.("itinerary")}
                className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container flex items-center gap-3 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                  <img
                    alt="Arashiyama Bamboo Forest"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnUMUxMTXtSGbZ02PNmB04OHV1AfyA_rGOxwW6fOmI9PeLKAf60RFve_jtKadv0f9tvQvIKbpTQKug8Ha1kh-bD2rnd3gVJi-SBkKAUYj8SgiwRIYZZ6ZC870mlOFQKZdZSHDJA9XOdCBwEnt1GWuxhRytTUYQ5_f3M2n44gl2olyFv72DwHfybj4KzxannGtvKvqOw9PbTVlpSlxuFNNiHs4MaknWJq55mu99Wo0KT0uDskDIHmsZWg"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-title-md text-title-md text-on-surface truncate">
                      Arashiyama Bamboo Forest
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#C13584]/10 text-[#C13584] flex-shrink-0">
                      Reels
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-tertiary">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>{" "}
                      Hari 3
                    </span>
                    <span className="text-outline">•</span>
                    <span className="font-body-sm text-body-sm text-outline truncate">
                      Kyoto Barat
                    </span>
                  </div>
                </div>
                <button
                  aria-label="Detail item"
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low text-outline flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                </button>
              </div>

              <div
                onClick={() => onNavigate?.("itinerary")}
                className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container flex items-center gap-3 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                  <img
                    alt="Omoide Yokocho Alley"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMigA1hHO05IKRcN5D9A6MaSANlQZlGO0ndlI5yTkD0GW4RmCKALtccN_8F7m1lPceCzTOIA0RKIPMpVlUIyqu70YMVA0c30Y2v1oWzR1zfc2aiLPwM02yrY_wGHgNL6EdVpCeu4a5pwM4xwMVnMqYPbBEvIoZz3vzV9xs1Oe8IPPzzc7wj9dk8qQMyyEDrirrAnD7JmwAaxJewF_ljJ5fMnKyGJYNTs2TbQuBfYKuwIEjPIk27Ki6Ug"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-title-md text-title-md text-on-surface truncate">
                      Omoide Yokocho Alley
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FE2C55]/10 text-[#FE2C55] flex-shrink-0">
                      TikTok
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>{" "}
                      Draft
                    </span>
                    <span className="text-outline">•</span>
                    <span className="font-body-sm text-body-sm text-outline truncate">
                      Kuliner Malam Shinjuku
                    </span>
                  </div>
                </div>
                <button
                  aria-label="Detail item"
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low text-outline flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
