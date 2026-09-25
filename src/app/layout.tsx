import type { Metadata, Viewport } from "next";
import { Luckiest_Guy, Nunito } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const luckiest = Luckiest_Guy({
  variable: "--font-luckiest",
  weight: "400",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const TITLE = "¿Quién es ese Pokémon?";
const DESCRIPTION =
  "Adiviná el Pokémon por su silueta: 4 opciones, 30 segundos y un ranking para ver quién es el mejor entrenador.";

export async function generateMetadata(): Promise<Metadata> {
  // URL absoluta para la imagen de vista previa al compartir el link.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = `${proto}://${host}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}`;

  return {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: "website",
      url: `${base}/`,
      images: [{ url: `${base}/og.png`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [`${base}/og.png`] },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0f24",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${luckiest.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
