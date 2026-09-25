"use client";

import { useEffect, useState } from "react";
import { BASE, shareApp, shareText } from "@/lib/client";
import { QRCode } from "../components/QRCode";

export function ShareQR() {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    // La URL depende del dominio y el mount path: solo se conoce en el navegador.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(`${location.origin}${BASE}/`);

    // Que la pantalla no se apague mientras alguien escanea.
    let lock: WakeLockSentinel | null = null;
    navigator.wakeLock
      ?.request("screen")
      .then((l) => (lock = l))
      .catch(() => {});
    return () => {
      lock?.release().catch(() => {});
    };
  }, []);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("¡Link copiado!");
    } catch {
      setStatus("No se pudo copiar.");
    }
  }

  async function share() {
    const r = await shareApp(shareText(null));
    if (r === "copied") setStatus("¡Link copiado!");
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="pop-in rounded-[2rem] bg-white p-4 shadow-[0_0_0_8px_var(--yellow),0_30px_80px_-20px_rgba(0,0,0,.8)] sm:p-6">
        {url ? (
          <QRCode value={url} className="h-[min(68vw,360px)] w-[min(68vw,360px)]" />
        ) : (
          <div className="h-[min(68vw,360px)] w-[min(68vw,360px)] animate-pulse rounded-2xl bg-slate-200" />
        )}
      </div>

      <div>
        <p className="logo-text text-4xl sm:text-5xl">¡Escaneá y jugá!</p>
        <p className="mt-2 break-all text-sm text-muted">{url ?? "…"}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={copy} className="btn btn-primary px-6 py-3">
          📋 Copiar link
        </button>
        <button onClick={share} className="btn btn-ghost px-6 py-3">
          📤 Compartir
        </button>
      </div>
      <p className="h-5 text-sm font-bold text-poke-yellow" role="status">
        {status}
      </p>
    </div>
  );
}
