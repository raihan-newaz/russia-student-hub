import { Shell, Heading } from "@/components/shell";
import { ActionForm } from "@/components/action-form";
import { updatePassword } from "@/lib/actions";
import { identity } from "@/lib/data";
import { KeyRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const user = await identity();

  return (
    <Shell
      active="/account"
      alias={user?.profile?.alias}
      avatar={user?.avatar}
      email={user?.email}
      name={user?.name}
      unreadNotices={user?.unreadNotices}
      admin={user?.admin}
    >
      <Heading
        title="নতুন পাসওয়ার্ড সেট করুন"
        description="আপনার অ্যাকাউন্টের জন্য একটি নতুন ও শক্তিশালী পাসওয়ার্ড নির্ধারণ করুন।"
      />

      <div className="login-gate" style={{ maxWidth: 440 }}>
        <span className="brand-icon">
          <KeyRound size={34} />
        </span>
        <h2>Reset Your Password</h2>
        <p>আপনার অ্যাকাউন্টের জন্য নতুন পাসওয়ার্ড দিন।</p>

        <div className="email-login-box" style={{ maxWidth: "100%" }}>
          <ActionForm action={updatePassword} success="পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!">
            <label>
              New Password
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
                autoComplete="new-password"
              />
            </label>
            <button
              className="button primary"
              style={{ marginTop: 12, width: "100%", fontWeight: 600 }}
            >
              Update Password
            </button>
          </ActionForm>
        </div>
      </div>
    </Shell>
  );
}
