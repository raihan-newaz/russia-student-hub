import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/shell";
import { Comments } from "@/components/comments";
import { identity, isDemo } from "@/lib/data";
import { db, configured } from "@/lib/supabase";
import { demoExperiences } from "@/lib/demo";
import { labels, type Experience } from "@/lib/model";
import { z } from "zod";
export const dynamic = "force-dynamic";
export default async function Story({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const page = Math.max(
    1,
    Math.min(10000, Number((await searchParams).page) || 1),
  );
  const user = await identity();
  let story: Experience | undefined;
  let comments = [];
  let more = false;
  if (isDemo()) story = demoExperiences.find((e) => e.id === id);
  else if (configured() && z.string().uuid().safeParse(id).success) {
    const c = await db();
    const [s, r] = await Promise.all([
      c.from("public_experiences").select("*").eq("id", id).maybeSingle(),
      c
        .from("public_comments")
        .select("*")
        .eq("experience_id", id)
        .order("created_at")
        .range((page - 1) * 30, page * 30),
    ]);
    if (s.error || r.error) throw Error("লোড হয়নি");
    story = s.data;
    comments = (r.data || []).slice(0, 30);
    more = (r.data?.length || 0) > 30;
  }
  if (!story) notFound();
  return (
    <Shell
      active="/experiences"
      alias={user?.profile?.alias}
      avatar={user?.avatar}
      email={user?.email}
      unreadNotices={user?.unreadNotices}
      admin={user?.admin}
      demo={isDemo()}
    >
      <Link href="/experiences" className="text-link">
        ← সব অভিজ্ঞতা
      </Link>
      <div className="stack">
        <article className="panel">
          <div className="story-context">
            <span className="badge green">
              {labels[story.outcome] || "অভিজ্ঞতা"}
            </span>
            <span className="badge neutral">{labels[story.course]}</span>
            <span className="badge neutral">{story.city}</span>
          </div>
          <h1 style={{ marginTop: 20 }}>{story.title}</h1>
          <p className="muted">
            {story.alias} · {story.university} ·{" "}
            {new Date(story.created_at).toLocaleDateString("bn-BD")}
          </p>
          <div className="story-body">{story.body}</div>
          <p className="notice">
            এটি একজন শিক্ষার্থীর নিজস্ব অভিজ্ঞতা, কোনো সরকারি নির্দেশনা বা ভিসার
            নিশ্চয়তা নয়।
          </p>
        </article>
        <Comments
          items={comments}
          experienceId={id}
          loggedIn={Boolean(user) && !isDemo()}
          more={more}
          page={page}
        />
      </div>
    </Shell>
  );
}
