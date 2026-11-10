import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
  tone: "green" | "mint" | "gold";
}

export function StatCard({ icon, label, value, note, tone }: StatCardProps) {
  const styles = {
    green: "bg-[#eff5e9] text-leaf-700",
    mint: "bg-[#e8f4ed] text-emerald-700",
    gold: "bg-[#fbf2dd] text-amber-700",
  };
  return (
    <div className="soft-card flex items-center gap-3.5 p-4 sm:p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles[tone]}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="section-label !text-[9px]">{label}</p>
        <p className="mt-1 truncate text-lg font-bold leading-tight">{value}</p>
        <p className="mt-1 text-[10px] font-medium text-slate-400">{note}</p>
      </div>
    </div>
  );
}
