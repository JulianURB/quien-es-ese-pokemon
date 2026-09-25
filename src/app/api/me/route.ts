import { NextResponse } from "next/server";
import { buildMe, currentPlayer, getDB } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const DB = await getDB();
  return NextResponse.json(await buildMe(DB, await currentPlayer(DB)));
}
