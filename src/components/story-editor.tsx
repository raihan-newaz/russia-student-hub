"use client";
import { useState, useEffect } from "react";
import { publishExperience, rpcAction } from "@/lib/actions";
import { ActionForm } from "./action-form";
import { labels } from "@/lib/model";
import { DEFAULT_UNIVERSITIES, DEFAULT_CITIES } from "@/lib/constants";
type Story = {
  id: string;
  title: string;
  body: string;
  university: string;
  city: string;
  course: string;
  funding: string;
  outcome: string;
  status: string;
  review_note: string;
};
export function StoryEditor({
  stories,
  initialOpen = false,
}: {
  stories: Story[];
  initialOpen?: boolean;
}) {
  const [edit, setEdit] = useState<Story | null>(null);
  const [show, setShow] = useState(initialOpen);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (
        initialOpen ||
        window.location.hash.includes("stories") ||
        window.location.search.includes("write=true")
      ) {
        setShow(true);
        setTimeout(() => {
          const el = document.getElementById("stories");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
  }, [initialOpen]);

  return (
    <section className="panel">
      <div className="section-title">
        <div>
          <h2>আমার অভিজ্ঞতা</h2>
          <p>যাচাইয়ের পর আপনার alias দিয়ে প্রকাশ হবে</p>
        </div>
        <button
          className="button primary"
          onClick={() => {
            setEdit(null);
            setTitle("");
            setBody("");
            setShow(true);
          }}
        >
          Write Experience
        </button>
      </div>
      {show && (
        <ActionForm
          key={edit?.id || "new"}
          action={async (form) => {
            await publishExperience(form);
            setShow(false);
          }}
          success="Review-এর জন্য পাঠানো হয়েছে।"
        >
          <input type="hidden" name="previous_id" value={edit?.id || ""} />
          <div className="form-grid">
            <label className="full">
              শিরোনাম
              <input
                name="title"
                required
                minLength={5}
                maxLength={160}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="full">
              প্রশ্ন, উত্তর, আপনার অভিজ্ঞতা ও পরামর্শ
              <textarea
                name="body"
                required
                minLength={20}
                maxLength={12000}
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </label>
            <label>
              বিশ্ববিদ্যালয়
              <select
                name="university"
                defaultValue={edit?.university || ""}
              >
                <option value="">বিশ্ববিদ্যালয় নির্বাচন করুন</option>
                {DEFAULT_UNIVERSITIES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
            <label>
              শহর
              <select
                name="city"
                defaultValue={edit?.city || ""}
              >
                <option value="">শহর নির্বাচন করুন</option>
                {DEFAULT_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            {[
              [
                "course",
                "কোর্স",
                ["preparatory", "bachelor", "masters", "phd"],
              ],
              ["funding", "ফান্ডিং", ["self", "scholarship"]],
              [
                "outcome",
                "ভিসার ফলাফল",
                ["pending", "approved", "rejected", "withdrawn"],
              ],
            ].map(([key, label, values]) => (
              <label key={String(key)}>
                {label as string}
                <select
                  name={String(key)}
                  defaultValue={edit?.[key as keyof Story] || ""}
                >
                  <option value="">প্রকাশ করতে চাই না</option>
                  {(values as string[]).map((v) => (
                    <option value={v} key={v}>
                      {labels[v]}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <p className="notice">
            Google নাম, email, passport details, সুনির্দিষ্ট appointment বা
            flight schedule লিখবেন না। Public অভিজ্ঞতা থেকে নিজের পরিচয় প্রকাশ
            পেতে পারে এমন তথ্য বাদ দিন।
          </p>
          <button
            type="button"
            className="button"
            onClick={() => setPreview(!preview)}
          >
            {preview ? "Hide Preview" : "Public Preview"}
          </button>
          {preview && (
            <div className="preview-box">
              <strong>{title || "আপনার শিরোনাম"}</strong>
              <p>{body || "আপনার অভিজ্ঞতা এখানে দেখা যাবে।"}</p>
              <small>
                আপনার alias ও নির্বাচিত study context-সহ প্রকাশ হবে।
              </small>
            </div>
          )}
          <label className="check-label">
            <input type="checkbox" name="consent" required />
            নির্বাচিত তথ্য ও অভিজ্ঞতা public করার সম্মতি দিচ্ছি
          </label>
          <div className="form-actions">
            <button className="button primary">Submit for Review</button>
            <button
              type="button"
              className="button"
              onClick={() => setShow(false)}
            >
              Cancel
            </button>
          </div>
        </ActionForm>
      )}
      <div className="entry-list">
        {stories.map((story) => (
          <div className="entry-item" key={story.id}>
            <h3>{story.title}</h3>
            <p>
              অবস্থা:{" "}
              {
                (
                  {
                    pending: "Review-তে",
                    approved: "প্রকাশিত",
                    returned: "সংশোধন প্রয়োজন",
                    hidden: "অপ্রকাশিত",
                    superseded: "পুরোনো সংস্করণ",
                  } as Record<string, string>
                )[story.status]
              }{" "}
              {story.review_note && `· ${story.review_note}`}
            </p>
            <div className="form-actions">
              <button
                className="button"
                onClick={() => {
                  setEdit(story);
                  setTitle(story.title);
                  setBody(story.body);
                  setShow(true);
                }}
              >
                Edit Story
              </button>
              <ActionForm
                action={async () => {
                  await rpcAction("unpublish_experience", { target: story.id });
                }}
                success="সব সংস্করণ অপ্রকাশিত হয়েছে।"
              >
                <button className="button">Unpublish</button>
              </ActionForm>
            </div>
          </div>
        ))}
      </div>
      {!stories.length && !show && (
        <div
          style={{
            textAlign: "center",
            padding: "32px 20px",
            background: "#f8fafc",
            borderRadius: 12,
            border: "1px dashed #cbd5e1",
            marginTop: 16,
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1e293b",
              marginBottom: 6,
            }}
          >
            আপনি এখনো কোনো অভিজ্ঞতা লিখেননি
          </h3>
          <p
            className="muted"
            style={{ marginBottom: 16, fontSize: 14, maxWidth: 440, margin: "0 auto 16px" }}
          >
            আপনার বাস্তব অভিজ্ঞতা ও পরামর্শ অন্য শিক্ষার্থীদের রাশিয়া যাত্রার প্রস্তুতিতে অনেক সাহায্য করবে।
          </p>
          <button
            className="button primary"
            onClick={() => {
              setEdit(null);
              setTitle("");
              setBody("");
              setShow(true);
            }}
          >
            Write Experience
          </button>
        </div>
      )}
    </section>
  );
}
