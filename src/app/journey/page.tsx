import { Shell, Heading, LoginGate } from "@/components/shell";
import { JourneyEditor } from "@/components/journey-editor";
import { identity, isDemo } from "@/lib/data";
import { db } from "@/lib/supabase";
import type { Entry } from "@/lib/model";
import { ActionForm } from "@/components/action-form";
import { saveProfile } from "@/lib/actions";
import { DEFAULT_UNIVERSITIES, DEFAULT_CITIES } from "@/lib/constants";
export const dynamic = "force-dynamic";
export default async function Journey() {
  const user = await identity();
  let entries: Entry[] = [];
  let universities: string[] = DEFAULT_UNIVERSITIES;
  let cities: string[] = DEFAULT_CITIES;
  if (user) {
    const c = await db();
    const [r, u, t] = await Promise.all([
      c.from("records").select("*").eq("owner_id", user.id).order("updated_at"),
      c.from("universities").select("name"),
      c.from("cities").select("name"),
    ]);
    if (r.error || u.error || t.error) throw Error("তথ্য লোড হয়নি");
    entries = r.data as Entry[];
    universities = Array.from(
      new Set([...DEFAULT_UNIVERSITIES, ...u.data.map((x) => x.name)]),
    ).sort();
    cities = Array.from(
      new Set([...DEFAULT_CITIES, ...t.data.map((x) => x.name)]),
    ).sort();
  }
  return (
    <Shell
      active="/journey"
      alias={user?.profile?.alias}
      avatar={user?.avatar}
      email={user?.email}
      name={user?.name}
      unreadNotices={user?.unreadNotices}
      admin={user?.admin}
      demo={isDemo()}
    >
      <Heading
        eyebrow="একটি ধাপ, একটি নতুন শুরু"
        title="আমার যাত্রা"
        description="অ্যাডমিশন থেকে রাশিয়ায় পৌঁছানো—নিজের সব তথ্য এক জায়গায়।"
      />
      {!user ? (
        <LoginGate />
      ) : (
        <div className="stack">
          {user.profile?.suspended ? (
            <p className="notice">আপনার account আপাতত সীমিত করা হয়েছে।</p>
          ) : (
            <>
              <details className="panel" open={!entries.length}>
                <summary>Public Profile (Alias)</summary>
                <ActionForm action={saveProfile}>
                  <label>
                    Public alias
                    <input
                      name="alias"
                      minLength={2}
                      maxLength={60}
                      defaultValue={user.profile?.alias}
                      required
                    />
                  </label>
                  <button className="button primary" style={{ marginTop: 15 }}>
                    Save Profile
                  </button>
                </ActionForm>
              </details>
              <JourneyEditor
                entries={entries}
                universities={universities}
                cities={cities}
              />
              <section className="panel">
                <h2>পরবর্তী তারিখ</h2>
                {entries
                  .filter(
                    (e) =>
                      e.kind === "visa" &&
                      e.data.appointment_date &&
                      e.data.appointment_date >=
                        new Date().toISOString().slice(0, 10),
                  )
                  .map((e) => (
                    <p key={e.id}>
                      {e.data.title} ·{" "}
                      {e.data.appointment_date.replace("T", " ")} (বাংলাদেশ সময়)
                    </p>
                  ))}
                <p className="muted">
                  আপনার দেওয়া ভবিষ্যৎ appointment এখানে দেখা যাবে।
                </p>
              </section>
            </>
          )}
        </div>
      )}
    </Shell>
  );
}
