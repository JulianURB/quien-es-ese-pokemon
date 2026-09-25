import qrcode from "qrcode-generator";

/**
 * QR en SVG con una Pokébola al centro. Usa corrección de errores alta (H):
 * el logo tapa algunos módulos y el QR se sigue leyendo igual.
 */
export function QRCode({ value, className = "" }: { value: string; className?: string }) {
  const qr = qrcode(0, "H");
  qr.addData(value);
  qr.make();
  const n = qr.getModuleCount();
  const margin = 2;
  const size = n + margin * 2;
  const center = size / 2;
  const hole = n * 0.22;

  let path = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.isDark(r, c)) continue;
      const x = c + margin;
      const y = r + margin;
      // Deja libre el centro para la Pokébola.
      if (Math.abs(x + 0.5 - center) < hole / 2 + 0.5 && Math.abs(y + 0.5 - center) < hole / 2 + 0.5) continue;
      // Los 3 patrones de las esquinas van cuadrados (los lectores se guían por
      // ellos); el resto, como puntos.
      const finder = (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
      path += finder
        ? `M${x},${y}h1v1h-1z`
        : `M${x + 0.5},${y}h0a0.5,0.5 0 0 1 0,1a0.5,0.5 0 0 1 0,-1z`;
    }
  }

  const ball = hole / 2 - 0.3;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} role="img" aria-label={`Código QR: ${value}`}>
      <rect width={size} height={size} fill="#fff" />
      <path d={path} fill="#0a0f24" stroke="#0a0f24" strokeWidth="0.12" />
      <g transform={`translate(${center} ${center})`}>
        <circle r={ball} fill="#fff" stroke="#0a0f24" strokeWidth="0.35" />
        <path d={`M${-ball},0a${ball},${ball} 0 0 1 ${ball * 2},0z`} fill="#e3350d" stroke="#0a0f24" strokeWidth="0.35" />
        <circle r={ball * 0.34} fill="#fff" stroke="#0a0f24" strokeWidth="0.35" />
      </g>
    </svg>
  );
}
