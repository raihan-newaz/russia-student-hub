import { db } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const client = await db();
  await client.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

export async function GET(request: Request) {
  const client = await db();
  await client.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url));
}
