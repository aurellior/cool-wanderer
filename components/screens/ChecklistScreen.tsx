"use client";

import React, { useState } from "react";

interface ChecklistItem {
  id: string;
  category: number;
  title: string;
  subtitle: string;
  checked: boolean;
  badgeText?: string;
  badgeType?: "default" | "primary" | "secondary" | "error" | "ai";
  importantPrefix?: string;
  icon?: string;
}

interface ChecklistScreenProps {
  forceMode?: "auto" | "desktop" | "mobile";
  onNavigate?: (tab: "import" | "itinerary" | "explore" | "checklist") => void;
}

const initialItems: ChecklistItem[] = [
  // Category 1: Dokumen & Finansial Wajib
  {
    id: "doc-1",
    category: 1,
    title: "Paspor RI aktif min. 6 bulan",
    subtitle: "Masa berlaku s/d Oktober 2029 • Fisik tersimpan di tas kabin",
    checked: true,
    badgeText: "Fisik",
    badgeType: "default",
    icon: "verified",
  },
  {
    id: "doc-2",
    category: 1,
    title: "Visa Jepang / Registrasi Paspor Elektronik (e-Visa)",
    subtitle: "Status e-Visa: Terbit & Tersimpan offline di smartphone",
    checked: true,
    badgeText: "Digital PDF",
    badgeType: "primary",
    icon: "qr_code_2",
  },
  {
    id: "doc-3",
    category: 1,
    title: "QR Code Visit Japan Web (Imigrasi & Bea Cukai)",
    subtitle: "Tangkapan layar tersimpan di Apple Wallet & Galeri",
    checked: true,
    badgeText: "QR Code",
    badgeType: "primary",
    icon: "qr_code_2",
  },
  {
    id: "doc-4",
    category: 1,
    title: "Kartu Debit Jenius / Suica IC Card di Apple Wallet / Pasmo",
    subtitle:
      "Saldo aktif Suica: ¥5.000 + Mata uang JPY diaktifkan di m-Banking",
    checked: true,
    badgeText: "Finansial",
    badgeType: "default",
    icon: "credit_card",
  },
  {
    id: "doc-5",
    category: 1,
    title: "Asuransi Perjalanan Sompo / Allianz",
    subtitle: "Polis mencakup kompensasi medis & keterlambatan bagasi",
    checked: true,
    badgeText: "Polis Aktif",
    badgeType: "primary",
    icon: "verified_user",
  },

  // Category 2: Pakaian & Perlengkapan Cuaca (Autumn)
  {
    id: "cloth-1",
    category: 2,
    title: "2x Outer Coat / Trench Coat hangat",
    subtitle: "Warna netral (Khaki & Hitam) untuk sesi foto di Arashiyama",
    checked: true,
    icon: "dry_cleaning",
  },
  {
    id: "cloth-2",
    category: 2,
    title: "Heattech Ultra Warm Top & Bottom (2 set)",
    subtitle: "Belum dikemas • Cek di lemari atas atau beli tambahan Uniqlo",
    checked: false,
    badgeText: "Prioritas",
    badgeType: "secondary",
    icon: "styler",
  },
  {
    id: "cloth-3",
    category: 2,
    title: "Sepatu Sneaker Walking Nyaman (New Balance / Hoka)",
    subtitle: "Sudah dibersihkan & insole gel terpasang",
    checked: true,
    icon: "hiking",
  },
  {
    id: "cloth-4",
    category: 2,
    title: "Payung Lipat Ringan Ultra-Durable",
    subtitle: "AI mendeteksi potensi hujan gerimis 30% pada Day 3 saat di Kyoto",
    checked: false,
    badgeText: "Rekomendasi Cuaca",
    badgeType: "ai",
    icon: "umbrella",
  },

  // Category 3: Gadget & Elektronik
  {
    id: "gad-1",
    category: 3,
    title: "Universal Travel Adapter colokan tipe A (pipih 2 pin)",
    subtitle: "Tegangan 100V kompatibel",
    checked: true,
    icon: "power",
  },
  {
    id: "gad-2",
    category: 3,
    title: "eSIM Jepang Unlimited 7 Hari",
    subtitle:
      "Ubigi / Airalo QR terpasang di setting seluler (tinggal nyalakan roaming saat mendarat)",
    checked: true,
    icon: "sim_card",
  },
  {
    id: "gad-3",
    category: 3,
    title: "Powerbank 10.000 - 20.000 mAh",
    subtitle:
      "Wajib masuk tas jinjing/kabin, dilarang masuk koper bagasi check-in",
    importantPrefix: "PENTING:",
    checked: false,
    badgeText: "Aturan Kabin",
    badgeType: "error",
    icon: "battery_charging_full",
  },
  {
    id: "gad-4",
    category: 3,
    title: "Charger 65W GaN & Kabel Cadangan Type-C / Lightning",
    subtitle: "1 kepala charger untuk smartphone, kamera, dan powerbank",
    checked: true,
    icon: "bolt",
  },

  // Category 4: Obat-obatan & Kenyamanan Diri
  {
    id: "med-1",
    category: 4,
    title: "Tolak Angin, Panadol, Salonpas patch koyo kaki pegal",
    subtitle: "Sangat vital setelah seharian menjelajahi Fushimi Inari",
    checked: true,
    icon: "medication",
  },
  {
    id: "med-2",
    category: 4,
    title: "Obat alergi dingin (antihistamin) & tetes mata kering",
    subtitle: "Beli di apotek sebelum H-3",
    checked: false,
    badgeText: "Perlu Beli",
    badgeType: "secondary",
    icon: "medication",
  },
];

export default function ChecklistScreen({
  forceMode = "auto",
}: ChecklistScreenProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<number>(3);
  const [yenAmount, setYenAmount] = useState<string>("1000");

  const exchangeRate = 104.8;
  const calculatedIdr = Math.round(
    (parseFloat(yenAmount) || 0) * exchangeRate
  ).toLocaleString("id-ID");

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleReset = () => {
    setItems((prev) => prev.map((item) => ({ ...item, checked: false })));
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      category: newItemCategory,
      title: newItemName.trim(),
      subtitle: "Ditambahkan manual oleh Anda",
      checked: false,
      badgeText: "Baru",
      badgeType: "default",
      icon: "inventory_2",
    };
    setItems((prev) => [...prev, newItem]);
    setNewItemName("");
    setShowAddForm(false);
  };

  // Calculate progress
  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const percent =
    totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const getCategoryStats = (catId: number) => {
    const catItems = items.filter((i) => i.category === catId);
    const catChecked = catItems.filter((i) => i.checked).length;
    return { checked: catChecked, total: catItems.length };
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
      {/* ==================== DESKTOP VIEW (Stitch: Checklist & Trip Reminders) ==================== */}
      <div className={showDesktopClass}>
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute top-72 -right-24 w-80 h-80 bg-secondary-fixed/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

          <div className="w-full px-gutter max-w-7xl mx-auto py-space-md flex flex-col gap-space-xl">
            {/* TOP BANNER: Countdown, Flight Specs & AI Climate Advisory */}
            <section className="w-full rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Countdown & Flight Spec (7 cols) */}
                <div className="lg:col-span-7 p-space-lg flex flex-col justify-between gap-space-md">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center gap-space-sm">
                      <span className="px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm tracking-wide uppercase flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">
                          flight_takeoff
                        </span>{" "}
                        Hitung Mundur
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          verified
                        </span>{" "}
                        Tiket Terkonfirmasi
                      </span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">
                      H-18 Menuju Keberangkatan ke Tokyo &amp; Kyoto! ✈️
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">
                        calendar_today
                      </span>
                      <span className="font-semibold text-on-surface">
                        15 November 2025
                      </span>{" "}
                      • Penerbangan ANA NH856 (CGK ➔ HND 06:15 WIB)
                    </p>
                  </div>

                  {/* Flight Milestone Card */}
                  <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-md">
                      <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">
                          airplane_ticket
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md text-on-surface font-semibold">
                          All Nippon Airways • NH856
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Boeing 787-9 Dreamliner • Terminal 3 Soekarno-Hatta
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-sm bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        T-432 Jam Tersisa
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Weather & Dynamic Packing Guidance (5 cols) */}
                <div className="lg:col-span-5 bg-gradient-to-br from-surface-container-high to-surface-container p-space-lg flex flex-col justify-between gap-space-md">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-primary">
                        <span className="material-symbols-outlined text-[18px]">
                          auto_awesome
                        </span>
                        <span className="font-label-md text-label-md uppercase font-bold tracking-wider">
                          VoyageAI Climate Oracle
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                        Musim Gugur (Autumn)
                      </h3>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Tokyo &amp; Kyoto Suburban Forecast
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[26px]">
                        ac_unit
                      </span>
                      <div className="flex flex-col items-end">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                          12° - 18°C
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Sejuk &amp; Berangin
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Insight Pill */}
                  <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
                      tips_and_updates
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-bold">
                        Rekomendasi Pintar AI:
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-0.5">
                        Disarankan membawa jaket tebal/coat, syal hangat, dan
                        sepatu jalan yang empuk (rata-rata estimasi rute Anda:{" "}
                        <strong className="text-on-surface font-semibold">
                          12.000 langkah/hari
                        </strong>
                        ).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        air
                      </span>{" "}
                      Angin sore: 14 km/j
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        water_drop
                      </span>{" "}
                      Kelembapan: 58%
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">
                        wb_twilight
                      </span>{" "}
                      Terbenam: 16:38 JST
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* MAIN CONTENT SPLIT GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
              {/* LEFT COLUMN: Smart Packing Checklist (7 cols) */}
              <section className="xl:col-span-7 flex flex-col gap-space-lg">
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          checklist_rtl
                        </span>
                        <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                          Smart Packing Checklist
                        </h2>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        Disesuaikan otomatis dengan musim, durasi 7 hari &amp;
                        destinasi.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1 shadow-sm hover:opacity-95 transition-all"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          add
                        </span>{" "}
                        Tambah Item
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md font-semibold hover:bg-surface-container-highest transition-colors flex items-center gap-1"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          restart_alt
                        </span>{" "}
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Progress Meter */}
                  <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-2">
                    <div className="flex items-center justify-between font-label-md text-label-md">
                      <span className="text-on-surface font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-[18px]">
                          inventory_2
                        </span>
                        Kesiapan Bagasi Keseluruhan
                      </span>
                      <span className="text-primary font-bold">
                        {checkedCount} dari {totalCount} Barang Siap ({percent}%
                        Selesai)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-surface-container-highest overflow-hidden relative">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant pt-0.5">
                      <span>Koper Bagasi Maks. 23kg x 2</span>
                      <span className="text-primary font-medium">
                        {totalCount - checkedCount} barang tersisa
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add Item Inline Form */}
                {showAddForm && (
                  <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-md flex flex-col gap-3">
                    <span className="font-title-md text-title-md text-on-surface font-semibold">
                      + Tambah Perlengkapan Pribadi Baru
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        className="sm:col-span-2 px-3 py-2 rounded-xl bg-surface-container-low text-body-md text-on-surface placeholder:text-outline focus:outline-none"
                        placeholder="Nama barang (misal: Kamera Mirrorless)"
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                      />
                      <select
                        className="px-3 py-2 rounded-xl bg-surface-container-low text-body-md text-on-surface focus:outline-none"
                        value={newItemCategory}
                        onChange={(e) =>
                          setNewItemCategory(Number(e.target.value))
                        }
                      >
                        <option value={1}>Dokumen &amp; Finansial</option>
                        <option value={2}>Pakaian</option>
                        <option value={3}>Gadget</option>
                        <option value={4}>Obat/Lainnya</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-3 py-1.5 rounded-xl bg-surface-container font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high"
                        type="button"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleAddItem}
                        className="px-4 py-1.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:opacity-90"
                        type="button"
                      >
                        Simpan Barang
                      </button>
                    </div>
                  </div>
                )}

                {/* Grouped Categories Container */}
                <div className="flex flex-col gap-space-md">
                  {[
                    {
                      id: 1,
                      title: "1. Dokumen & Finansial Wajib",
                      icon: "verified_user",
                      iconBg: "bg-primary-fixed text-on-primary-fixed",
                      rightTag: "Lengkap",
                      rightTagClass:
                        "bg-primary text-on-primary flex items-center gap-0.5",
                    },
                    {
                      id: 2,
                      title: "2. Pakaian & Perlengkapan Cuaca (Autumn)",
                      icon: "dry_cleaning",
                      iconBg: "bg-secondary-fixed text-on-secondary-fixed",
                      rightTag: "Suhu 12°C",
                      rightTagClass: "bg-secondary-container/20 text-secondary",
                    },
                    {
                      id: 3,
                      title: "3. Gadget & Elektronik",
                      icon: "devices",
                      iconBg: "bg-surface-container-highest text-on-surface",
                      rightTag: "Kabin Pesawat",
                      rightTagClass:
                        "bg-surface-container text-on-surface-variant",
                    },
                    {
                      id: 4,
                      title: "4. Obat-obatan & Kenyamanan Diri",
                      icon: "medication",
                      iconBg: "bg-surface-container-high text-on-surface",
                      rightTag: "Pouch P3K",
                      rightTagClass:
                        "bg-surface-container text-on-surface-variant",
                    },
                  ].map((cat) => {
                    const stats = getCategoryStats(cat.id);
                    const catItems = items.filter((i) => i.category === cat.id);
                    return (
                      <div
                        key={cat.id}
                        className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-shadow hover:shadow-md"
                      >
                        <div className="p-space-md bg-surface-container-low flex items-center justify-between">
                          <div className="flex items-center gap-space-sm">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.iconBg}`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {cat.icon}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-title-md text-title-md text-on-surface font-bold">
                                {cat.title}
                              </h3>
                              <span className="font-label-sm text-label-sm text-primary font-semibold">
                                {stats.checked} dari {stats.total} Selesai
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${cat.rightTagClass}`}
                          >
                            {cat.rightTag}
                          </span>
                        </div>

                        <div className="p-space-md flex flex-col gap-2.5">
                          {catItems.map((item) => (
                            <label
                              key={item.id}
                              className={`flex items-start gap-space-sm p-2 rounded-xl cursor-pointer transition-colors ${
                                item.checked
                                  ? "hover:bg-surface-container-low"
                                  : "bg-surface-container-low/50 hover:bg-surface-container-low"
                              }`}
                            >
                              <input
                                checked={item.checked}
                                onChange={() => toggleItem(item.id)}
                                className="mt-0.5 h-5 w-5 rounded-md accent-primary text-primary focus:ring-0 cursor-pointer"
                                type="checkbox"
                              />
                              <div className="flex-1 flex flex-col">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className={`font-body-md text-body-md ${
                                      item.checked
                                        ? "font-medium line-through text-on-surface-variant/70"
                                        : "text-on-surface font-semibold"
                                    }`}
                                  >
                                    {item.title}
                                  </span>
                                  {item.badgeType === "ai" && item.badgeText && (
                                    <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm flex items-center gap-0.5">
                                      <span className="material-symbols-outlined text-[12px]">
                                        auto_awesome
                                      </span>{" "}
                                      {item.badgeText}
                                    </span>
                                  )}
                                </div>
                                <span className="font-label-sm text-label-sm text-on-surface-variant">
                                  {item.importantPrefix && (
                                    <strong className="text-error font-semibold mr-1">
                                      {item.importantPrefix}
                                    </strong>
                                  )}
                                  {item.subtitle}
                                </span>
                              </div>
                              {item.badgeText && item.badgeType !== "ai" ? (
                                <span
                                  className={`px-2 py-0.5 rounded font-label-sm text-label-sm ${
                                    item.badgeType === "primary"
                                      ? "bg-primary-fixed text-on-primary-fixed"
                                      : item.badgeType === "secondary"
                                      ? "bg-secondary-fixed text-on-secondary-fixed"
                                      : item.badgeType === "error"
                                      ? "bg-error-container text-on-error-container font-semibold"
                                      : "bg-surface-container text-on-surface-variant"
                                  }`}
                                >
                                  {item.badgeText}
                                </span>
                              ) : (
                                <span
                                  className={`material-symbols-outlined text-[20px] ${
                                    item.checked
                                      ? "text-primary"
                                      : "text-outline"
                                  }`}
                                >
                                  {item.checked
                                    ? "check_circle"
                                    : "radio_button_unchecked"}
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* RIGHT COLUMN: Reminders Timeline & Live Financial Dashboard (5 cols) */}
              <section className="xl:col-span-5 flex flex-col gap-space-lg">
                {/* SECTION 3: Trip Reminder & Jadwal Booking (Timeline) */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[24px]">
                        notifications_active
                      </span>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Timeline Pengingat Waktu
                      </h2>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                      Sinkron Google Calendar
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Jadwal krusial pemesanan atraksi dan batas waktu dokumen
                    sebelum terbang.
                  </p>

                  {/* Vertical Timeline Structure */}
                  <div className="relative pl-6 flex flex-col gap-space-lg before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-container-highest">
                    {/* Reminder 1: H-14 */}
                    <div className="relative flex flex-col gap-1">
                      <div className="absolute -left-[27px] top-0 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center ring-4 ring-surface-container-lowest">
                        <span className="material-symbols-outlined text-[14px]">
                          done
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                          H-14 (1 November 2025)
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">
                            check
                          </span>{" "}
                          Sudah Dibeli
                        </span>
                      </div>
                      <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                        Beli Tiket Masuk Shibuya Sky
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Slot golden sunset 16:20 terkonfirmasi via Klook. Tiket
                        tersimpan di dompet digital.
                      </p>
                    </div>

                    {/* Reminder 2: H-7 */}
                    <div className="relative flex flex-col gap-1 p-3 rounded-xl bg-secondary-fixed/30 -ml-1">
                      <div className="absolute -left-[23px] top-3 w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center ring-4 ring-surface-container-lowest shadow-sm animate-bounce">
                        <span className="material-symbols-outlined text-[14px]">
                          priority_high
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                          H-7 (8 November 2025)
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold flex items-center gap-0.5 shadow-sm">
                          <span className="material-symbols-outlined text-[12px]">
                            warning
                          </span>{" "}
                          Perlu Dilakukan
                        </span>
                      </div>
                      <h4 className="font-title-md text-title-md text-on-surface font-bold">
                        Tukar e-Voucher JR Pass &amp; Reservasi Kursi
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface font-medium">
                        Buka portal reservasi Shinkansen untuk Tokyo ➔ Kyoto.
                        Kursi sisi kanan (Melihat Gunung Fuji) cepat habis!
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          className="px-3 py-1 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:opacity-95"
                          type="button"
                        >
                          Buka Web JR
                        </button>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Estimasi proses: 10 menit
                        </span>
                      </div>
                    </div>

                    {/* Reminder 3: H-3 */}
                    <div className="relative flex flex-col gap-1">
                      <div className="absolute -left-[27px] top-0 w-6 h-6 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center ring-4 ring-surface-container-lowest">
                        <span className="material-symbols-outlined text-[14px]">
                          schedule
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
                          H-3 (12 November 2025)
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">
                            hourglass_empty
                          </span>{" "}
                          Menunggu Jadwal
                        </span>
                      </div>
                      <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                        Isi Formulir Visit Japan Web
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Lengkapi deklarasi bea cukai dan deklarasi karantina
                        kesehatan imigrasi agar tidak antre lama di Bandara
                        Haneda.
                      </p>
                    </div>

                    {/* Reminder 4: H-1 */}
                    <div className="relative flex flex-col gap-1">
                      <div className="absolute -left-[27px] top-0 w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center ring-4 ring-surface-container-lowest">
                        <span className="material-symbols-outlined text-[14px]">
                          notifications
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                          H-1 (14 November 2025 • 06:00 WIB)
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">
                            alarm
                          </span>{" "}
                          Alarm Aktif
                        </span>
                      </div>
                      <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                        Online Web Check-in ANA NH856
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Sistem VoyageAI akan mengirim notifikasi WhatsApp
                        otomatis saat check-in 24 jam dibuka.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Ringkasan Estimasi Budget & Pengeluaran */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[22px]">
                        account_balance_wallet
                      </span>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Ringkasan Estimasi Budget
                      </h2>
                    </div>
                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                      IDR / JPY
                    </span>
                  </div>

                  <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                      Total Alokasi Rencana Perjalanan
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
                        Rp 24.500.000
                      </span>
                      <span className="font-label-md text-label-md text-primary font-bold">
                        ~ ¥233.778 JPY
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="w-full h-3 rounded-full bg-surface-container-highest overflow-hidden flex">
                      <div
                        className="h-full bg-primary"
                        style={{ width: "66%" }}
                        title="Terbayar 66%"
                      ></div>
                      <div
                        className="h-full bg-secondary"
                        style={{ width: "34%" }}
                        title="Uang Saku 34%"
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-space-sm mt-1">
                      <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-primary">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                          <span className="font-label-sm text-label-sm font-semibold">
                            Terbayar (66%)
                          </span>
                        </div>
                        <span className="font-title-md text-title-md font-bold text-on-surface">
                          Rp 16.200.000
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Tiket Pesawat ANA &amp; Hotel Tokyo/Kyoto
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-secondary">
                          <span className="w-2 h-2 rounded-full bg-secondary"></span>
                          <span className="font-label-sm text-label-sm font-semibold">
                            Uang Saku (34%)
                          </span>
                        </div>
                        <span className="font-title-md text-title-md font-bold text-on-surface">
                          Rp 8.300.000
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Kuliner, Oleh-oleh &amp; Tiket On-spot
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Live Currency Converter Widget */}
                  <div className="p-3.5 rounded-xl bg-surface-container flex items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-primary text-[20px]">
                          currency_exchange
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-label-md text-label-md text-on-surface font-bold">
                            Konversi Kurs Live
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                        </div>
                        <span className="font-title-md text-title-md font-extrabold text-primary">
                          1 JPY = Rp 104,80
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-label-sm text-label-sm text-on-surface-variant block">
                        Terakhir diperbarui:
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface font-medium">
                        Hari ini 11:45 WIB
                      </span>
                    </div>
                  </div>

                  {/* Mini Currency Calculator */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 flex items-center bg-surface-container-low rounded-xl px-3 py-1.5">
                      <span className="font-label-sm text-label-sm text-on-surface-variant mr-1">
                        ¥
                      </span>
                      <input
                        className="w-full bg-transparent font-title-md text-title-md text-on-surface font-semibold focus:outline-none"
                        placeholder="1000"
                        type="number"
                        value={yenAmount}
                        onChange={(e) => setYenAmount(e.target.value)}
                      />
                    </div>
                    <span className="material-symbols-outlined text-outline text-[18px]">
                      sync_alt
                    </span>
                    <div className="flex-1 flex items-center bg-surface-container-low rounded-xl px-3 py-1.5">
                      <span className="font-label-sm text-label-sm text-on-surface-variant mr-1">
                        Rp
                      </span>
                      <span className="font-title-md text-title-md text-on-surface font-semibold">
                        {calculatedIdr}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Travel Helper Widget */}
                <div className="p-space-md rounded-2xl bg-gradient-to-r from-primary to-tertiary text-on-primary shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[28px]">
                      luggage
                    </span>
                    <div className="flex flex-col">
                      <span className="font-title-md text-title-md font-bold">
                        Panduan Bagasi Kabin &amp; Check-in
                      </span>
                      <span className="font-body-sm text-body-sm opacity-90">
                        Cek daftar benda terlarang penerbangan internasional
                      </span>
                    </div>
                  </div>
                  <button
                    className="p-2 rounded-xl bg-surface-container-lowest/20 hover:bg-surface-container-lowest/30 backdrop-blur-md transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE VIEW (Stitch: Checklist & Reminders Mobile) ==================== */}
      <div className={showMobileClass}>
        <div className="flex flex-col w-full px-margin-mobile pt-space-sm pb-space-xl gap-space-md bg-surface-container-lowest">
          {/* Countdown & Flight Header Card */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container p-space-md shadow-sm">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-primary-fixed-dim/20 blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between gap-space-xs mb-space-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/15 text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse"></span>
                H-18 Menuju Keberangkatan
              </span>
              <span className="font-numeric-metric text-numeric-metric text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  flight_takeoff
                </span>
                ANA NH856
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-1">
              Tokyo &amp; Kyoto ✈️
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Sabtu, 15 Nov 2025 • Bandara Soekarno-Hatta (CGK) → Haneda (HND)
            </p>

            {/* Progress Overview Panel */}
            <div className="mt-space-md pt-space-sm bg-surface-container-lowest/80 rounded-xl p-space-sm backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    task_alt
                  </span>
                  <span className="font-title-md text-title-md text-on-surface">
                    Kesiapan Perjalanan
                  </span>
                </div>
                <span className="font-numeric-metric text-numeric-metric text-primary">
                  {percent}%
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2 font-label-md text-label-md text-on-surface-variant">
                <span>
                  {checkedCount} dari {totalCount} barang disiapkan
                </span>
                <span className="text-secondary font-label-sm text-label-sm">
                  {totalCount - checkedCount} sisa
                </span>
              </div>
            </div>
          </div>

          {/* Time-Sensitive Reminders */}
          <section className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  notifications_active
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Jadwal Pengingat
                </h2>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant px-2 py-0.5 rounded-full bg-surface-container">
                Harian
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-surface-container-low rounded-xl p-space-sm flex items-start gap-space-sm shadow-sm">
                <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-secondary-container/15 text-secondary flex-shrink-0">
                  <span className="font-label-sm text-label-sm uppercase leading-none">
                    Hari
                  </span>
                  <span className="font-numeric-metric text-numeric-metric font-bold">
                    H-7
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-title-md text-title-md text-on-surface truncate">
                      Tukar e-Voucher JR Pass
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex-shrink-0">
                      Penting
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">
                    Simpan QR MCO dari Klook ke Apple Wallet / Google Keep
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-space-sm flex items-start gap-space-sm shadow-sm">
                <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-surface-container text-on-surface-variant flex-shrink-0">
                  <span className="font-label-sm text-label-sm uppercase leading-none">
                    Hari
                  </span>
                  <span className="font-numeric-metric text-numeric-metric font-bold">
                    H-3
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-title-md text-title-md text-on-surface truncate">
                      Isi Visit Japan Web
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm flex-shrink-0">
                      Imigrasi &amp; Bea
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">
                    Screenshot QR code Imigrasi &amp; Bea Cukai untuk offline
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-space-sm flex items-start gap-space-sm shadow-sm">
                <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-surface-container text-on-surface-variant flex-shrink-0">
                  <span className="font-label-sm text-label-sm uppercase leading-none">
                    Hari
                  </span>
                  <span className="font-numeric-metric text-numeric-metric font-bold">
                    H-1
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-title-md text-title-md text-on-surface truncate">
                      Online Check-in ANA
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm flex-shrink-0">
                      24 Jam
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">
                    Pilih kursi lorong/jendela &amp; verifikasi nomor paspor
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Mobile Checklist Sections */}
          {[
            {
              cat: 1,
              title: "Dokumen Wajib",
              icon: "badge",
              rightLabel: "Prioritas Utama",
            },
            {
              cat: 2,
              title: "Pakaian Musim Gugur",
              icon: "ac_unit",
              rightLabel: "12°C - 18°C",
              banner:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAQL-y4JesGGwFTWVNLs7ngs6ff0l7r9dfqWgftUonFHan4VDsxYA5qfEPYQMZEWvTlIU8y-Tko4NIX-xM4uK8_XqR_8wMh788yJbAllhzTgd-fyECuITA0CKH64ZJ83ERHxFYkbzc4zsw8S0Ol4R-ESxSKK-GgF0ye0Xw_Di52p1_sOg_-MhVszRWLFx6CpnXUgOT5ivZg9tCOW9USx0s0SQVRhAgZOxQeXJTklFLkxNUiDnuDpOnehQ",
            },
            {
              cat: 3,
              title: "Gadget & Listrik",
              icon: "bolt",
              rightLabel: "Regulasi Maskapai",
            },
          ].map((sec) => {
            const secItems = items.filter((i) => i.category === sec.cat);
            return (
              <section key={sec.cat} className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      {sec.icon}
                    </span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">
                      {sec.title}
                    </h2>
                  </div>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">
                    {sec.rightLabel}
                  </span>
                </div>

                {sec.banner && (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden shadow-sm">
                    <img
                      alt="Autumn Kyoto"
                      className="w-full h-full object-cover"
                      src={sec.banner}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-on-surface/70 via-on-surface/40 to-transparent p-3 flex flex-col justify-end text-on-primary">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary-fixed">
                        Rekomendasi Suhu
                      </span>
                      <span className="font-title-md text-title-md text-on-primary font-semibold">
                        Lapisan Ringan &amp; Anti Angin
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {secItems.map((item) => (
                    <label
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className="group flex items-center justify-between p-space-sm bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container cursor-pointer select-none transition-all active:bg-surface-container-low"
                    >
                      <div className="flex items-center gap-space-sm min-w-0">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                            item.checked
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              item.checked ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            check
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span
                            className={`font-body-lg text-body-lg truncate transition-all ${
                              item.checked
                                ? "text-outline line-through"
                                : "text-on-surface"
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="font-body-sm text-body-sm text-outline truncate">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-outline text-[20px] ml-2 flex-shrink-0">
                        {item.icon || "check_circle"}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Quick Floating Action Bar */}
          <div className="sticky bottom-2 w-full pt-2 flex items-center justify-between gap-space-sm">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-title-md text-title-md flex items-center justify-center gap-2 shadow-md active:bg-primary-container transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">
                add_circle
              </span>
              <span>Tambah Barang</span>
            </button>
            <button
              onClick={handleReset}
              aria-label="Reset checklist"
              className="w-12 h-12 rounded-xl bg-surface-container text-on-surface flex items-center justify-center shadow-sm active:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">
                restart_alt
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
