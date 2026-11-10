import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  MapPin,
  Store,
  TrendingUp,
} from "lucide-react";
import type { Commodity, Market } from "../../api";
import type { Translation } from "../../i18n/copy";

interface MarketCardProps {
  language: "bn" | "en";
  text: Translation;
  market: Market | null;
  series: { day: string; price: number }[];
  price: number;
  commodities?: Commodity[];
  selectedCrop?: string;
  onSelectCrop?: (cropId: string) => void;
  onLoad: () => void;
}

export function MarketCard({
  language,
  text: t,
  market,
  series,
  price,
  commodities = [],
  selectedCrop = "rice",
  onSelectCrop,
  onLoad,
}: MarketCardProps) {
  if (market && market.history.length === 0) {
    const trendLabel = {
      rising: language === "en" ? "Rising" : "বাড়তির সম্ভাবনা",
      falling: language === "en" ? "Falling" : "কমতির সম্ভাবনা",
      stable: language === "en" ? "Stable" : "স্থিতিশীল",
      uncertain: language === "en" ? "Uncertain" : "অনিশ্চিত",
    }[market.trend];
    return (
      <section id="market" className="soft-card scroll-mt-24 p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="section-label mb-1">{t.marketTitle}</p>
            <h2 className="text-lg font-bold">
              {market.crop} · {market.location}
            </h2>
          </div>
          <button
            onClick={onLoad}
            aria-label={t.viewMarket}
            className="rounded-xl bg-[#f3f7ee] p-2.5 text-leaf-700 hover:bg-leaf-100"
          >
            <TrendingUp size={18} />
          </button>
        </div>
        <div className="rounded-xl bg-[#f7f9f4] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-bold text-ink">
              {language === "en" ? "7-day outlook" : "৭ দিনের বাজার পূর্বাভাস"}
            </span>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
              {trendLabel} · {Math.round(market.confidence * 100)}%
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            {market.outlook}
          </p>
          {market.drivers.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-slate-600">
              {market.drivers.map((driver, index) => (
                <li key={`${index}-${driver}`}>{driver}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[10px] leading-4 text-slate-500">
            {market.caveats}
          </p>
        </div>
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="section-label mb-2">
            {language === "en" ? "Web sources" : "ওয়েব সূত্র"} ·{" "}
            {market.source}
          </p>
          {market.articles.length ? (
            <ul className="space-y-2">
              {market.articles.map((article) => (
                <li key={article.url}>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold leading-5 text-leaf-700 hover:underline"
                  >
                    {article.title}
                  </a>
                  {article.published_at && (
                    <p className="text-[10px] text-slate-400">
                      {article.published_at}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              {language === "en"
                ? "No recent relevant articles were found."
                : "সাম্প্রতিক প্রাসঙ্গিক সংবাদ পাওয়া যায়নি।"}
            </p>
          )}
        </div>
      </section>
    );
  }
  return (
    <section id="market" className="soft-card scroll-mt-24 p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="section-label mb-1">{t.marketTitle}</p>
          <h2 className="text-lg font-bold">
            {market ? `${market.crop} · ${market.location}` : t.marketSub}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {commodities.length > 0 && onSelectCrop && (
            <select
              aria-label={t.selectCommodity}
              value={selectedCrop}
              onChange={(e) => onSelectCrop(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm outline-none focus:border-leaf-500"
            >
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === "bn" ? c.name_bn : c.name_en}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={onLoad}
            aria-label={t.viewMarket}
            className="rounded-xl bg-[#f3f7ee] p-2 text-leaf-700 hover:bg-leaf-100"
          >
            <TrendingUp size={16} />
          </button>
        </div>
      </div>

      {market?.farmgate_price !== undefined ? (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-2.5 text-center">
            <p className="text-[10px] font-bold uppercase text-emerald-800">
              {t.farmgate}
            </p>
            <p className="mt-1 text-base font-bold text-emerald-900">
              ৳{market.farmgate_price}
            </p>
            <p className="text-[9px] text-emerald-700">{t.perKg}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-2.5 text-center">
            <p className="text-[10px] font-bold uppercase text-amber-800">
              {t.wholesale}
            </p>
            <p className="mt-1 text-base font-bold text-amber-900">
              ৳{market.wholesale_price}
            </p>
            <p className="text-[9px] text-amber-700">{t.perKg}</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-2.5 text-center">
            <p className="text-[10px] font-bold uppercase text-blue-800">
              {t.retail}
            </p>
            <p className="mt-1 text-base font-bold text-blue-900">
              ৳{market.retail_price}
            </p>
            <p className="text-[9px] text-blue-700">{t.perKg}</p>
          </div>
        </div>
      ) : (
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="section-label !text-[9px]">{t.currentPrice}</p>
            <div className="mt-1 text-[26px] font-bold tracking-tight">
              ৳{price.toFixed(1)}{" "}
              <span className="text-xs font-medium text-slate-400">
                {t.perKg}
              </span>
            </div>
          </div>
          <div className="mb-1 flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            <ArrowUpRight size={14} />
            2.6%
          </div>
        </div>
      )}

      <div className="h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={series}
            margin={{ top: 12, right: 4, left: -22, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#79a653" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#79a653" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#eef1eb"
              strokeDasharray="4 5"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9aa49a", fontSize: 10 }}
              dy={9}
            />
            <YAxis
              domain={["dataMin - 2", "dataMax + 2"]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9aa49a", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #ebeee6",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value) => [
                `৳${Number(value).toFixed(1)}`,
                "BDT / kg",
              ]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#639343"
              strokeWidth={2.5}
              fill="url(#priceFill)"
              activeDot={{
                r: 5,
                fill: "#639343",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {market?.storage_advice && (
        <div className="mt-3 rounded-xl bg-[#f7f9f4] p-3 text-xs">
          <p className="font-bold text-leaf-800 mb-1 flex items-center gap-1.5">
            <Store size={13} className="text-leaf-600" />
            {t.storageAdvice}
          </p>
          <p className="leading-5 text-slate-600">{market.storage_advice}</p>
        </div>
      )}

      {market?.trading_hubs && market.trading_hubs.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
            <MapPin size={11} /> {t.topHubs}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {market.trading_hubs.map((hub, idx) => (
              <span
                key={idx}
                className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
              >
                {hub}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px]">
        <span className="font-medium text-slate-400">{t.weekly}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
          <ArrowDownRight size={13} />
          {market?.outlook || t.marketDisclaimer}
        </span>
      </div>
    </section>
  );
}
