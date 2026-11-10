import type { FormEvent, RefObject } from "react";
import {
  Check,
  ChevronDown,
  Leaf,
  LoaderCircle,
  Plus,
  ScanLine,
  ShieldCheck,
  Sprout,
  Upload,
  Volume2,
} from "lucide-react";
import type { Crop, Diagnosis } from "../../api";
import { Advice } from "../../components/dashboard/Advice";
import { CropIcon } from "../../components/crops/CropIcon";
import type { Language, Translation } from "../../i18n/copy";

const quickCrops = [
  { id: "rice", nameEn: "Rice", nameBn: "ধান" },
  { id: "potato", nameEn: "Potato", nameBn: "আলু" },
  { id: "tomato", nameEn: "Tomato", nameBn: "টমেটো" },
  { id: "wheat", nameEn: "Wheat", nameBn: "গম" },
  { id: "chili", nameEn: "Chili", nameBn: "মরিচ" },
] as const;

interface DiagnosisPanelProps {
  language: Language;
  text: Translation;
  authenticated: boolean;
  crops: Crop[];
  selectedCrop: string;
  onSelectedCropChange: (cropId: string) => void;
  guestCropHint?: string;
  onGuestCropHintChange?: (hint: string) => void;
  newCrop: string;
  onNewCropChange: (cropName: string) => void;
  addingCrop: boolean;
  onAddCrop: (event: FormEvent<HTMLFormElement>) => void;
  fileInput: RefObject<HTMLInputElement>;
  upload: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File | null) => void;
  diagnosis: Diagnosis | null;
  loading: boolean;
  onDiagnose: () => void;
  onSpeak: (text: string) => void;
}

export function DiagnosisPanel({
  language,
  text: t,
  authenticated,
  crops,
  selectedCrop,
  onSelectedCropChange,
  guestCropHint,
  onGuestCropHintChange,
  newCrop,
  onNewCropChange,
  addingCrop,
  onAddCrop,
  fileInput,
  upload,
  previewUrl,
  onFileSelect,
  diagnosis,
  loading,
  onDiagnose,
  onSpeak,
}: DiagnosisPanelProps) {
  return (
    <section
      id="diagnosis"
      className="soft-card scroll-mt-24 overflow-hidden p-5 sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#f2f7ed] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-leaf-700">
            <ScanLine size={12} /> AI crop care
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {t.diagnosisTitle}
          </h2>
          <p className="mt-1 max-w-lg text-sm leading-6 text-slate-500">
            {t.diagnosisText}
          </p>
        </div>
        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef5e8] text-leaf-600 sm:flex">
          <Leaf size={22} />
        </div>
      </div>
      {authenticated ? (
        <div className="mb-4 rounded-2xl border border-leaf-200/80 bg-gradient-to-b from-[#f9fbf6] to-[#f3f7ee] p-3.5 sm:p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-leaf-900">
              <Sprout size={15} className="text-leaf-600" />
              <span>{t.selectCrop}</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                {language === "bn" ? "ঐচ্ছিক" : "Optional"}
              </span>
            </div>
            {selectedCrop && (
              <button
                type="button"
                onClick={() => onSelectedCropChange("")}
                className="text-[11px] font-semibold text-slate-400 hover:text-leaf-700"
              >
                {language === "bn" ? "রিসেট" : "Reset"}
              </button>
            )}
          </div>

          {crops.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {crops.map((crop) => {
                const isSelected = selectedCrop === crop.id;
                return (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => onSelectedCropChange(isSelected ? "" : crop.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-leaf-600 text-white shadow-sm ring-2 ring-leaf-500/20"
                        : "bg-white border border-[#e1e9db] text-slate-700 hover:border-leaf-300 hover:bg-slate-50"
                    }`}
                  >
                    <CropIcon crop={crop.crop_type} size={14} />
                    <span>{crop.crop_type}</span>
                    {isSelected && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-3 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100/70 text-leaf-700">
                <CropIcon
                  crop={
                    selectedCrop
                      ? crops.find((c) => c.id === selectedCrop)?.crop_type
                      : "default"
                  }
                  size={16}
                />
              </div>
              <select
                aria-label={t.selectCrop}
                value={selectedCrop}
                onChange={(event) => onSelectedCropChange(event.target.value)}
                className="w-full appearance-none rounded-xl border border-leaf-200/90 bg-white py-2.5 pl-12 pr-9 text-xs font-semibold text-slate-700 shadow-xs outline-none transition-all hover:border-leaf-400 focus:border-leaf-600 focus:ring-2 focus:ring-leaf-500/20"
              >
                <option value="">
                  {language === "bn"
                    ? "✨ আমার সব ফসল / স্বয়ংক্রিয় সনাক্তকরণ"
                    : "✨ All crops / Auto-detect"}
                </option>
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.crop_type}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 text-leaf-600">
                <ChevronDown size={15} />
              </div>
            </div>

            <form onSubmit={onAddCrop} className="flex items-center gap-1.5">
              <input
                value={newCrop}
                onChange={(event) => onNewCropChange(event.target.value)}
                placeholder={t.cropNamePlaceholder}
                minLength={2}
                maxLength={100}
                className="w-full rounded-xl border border-leaf-200/90 bg-white px-3 py-2 text-xs outline-none transition-all placeholder:text-slate-400 focus:border-leaf-600 focus:ring-2 focus:ring-leaf-500/20"
              />
              <button
                type="submit"
                disabled={addingCrop || newCrop.trim().length < 2}
                className="flex shrink-0 items-center gap-1 rounded-xl bg-leaf-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-leaf-700 disabled:opacity-50"
              >
                <Plus size={14} />
                <span>{t.addCrop}</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-2xl border border-leaf-200/80 bg-gradient-to-b from-[#f9fbf6] to-[#f3f7ee] p-3.5 sm:p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-leaf-900">
              <Sprout size={15} className="text-leaf-600" />
              <span>{t.selectCrop}</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                {language === "bn" ? "ঐচ্ছিক" : "Optional"}
              </span>
            </div>
            {guestCropHint && (
              <button
                type="button"
                onClick={() => onGuestCropHintChange?.("")}
                className="text-[11px] font-semibold text-slate-400 hover:text-leaf-700"
              >
                {language === "bn" ? "রিসেট" : "Reset"}
              </button>
            )}
          </div>

          {/* Quick crop pills with specific crop icons */}
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {quickCrops.map((c) => {
              const isSelected = guestCropHint === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onGuestCropHintChange?.(isSelected ? "" : c.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-leaf-600 text-white shadow-sm ring-2 ring-leaf-500/25"
                      : "bg-white border border-[#e1e9db] text-slate-700 hover:border-leaf-300 hover:bg-slate-50"
                  }`}
                >
                  <CropIcon cropType={c.id} size={14} />
                  <span>{language === "bn" ? c.nameBn : c.nameEn}</span>
                  {isSelected && <Check size={12} />}
                </button>
              );
            })}
          </div>

          {/* Custom styled select with crop icon and chevron */}
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100/70 text-leaf-700">
              <CropIcon crop={guestCropHint || "default"} size={16} />
            </div>
            <select
              aria-label={t.selectCrop}
              value={guestCropHint || ""}
              onChange={(event) => onGuestCropHintChange?.(event.target.value)}
              className="w-full appearance-none rounded-xl border border-leaf-200/90 bg-white py-2.5 pl-12 pr-9 text-xs font-semibold text-slate-700 shadow-xs outline-none transition-all hover:border-leaf-400 focus:border-leaf-600 focus:ring-2 focus:ring-leaf-500/20"
            >
              <option value="">
                {language === "bn"
                  ? "✨ স্বয়ংক্রিয় সনাক্তকরণ (যে কোনো ফসল)"
                  : "✨ Auto-detect crop (Any crop)"}
              </option>
              <option value="rice">
                {language === "bn" ? "🌾 ধান (Rice)" : "🌾 Rice (Paddy)"}
              </option>
              <option value="potato">
                {language === "bn" ? "🥔 আলু (Potato)" : "🥔 Potato"}
              </option>
              <option value="tomato">
                {language === "bn" ? "🍅 টমেটো (Tomato)" : "🍅 Tomato"}
              </option>
              <option value="wheat">
                {language === "bn" ? "🌾 গম (Wheat)" : "🌾 Wheat"}
              </option>
              <option value="chili">
                {language === "bn" ? "🌶️ মরিচ (Chili)" : "🌶️ Chili / Pepper"}
              </option>
              <option value="corn">
                {language === "bn" ? "🌽 ভুট্টা (Maize/Corn)" : "🌽 Maize / Corn"}
              </option>
              <option value="mustard">
                {language === "bn" ? "🌼 সরিষা (Mustard)" : "🌼 Mustard"}
              </option>
              <option value="onion">
                {language === "bn" ? "🧅 পেঁয়াজ (Onion)" : "🧅 Onion"}
              </option>
            </select>
            <div className="pointer-events-none absolute right-3 text-leaf-600">
              <ChevronDown size={15} />
            </div>
          </div>
        </div>
      )}
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => onFileSelect(event.target.files?.[0] || null)}
      />
      <button
        onClick={() => fileInput.current?.click()}
        className="upload-zone flex min-h-[142px] w-full items-center justify-center overflow-hidden rounded-2xl px-4 py-5 text-center"
      >
        {previewUrl ? (
          <div className="flex items-center gap-4 text-left">
            <img
              src={previewUrl}
              alt="Selected crop leaf"
              className="h-24 w-24 rounded-xl object-cover"
            />
            <div>
              <p className="max-w-48 truncate text-sm font-bold">
                {upload?.name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {Math.max(1, Math.round((upload?.size || 0) / 1024))} KB ·{" "}
                {language === "en"
                  ? "Ready to check"
                  : "পরীক্ষার জন্য প্রস্তুত"}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-leaf-700">
                <Check size={13} />
                {language === "en"
                  ? "Photo selected"
                  : "ছবি নির্বাচন করা হয়েছে"}
              </span>
            </div>
          </div>
        ) : (
          <div>
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-leaf-600 shadow-sm">
              <Upload size={20} />
            </div>
            <p className="text-sm font-bold text-ink">{t.upload}</p>
            <p className="mt-1 text-xs text-slate-400">{t.uploadHint}</p>
            <span className="mt-3 inline-flex rounded-lg border border-[#e2e9dc] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
              {t.choose}
            </span>
          </div>
        )}
      </button>
      <div className="mt-4 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="max-w-md text-[11px] leading-5 text-slate-400">
          <ShieldCheck size={13} className="mr-1 inline text-leaf-600" />
          {t.disclaimer}
        </p>
        <button
          disabled={loading}
          onClick={onDiagnose}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-leaf-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-leaf-700 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          {loading ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <ScanLine size={17} />
          )}
          {loading ? t.analyzing : t.analyze}
        </button>
      </div>
      {diagnosis && (
        <div className="mt-5 rounded-2xl border border-leaf-100 bg-leaf-50/70 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="section-label mb-1">{t.result}</p>
              <h3 className="text-lg font-bold text-leaf-800">
                {diagnosis.disease_name}
              </h3>
              {diagnosis.pathogen && (
                <p className="mt-0.5 text-xs font-medium text-slate-600">
                  🔬 {diagnosis.pathogen}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {diagnosis.is_healthy ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  ✓ {language === "bn" ? "সুস্থ ফসল" : "Healthy Crop"}
                </span>
              ) : (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                    diagnosis.severity === "high"
                      ? "bg-red-100 text-red-800"
                      : diagnosis.severity === "medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {t.severity}: {diagnosis.severity}
                </span>
              )}
              {diagnosis.demo_result && (
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                  {t.sampleResult}
                </span>
              )}
            </div>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-leaf-500"
              style={{ width: `${Math.round(diagnosis.confidence * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {Math.round(diagnosis.confidence * 100)}% {t.confidence}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Advice label={t.medicine} text={diagnosis.medicine} />
            <Advice label={t.dosage} text={diagnosis.dosage} />
            {diagnosis.organic_treatment && (
              <Advice label={t.organic} text={diagnosis.organic_treatment} />
            )}
            {diagnosis.prevention && (
              <Advice label={t.prevention} text={diagnosis.prevention} />
            )}
            {diagnosis.cause && (
              <Advice label={t.cause} text={diagnosis.cause} />
            )}
            {diagnosis.safety_alert && (
              <Advice label={t.safety} text={diagnosis.safety_alert} />
            )}
          </div>
          <button
            onClick={() => {
              const parts = [diagnosis.disease_name];
              if (diagnosis.medicine) parts.push(diagnosis.medicine);
              if (diagnosis.dosage) parts.push(diagnosis.dosage);
              if (diagnosis.organic_treatment) parts.push(diagnosis.organic_treatment);
              onSpeak(parts.join(". "));
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-leaf-700"
          >
            <Volume2 size={15} />
            {language === "en" ? "Listen to advice" : "পরামর্শ শুনুন"}
          </button>
        </div>
      )}
    </section>
  );
}
