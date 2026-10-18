import { db, configured } from "./supabase";
import { demoExperiences, demoDashboard } from "./demo";
import { cookies } from "next/headers";
export const isDemo = () =>
  process.env.DEMO_MODE === "true" && process.env.VERCEL_ENV !== "production";
export async function identity() {
  if (!configured()) return null;

  // Fast-path: Check cookies first. If user has no auth tokens, skip database/auth calls entirely
  const jar = await cookies();
  const allCookies = jar.getAll();
  const hasAuthCookie = allCookies.some(
    (c) =>
      c.name.includes("sb-") ||
      c.name.includes("supabase") ||
      c.name.includes("auth-token")
  );
  if (!hasAuthCookie) return null;

  const c = await db();
  const {
    data: { user },
  } = await c.auth.getUser();
  if (!user) return null;
  const [{ data: profile }, { data: admin }, { count: unreadNotices }] =
    await Promise.all([
      c.from("profiles").select("*").eq("id", user.id).single(),
      c.rpc("is_admin"),
      c
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .eq("read", false),
    ]);
  const avatar =
    (user.user_metadata?.avatar_url as string) ||
    (user.user_metadata?.picture as string) ||
    null;
  const name =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    (user.user_metadata?.given_name as string) ||
    null;
  return {
    id: user.id,
    email: user.email,
    name,
    avatar,
    profile,
    admin: Boolean(admin),
    unreadNotices: unreadNotices || 0,
  };
}
export const emptyStats = {
  students: 0,
  universities: 0,
  cities: 0,
  applications: 0,
  suppressed: true,
  outcomes: {} as Record<string, number>,
  funding: {} as Record<string, number>,
  courses: {} as Record<string, number>,
  costs: [] as {
    category: string;
    currency: string;
    median: number;
    samples: number;
  }[],
  processing: [] as { service: string; days: number; samples: number }[],
  updated: null as string | null,
};
export async function dashboard(filters: Record<string, string>) {
  if (isDemo()) return demoDashboard(filters);
  if (!configured()) return emptyStats;
  const c = await db();
  const { data, error } = await c.rpc("dashboard", { filters });
  if (error) throw Error("পরিসংখ্যান লোড করা যায়নি।");
  return data as typeof emptyStats;
}
export async function experiences(page = 1) {
  if (isDemo())
    return { items: page === 1 ? demoExperiences : [], more: false };
  if (!configured()) return { items: [], more: false };
  const c = await db();
  const { data, error } = await c
    .from("public_experiences")
    .select("*")
    .order("created_at", { ascending: false })
    .range((page - 1) * 9, page * 9);
  if (error) throw Error("অভিজ্ঞতা লোড করা যায়নি।");
  return { items: (data || []).slice(0, 9), more: (data?.length || 0) > 9 };
}
