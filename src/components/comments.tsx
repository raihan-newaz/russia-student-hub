"use client";
import { useState } from "react";
import { rpcAction } from "@/lib/actions";
import { ActionForm } from "./action-form";
import { GoogleIcon } from "./shell";
import Link from "next/link";
type Comment = {
  id: string;
  alias: string;
  body: string;
  parent_id: string | null;
  mine: boolean;
  created_at: string;
};
export function Comments({
  items,
  experienceId,
  loggedIn,
  more,
  page,
}: {
  items: Comment[];
  experienceId: string;
  loggedIn: boolean;
  more: boolean;
  page: number;
}) {
  const [target, setTarget] = useState<{
    mode: "reply" | "edit" | "report";
    id: string;
    body: string;
  } | null>(null);
  const [draft, setDraft] = useState("");
  const roots = items.filter((c) => !c.parent_id);
  const visibleIds = new Set(roots.map((c) => c.id));
  const render = (c: Comment) => (
    <article key={c.id} className={`comment ${c.parent_id ? "reply" : ""}`}>
      <div className="comment-meta">
        <strong>{c.alias}</strong>
        <span>{new Date(c.created_at).toLocaleDateString("bn-BD")}</span>
      </div>
      <p>{c.body}</p>
      {loggedIn && (
        <div className="comment-tools">
          {!c.parent_id && (
            <button
              onClick={() => setTarget({ mode: "reply", id: c.id, body: "" })}
            >
              Reply
            </button>
          )}
          {c.mine ? (
            <>
              <button
                onClick={() =>
                  setTarget({ mode: "edit", id: c.id, body: c.body })
                }
              >
                Edit
              </button>
              <ActionForm
                action={async () => {
                  if (confirm("Are you sure you want to delete this comment?"))
                    await rpcAction("delete_comment", { target: c.id });
                }}
              >
                <button>Delete</button>
              </ActionForm>
            </>
          ) : (
            <button
              onClick={() => setTarget({ mode: "report", id: c.id, body: "" })}
            >
              Report
            </button>
          )}
        </div>
      )}
    </article>
  );
  return (
    <section className="panel">
      <h2>আলোচনা</h2>
      <p className="muted">
        অভিজ্ঞতা নিয়ে কথা বলুন, ব্যক্তিগত তথ্য শেয়ার করবেন না।
      </p>
      {loggedIn ? (
        <ActionForm
          action={async () => {
            await rpcAction("write_comment", {
              target: experienceId,
              content: draft,
              parent: null,
              editing: null,
            });
            setDraft("");
          }}
          success="মন্তব্য প্রকাশ হয়েছে।"
        >
          <label style={{ marginTop: 18 }}>
            আপনার মন্তব্য
            <textarea
              required
              maxLength={2000}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="আপনার প্রশ্ন বা মতামত লিখুন…"
            />
          </label>
          <button className="button primary" style={{ marginTop: 12 }}>
            Post Comment
          </button>
        </ActionForm>
      ) : (
        <p className="notice">
          <a
            href="/auth/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 500,
            }}
          >
            <GoogleIcon size={16} /> Sign In with Google to comment →
          </a>
        </p>
      )}
      {roots.map((c) => (
        <div key={c.id}>
          {render(c)}
          {items.filter((r) => r.parent_id === c.id).map(render)}
        </div>
      ))}
      {items
        .filter((c) => c.parent_id && !visibleIds.has(c.parent_id))
        .map(render)}
      {!items.length && <p className="empty">এখনো কোনো মন্তব্য নেই।</p>}
      <div className="pagination">
        {page > 1 && (
          <Link className="button" href={`?page=${page - 1}`}>
            Previous
          </Link>
        )}
        {more && (
          <Link className="button" href={`?page=${page + 1}`}>
            Next
          </Link>
        )}
      </div>
      {target && (
        <dialog
          className="modal"
          ref={(node) => {
            if (node && !node.open) node.showModal();
          }}
          onCancel={() => setTarget(null)}
          aria-labelledby="comment-dialog"
        >
          <h3 id="comment-dialog">
            {target.mode === "reply"
              ? "উত্তর দিন"
              : target.mode === "edit"
                ? "মন্তব্য পরিবর্তন"
                : "রিপোর্টের কারণ"}
          </h3>
          <ActionForm
            action={async (form) => {
              const content = String(form.get("body"));
              if (target.mode === "report")
                await rpcAction("report_comment", {
                  target: target.id,
                  content,
                });
              else
                await rpcAction("write_comment", {
                  target: experienceId,
                  content,
                  parent: target.mode === "reply" ? target.id : null,
                  editing: target.mode === "edit" ? target.id : null,
                });
              setTarget(null);
            }}
          >
            <label>
              লিখুন
              <textarea
                autoFocus
                name="body"
                required
                minLength={target.mode === "report" ? 3 : 1}
                maxLength={target.mode === "report" ? 1000 : 2000}
                defaultValue={target.body}
              />
            </label>
            <div className="form-actions">
              <button className="button primary">Submit</button>
              <button
                type="button"
                className="button"
                onClick={() => setTarget(null)}
              >
                Cancel
              </button>
            </div>
          </ActionForm>
        </dialog>
      )}
    </section>
  );
}
