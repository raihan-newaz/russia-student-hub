import { Shell, Heading, GoogleIcon } from "@/components/shell";
import { ActionForm } from "@/components/action-form";
import { StoryEditor } from "@/components/story-editor";
import { identity, isDemo } from "@/lib/data";
import { configured, db } from "@/lib/supabase";
import {
  saveProfile,
  signOut,
  deleteAccount,
  markNotifications,
  signInWithPassword,
} from "@/lib/actions";
import { GraduationCap, ArrowUpRight, ShieldCheck } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; setup?: string; write?: string }>;
}) {
  const user = await identity();
  const query = await searchParams;
  const isWrite = Boolean(query.write);
  let stories = [];
  let notices = [];
  if (user) {
    const c = await db();
    const [s, n] = await Promise.all([
      c
        .from("experience_versions")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false }),
      c
        .from("notifications")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    if (s.error || n.error) throw Error("লোড হয়নি");
    stories = s.data || [];
    notices = n.data || [];
  }
  return (
    <Shell
      active="/account"
      alias={user?.profile?.alias}
      avatar={user?.avatar}
      email={user?.email}
      name={user?.name}
      unreadNotices={user?.unreadNotices}
      admin={user?.admin}
      demo={isDemo()}
    >
      <Heading
        title="আমার অ্যাকাউন্ট"
        description="পরিচয়, privacy, অভিজ্ঞতা ও notification পরিচালনা করুন।"
      />
      {!configured() && (
        <p className="notice">
          Supabase configuration প্রয়োজন। .env.local ফাইল চেক করুন।
        </p>
      )}
      {query.error && (
        <p className="notice">লগইন সম্পন্ন হয়নি। আবার চেষ্টা করুন।</p>
      )}
      {!user ? (
        <div className="login-gate">
          <span className="brand-icon">
            <GraduationCap size={34} />
          </span>
          {isWrite ? (
            <>
              <h2>অভিজ্ঞতা শেয়ার করতে সাইন ইন করুন</h2>
              <p>
                রাশিয়ায় পড়াশোনা, স্কলারশিপ বা ভিসার অভিজ্ঞতা লিখে অন্যান্য
                শিক্ষার্থীদের প্রস্তুতিতে সাহায্য করুন।
              </p>
            </>
          ) : (
            <>
              <h2>Start Your Russian Study Journey</h2>
              <p>
                একটি Dashboard-এ Admission, Visa, Expense ও Flight-এর সব ট্র্যাকিং।
                <br />
                সহজে নিজের মতো তথ্য পূরণ করুন ও যেকোনো সময় আপডেট করুন।
              </p>
            </>
          )}
          <a
            className="button primary"
            href={isWrite ? "/auth/login?next=/experiences/new" : "/auth/login"}
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
          <div className="login-divider">
            <span>Or Sign In with Email</span>
          </div>
          <div className="email-login-box">
            <ActionForm action={signInWithPassword} success="লগইন সফল হচ্ছে…">
              <label>
                Email Address
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="আপনার পাসওয়ার্ড"
                />
              </label>
              <button
                className="button"
                style={{ marginTop: 8, width: "100%", fontWeight: 600 }}
              >
                Sign In with Password
              </button>
            </ActionForm>
          </div>
          <small style={{ marginTop: 24 }}>
            <ShieldCheck size={14} /> আপনার নাম ও পরিচয় সবসময় সুরক্ষিত ও গোপন
          </small>
        </div>
      ) : (
        <div className="stack">
          <section className="panel" style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 24px" }}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.profile?.alias || "Profile"}
                referrerPolicy="no-referrer"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "var(--teal)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                {(user.profile?.alias || user.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
                {user.profile?.alias}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                {user.email} · Google Account
              </div>
            </div>
          </section>
          <section className="panel">
            <h2>Public Profile</h2>
            <ActionForm action={saveProfile}>
              <label>
                Alias
                <input
                  name="alias"
                  required
                  minLength={2}
                  maxLength={60}
                  defaultValue={user.profile?.alias}
                />
              </label>
              <button className="button primary" style={{ marginTop: 16 }}>
                Save Changes
              </button>
            </ActionForm>
          </section>
          <div id="stories">
            <StoryEditor stories={stories} initialOpen={isWrite} />
          </div>
          <section className="panel" id="notifications">
            <div className="section-title">
              <h2>নোটিফিকেশন</h2>
              <ActionForm action={markNotifications}>
                <button className="button">Mark All Read</button>
              </ActionForm>
            </div>
            {notices.map((n) => (
              <div
                key={n.id}
                className={`notification ${!n.read ? "unread" : ""}`}
              >
                {n.message}
                <small>
                  {new Date(n.created_at).toLocaleDateString("bn-BD")}
                </small>
              </div>
            ))}
            {!notices.length && (
              <p className="muted">নতুন reply ও review-এর update এখানে আসবে।</p>
            )}
          </section>
          <section className="panel">
            <ActionForm action={signOut}>
              <button className="button">Logout</button>
            </ActionForm>
            <details style={{ marginTop: 25 }}>
              <summary className="form-error">Delete Account</summary>
              <p className="notice">
                Your tracker entries, public experiences, comments, and profile data
                will be permanently deleted. This action cannot be undone.
              </p>
              <ActionForm action={deleteAccount}>
                <label>
                  Type DELETE to confirm
                  <input
                    name="confirm"
                    pattern="DELETE"
                    required
                    autoComplete="off"
                    placeholder="DELETE"
                  />
                </label>
                <button className="button danger" style={{ marginTop: 14 }}>
                  Delete Account Permanently
                </button>
              </ActionForm>
            </details>
          </section>
        </div>
      )}
    </Shell>
  );
}
