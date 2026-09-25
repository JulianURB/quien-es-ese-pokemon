import type { Metadata } from "next";
import { Footer } from "../components/Footer";
import { PageHeader } from "../components/PageHeader";
import { ShareQR } from "./ShareQR";

export const metadata: Metadata = {
  title: "Compartir · ¿Quién es ese Pokémon?",
};

export default function CompartirPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
      <PageHeader />
      <main className="panel stage flex flex-1 items-center justify-center px-4 py-10">
        <div className="rays opacity-50" />
        <ShareQR />
      </main>
      <Footer />
    </div>
  );
}
