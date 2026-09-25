export function Pokeball({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14.5" fill="#fff" stroke="#111" strokeWidth="2" />
      <path d="M1.5 16a14.5 14.5 0 0 1 29 0z" fill="#e3350d" stroke="#111" strokeWidth="2" />
      <path d="M1.5 16h29" stroke="#111" strokeWidth="2" />
      <circle cx="16" cy="16" r="5" fill="#fff" stroke="#111" strokeWidth="2" />
      <circle cx="16" cy="16" r="2" fill="#fff" stroke="#111" strokeWidth="1" />
    </svg>
  );
}
