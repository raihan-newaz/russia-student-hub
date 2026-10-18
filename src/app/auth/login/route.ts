import { db, configured } from "@/lib/supabase";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  if (!configured())
    return NextResponse.redirect(
      new URL("/account?setup=required", request.url),
    );
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/journey";
  const client = await db();
  const callbackUrl = new URL("/auth/callback", process.env.NEXT_PUBLIC_SITE_URL || request.url);
  callbackUrl.searchParams.set("next", next);

  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });
  return NextResponse.redirect(
    error || !data.url
      ? new URL("/account?error=login", request.url)
      : data.url,
  );
}
