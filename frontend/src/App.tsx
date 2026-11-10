import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  CloudSun,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Mic,
  Plus,
  ScanLine,
  Search,
  ShieldCheck,
  Sprout,
  TrendingUp,
  UserRound,
  Volume2,
  Wheat,
  X,
} from "lucide-react";
import {
  addCrop,
  diagnose,
  fetchCommodities,
  fetchCrops,
  fetchDistricts,
  fetchHistory,
  fetchMarket,
  fetchProfile,
  fetchWeather,
  getToken,
  saveToken,
  type Commodity,
  type Crop,
  type Diagnosis,
  type District,
  type Farmer,
  type Market,
  type Weather,
} from "./api";
import { StatCard } from "./components/dashboard/StatCard";
import { sampleHistory, demoMarket } from "./data/dashboardSamples";
import { AuthModal } from "./features/auth/AuthModal";
import { DiagnosisPanel } from "./features/diagnosis/DiagnosisPanel";
import { HistoryCard } from "./features/history/HistoryCard";
import { MarketCard } from "./features/market/MarketCard";
import { WeatherCard } from "./features/weather/WeatherCard";
import { copy } from "./i18n/copy";
import { speak, type RecognitionWindow } from "./lib/speech";

export default function App() {
  const [language, setLanguage] = useState<"bn" | "en">("en");
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [upload, setUpload] = useState<File | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [history, setHistory] = useState<Diagnosis[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [guestCropHint, setGuestCropHint] = useState("");
  const [newCrop, setNewCrop] = useState("");
  const [addingCrop, setAddingCrop] = useState(false);
  const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);
  const [notice, setNotice] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [market, setMarket] = useState<Market | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("Rajshahi");
  const [selectedMarketCrop, setSelectedMarketCrop] = useState("rice");
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const t = copy[language];
  const navigation: {
    icon: typeof LayoutDashboard;
    label: string;
    id: string;
  }[] = [
    { icon: LayoutDashboard, label: t.overview, id: "home" },
    { icon: ScanLine, label: t.diagnosis, id: "diagnosis" },
    { icon: CloudSun, label: t.weather, id: "weather" },
    { icon: TrendingUp, label: t.market, id: "market" },
    { icon: History, label: t.history, id: "history" },
  ];
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!upload) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(upload);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [upload]);

  useEffect(() => {
    fetchDistricts().then(setDistricts).catch(() => undefined);
    fetchCommodities().then(setCommodities).catch(() => undefined);
  }, []);

  useEffect(() => {
    // Refresh weather & market whenever language, district, or crop changes
    fetchWeather({ district: selectedDistrict, language })
      .then(setWeather)
      .catch(() => undefined);
    fetchMarket({ crop: selectedMarketCrop, location: selectedDistrict, language })
      .then(setMarket)
      .catch(() => undefined);
  }, [language, selectedDistrict, selectedMarketCrop]);

  useEffect(() => {
    if (!getToken()) return;
    fetchProfile()
      .then((p) => {
        setFarmer(p);
        if (p.location) {
          setSelectedDistrict(p.location);
        }
      })
      .catch(() => saveToken(null));
    fetchCrops()
      .then(setCrops)
      .catch(() => undefined);
    fetchHistory()
      .then(setHistory)
      .catch(() => undefined);
  }, []);

  async function refreshHistory() {
    try {
      setHistory(await fetchHistory());
    } catch {
      /* Guest dashboard remains available. */
    }
  }

  async function runDiagnosis() {
    if (!upload) {
      setNotice(
        language === "en"
          ? "Choose a clear crop leaf photo first."
          : "প্রথমে ফসলের পাতার একটি পরিষ্কার ছবি নির্বাচন করুন।",
      );
      return;
    }
    setNotice("");
    setLoadingDiagnosis(true);
    try {
      const result = await diagnose(
        upload,
        language,
        selectedCrop || undefined,
        guestCropHint || undefined,
      );
      setDiagnosis(result);
      if (farmer) {
        await refreshHistory();
      }
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Diagnosis could not be completed.",
      );
    } finally {
      setLoadingDiagnosis(false);
    }
  }

  async function loadWeather() {
    if (!navigator.geolocation) {
      setNotice(t.locationPermission);
      return;
    }
    setLoadingWeather(true);
    setNotice("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const w = await fetchWeather({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            language,
          });
          setWeather(w);
          if (w.district_id) {
            setSelectedDistrict(w.district_id);
          }
          setNotice("");
        } catch (error) {
          setNotice(
            error instanceof Error
              ? error.message
              : "Weather could not be loaded.",
          );
        } finally {
          setLoadingWeather(false);
        }
      },
      () => {
        setNotice(t.locationPermission);
        setLoadingWeather(false);
      },
      { timeout: 10000 },
    );
  }

  async function loadMarket() {
    try {
      setMarket(
        await fetchMarket({
          crop: selectedMarketCrop,
          location: selectedDistrict,
          language,
        }),
      );
      setNotice("");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Market data could not be loaded.",
      );
    }
  }

  function handleSelectDistrict(districtId: string) {
    setSelectedDistrict(districtId);
  }

  function handleSelectCommodity(cropId: string) {
    setSelectedMarketCrop(cropId);
  }

  function handleSearch(text: string) {
    const q = text.toLowerCase().trim();
    if (!q) return;

    // Check commodities
    const matchedCommodity = commodities.find(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.name_en.toLowerCase().includes(q) ||
        c.name_bn.toLowerCase().includes(q),
    );
    if (matchedCommodity) {
      setSelectedMarketCrop(matchedCommodity.id);
      jumpTo("market");
      return;
    }

    // Check districts
    const matchedDistrict = districts.find(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.name_en.toLowerCase().includes(q) ||
        d.name_bn.toLowerCase().includes(q),
    );
    if (matchedDistrict) {
      setSelectedDistrict(matchedDistrict.id);
      jumpTo("weather");
      return;
    }

    if (
      q.includes("leaf") ||
      q.includes("disease") ||
      q.includes("পাত") ||
      q.includes("রোগ")
    ) {
      jumpTo("diagnosis");
      return;
    }

    if (
      q.includes("weather") ||
      q.includes("আবহাওয়া") ||
      q.includes("বৃষ্টি")
    ) {
      jumpTo("weather");
      return;
    }

    if (q.includes("market") || q.includes("দাম") || q.includes("বাজার")) {
      jumpTo("market");
      return;
    }
  }

  async function createCrop(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!getToken()) {
      setAuthOpen(true);
      return;
    }
    const cropName = newCrop.trim();
    if (!cropName) return;
    setAddingCrop(true);
    try {
      const crop = await addCrop(cropName);
      setCrops((current) => [crop, ...current]);
      setSelectedCrop(crop.id);
      setNewCrop("");
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not add crop.");
    } finally {
      setAddingCrop(false);
    }
  }

  function startVoiceSearch() {
    const speechWindow = window as RecognitionWindow;
    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setNotice(t.voiceNotAvailable);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === "bn" ? "bn-BD" : "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setListening(false);
      handleSearch(transcript);
    };
    recognition.onerror = () => setListening(false);
    setListening(true);
    recognition.start();
  }

  function handleAuthSuccess(profile: Farmer) {
    setFarmer(profile);
    setAuthOpen(false);
    setNotice("");
    refreshHistory();
    fetchCrops()
      .then(setCrops)
      .catch(() => undefined);
  }

  function signOut() {
    saveToken(null);
    setFarmer(null);
    setHistory([]);
    setCrops([]);
    setSelectedCrop("");
    setDiagnosis(null);
  }

  function jumpTo(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  }

  const marketSeries =
    market?.history.map((point) => ({
      day: new Date(point.date).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      }),
      price: point.price_bdt_per_kg,
    })) || demoMarket;
  const price = marketSeries[marketSeries.length - 1]?.price ?? 35.6;
  const historyRows = history.length
    ? history.slice(0, 4).map((item) => {
        const linkedCrop = item.crop_id
          ? crops.find((c) => c.id === item.crop_id)?.crop_type
          : null;
        return {
          crop: item.disease_name,
          cropType: linkedCrop || item.disease_name,
          disease: `${Math.round(item.confidence * 100)}% ${t.confidence}`,
          date: new Date(item.created_at).toLocaleDateString(
            language === "bn" ? "bn-BD" : "en",
            { month: "short", day: "numeric" },
          ),
          level:
            item.severity === "low"
              ? "Low"
              : item.severity === "high"
                ? "Review"
                : "Monitor",
          color:
            item.severity === "low"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700",
        };
      })
    : sampleHistory;

  return (
    <div className="app-shell flex bg-[#f6f8f2]">
      <aside
        className={`sidebar sticky top-0 flex h-screen flex-col border-r border-[#e9ede4] bg-white px-4 py-7 ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-600 text-white shadow-lg shadow-leaf-600/20">
            <Sprout size={25} />
          </div>
          <div className="sidebar-brand-text">
            <div className="text-[17px] font-bold tracking-tight text-ink">
              Krishok Seba
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[.2em] text-leaf-600">
              Farmer first
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-1 text-slate-500 md:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <p className="sidebar-label mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
          {language === "en" ? "WORKSPACE" : "কাজের জায়গা"}
        </p>
        <nav className="space-y-1.5" aria-label="Main navigation">
          {navigation.map(({ icon: Icon, label, id }, index) => (
            <button
              key={id}
              onClick={() => jumpTo(id)}
              className={`nav-item flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold ${index === 0 ? "bg-leaf-50 text-leaf-700" : "text-slate-500 hover:bg-slate-50 hover:text-ink"}`}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span className="sidebar-label">{label}</span>
              {id === "diagnosis" && (
                <span className="sidebar-label ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-[#f6f8f2] p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-leaf-600 shadow-sm">
            <Plus size={17} />
          </div>
          <p className="sidebar-label text-sm font-bold">{t.help}</p>
          <p className="sidebar-label mt-1 text-xs leading-5 text-slate-500">
            {language === "en"
              ? "We’re here to help you grow."
              : "আপনার পাশে আছি, ফসলের যত্নে।"}
          </p>
          <button
            onClick={() => setAuthOpen(true)}
            className="sidebar-label mt-3 text-xs font-bold text-leaf-700"
          >
            {language === "en" ? "Get support →" : "সহায়তা নিন →"}
          </button>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8efe1] text-leaf-700">
            <UserRound size={18} />
          </div>
          <div className="sidebar-footer-copy min-w-0 flex-1">
            <p className="truncate text-sm font-bold">
              {farmer?.name || "Rahim Uddin"}
            </p>
            <p className="text-xs text-slate-400">
              {farmer?.location || "Rangpur, Bangladesh"}
            </p>
          </div>
          {farmer && (
            <button
              onClick={signOut}
              className="sidebar-footer-copy text-slate-400 hover:text-red-600"
              aria-label={t.logout}
            >
              <LogOut size={17} />
            </button>
          )}
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="main-area min-h-screen flex-1 px-5 pb-12 sm:px-8 lg:px-10">
        <header className="sticky top-0 z-20 -mx-5 mb-7 flex items-center justify-between border-b border-[#e9ede4]/80 bg-[#f6f8f2]/90 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-xl p-2 text-slate-600 hover:bg-white md:hidden"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden w-64 sm:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                aria-label="Search farm information"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearch(query);
                  }
                }}
                placeholder={language === "en" ? "Search anything…" : "খুঁজুন…"}
                className="w-full rounded-xl border border-[#e8ece3] bg-white/75 py-2.5 pl-9 pr-10 text-sm outline-none placeholder:text-slate-400 focus:border-leaf-500"
              />
              <button
                onClick={startVoiceSearch}
                aria-label={t.voice}
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 ${listening ? "bg-red-50 text-red-600" : "text-slate-400 hover:bg-leaf-50 hover:text-leaf-600"}`}
              >
                <Mic size={15} />
              </button>
            </div>
            <span className="text-sm font-bold text-ink sm:hidden">
              Krishok Seba
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex rounded-xl border border-[#e8ece3] bg-white p-1">
              <button
                onClick={() => setLanguage("en")}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${language === "en" ? "bg-leaf-600 text-white" : "text-slate-500"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("bn")}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${language === "bn" ? "bg-leaf-600 text-white" : "text-slate-500"}`}
              >
                বাং
              </button>
            </div>
            <button
              className="relative rounded-xl border border-[#e8ece3] bg-white p-2.5 text-slate-500 hover:text-ink"
              aria-label="Notifications"
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-400 ring-2 ring-white" />
            </button>
            {farmer ? (
              <button
                onClick={signOut}
                className="hidden items-center gap-2 rounded-xl border border-[#e8ece3] bg-white px-3 py-2 text-xs font-semibold sm:flex"
              >
                <span className="max-w-24 truncate">{farmer.name}</span>
                <ChevronDown size={14} />
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="rounded-xl bg-leaf-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-leaf-700 sm:px-4"
              >
                {t.signIn}
              </button>
            )}
          </div>
        </header>

        <section id="home" className="scroll-mt-24">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-400">
                <CalendarDays size={14} />
                {t.date}
              </div>
              <h1 className="text-[26px] font-bold tracking-tight text-ink sm:text-[32px]">
                {t.welcome}, {farmer?.name.split(" ")[0] || "Rahim"}{" "}
                <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#e9ede4] bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600">
              <MapPin size={15} className="text-leaf-600" />
              {farmer?.location || "Rangpur, Bangladesh"}
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
          {notice && (
            <div
              role="status"
              className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            >
              <span>{notice}</span>
              <button
                onClick={() => setNotice("")}
                aria-label="Dismiss"
                className="shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={<Wheat size={18} />}
              label={t.crops}
              value="03"
              note={t.growing}
              tone="green"
            />
            <StatCard
              icon={<ShieldCheck size={18} />}
              label={t.health}
              value={t.allGood}
              note={t.today}
              tone="mint"
            />
            <StatCard
              icon={<MapPin size={18} />}
              label={t.farmLocation}
              value={farmer?.location || "Rangpur"}
              note={language === "en" ? "Bangladesh" : "বাংলাদেশ"}
              tone="gold"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.32fr_.88fr]">
            <DiagnosisPanel
              language={language}
              text={t}
              authenticated={Boolean(farmer)}
              crops={crops}
              selectedCrop={selectedCrop}
              onSelectedCropChange={setSelectedCrop}
              guestCropHint={guestCropHint}
              onGuestCropHintChange={setGuestCropHint}
              newCrop={newCrop}
              onNewCropChange={setNewCrop}
              addingCrop={addingCrop}
              onAddCrop={createCrop}
              fileInput={fileInput}
              upload={upload}
              previewUrl={previewUrl}
              onFileSelect={(file) => {
                setUpload(file);
                setDiagnosis(null);
                setNotice("");
              }}
              diagnosis={diagnosis}
              loading={loadingDiagnosis}
              onDiagnose={runDiagnosis}
              onSpeak={(text) => speak(text, language)}
            />

            <WeatherCard
              language={language}
              text={t}
              weather={weather}
              loading={loadingWeather}
              districts={districts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
              onLoad={loadWeather}
              onSpeak={(text) => speak(text, language)}
            />
          </div>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <MarketCard
            language={language}
            text={t}
            market={market}
            series={marketSeries}
            price={price}
            commodities={commodities}
            selectedCrop={selectedMarketCrop}
            onSelectCrop={handleSelectCommodity}
            onLoad={loadMarket}
          />
          <HistoryCard
            text={t}
            rows={historyRows}
            isEmpty={!history.length}
            onSeeAll={() => (farmer ? refreshHistory() : setAuthOpen(true))}
          />
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl bg-[#e9f0e1] p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-leaf-700">
              <Sprout size={24} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-leaf-900">{t.quickTip}</p>
              <p className="mt-1 text-xs leading-5 text-leaf-800/75">
                {t.tipText}
              </p>
            </div>
            <button
              onClick={() => speak(t.tipText, language)}
              aria-label="Listen to farming tip"
              className="rounded-xl bg-white/80 p-2.5 text-leaf-700 hover:bg-white"
            >
              <Volume2 size={17} />
            </button>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-[#e9ede4] bg-white p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Mic size={22} />
            </div>
            <div className="flex-1">
              <p className="font-bold">{t.voice}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {query || t.voiceHint}
              </p>
            </div>
            <button
              onClick={startVoiceSearch}
              aria-label={t.voice}
              className={`rounded-xl p-2.5 ${listening ? "bg-red-50 text-red-600" : "bg-[#f4f7f1] text-leaf-700 hover:bg-leaf-100"}`}
            >
              <Mic size={17} />
            </button>
          </div>
        </section>
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
          <span>
            © 2026 Krishok Seba ·{" "}
            {language === "en" ? "Growing together" : "একসাথে এগিয়ে চলি"}
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck size={12} />
            {language === "en"
              ? "Farmer data stays private"
              : "কৃষকের তথ্য সুরক্ষিত"}
          </span>
        </footer>
      </main>
      {authOpen && (
        <AuthModal
          language={language}
          onClose={() => setAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
