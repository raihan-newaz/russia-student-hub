"use server";
import { db, configured } from "./supabase";
import { recordSchema } from "./model";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
async function session() {
  if (!configured())
    throw new Error("Google login চালু করতে Supabase configuration প্রয়োজন।");
  const client = await db();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("অনুগ্রহ করে Google দিয়ে লগইন করুন।");
  return { client, user };
}
function refresh() {
  revalidatePath("/", "layout");
}
export async function saveRecord(input: unknown) {
  try {
    const parsed = recordSchema.parse(input);
    if (!parsed.data.title.trim())
      return { ok: false, error: "তথ্যটি চেনার জন্য একটি নাম দিন।" };
    const { client, user } = await session();
    const { id, ...rest } = parsed;
    const query = id
      ? client.from("records").update(rest).eq("id", id).eq("owner_id", user.id)
      : client.from("records").insert({ ...rest, owner_id: user.id });
    const { error } = await query.select("id").single();
    if (error) throw error;
    refresh();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof z.ZodError
          ? e.issues[0].message
          : e instanceof Error
            ? e.message
            : "সেভ হয়নি। আবার চেষ্টা করুন।",
    };
  }
}
export async function removeRecord(id: string) {
  const { client, user } = await session();
  const { error } = await client
    .from("records")
    .delete()
    .eq("id", z.string().uuid().parse(id))
    .eq("owner_id", user.id);
  if (error) throw Error(error.message);
  refresh();
}
export async function saveProfile(form: FormData) {
  const { client, user } = await session();
  const alias = z.string().trim().min(2).max(60).parse(form.get("alias"));
  const { error } = await client
    .from("profiles")
    .update({ alias, share_stats: true })
    .eq("id", user.id)
    .select("id")
    .single();
  if (error) throw Error(error.message);
  refresh();
}
export async function rpcAction(name: string, args: Record<string, unknown>) {
  const uuid = z.string().uuid();
  const schemas: Record<string, z.ZodType> = {
    unpublish_experience: z.object({ target: uuid }).strict(),
    delete_comment: z.object({ target: uuid }).strict(),
    report_comment: z
      .object({ target: uuid, content: z.string().trim().min(3).max(1000) })
      .strict(),
    write_comment: z
      .object({
        target: uuid,
        content: z.string().trim().min(1).max(2000),
        parent: uuid.nullable(),
        editing: uuid.nullable(),
      })
      .strict(),
    moderate: z
      .object({
        target: uuid,
        action_name: z.enum([
          "approved",
          "returned",
          "hidden",
          "hide_comment",
          "resolve_report",
          "suspend",
          "restore",
        ]),
        note: z.string().max(2000),
      })
      .strict(),
    merge_catalog: z
      .object({
        kind_name: z.enum(["city", "university"]),
        source_name: z.string().trim().min(1).max(200),
        target_name: z.string().trim().min(1).max(200),
      })
      .strict(),
  };
  if (!schemas[name]) throw Error("Invalid action");
  const validated = schemas[name].parse(args);
  const { client } = await session();
  const { error } = await client.rpc(
    name,
    validated as Record<string, unknown>,
  );
  if (error) throw Error(error.message);
  refresh();
}
export async function publishExperience(form: FormData) {
  const { client } = await session();
  const schema = z.object({
    title: z.string().trim().min(5).max(160),
    body: z.string().trim().min(20).max(12000),
    university: z.string().max(200),
    city: z.string().max(200),
    course: z.string().max(60),
    funding: z.string().max(60),
    outcome: z.string().max(60),
  });
  const payload = schema.parse(
    Object.fromEntries(
      [
        "title",
        "body",
        "university",
        "city",
        "course",
        "funding",
        "outcome",
      ].map((k) => [k, String(form.get(k) || "")]),
    ),
  );
  if (form.get("consent") !== "on")
    throw Error("Public sharing-এর সম্মতি প্রয়োজন।");
  const previous = String(form.get("previous_id") || "");
  const { error } = await client.rpc("submit_experience", {
    payload,
    previous_id: previous ? z.string().uuid().parse(previous) : null,
  });
  if (error) throw Error(error.message);
  refresh();
}
export async function markNotifications() {
  const { client, user } = await session();
  const { error } = await client
    .from("notifications")
    .update({ read: true })
    .eq("owner_id", user.id);
  if (error) throw Error(error.message);
  refresh();
}
export async function signOut() {
  const { client } = await session();
  await client.auth.signOut();
  redirect("/");
}
export async function deleteAccount(form: FormData) {
  const { client, user } = await session();
  if (form.get("confirm") !== "DELETE")
    throw Error("নিশ্চিত করতে DELETE লিখুন।");
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } },
    );
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw Error(error.message);
  } else {
    const { error } = await client.rpc("delete_own_account");
    if (error) throw Error(error.message);
  }
  await client.auth.signOut();
  refresh();
  redirect("/");
}

export async function signInWithPassword(form: FormData) {
  if (!configured()) throw Error("Supabase configuration প্রয়োজন।");
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "").trim();
  if (!email || !password) throw Error("ইমেইল ও পাসওয়ার্ড প্রদান করুন।");
  const client = await db();
  const { error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      throw Error("ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।");
    }
    throw Error(error.message);
  }
  refresh();
  redirect("/journey");
}

export async function signUpWithPassword(form: FormData) {
  if (!configured()) throw Error("Supabase configuration প্রয়োজন।");
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "").trim();
  if (!email || !password) throw Error("ইমেইল ও পাসওয়ার্ড প্রদান করুন।");
  if (password.length < 6) throw Error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
  
  const client = await db();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name || email.split("@")[0],
        name: name || email.split("@")[0],
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://russianvisa.vercel.app"}/auth/callback`,
    },
  });

  if (error) throw Error(error.message);

  // If Supabase has email confirmation disabled, user is immediately logged in
  if (data.session) {
    refresh();
    redirect("/journey");
  } else {
    // If email confirmation is enabled on Supabase
    return { ok: true, message: "আপনার ইমেইলে একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে। দয়া করে ইমেইল চেক করুন।" };
  }
}

export async function signInWithOtp(form: FormData) {
  if (!configured()) throw Error("Supabase configuration প্রয়োজন।");
  const email = String(form.get("email") || "").trim();
  if (!email || !email.includes("@")) throw Error("সঠিক ইমেইল দিন।");
  const client = await db();
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  if (error) throw Error(error.message);
}

