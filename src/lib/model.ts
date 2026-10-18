import { z } from "zod";
export const digits = (s: string) =>
  s.replace(/[০-৯]/g, (c) => String("০১২৩৪৫৬৭৮৯".indexOf(c)));
const text = z.string().max(2000).default("");
const date = z
  .string()
  .refine((v) => {
    if (!v) return true;
    if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(v)) return false;
    const parsed = new Date(v.length === 10 ? `${v}T00:00:00Z` : `${v}:00Z`);
    return (
      Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, v.length) === v
    );
  }, "সঠিক তারিখ দিন")
  .default("");
export const recordSchema = z
  .object({
    id: z.string().uuid().optional(),
    kind: z.enum(["study", "document", "visa", "cost", "flight"]),
    plan_id: z.string().uuid().nullable().optional(),
    data: z
      .object({
        title: text,
        intake: text,
        funding: z.enum(["self", "scholarship"]).default("self"),
        scholarship: text,
        course: z
          .enum(["preparatory", "bachelor", "masters", "phd"])
          .default("bachelor"),
        direct: z.boolean().default(true),
        subject: text,
        language: text,
        university: text,
        city: text,
        prep_university: text,
        prep_city: text,
        admission: text,
        offer: text,
        invitation: text,
        admission_date: date,
        offer_date: date,
        invitation_date: date,
        document_type: text,
        translation: text,
        notarization: text,
        legalization: text,
        submission_date: date,
        collection_date: date,
        service: z.enum(["regular", "express"]).default("regular"),
        appointment_type: z
          .enum(["appointment", "walkin"])
          .default("appointment"),
        appointment_date: date,
        interview_date: date,
        questions: text,
        answers: text,
        interview_language: text,
        rating: text,
        tips: text,
        outcome: z
          .enum(["pending", "approved", "rejected", "withdrawn"])
          .default("pending"),
        decision_date: date,
        delivery_date: date,
        reapply: text,
        previous_attempt: text,
        category: text,
        amount: z
          .string()
          .transform(digits)
          .refine(
            (v) => !v || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) <= 1e10),
            "সঠিক টাকার পরিমাণ দিন",
          )
          .default(""),
        currency: z.enum(["BDT", "RUB", "USD"]).default("BDT"),
        payment_status: text,
        payment_date: date,
        tuition_period: text,
        airline: text,
        flight_number: text,
        departure_airport: text,
        arrival_airport: text,
        departure_time: date,
        arrival_time: date,
        departure_timezone: text,
        arrival_timezone: text,
        arrival_status: text,
        arrival_date: date,
        notes: text,
      })
      .strict(),
  })
  .superRefine((v, ctx) => {
    if (
      v.data.decision_date &&
      v.data.submission_date &&
      v.data.decision_date < v.data.submission_date
    )
      ctx.addIssue({
        code: "custom",
        path: ["data", "decision_date"],
        message: "সিদ্ধান্তের তারিখ জমা দেওয়ার আগের হতে পারে না",
      });
    if (v.kind === "flight") {
      for (const key of ["departure_timezone", "arrival_timezone"] as const) {
        try {
          if (v.data[key])
            new Intl.DateTimeFormat("en", { timeZone: v.data[key] });
        } catch {
          ctx.addIssue({
            code: "custom",
            path: ["data", key],
            message: "সঠিক IANA timezone দিন",
          });
        }
      }
    }
  });
export type RecordData = z.output<typeof recordSchema>;
export type Entry = RecordData & { id: string; updated_at: string };
export type Experience = {
  id: string;
  alias: string;
  title: string;
  body: string;
  university: string;
  city: string;
  course: string;
  funding: string;
  outcome: string;
  created_at: string;
};
export const bn = (n: number) => new Intl.NumberFormat("en-US").format(n);
export const labels: Record<string, string> = {
  self: "Self-funded",
  scholarship: "Scholarship",
  preparatory: "Preparatory",
  bachelor: "Bachelor's",
  masters: "Master's",
  phd: "PhD",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  regular: "Regular (4-20 working days)",
  express: "Express (1-3 working days)",
};


