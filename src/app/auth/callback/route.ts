import { db } from "@/lib/supabase";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/journey";
  if (code) {
    const client = await db();
    const { error, data } = await client.auth.exchangeCodeForSession(code);
    if (!error) {
      if (data?.user) {
        const { data: profile } = await client
          .from("profiles")
          .select("alias")
          .eq("id", data.user.id)
          .single();
        if (profile?.alias === "শিক্ষার্থী") {
          const metaName =
            (data.user.user_metadata?.full_name as string) ||
            (data.user.user_metadata?.name as string) ||
            (data.user.email ? data.user.email.split("@")[0] : null);
          if (metaName && metaName.trim().length >= 2) {
            await client
              .from("profiles")
              .update({ alias: metaName.trim().slice(0, 60) })
              .eq("id", data.user.id);
          }
        }
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }
  return NextResponse.redirect(new URL("/account?error=login", request.url));
}
