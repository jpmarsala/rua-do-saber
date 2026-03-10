import { getSession } from "@/lib/auth/get-session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  const res = NextResponse.json({ user: session });
  res.headers.set("Cache-Control", "private, no-store, max-age=0");
  return res;
}
