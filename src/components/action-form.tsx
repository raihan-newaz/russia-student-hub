"use client";
import { useState, startTransition } from "react";
import { event } from "@/lib/gtag";
export function ActionForm({
  action,
  children,
  success = "সফলভাবে সেভ হয়েছে।",
  className = "",
}: {
  action: (form: FormData) => Promise<void>;
  children: React.ReactNode;
  success?: string;
  className?: string;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        startTransition(async () => {
          setBusy(true);
          setMessage("");
          try {
            await action(form);
            setMessage(success);
            event("form_submit_success", { form_class: className || "action_form" });
          } catch (error) {
            if (
              error instanceof Error &&
              error.message.includes("NEXT_REDIRECT")
            )
              throw error;
            const errMsg = error instanceof Error ? error.message : "কাজটি সম্পন্ন হয়নি।";
            setMessage(errMsg);
            event("form_submit_error", {
              form_class: className || "action_form",
              error_message: errMsg,
            });
          } finally {
            setBusy(false);
          }
        });
      }}
    >
      <fieldset
        disabled={busy}
        style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
      >
        {children}
      </fieldset>
      <p className="form-status" role="status" aria-live="polite">
        {busy ? "অপেক্ষা করুন…" : message}
      </p>
    </form>
  );
}
