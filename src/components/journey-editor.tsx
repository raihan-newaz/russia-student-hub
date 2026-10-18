"use client";
import { useState, useTransition, startTransition } from "react";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { saveRecord, removeRecord } from "@/lib/actions";
import { trackJourneyStep, event } from "@/lib/gtag";
import {
  type Entry,
  type RecordData,
  recordSchema,
  bn,
  labels,
} from "@/lib/model";
import {
  DEFAULT_INTAKES,
  DEFAULT_UNIVERSITIES,
  DEFAULT_CITIES,
} from "@/lib/constants";
type Field = {
  key: string;
  label: string;
  type?: string;
  options?: string[][];
  list?: string;
};
const status = [
  ["", "এখনো জানি না"],
  ["planned", "Planned"],
  ["submitted", "Submitted"],
  ["completed", "Completed"],
];
const fields: Record<string, Field[]> = {
  study: [
    { key: "title", label: "Plan Title", type: "required" },
    {
      key: "intake",
      label: "Intake",
      options: [
        ["", "Select Intake"],
        ...DEFAULT_INTAKES.map((v) => [v, v]),
      ],
    },
    {
      key: "funding",
      label: "Funding Type",
      options: [
        ["self", "Self-funded"],
        ["scholarship", "Scholarship"],
      ],
    },
    { key: "scholarship", label: "Scholarship Name" },
    {
      key: "course",
      label: "Degree / Program",
      options: [
        ["preparatory", "Preparatory"],
        ["bachelor", "Bachelor's"],
        ["masters", "Master's"],
        ["phd", "PhD"],
      ],
    },
    { key: "subject", label: "Subject / Faculty" },
    {
      key: "language",
      label: "Medium of Study",
      options: [
        ["", "Select Language"],
        ["Russian", "Russian"],
        ["English", "English"],
        ["Bilingual", "Bilingual"],
      ],
    },
    {
      key: "university",
      label: "Main University",
    },
    { key: "city", label: "City" },
    {
      key: "prep_university",
      label: "Preparatory University",
    },
    { key: "prep_city", label: "Preparatory City" },
    { key: "admission", label: "Admission Application", options: status },
    { key: "admission_date", label: "Application Date", type: "date" },
    { key: "offer", label: "Offer Letter", options: status },
    { key: "offer_date", label: "Offer Date", type: "date" },
    { key: "invitation", label: "Invitation Letter", options: status },
    { key: "invitation_date", label: "Invitation Date", type: "date" },
  ],
  document: [
    { key: "title", label: "Document Title", type: "required" },
    {
      key: "document_type",
      label: "Document Type",
      options: [
        ["", "Select Document"],
        ["SSC / O-Level Certificate", "SSC / O-Level Certificate"],
        ["SSC / O-Level Marksheet", "SSC / O-Level Marksheet"],
        ["HSC / A-Level Certificate", "HSC / A-Level Certificate"],
        ["HSC / A-Level Marksheet", "HSC / A-Level Marksheet"],
        ["Bachelor Certificate", "Bachelor's Certificate"],
        ["Bachelor Transcript", "Bachelor's Transcript"],
        ["Masters Certificate", "Master's Certificate"],
        ["Passport", "Passport"],
        ["Police Clearance", "Police Clearance Certificate"],
        ["Medical Fitness Certificate", "Medical Fitness Certificate"],
        ["HIV / AIDS Report", "HIV / AIDS Report"],
        ["Birth Certificate", "Birth Certificate"],
        ["Bank Statement", "Bank Statement / Solvency"],
        ["Other", "Other"],
      ],
    },
    { key: "translation", label: "Russian Translation", options: status },
    { key: "notarization", label: "Notarization", options: status },
    { key: "legalization", label: "Apostille / Legalization", options: status },
    { key: "submission_date", label: "Submission Date", type: "date" },
    { key: "collection_date", label: "Collection Date", type: "date" },
  ],
  visa: [
    { key: "title", label: "Application Title", type: "required" },
    {
      key: "service",
      label: "Visa Service",
      options: [
        ["regular", "Single Entry Visa (4-20 working days) · ৳ 11,150"],
        ["express", "Single Entry Visa (1-3 working days) · ৳ 21,150"],
      ],
    },
    { key: "submission_date", label: "Submission Date", type: "date" },
    {
      key: "appointment_type",
      label: "Appointment Type",
      options: [
        ["appointment", "Appointment"],
        ["walkin", "Walk-in"],
      ],
    },
    {
      key: "appointment_date",
      label: "Appointment Date & Time",
      type: "datetime-local",
    },
    { key: "interview_date", label: "Interview Date", type: "date" },
    { key: "questions", label: "Questions Asked (ইন্টারভিউ প্রশ্ন)", type: "textarea" },
    { key: "answers", label: "Your Experience & Answers (আপনার অভিজ্ঞতা)", type: "textarea" },
    {
      key: "interview_language",
      label: "Interview Language",
      options: [
        ["", "Select Language"],
        ["English", "English"],
        ["Russian", "Russian"],
        ["Bangla", "Bangla"],
        ["Mixed", "Mixed"],
      ],
    },
    {
      key: "rating",
      label: "Interview Rating",
      options: [
        ["", "Unknown"],
        ["good", "Smooth / Good"],
        ["average", "Average"],
        ["difficult", "Difficult"],
      ],
    },
    { key: "tips", label: "Tips for Other Students (পরামর্শ)", type: "textarea" },
    {
      key: "outcome",
      label: "Visa Outcome",
      options: ["pending", "approved", "rejected", "withdrawn"].map((k) => [
        k,
        labels[k],
      ]),
    },
    { key: "decision_date", label: "Decision Date", type: "date" },
    { key: "delivery_date", label: "Expected Delivery Date", type: "date" },
    { key: "collection_date", label: "Passport Collection Date", type: "date" },
    {
      key: "reapply",
      label: "Will Reapply?",
      options: [
        ["", "N/A"],
        ["yes", "Yes"],
        ["no", "No"],
        ["unsure", "Unsure"],
      ],
    },
  ],
  cost: [
    { key: "title", label: "Expense Title", type: "required" },
    {
      key: "category",
      label: "Category",
      options: [
        ["admission", "Admission & Application Fee"],
        ["invitation", "Invitation Issue Fee"],
        ["tuition", "Tuition Fee"],
        ["translation", "Translation"],
        ["notarization", "Notarization"],
        ["legalization", "Legalization / Attestation"],
        ["medical", "Medical & HIV Tests"],
        ["visa", "Visa Fee"],
        ["agency", "Agency / Service Charge"],
        ["accommodation", "Accommodation / Dorm"],
        ["other", "Other"],
      ],
    },
    { key: "amount", label: "Amount", type: "decimal" },
    {
      key: "currency",
      label: "Currency",
      options: [
        ["BDT", "BDT (৳)"],
        ["RUB", "RUB (₽)"],
        ["USD", "USD ($)"],
      ],
    },
    {
      key: "payment_status",
      label: "Payment Status",
      options: [
        ["estimated", "Estimated / Planned"],
        ["paid", "Paid"],
      ],
    },
    { key: "payment_date", label: "Payment Date", type: "date" },
    {
      key: "tuition_period",
      label: "Tuition Period",
      options: [
        ["", "N/A"],
        ["semester", "Per Semester"],
        ["year", "Per Year"],
        ["course", "Full Course"],
      ],
    },
  ],
  flight: [
    { key: "title", label: "Flight / Transit Title", type: "required" },
    { key: "airline", label: "Airline" },
    { key: "flight_number", label: "Flight Number (Optional)" },
    { key: "departure_airport", label: "Departure Airport" },
    { key: "arrival_airport", label: "Arrival Airport" },
    {
      key: "departure_time",
      label: "Departure Local Time",
      type: "datetime-local",
    },
    {
      key: "departure_timezone",
      label: "Departure Timezone",
      options: [
        ["Asia/Dhaka", "Asia/Dhaka (Bangladesh UTC+6)"],
        ["Europe/Moscow", "Europe/Moscow (Moscow UTC+3)"],
        ["Asia/Dubai", "Asia/Dubai (Dubai UTC+4)"],
        ["Asia/Muscat", "Asia/Muscat (Muscat UTC+4)"],
        ["Asia/Kuwait", "Asia/Kuwait (Kuwait UTC+3)"],
        ["Asia/Qatar", "Asia/Qatar (Doha UTC+3)"],
        ["Europe/Istanbul", "Europe/Istanbul (Istanbul UTC+3)"],
        ["Asia/Yekaterinburg", "Asia/Yekaterinburg (Yekaterinburg UTC+5)"],
        ["Asia/Novosibirsk", "Asia/Novosibirsk (Novosibirsk UTC+7)"],
        ["Asia/Tomsk", "Asia/Tomsk (Tomsk UTC+7)"],
        ["Asia/Krasnoyarsk", "Asia/Krasnoyarsk (Krasnoyarsk UTC+7)"],
        ["Asia/Irkutsk", "Asia/Irkutsk (Irkutsk UTC+8)"],
        ["Asia/Vladivostok", "Asia/Vladivostok (Vladivostok UTC+10)"],
      ],
    },
    {
      key: "arrival_time",
      label: "Arrival Local Time",
      type: "datetime-local",
    },
    {
      key: "arrival_timezone",
      label: "Arrival Timezone",
      options: [
        ["Europe/Moscow", "Europe/Moscow (Moscow UTC+3)"],
        ["Asia/Dhaka", "Asia/Dhaka (Bangladesh UTC+6)"],
        ["Asia/Yekaterinburg", "Asia/Yekaterinburg (Yekaterinburg UTC+5)"],
        ["Asia/Novosibirsk", "Asia/Novosibirsk (Novosibirsk UTC+7)"],
        ["Asia/Tomsk", "Asia/Tomsk (Tomsk UTC+7)"],
        ["Asia/Krasnoyarsk", "Asia/Krasnoyarsk (Krasnoyarsk UTC+7)"],
        ["Asia/Irkutsk", "Asia/Irkutsk (Irkutsk UTC+8)"],
        ["Asia/Vladivostok", "Asia/Vladivostok (Vladivostok UTC+10)"],
        ["Asia/Dubai", "Asia/Dubai (Dubai UTC+4)"],
        ["Europe/Istanbul", "Europe/Istanbul (Istanbul UTC+3)"],
      ],
    },
    {
      key: "amount",
      label: "Ticket Fare",
      type: "decimal",
    },
    {
      key: "currency",
      label: "Currency",
      options: [
        ["BDT", "BDT (৳)"],
        ["RUB", "RUB (₽)"],
        ["USD", "USD ($)"],
      ],
    },
    {
      key: "arrival_status",
      label: "Travel Status",
      options: [
        ["planned", "Planned"],
        ["departed", "Departed"],
        ["arrived", "Arrived"],
      ],
    },
    { key: "arrival_date", label: "Arrival Date", type: "date" },
  ],
};
const sectionNames: Record<string, string> = {
  study: "Study Plan",
  document: "Documents",
  visa: "Visa Application",
  cost: "Expenses",
  flight: "Flight & Travel",
};
export function JourneyEditor({
  entries,
  universities,
  cities,
}: {
  entries: Entry[];
  universities: string[];
  cities: string[];
}) {
  const [section, setSection] = useState("study");
  const [editing, setEditing] = useState<Entry | null>(null);
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState(
    entries.find((e) => e.kind === "study")?.id || "",
  );
  const [message, setMessage] = useState("");
  const plans = entries.filter((e) => e.kind === "study");
  const selectedPlan = plans.some((p) => p.id === plan)
    ? plan
    : plans[0]?.id || "";
  const visible = entries.filter(
    (e) =>
      e.kind === section && (section === "study" || e.plan_id === selectedPlan),
  );
  const active = entries.filter((e) => e.plan_id === selectedPlan);
  const totals = active
    .filter((e) => ["cost", "flight"].includes(e.kind) && e.data.amount)
    .reduce(
      (a, e) => {
        a[e.data.currency] = (a[e.data.currency] || 0) + Number(e.data.amount);
        return a;
      },
      {} as Record<string, number>,
    );
  return (
    <>
      <div className="journey-timeline">
        {Object.entries(sectionNames).map(([k, v], i) => (
          <span
            key={k}
            className={
              (k === "study" ? plans.length : active.some((e) => e.kind === k))
                ? "done"
                : ""
            }
          >
            <strong>{bn(i + 1)}</strong>
            {v}
          </span>
        ))}
      </div>
      <div className="panel">
        <div className="entry-header">
          <div>
            <h2>আপনার তথ্য, আপনার নিয়ন্ত্রণে</h2>
            <p className="muted">
              ছোট ধাপে পূরণ করুন। সব তথ্য একবারে দেওয়া জরুরি নয়।
            </p>
          </div>
          <button
            className="button primary"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus size={17} />
            Add {sectionNames[section]}
          </button>
        </div>
        {plans.length > 0 && (
          <label style={{ marginTop: 20 }}>
            বর্তমান study plan
            <select
              value={selectedPlan}
              onChange={(e) => {
                setPlan(e.target.value);
                setOpen(false);
              }}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.data.title || p.data.university}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="form-tabs" role="tablist" aria-label="তথ্যের বিভাগ">
          {Object.entries(sectionNames).map(([k, v]) => (
            <button
              role="tab"
              aria-selected={section === k}
              key={k}
              className={section === k ? "active" : ""}
              onClick={() => {
                setSection(k);
                trackJourneyStep(k);
                setOpen(false);
                setMessage("");
              }}
            >
              {v}
            </button>
          ))}
        </div>
        {section === "document" && (
          <p className="notice">
            এটি আপনার ব্যক্তিগত checklist; সরকারি document requirement নয়। খরচ
            আলাদা “খরচ” বিভাগে লিখুন।
          </p>
        )}
        {section === "visa" && (
          <div className="notice" style={{ background: "#f0fdf4", borderColor: "#86efac", color: "#166534" }}>
            <p style={{ margin: "0 0 6px 0" }}>
              🏛️ <strong>রাশিয়ান এম্বাসি (ঢাকা) ভিসা শিডিউল ও অফিসিয়াল ফি:</strong> শুধুমাত্র <strong>রবিবার, মঙ্গলবার ও বৃহস্পতিবার</strong> (সকাল 8:45 - 11:45) আবেদন গ্রহণ ও ভিসা ডেলিভারি করা হয়।<br />
              • Single Entry Regular (4-20 কর্মদিবস): ৳ 11,150 (সার্ভিস: ৳ 10,000 + কনভেনিয়েন্স: ৳ 1,000 + ভ্যাট)<br />
              • Single Entry Express (1-3 কর্মদিবস): ৳ 21,150 (সার্ভিস: ৳ 20,000 + কনভেনিয়েন্স: ৳ 1,000 + ভ্যাট)
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              <a
                href="https://visa.kdmid.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="button"
                style={{ fontSize: 12, padding: "4px 10px", textDecoration: "none" }}
              >
                📝 Visa Application Form (kdmid.ru)
              </a>
              <a
                href="https://dhaka.kdmid.ru/queue-en/orderinfo.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="button"
                style={{ fontSize: 12, padding: "4px 10px", textDecoration: "none" }}
              >
                📅 Appointment Booking (dhaka.kdmid.ru)
              </a>
              <a
                href="https://pay-russia.visa-cbc.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="button"
                style={{ fontSize: 12, padding: "4px 10px", textDecoration: "none" }}
              >
                💳 Pay Visa Fee (CBC)
              </a>
            </div>
          </div>
        )}
        {section === "document" && (
          <div className="notice">
            <p style={{ margin: "0 0 4px 0" }}>
              📜 <strong>লিগালাইজেশন ফি (Legalization):</strong> রাশিয়ান এম্বাসিতে প্রতি পৃষ্ঠার জন্য <strong>৳ 9,150</strong> (সার্ভিস ফি: ৳ 8,000 + কনভেনিয়েন্স ফি: ৳ 1,000 + ভ্যাট)। মাস্টার্সে সার্টিফিকেট ও ট্রান্সক্রিপ্ট (2 পৃষ্ঠা) লিগালাইজেশনে মোট ৳ 18,300 খরচ হয়।
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#0369a1" }}>
              💡 <strong>e-Apostille নোট:</strong> বর্তমানে অনেক রাশিয়ান বিশ্ববিদ্যালয়ে শুধু e-Apostille (ই-অ্যাপোস্টিল) গ্রহণযোগ্য, আলাদা এম্বাসি লিগালাইজেশনের প্রয়োজন হচ্ছে না।
            </p>
          </div>
        )}
        {section === "flight" && (
          <p className="notice">
            প্রতিটি transit leg আলাদা entry করুন। একটি booking-এর পুরো মূল্য
            শুধু একটি leg-এ দিন, যাতে দুইবার যোগ না হয়।
          </p>
        )}
        {section === "cost" && (
          <p className="notice">
            বিমান টিকিটের খরচ “ফ্লাইট” বিভাগ থেকে যুক্ত হয়। মোট:{" "}
            {Object.entries(totals)
              .map(([c, n]) => `${c} ${bn(n)}`)
              .join(" · ") || "এখনো খরচ নেই"}
          </p>
        )}
        {open && (section === "study" || selectedPlan) ? (
          <RecordForm
            key={editing?.id || section}
            kind={section as RecordData["kind"]}
            plan={selectedPlan}
            entry={editing}
            entries={active}
            universities={universities}
            cities={cities}
            onDone={() => {
              setOpen(false);
              setEditing(null);
              setMessage("তথ্য সেভ হয়েছে।");
            }}
            onCancel={() => setOpen(false)}
          />
        ) : open ? (
          <p className="notice">
            আগে পড়াশোনা বিভাগে একটি study plan তৈরি করুন।
          </p>
        ) : null}
        <p role="status" className="form-status">
          {message}
        </p>
        <div className="entry-list">
          {visible.map((e, i) => (
            <div key={e.id} className="entry-item">
              <div className="entry-header">
                <div>
                  <h3>
                    {section === "visa" ? `আবেদন ${bn(i + 1)} · ` : ""}
                    {e.data.title}
                  </h3>
                  <p>
                    {section === "study"
                      ? `${e.data.university} · ${e.data.city} · ${labels[e.data.course]}`
                      : section === "visa"
                        ? `${labels[e.data.outcome]} · ${labels[e.data.service]}`
                        : section === "cost"
                          ? `${e.data.currency} ${e.data.amount ? bn(Number(e.data.amount)) : "—"}`
                          : section === "flight"
                            ? `${e.data.airline} · ${e.data.departure_airport} → ${e.data.arrival_airport}`
                            : e.data.document_type}
                  </p>
                  <small className="muted">
                    আপডেট: {new Date(e.updated_at).toLocaleDateString("bn-BD")}
                  </small>
                </div>
                <div className="entry-actions">
                  <button
                    className="button"
                    onClick={() => {
                      setEditing(e);
                      setOpen(true);
                    }}
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    aria-label={`Delete ${e.data.title}`}
                    className="button danger"
                    onClick={async () => {
                      if (
                        !confirm(
                          section === "study"
                            ? "All visa, document, cost and flight records under this plan will be deleted. Are you sure?"
                            : "Are you sure you want to delete this entry?",
                        )
                      )
                        return;
                      startTransition(async () => {
                        try {
                          await removeRecord(e.id);
                          event("journey_record_delete", { kind: e.kind });
                          setMessage("মুছে ফেলা হয়েছে।");
                        } catch (err) {
                          setMessage(
                            err instanceof Error
                              ? err.message
                              : "মুছে ফেলা যায়নি।",
                          );
                        }
                      });
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {!visible.length && !open && (
          <div className="empty">
            <h3>এখান থেকেই শুরু</h3>
            <p>
              নতুন {sectionNames[section]} যোগ করতে উপরের button ব্যবহার করুন।
            </p>
          </div>
        )}
      </div>
    </>
  );
}
function RecordForm({
  kind,
  plan,
  entry,
  entries,
  universities,
  cities,
  onDone,
  onCancel,
}: {
  kind: RecordData["kind"];
  plan: string;
  entry: Entry | null;
  entries: Entry[];
  universities: string[];
  cities: string[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const defaults = (entry?.data || recordSchema.parse({ kind, data: {} }).data) as Record<string, unknown>;
  const allUnis = Array.from(
    new Set([
      ...DEFAULT_UNIVERSITIES,
      ...universities,
      ...(typeof defaults?.university === "string" && defaults.university
        ? [defaults.university]
        : []),
      ...(typeof defaults?.prep_university === "string" &&
      defaults.prep_university
        ? [defaults.prep_university]
        : []),
    ]),
  ).sort();

  const allCities = Array.from(
    new Set([
      ...DEFAULT_CITIES,
      ...cities,
      ...(typeof defaults?.city === "string" && defaults.city
        ? [defaults.city]
        : []),
      ...(typeof defaults?.prep_city === "string" && defaults.prep_city
        ? [defaults.prep_city]
        : []),
    ]),
  ).sort();

  const dynamicOptions: Record<string, string[][]> = {
    university: [
      ["", "বিশ্ববিদ্যালয় নির্বাচন করুন"],
      ...allUnis.map((u) => [u, u]),
    ],
    city: [["", "শহর নির্বাচন করুন"], ...allCities.map((c) => [c, c])],
    prep_university: [
      ["", "প্রিপারেটরি বিশ্ববিদ্যালয় নির্বাচন করুন"],
      ...allUnis.map((u) => [u, u]),
    ],
    prep_city: [
      ["", "প্রিপারেটরি শহর নির্বাচন করুন"],
      ...allCities.map((c) => [c, c]),
    ],
  };

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, unknown>>({ defaultValues: defaults });
  const [failure, setFailure] = useState("");
  const [pending, startTransition] = useTransition();
  const direct = watch("course") === "preparatory" ? false : watch("direct"),
    funding = watch("funding");
  return (
    <form
      className="panel"
      style={{ marginBottom: 20, background: "#f9fbfa" }}
      onSubmit={handleSubmit(async (data) => {
        setFailure("");
        if (kind === "study") data.direct = direct;
        const parsed = recordSchema.safeParse({
          id: entry?.id,
          kind,
          plan_id: kind === "study" ? null : plan,
          data,
        });
        if (!parsed.success) {
          parsed.error.issues.forEach((i) =>
            setError(String(i.path[1] || "title"), { message: i.message }),
          );
          setFailure("চিহ্নিত তথ্যগুলো ঠিক করুন।");
          return;
        }
        startTransition(async () => {
          try {
            const result = await saveRecord(parsed.data);
            if (result.ok) {
              event("journey_record_save", { kind });
              onDone();
            } else setFailure(result.error || "সেভ হয়নি।");
          } catch {
            setFailure("সংযোগ বিচ্ছিন্ন হয়েছে। আপনার লেখা আছে, আবার সেভ করুন।");
          }
        });
      })}
    >
      <h3 style={{ marginBottom: 18 }}>
        {entry ? "তথ্য পরিবর্তন করুন" : "নতুন তথ্য যোগ করুন"}
      </h3>
      {kind === "study" && watch("course") !== "preparatory" && (
        <label className="check-label" style={{ marginBottom: 20 }}>
          <input type="checkbox" {...register("direct")} />
          প্রিপারেটরি কোর্স ছাড়াই মূল কোর্সে যাচ্ছি
        </label>
      )}
      <div className="form-grid">
        {fields[kind]
          .filter(
            (f) =>
              !(f.key === "scholarship" && funding !== "scholarship") &&
              !(f.key.startsWith("prep_") && direct) &&
              !(f.key === "tuition_period" && watch("category") !== "tuition"),
          )
          .map((f) => {
            const fieldOptions = f.options || dynamicOptions[f.key];
            return (
              <label
                key={f.key}
                className={f.type === "textarea" ? "full" : ""}
              >
                {f.label}
                {fieldOptions ? (
                  <select {...register(f.key)}>
                    {fieldOptions.map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea {...register(f.key)} maxLength={2000} />
                ) : (
                  <input
                    {...register(f.key)}
                    required={f.type === "required"}
                    type={
                      ["date", "datetime-local"].includes(f.type || "")
                        ? f.type
                        : "text"
                    }
                    inputMode={f.type === "decimal" ? "decimal" : undefined}
                    maxLength={2000}
                  />
                )}{" "}
                {errors[f.key] && (
                  <span className="form-error">
                    {String(errors[f.key]?.message)}
                  </span>
                )}
              </label>
            );
          })}
        {kind === "visa" && (
          <label>
            আগের আবেদন (পুনরায় আবেদন হলে)
            <select {...register("previous_attempt")}>
              <option value="">প্রথম আবেদন / প্রযোজ্য নয়</option>
              {entries
                .filter((e) => e.kind === "visa" && e.id !== entry?.id)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.data.title}
                  </option>
                ))}
            </select>
          </label>
        )}
        <label className="full">
          ব্যক্তিগত নোট
          <textarea
            {...register("notes")}
            maxLength={2000}
            placeholder="এই তথ্য কখনো public হবে না"
          />
        </label>
      </div>
      {kind === "study" && (
        <small className="muted">
          তালিকায় আপনার কাঙ্ক্ষিত বিশ্ববিদ্যালয় ও শহর সহজে নির্বাচন করুন।
        </small>
      )}
      <div className="form-actions">
        <button className="button primary" disabled={isSubmitting || pending}>
          <Save size={16} />
          {isSubmitting || pending ? "Saving..." : "Save Entry"}
        </button>
        <button type="button" className="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <p role="alert" className="form-error">
        {failure}
      </p>
    </form>
  );
}
