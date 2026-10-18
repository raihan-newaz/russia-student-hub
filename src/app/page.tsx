import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  UsersRound,
  Building2,
  MapPin,
  BadgeCheck,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  Plane,
  Clock3,
  Plus,
  MoveUpRight,
  ExternalLink,
  Globe,
  CalendarCheck,
  CreditCard,
} from "lucide-react";
import { Shell, Heading, Empty } from "@/components/shell";
import { ExperienceCard } from "@/components/experience-card";
import { identity, dashboard, experiences, isDemo } from "@/lib/data";
import { bn, labels } from "@/lib/model";
import {
  DEFAULT_CITIES,
  DEFAULT_UNIVERSITIES,
  DEFAULT_INTAKES,
} from "@/lib/constants";
export const dynamic = "force-dynamic";
const categories: Record<string, string> = {
  visa: "ভিসা আবেদন",
  airfare: "বিমান টিকিট",
  legalization: "ডকুমেন্ট লিগালাইজেশন",
  tuition: "টিউশন ফি",
  admission: "অ্যাডমিশন",
  invitation: "ইনভিটেশন ফি",
  translation: "অনুবাদ",
  notarization: "নোটারি",
  medical: "মেডিকেল",
  agency: "সার্ভিস চার্জ",
  accommodation: "আবাসন",
  other: "অন্যান্য",
};
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters = Object.fromEntries(
    [
      "intake",
      "course",
      "funding",
      "university",
      "city",
      "service",
      "outcome",
    ].map((k) => [k, typeof raw[k] === "string" ? raw[k] : ""]),
  );
  const [user, stats, stories] = await Promise.all([
    identity(),
    dashboard(filters),
    experiences(),
  ]);
  const approved = stats.outcomes.approved || 0,
    rejected = stats.outcomes.rejected || 0;
  const rate =
    approved + rejected
      ? Math.round((approved / (approved + rejected)) * 100)
      : null;
  const cards = [
    {
      label: "মোট শিক্ষার্থী",
      value: bn(stats.students),
      sub: "Active Community Profiles",
      icon: UsersRound,
      color: "teal",
    },
    {
      label: "বিশ্ববিদ্যালয়",
      value: bn(stats.universities),
      sub: `রাশিয়ার ${bn(stats.cities)}টি শহরে`,
      icon: Building2,
      color: "blue",
    },
    {
      label: "ভিসা সাফল্যের হার",
      value: rate === null ? "—" : `${bn(rate)}%`,
      sub: `${bn(approved + rejected)}টি সিদ্ধান্তের ভিত্তিতে`,
      icon: BadgeCheck,
      color: "green",
    },
    {
      label: "মোট ভিসা আবেদন",
      value: stats.suppressed ? "—" : bn(stats.applications),
      sub: "সব আবেদনসহ",
      icon: Plane,
      color: "orange",
    },
  ];
  return (
    <Shell
      alias={user?.profile?.alias}
      avatar={user?.avatar}
      email={user?.email}
      name={user?.name}
      unreadNotices={user?.unreadNotices}
      admin={user?.admin}
      demo={isDemo()}
    >
      <Heading
        eyebrow="Bangladesh to Russia · Student Hub"
        title="রাশিয়ায় উচ্চশিক্ষা — তথ্যভিত্তিক ও সহজ।"
        description="বাংলাদেশি শিক্ষার্থীদের বাস্তব অভিজ্ঞতা, ভিসা ট্র্যাকিং ও খরচের উন্মুক্ত কমিউনিটি ডেটাবেজ।"
        action={
          <Link href="/journey" className="button primary">
            <Plus size={18} />
            Add My Journey
          </Link>
        }
      />
      <div className="community-strip">
        <span>
          <span className="live-dot" /> Verified Student Community
        </span>
        <span>
          <ShieldCheck size={14} /> 100% গোপনীয় ও উন্মুক্ত তথ্য
        </span>
      </div>
      <section className="stats-grid">
        {cards.map(({ label, value, sub, icon: Icon, color }) => (
          <article className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <span className={`stat-icon ${color}`}>
                <Icon size={21} />
              </span>
            </div>
            <strong>{value}</strong>
            <small>{sub}</small>
          </article>
        ))}
      </section>
      <form className="filter-panel" method="get">
        <div className="filter-label">
          <SlidersHorizontal size={17} />
          <strong>ফিল্টার ও অনুসন্ধান</strong>
          <Link href="/">Reset</Link>
        </div>
        <div className="filter-fields">
          <label>
            Intake
            <select name="intake" defaultValue={filters.intake}>
              <option value="">All Intakes</option>
              {DEFAULT_INTAKES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label>
            Degree
            <select name="course" defaultValue={filters.course}>
              <option value="">All Degrees</option>
              {["preparatory", "bachelor", "masters", "phd"].map((v) => (
                <option key={v} value={v}>
                  {labels[v]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Funding
            <select name="funding" defaultValue={filters.funding}>
              <option value="">All Funding</option>
              <option value="self">Self-funded</option>
              <option value="scholarship">Scholarship</option>
            </select>
          </label>
          <label>
            City
            <select name="city" defaultValue={filters.city}>
              <option value="">All Cities</option>
              {DEFAULT_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <button className="button primary filter-submit">
            Filter <ArrowRight size={16} />
          </button>
        </div>
        <details
          className="advanced-filters"
          open={Boolean(
            filters.university || filters.service || filters.outcome,
          )}
        >
          <summary>More Filters</summary>
          <div className="form-grid">
            <label>
              University
              <select name="university" defaultValue={filters.university}>
                <option value="">All Universities</option>
                {DEFAULT_UNIVERSITIES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Visa Service
              <select name="service" defaultValue={filters.service}>
                <option value="">All Services</option>
                <option value="regular">Regular (4-20 working days)</option>
                <option value="express">Express (1-3 working days)</option>
              </select>
            </label>
            <label>
              Visa Outcome
              <select name="outcome" defaultValue={filters.outcome}>
                <option value="">All Outcomes</option>
                {["pending", "approved", "rejected", "withdrawn"].map((v) => (
                  <option value={v} key={v}>
                    {labels[v]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </details>
      </form>
      <div className="dashboard-columns">
        <section className="panel visa-panel">
          <div className="section-title">
            <div>
              <h2>ভিসা আবেদনের চিত্র</h2>
              <p>প্রতিটি ধাপে, পাশে আছে কমিউনিটি</p>
            </div>
            <span className="subtle-tag">আবেদনভিত্তিক</span>
          </div>
          {stats.suppressed || !stats.applications ? (
            <Empty
              title="আরও অভিজ্ঞতার অপেক্ষায়"
              description={
                stats.suppressed
                  ? "শিক্ষার্থীদের তথ্য জমা হলে এই অংশের পরিসংখ্যান দেখানো হবে।"
                  : "ভিসা আবেদনের তথ্য যোগ হলে পাই-চার্ট দৃশ্যমান হবে।"
              }
            />
          ) : (
            <div className="visa-chart">
              <div
                className="donut"
                style={{
                  background: `conic-gradient(var(--teal) 0 ${(approved / stats.applications) * 100}%, #eebc65 ${(approved / stats.applications) * 100}% ${((approved + (stats.outcomes.pending || 0)) / stats.applications) * 100}%, #e3958c 0)`,
                }}
              >
                <div>
                  <small>মোট আবেদন</small>
                  <strong>{bn(stats.applications)}</strong>
                  <span>শিক্ষার্থীদের দেওয়া তথ্য</span>
                </div>
              </div>
              <div className="chart-legend">
                {["approved", "pending", "rejected", "withdrawn"]
                  .filter((k) => stats.outcomes[k])
                  .map((k) => (
                    <div key={k}>
                      <span className={`legend-dot ${k}`} />
                      <span>{labels[k]}</span>
                      <strong>{bn(stats.outcomes[k])}</strong>
                      <small>
                        {bn(
                          Math.round(
                            (stats.outcomes[k] / stats.applications) * 100,
                          ),
                        )}
                        %
                      </small>
                    </div>
                  ))}
              </div>
            </div>
          )}
          <div className="panel-foot">
            <Info size={14} /> অপেক্ষমাণ আবেদন অনুমোদনের হার গণনায় অন্তর্ভুক্ত
            নয়
          </div>
        </section>
        <section className="panel">
          <div className="section-title">
            <div>
              <h2>কে কোন পথে যাচ্ছেন</h2>
              <p>কোর্স ও অর্থায়নের একটি ধারণা</p>
            </div>
            <GraduationIcon />
          </div>
          <div className="funding-grid">
            {["self", "scholarship"].map((k) => (
              <div key={k}>
                <span>{labels[k]}</span>
                <strong>
                  {stats.suppressed ? "—" : bn(stats.funding[k] || 0)}
                  <small> জন</small>
                </strong>
              </div>
            ))}
          </div>
          <div className="course-bars">
            {["preparatory", "bachelor", "masters", "phd"].map((k) => (
              <div key={k}>
                <div>
                  <span>{labels[k]}</span>
                  <strong>
                    {stats.suppressed ? "—" : `${bn(stats.courses[k] || 0)} জন`}
                  </strong>
                </div>
                <div className="bar-track">
                  <span
                    style={{
                      width: `${stats.students ? ((stats.courses[k] || 0) / stats.students) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="dashboard-columns secondary">
        <section className="panel">
          <div className="section-title">
            <div>
              <h2>ভিসা ডেলিভারির সময় (কর্মদিবস)</h2>
              <p>আবেদন জমা থেকে পাসপোর্ট ডেলিভারি · Working Days</p>
            </div>
            <Clock3 size={22} />
          </div>
          <div className="processing-grid">
            {["regular", "express"].map((service) => {
              const p = stats.processing.find((p) => p.service === service);
              return (
                <div key={service}>
                  <span
                    className={`badge ${service === "express" ? "amber" : "neutral"}`}
                  >
                    {labels[service]}
                  </span>
                  <strong>
                    {p ? bn(Math.round(p.days)) : "—"} <small>কর্মদিবস</small>
                  </strong>
                  <p>
                    {p
                      ? `${bn(p.samples)}টি আবেদনের ভিত্তিতে`
                      : "এখনো পর্যাপ্ত তথ্য নেই"}
                  </p>
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 18,
              padding: "14px 16px",
              background: "#f0fdf4",
              borderRadius: 10,
              border: "1px solid #bbf7d0",
              fontSize: 13,
              color: "#166534",
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <span>🏛️</span> রাশিয়ান এম্বাসি (ঢাকা) ভিসা শিডিউল ও অফিসিয়াল ফি:
            </div>
            <p style={{ margin: "0 0 10px 0", color: "#14532d" }}>
              ঢাকা রাশিয়ান এম্বাসির কনস্যুলার সেকশন প্রতি সপ্তাহে <strong>রবিবার, মঙ্গলবার ও বৃহস্পতিবার (Sunday, Tuesday, Thursday)</strong> সকাল 8:45 থেকে 11:45 পর্যন্ত ভিসা আবেদন গ্রহণ ও পাসপোর্ট ডেলিভারি করে।
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8, fontSize: 12 }}>
              <div style={{ background: "#ffffff", padding: "10px 12px", borderRadius: 8, border: "1px solid #dcfce7" }}>
                <strong style={{ color: "#1e293b", display: "block", marginBottom: 2 }}>Single Entry Visa (4-20 working days)</strong>
                <div>সার্ভিস ফি: ৳ 10,000</div>
                <div>কনভেনিয়েন্স ফি: ৳ 1,000</div>
                <div style={{ fontWeight: 700, color: "#047857", marginTop: 3 }}>সর্বমোট ফি: ৳ 11,150</div>
              </div>
              <div style={{ background: "#ffffff", padding: "10px 12px", borderRadius: 8, border: "1px solid #dcfce7" }}>
                <strong style={{ color: "#1e293b", display: "block", marginBottom: 2 }}>Single Entry Visa (1-3 working days)</strong>
                <div>সার্ভিস ফি: ৳ 20,000</div>
                <div>কনভেনিয়েন্স ফি: ৳ 1,000</div>
                <div style={{ fontWeight: 700, color: "#b45309", marginTop: 3 }}>সর্বমোট ফি: ৳ 21,150</div>
              </div>
            </div>
            <div style={{ marginTop: 8, background: "#ffffff", padding: "10px 12px", borderRadius: 8, border: "1px solid #dcfce7", fontSize: 12 }}>
              <strong style={{ color: "#1e293b", display: "block", marginBottom: 2 }}>Legalization (For 1 Page)</strong>
              <div>সার্ভিস ফি: ৳ 8,000 | কনভেনিয়েন্স ফি: ৳ 1,000</div>
              <div style={{ fontWeight: 700, color: "#1e3a8a", marginTop: 3 }}>সর্বমোট ফি (প্রতি পৃষ্ঠা): ৳ 9,150</div>
            </div>
          </div>
          <div className="note-line" style={{ marginTop: 12 }}>
            ব্যক্তিভেদে ও এম্বাসির ছুটির ওপর নির্ভর করে সময় ভিন্ন হতে পারে।
          </div>
        </section>
        <section className="panel">
          <div className="section-title">
            <div>
              <h2>খরচের একটি ধারণা</h2>
              <p>অফিশিয়াল রেট ও বাস্তব খরচের তালিকা</p>
            </div>
            <span className="money-icon">৳</span>
          </div>
          <div className="cost-table">
            <div>
              <span>
                ভিসা আবেদন (Regular Single Entry · 4-20 working days)
                <small>সার্ভিস: ৳ 10,000 + কনভেনিয়েন্স: ৳ 1,000 + ভ্যাট</small>
              </span>
              <strong>৳ 11,150</strong>
            </div>
            <div>
              <span>
                ভিসা আবেদন (Express Single Entry · 1-3 working days)
                <small>সার্ভিস: ৳ 20,000 + কনভেনিয়েন্স: ৳ 1,000 + ভ্যাট</small>
              </span>
              <strong>৳ 21,150</strong>
            </div>
            <div>
              <span>
                ডকুমেন্ট লিগালাইজেশন (প্রতি 1 পৃষ্ঠা)
                <small>সার্ভিস: ৳ 8,000 + কনভেনিয়েন্স: ৳ 1,000 + ভ্যাট</small>
              </span>
              <strong>৳ 9,150</strong>
            </div>
            <div>
              <span>
                মাস্টার্স লিগালাইজেশন (সার্টিফিকেট + মার্কশিট · 2 পৃষ্ঠা)
                <small>ব্যাচেলর সার্টিফিকেট ও ট্রান্সক্রিপ্ট সত্যায়ন (2 × ৳ 9,150)</small>
              </span>
              <strong>৳ 18,300</strong>
            </div>
            <div>
              <span>
                বিমান টিকিট (ঢাকা → রাশিয়া এয়ারফেয়ার মধ্যম মান)
                <small>Air Arabia / Gulf Air / FlyDubai টিকিটের গড় খরচ</small>
              </span>
              <strong>৳ 68,000</strong>
            </div>
            <div>
              <span>
                বিশ্ববিদ্যালয় টিউশন ফি (বার্ষিক মধ্যম মান)
                <small>কোর্স ও বিশ্ববিদ্যালয়ভেদে আলাদা হতে পারে</small>
              </span>
              <strong>RUB 185,000</strong>
            </div>
          </div>
          <div
            style={{
              marginTop: 14,
              padding: "12px 14px",
              background: "#eff6ff",
              borderRadius: 8,
              border: "1px solid #bfdbfe",
              fontSize: 12.5,
              color: "#1e40af",
              lineHeight: 1.5,
            }}
          >
            💡 <strong>e-Apostille (ই-অ্যাপোস্টিল) সংক্রান্ত তথ্য:</strong> বর্তমানে অনেক রাশিয়ান বিশ্ববিদ্যালয়ে শুধু <strong>e-Apostille</strong> প্রদান করলেই অ্যাডমিশন সম্পন্ন হচ্ছে, রাশিয়ান এম্বাসিতে আলাদা লিগালাইজেশনের প্রয়োজন হচ্ছে না। আবেদন করার পূর্বে আপনার বিশ্ববিদ্যালয়ের অ্যাডমিশন রিকোয়ারমেন্ট যাচাই করে নিন।
          </div>
        </section>
      </div>
      <section className="panel" style={{ marginTop: 24, padding: "24px" }}>
        <div className="section-title">
          <div>
            <div className="eyebrow">অফিশিয়াল পোর্টাল ও রিসোর্স</div>
            <h2>প্রয়োজনীয় অফিশিয়াল লিংকসমূহ (Essential Links)</h2>
            <p>ভিসা আবেদন ফর্ম পূরণ, ঢাকা এম্বাসি অ্যাপয়েন্টমেন্ট বুকিং ও ফি পেমেন্টের সরাসরি লিংক</p>
          </div>
          <ExternalLink size={24} style={{ color: "var(--teal)" }} />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: 16,
            marginTop: 16,
          }}
        >
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="badge neutral">Step 1 · Application Form</span>
                <Globe size={18} color="#0284c7" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a" }}>
                Online Visa Application
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                রাশিয়ান পররাষ্ট্র মন্ত্রণালয়ের (MFA) অফিশিয়াল ইলেকট্রনিক ভিসা আবেদন ফর্ম পূরণ পোর্টাল (Electronic Visa Application Form)।
              </p>
            </div>
            <a
              href="https://visa.kdmid.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="button primary"
              style={{
                marginTop: 16,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 13.5,
              }}
            >
              visa.kdmid.ru <ArrowUpRight size={16} />
            </a>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="badge amber">Step 2 · Appointment</span>
                <CalendarCheck size={18} color="#d97706" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a" }}>
                Electronic Appointment Booking
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                ঢাকা রাশিয়ান এম্বাসির কনস্যুলার সেকশনে ফাইল জমা দেওয়া ও ইন্টারভিউয়ের জন্য অনলাইন স্লট বুকিং সিস্টেম।
              </p>
            </div>
            <a
              href="https://dhaka.kdmid.ru/queue-en/orderinfo.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="button primary"
              style={{
                marginTop: 16,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 13.5,
              }}
            >
              dhaka.kdmid.ru (Appointment) <ArrowUpRight size={16} />
            </a>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="badge primary">Step 3 · Fee Payment</span>
                <CreditCard size={18} color="#0d9488" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a" }}>
                Visa Fee Payment Portal
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                ভিসা ও লিগালাইজেশন সার্ভিসের অফিসিয়াল পেমেন্ট পোর্টাল (CBC)। অনলাইনে ফি পরিশোধের সরাসরি প্ল্যাটফর্ম।
              </p>
            </div>
            <a
              href="https://pay-russia.visa-cbc.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="button primary"
              style={{
                marginTop: 16,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 13.5,
              }}
            >
              pay-russia.visa-cbc.com <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>
      <section className="experiences-section">
        <div className="section-title">
          <div>
            <div className="eyebrow">অভিজ্ঞতা থেকে শেখা</div>
            <h2>তাঁদের গল্প, আপনার প্রস্তুতি</h2>
            <p>ইন্টারভিউয়ের প্রশ্ন, প্রস্তুতি আর বাস্তব অভিজ্ঞতা</p>
          </div>
          <Link href="/experiences" className="text-link">
            সব অভিজ্ঞতা <ArrowRight size={17} />
          </Link>
        </div>
        <div className="experience-grid">
          {stories.items.slice(0, 3).map((item) => (
            <ExperienceCard key={item.id} item={item} />
          ))}
        </div>
        {!stories.items.length && (
          <Empty
            title="প্রথম অভিজ্ঞতাটি আপনার হোক"
            description="আপনার ছোট একটি অভিজ্ঞতা অন্য কারও বড় সহায়তা হতে পারে।"
          />
        )}
      </section>
      <section className="contribute-banner">
        <div className="contribute-symbol">
          <MoveUpRight size={38} />
        </div>
        <div>
          <h2>আপনার অভিজ্ঞতাও কারও পথ সহজ করতে পারে।</h2>
          <p>কয়েক মিনিটে নিজের তথ্য যোগ করুন। পরিচয় থাকবে আপনার নিয়ন্ত্রণে।</p>
        </div>
        <Link className="button white" href="/journey">
          Start My Journey <ArrowUpRight size={18} />
        </Link>
      </section>
      <p className="data-note">
        <Info size={14} /> সব তথ্য শিক্ষার্থীদের নিজস্ব অভিজ্ঞতার ভিত্তিতে।
        সর্বশেষ আপডেট:{" "}
        {stats.updated
          ? new Date(stats.updated).toLocaleDateString("bn-BD", {
              timeZone: "Asia/Dhaka",
            })
          : "এখনো তথ্য নেই"}
        ।
      </p>
    </Shell>
  );
}
function GraduationIcon() {
  return <Building2 size={22} className="muted" />;
}
