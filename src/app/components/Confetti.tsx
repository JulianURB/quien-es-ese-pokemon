const COLORS = ["#ffcb05", "#e3350d", "#2a75bb", "#22c55e", "#ffffff", "#f95587"];

// Posiciones fijas por índice: evita Math.random en el render.
const PIECES = Array.from({ length: 36 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 53) % 40) / 100,
  color: COLORS[i % COLORS.length],
  rotate: (i * 47) % 360,
}));

export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, rotate: `${p.rotate}deg` }}
        />
      ))}
    </div>
  );
}
