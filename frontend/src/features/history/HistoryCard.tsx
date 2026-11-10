import type { Translation } from "../../i18n/copy";
import { CropIcon, getCropVisual } from "../../components/crops/CropIcon";

export interface HistoryRow {
  crop: string;
  disease: string;
  date: string;
  level: string;
  color: string;
  cropType?: string;
}

interface HistoryCardProps {
  text: Translation;
  rows: HistoryRow[];
  isEmpty: boolean;
  onSeeAll: () => void;
}

export function HistoryCard({
  text: t,
  rows,
  isEmpty,
  onSeeAll,
}: HistoryCardProps) {
  return (
    <section id="history" className="soft-card scroll-mt-24 p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="section-label mb-1">{t.history}</p>
          <h2 className="text-lg font-bold">{t.recent}</h2>
        </div>
        <button
          onClick={onSeeAll}
          className="text-xs font-bold text-leaf-700 hover:text-leaf-800"
        >
          {t.seeAll}
        </button>
      </div>
      <div className="space-y-1">
        {rows.map((item, index) => {
          const visual = getCropVisual(item.cropType || item.crop);
          return (
            <div
              key={`${item.crop}-${index}`}
              className="flex items-center gap-3 border-b border-slate-50 py-3 last:border-0 hover:bg-slate-50/50 rounded-xl px-1.5 transition-colors"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${visual.badgeBg} ${visual.textColor} ${visual.borderColor} shadow-xs transition-transform`}
                title={`${item.crop} (${visual.labelEn})`}
              >
                <CropIcon crop={item.cropType || item.crop} size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{item.crop}</p>
                <p className="mt-0.5 text-xs text-slate-400">{item.disease}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${item.color}`}
                >
                  {item.level}
                </span>
                <span className="text-[10px] text-slate-400">{item.date}</span>
              </div>
            </div>
          );
        })}
      </div>
      {isEmpty && (
        <p className="mt-2 text-center text-xs leading-5 text-slate-400">
          {t.noHistory}
        </p>
      )}
    </section>
  );
}
