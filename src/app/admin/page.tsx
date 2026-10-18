import { notFound } from "next/navigation";
import { Shell, Heading } from "@/components/shell";
import { ActionForm } from "@/components/action-form";
import { identity } from "@/lib/data";
import { db } from "@/lib/supabase";
import { rpcAction } from "@/lib/actions";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Math.max(
    1,
    Math.min(10000, Math.floor(Number((await searchParams).page) || 1)),
  );
  const user = await identity();
  if (!user?.admin) notFound();
  const c = await db();
  const [s, r, p, l] = await Promise.all([
    c
      .from("experience_versions")
      .select("*")
      .in("status", ["pending", "approved"])
      .order("created_at", { ascending: false })
      .range((page - 1) * 50, page * 50 - 1),
    c
      .from("reports")
      .select("*")
      .eq("resolved", false)
      .order("created_at")
      .range((page - 1) * 50, page * 50 - 1),
    c
      .from("profiles")
      .select("*")
      .order("id")
      .range((page - 1) * 50, page * 50 - 1),
    c
      .from("moderation_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .range((page - 1) * 50, page * 50 - 1),
  ]);
  const comments = r.data?.length
    ? await c
        .from("comments")
        .select("id,body")
        .in(
          "id",
          r.data.map((x) => x.comment_id),
        )
    : { data: [], error: null };
  if ([s, r, p, l, comments].some((x) => x.error))
    throw Error("Admin তথ্য লোড হয়নি");
  return (
    <Shell active="/admin" alias={user.profile.alias} avatar={user.avatar} email={user.email} name={user.name} admin>
      <Heading
        title="কমিউনিটি পরিচালনা"
        description="অভিজ্ঞতা যাচাই, reports এবং account status।"
      />
      <div className="pagination">
        {page > 1 && (
          <Link className="button" href={`?page=${page - 1}`}>
            Previous
          </Link>
        )}
        <span>Page {page}</span>
        {[s, r, p, l].some((x) => (x.data?.length || 0) === 50) && (
          <Link className="button" href={`?page=${page + 1}`}>
            Next
          </Link>
        )}
      </div>
      <div className="stack">
        <section className="panel">
          <h2>অভিজ্ঞতার review</h2>
          <p className="muted">
            প্রতি পাতায় সর্বোচ্চ 50টি pending বা published version
          </p>
          {s.data?.map((story) => (
            <details key={story.id} className="entry-item">
              <summary>
                {story.title} · {story.status}
              </summary>
              <p className="story-body">{story.body}</p>
              <p>
                {story.university} · {story.city} · {story.outcome}
              </p>
              <ActionForm
                action={async (form) => {
                  "use server";
                  await rpcAction("moderate", {
                    target: story.id,
                    action_name: String(form.get("action")),
                    note: String(form.get("note")),
                  });
                }}
              >
                <label>
                  Review note
                  <textarea name="note" maxLength={2000} />
                </label>
                <label>
                  সিদ্ধান্ত
                  <select name="action">
                    <option value="approved">অনুমোদন</option>
                    <option value="returned">সংশোধনের জন্য ফেরত</option>
                    <option value="hidden">লুকিয়ে রাখুন</option>
                  </select>
                </label>
                <button className="button primary" style={{ marginTop: 12 }}>
                  Save Decision
                </button>
              </ActionForm>
            </details>
          ))}
          {!s.data?.length && (
            <p className="muted">Review-এর অপেক্ষায় কিছু নেই।</p>
          )}
        </section>
        <section className="panel">
          <h2>Reported comments</h2>
          {r.data?.map((report) => (
            <div key={report.id} className="entry-item">
              <p>
                <strong>মন্তব্য:</strong>{" "}
                {comments.data?.find((c) => c.id === report.comment_id)?.body ||
                  "মন্তব্যটি লোড হয়নি"}
              </p>
              <p>
                <strong>কারণ:</strong> {report.reason}
              </p>
              <div className="form-actions">
                <ActionForm
                  action={async () => {
                    "use server";
                    await rpcAction("moderate", {
                      target: report.comment_id,
                      action_name: "hide_comment",
                      note: report.reason,
                    });
                  }}
                >
                  <button className="button danger">Hide Comment</button>
                </ActionForm>
                <ActionForm
                  action={async () => {
                    "use server";
                    await rpcAction("moderate", {
                      target: report.id,
                      action_name: "resolve_report",
                      note: "",
                    });
                  }}
                >
                  <button className="button">Resolve Report</button>
                </ActionForm>
              </div>
            </div>
          ))}
          {!r.data?.length && (
            <p className="muted">কোনো অমীমাংসিত report নেই।</p>
          )}
        </section>
        <section className="panel">
          <h2>Account moderation</h2>
          {p.data
            ?.filter((p) => p.id !== user.id)
            .map((profile) => (
              <div key={profile.id} className="entry-item entry-header">
                <span>
                  {profile.alias} · {profile.suspended ? "সীমিত" : "সক্রিয়"}
                </span>
                <ActionForm
                  action={async () => {
                    "use server";
                    await rpcAction("moderate", {
                      target: profile.id,
                      action_name: profile.suspended ? "restore" : "suspend",
                      note: "",
                    });
                  }}
                >
                  <button className="button">
                    {profile.suspended ? "Restore Account" : "Suspend Account"}
                  </button>
                </ActionForm>
              </div>
            ))}
        </section>
        <section className="panel">
          <h2>University / city নাম একত্র করুন</h2>
          <p className="muted">
            বানান বা duplicate entry একত্র হবে; সংশ্লিষ্ট study plan ও public
            অভিজ্ঞতার নামও বদলাবে।
          </p>
          <ActionForm
            action={async (form) => {
              "use server";
              await rpcAction("merge_catalog", {
                kind_name: form.get("kind"),
                source_name: form.get("source"),
                target_name: form.get("target"),
              });
            }}
          >
            <div className="form-grid">
              <label>
                ধরন
                <select name="kind">
                  <option value="university">বিশ্ববিদ্যালয়</option>
                  <option value="city">শহর</option>
                </select>
              </label>
              <label>
                পুরোনো নাম
                <input required name="source" maxLength={200} />
              </label>
              <label>
                সঠিক নাম
                <input required name="target" maxLength={200} />
              </label>
            </div>
            <button className="button primary" style={{ marginTop: 15 }}>
              Merge Names
            </button>
          </ActionForm>
        </section>
        <section className="panel">
          <h2>সাম্প্রতিক audit history</h2>
          {l.data?.map((log) => (
            <div className="notification" key={log.id}>
              {log.action} · {log.note}
              <small>
                {new Date(log.created_at).toLocaleString("bn-BD", {
                  timeZone: "Asia/Dhaka",
                })}
              </small>
            </div>
          ))}
        </section>
      </div>
    </Shell>
  );
}
