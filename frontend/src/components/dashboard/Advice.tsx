interface AdviceProps {
  label: string;
  text: string;
}

export function Advice({ label, text }: AdviceProps) {
  return (
    <div className="rounded-xl bg-white/80 p-3">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-leaf-700">
        {label}
      </p>
      <p className="text-xs leading-5 text-slate-600">{text}</p>
    </div>
  );
}
