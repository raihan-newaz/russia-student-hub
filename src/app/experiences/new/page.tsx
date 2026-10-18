import Link from "next/link";
import { Shell, Heading, GoogleIcon } from "@/components/shell";
import { StoryEditor } from "@/components/story-editor";
import { identity, isDemo } from "@/lib/data";
import { db, configured } from "@/lib/supabase";
import { ArrowLeft, ArrowUpRight, PenLine, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewExperiencePage() {
  const user = await identity();
  let stories = [];

  if (user && configured()) {
    const c = await db();
    const s = await c
      .from("experience_versions")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    stories = s.data || [];
  }

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
      <div style={{ marginBottom: 16 }}>
        <Link
          href="/experiences"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--teal)",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} /> Back to Experiences
        </Link>
      </div>

      {!user ? (
        <div className="login-gate">
          <span className="brand-icon">
            <PenLine size={32} />
          </span>
          <h2>অভিজ্ঞতা শেয়ার করতে সাইন ইন করুন</h2>
          <p>
            রাশিয়ায় পড়াশোনা, স্কলারশিপ বা ভিসার অভিজ্ঞতা লিখে অন্যান্য
            শিক্ষার্থীদের সঠিক তথ্য ও প্রস্তুতিতে সাহায্য করুন।
          </p>
          <a
            className="button primary"
            href="/auth/login?next=/experiences/new"
            style={{
              width: "100%",
              maxWidth: 340,
              margin: "0 auto",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            <GoogleIcon size={19} /> Sign In with Google
            <ArrowUpRight size={18} />
          </a>
          <small style={{ marginTop: 24 }}>
            <ShieldCheck size={14} /> আপনার নাম ও গোপনীয়তা সুরক্ষিত থাকবে, Alias দিয়ে প্রকাশ হবে
          </small>
        </div>
      ) : (
        <div className="stack">
          <Heading
            eyebrow="শিক্ষার্থীদের জন্য আপনার অভিজ্ঞতা"
            title="অভিজ্ঞতা শেয়ার করুন"
            description="ইন্টারভিউয়ের প্রশ্ন, ভিসা প্রসেস, বিশ্ববিদ্যালয় ও রাশিয়ায় পড়ার বাস্তব অভিজ্ঞতা লিখুন।"
          />
          <div id="stories">
            <StoryEditor stories={stories} initialOpen={true} />
          </div>
        </div>
      )}
    </Shell>
  );
}
