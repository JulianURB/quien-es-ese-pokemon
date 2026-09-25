import { TYPES } from "@/lib/pokemon";

export function TypeChip({ type }: { type: string }) {
  const t = TYPES[type] ?? { label: type, color: "#888" };
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white shadow"
      style={{ background: t.color, textShadow: "0 1px 2px rgba(0,0,0,.5)" }}
    >
      {t.label}
    </span>
  );
}
