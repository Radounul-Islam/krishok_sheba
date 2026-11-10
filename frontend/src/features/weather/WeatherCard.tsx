import {
  AlertTriangle,
  CloudSun,
  Droplets,
  LoaderCircle,
  MapPin,
  Sparkles,
  Sun,
  Volume2,
} from "lucide-react";
import type { District, Weather } from "../../api";
import type { Language, Translation } from "../../i18n/copy";
import { WeatherMetric } from "../../components/dashboard/WeatherMetric";

interface WeatherCardProps {
  language: Language;
  text: Translation;
  weather: Weather | null;
  loading: boolean;
  districts?: District[];
  selectedDistrict?: string;
  onSelectDistrict?: (districtId: string) => void;
  onLoad: () => void;
  onSpeak: (text: string) => void;
}

export function WeatherCard({
  language,
  text: t,
  weather,
  loading,
  districts = [],
  selectedDistrict = "",
  onSelectDistrict,
  onLoad,
  onSpeak,
}: WeatherCardProps) {
  return (
    <section id="weather" className="soft-card scroll-mt-24 overflow-hidden">
      <div className="weather-art relative min-h-[244px] overflow-hidden p-5 sm:p-6">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="section-label">{t.today}</p>
            <h2 className="mt-1 text-xl font-bold">
              {weather?.district ? `${weather.district} · ${t.weatherTitle}` : t.weatherTitle}
            </h2>
            {weather?.zone && (
              <p className="mt-0.5 text-[11px] font-medium text-slate-600">
                🌱 {weather.zone}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {districts.length > 0 && onSelectDistrict && (
              <select
                aria-label={t.selectDistrict}
                value={selectedDistrict}
                onChange={(e) => onSelectDistrict(e.target.value)}
                className="rounded-xl border border-white/60 bg-white/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm outline-none backdrop-blur-sm focus:border-leaf-500"
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {language === "bn" ? d.name_bn : d.name_en}
                  </option>
                ))}
              </select>
            )}
            <div className="rounded-xl bg-white/70 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-leaf-700">
              {weather ? weather.source : t.demo}
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-5 flex items-center justify-between">
          <div>
            <p className="text-5xl font-semibold tracking-tight text-ink">
              {weather ? Math.round(weather.temperature_c) : 28}
              <span className="ml-1 align-top text-2xl">°</span>
            </p>
            <p className="mt-1 text-sm font-medium capitalize text-slate-600">
              {weather?.description ||
                (language === "en" ? "Partly sunny" : "আংশিক রৌদ্রোজ্জ্বল")}
            </p>
          </div>
          <div className="mr-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/60 text-amber-500 shadow-inner">
            <Sun size={55} strokeWidth={1.4} />
          </div>
        </div>
        <p className="relative z-10 mt-2 max-w-[260px] text-xs leading-5 text-slate-500">
          {t.weatherDesc}
        </p>
        <div className="absolute -bottom-10 -right-8 h-36 w-56 rounded-[50%] bg-white/30" />
      </div>
      <div className="p-5 pt-4">
        <div className="mb-4 grid grid-cols-3 gap-2">
          <WeatherMetric
            icon={<Sun size={15} />}
            label={t.feels}
            value={`${weather ? Math.round(weather.feels_like_c) : 31}°`}
          />
          <WeatherMetric
            icon={<Droplets size={15} />}
            label={t.humidity}
            value={`${weather?.humidity ?? 68}%`}
          />
          <WeatherMetric
            icon={<CloudSun size={15} />}
            label={t.rain}
            value={`${weather?.rain_probability ?? 20}%`}
          />
        </div>
        {weather?.forecast.length ? (
          <div className="mb-4 grid grid-cols-3 gap-2">
            {weather.forecast.map((day) => (
              <div
                key={day.date}
                className="rounded-xl border border-slate-100 px-2 py-2 text-center"
              >
                <p className="text-[10px] font-semibold text-slate-500">
                  {new Date(`${day.date}T12:00:00`).toLocaleDateString(
                    language === "bn" ? "bn-BD" : "en",
                    { weekday: "short" },
                  )}
                </p>
                <p className="mt-1 text-xs font-bold text-ink">
                  {Math.round(day.temperature_max_c)}° /{" "}
                  {Math.round(day.temperature_min_c)}°
                </p>
                <p className="mt-0.5 text-[10px] text-blue-600">
                  {day.precipitation_probability ?? 0}%{" "}
                  {language === "en" ? "rain" : "বৃষ্টি"}
                </p>
              </div>
            ))}
          </div>
        ) : null}
        {weather?.spray_advisory && (
          <div className="mb-3 rounded-xl border border-leaf-100 bg-[#edf5e6] p-3.5">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-leaf-800">
                <Sparkles size={14} className="text-leaf-600" />
                {t.sprayTitle}
              </div>
              {weather.spray_status && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    weather.spray_status === "Good"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {weather.spray_status}
                </span>
              )}
            </div>
            <p className="text-xs leading-5 text-leaf-900/80">
              {weather.spray_advisory}
            </p>
          </div>
        )}
        {weather?.fog_alert && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <AlertTriangle size={14} className="text-amber-600" />
              {language === "bn" ? "কুয়াশা ও রোগ সতর্কতা" : "Fog & Crop Blight Alert"}
            </div>
            <p className="mt-1 text-xs text-amber-800">{weather.fog_alert}</p>
          </div>
        )}
        <div className="rounded-xl bg-[#f7f9f4] p-3.5">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-ink">
            <Droplets size={14} className="text-blue-500" />
            {t.irrigation}
          </div>
          <p className="text-xs leading-5 text-slate-500">
            {weather?.advisory || t.weatherAdvice}
          </p>
          <button
            onClick={() => onSpeak(weather?.advisory || t.weatherAdvice)}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-leaf-700"
          >
            <Volume2 size={13} />
            {language === "en" ? "Listen" : "শুনুন"}
          </button>
        </div>
        <button
          onClick={onLoad}
          disabled={loading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e7ecdf] py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <MapPin size={14} />
          )}
          {loading
            ? language === "en"
              ? "Loading local weather…"
              : "আবহাওয়া দেখা হচ্ছে…"
            : t.locationPermission}
        </button>
      </div>
    </section>
  );
}
