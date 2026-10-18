import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Route,
  UserRound,
  GraduationCap,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  Heart,
  Bell,
} from "lucide-react";
import { ProfileMenu } from "./profile-menu";
const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/experiences", label: "Stories", icon: BookOpen },
  { href: "/journey", label: "My Journey", icon: Route },
  { href: "/account", label: "Account", icon: UserRound },
];
export function Shell({
  children,
  active = "/",
  alias,
  avatar,
  email,
  name,
  unreadNotices = 0,
  admin = false,
  demo = false,
}: {
  children: React.ReactNode;
  active?: string;
  alias?: string;
  avatar?: string | null;
  email?: string;
  name?: string | null;
  unreadNotices?: number;
  admin?: boolean;
  demo?: boolean;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <GraduationCap size={26} />
          </span>
          <span>
            Russia<span className="brand-sub">STUDENT HUB</span>
          </span>
        </Link>
        <div className="nav-caption">আপনার নতুন যাত্রার সঙ্গী</div>
        <nav>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${active === href ? "active" : ""}`}
            >
              <Icon size={20} />
              {label}
              {active === href && <span className="nav-dot" />}
            </Link>
          ))}
          {admin && (
            <Link
              href="/admin"
              className={`nav-link ${active === "/admin" ? "active" : ""}`}
            >
              <ShieldCheck size={20} />
              Admin
            </Link>
          )}
        </nav>
        <div className="sidebar-note">
          <div className="mini-globe">
            БД <span>→</span> RU
          </div>
          <h3>স্বপ্ন থেকে গন্তব্যে</h3>
          <p>
            সঠিক তথ্য, বাস্তব অভিজ্ঞতা।
            <br />
            একসঙ্গে পথ চলা সহজ হোক।
          </p>
          <Link href="/journey">
            আপনার যাত্রা যোগ করুন <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="sidebar-footer">
          <span className="tiny-dot" /> শিক্ষার্থীদের জন্য, শিক্ষার্থীদের পাশে
          <p>
            Made with <Heart size={11} /> in Bangladesh
          </p>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <div className="breadcrumb">
            কমিউনিটি <span>/</span>{" "}
            <strong>
              {links.find((l) => l.href === active)?.label || "Admin"}
            </strong>
          </div>
          <div className="top-actions">
            <Link
              className="icon-button"
              href="/account#notifications"
              aria-label="নোটিফিকেশন"
              style={{ position: "relative" }}
            >
              <Bell size={19} />
              {unreadNotices > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 0 2px #fff",
                  }}
                >
                  {unreadNotices > 9 ? "9+" : unreadNotices}
                </span>
              )}
            </Link>
            <ProfileMenu
              alias={alias}
              avatar={avatar}
              email={email}
              name={name}
              admin={admin}
            />
          </div>
        </header>
        {demo && (
          <div className="demo-banner">
            ডেমো প্রিভিউ · এখানে দেখানো তথ্য কাল্পনিক, বাস্তব শিক্ষার্থীদের
            পরিসংখ্যান নয়।
          </div>
        )}
        <main>{children}</main>
        <footer className="page-footer">
          <span>© {new Date().getFullYear()} Russia Student Hub</span>
          <span>
            <ShieldCheck size={14} /> আপনার পরিচয়, আপনার নিয়ন্ত্রণে
          </span>
          <Link href="/privacy">গোপনীয়তা ও তথ্যনীতি</Link>
        </footer>
      </div>
      <nav className="mobile-nav">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={active === href ? "active" : ""}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
export function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Empty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty">
      <MapPin size={32} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.255 21.35 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.13z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.255 2.65 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

export function LoginGate() {
  return (
    <div className="login-gate">
      <span className="brand-icon">
        <GraduationCap size={34} />
      </span>
      <h2>Start Your Russian Study Journey</h2>
      <p>
        একটি একাউন্টে Admission, Visa, Expense ও Flight-এর সব ট্র্যাকিং।
        <br />
        নিজের সুবিধামতো যেকোনো সময় তথ্য আপডেট করুন।
      </p>
      <a className="button primary" href="/auth/login">
        <GoogleIcon size={18} /> Continue with Google{" "}
        <ArrowUpRight size={18} />
      </a>
      <small>
        <ShieldCheck size={14} /> আপনার Google Name ও Email কখনো Public হবে না
      </small>
    </div>
  );
}
