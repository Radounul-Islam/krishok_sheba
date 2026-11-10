import type { ReactNode } from "react";

interface WeatherMetricProps {
  icon: ReactNode;
  label: string;
  value: string;
}

export function WeatherMetric({ icon, label, value }: WeatherMetricProps) {
  return (
    <div className="rounded-xl bg-[#f8faf6] p-2.5 text-center">
      <div className="mb-1 flex items-center justify-center gap-1 text-slate-400">
        {icon}
        <span className="text-[9px] font-semibold">{label}</span>
      </div>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
