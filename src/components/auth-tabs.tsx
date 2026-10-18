"use client";

import { useState } from "react";
import { ActionForm } from "./action-form";
import { signInWithPassword, signUpWithPassword } from "@/lib/actions";

export function AuthTabs() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  return (
    <div className="email-login-box">
      <div
        style={{
          display: "flex",
          background: "#f1f5f7",
          padding: 3,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={() => setTab("signin")}
          style={{
            flex: 1,
            padding: "8px 12px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            background: tab === "signin" ? "#fff" : "transparent",
            color: tab === "signin" ? "var(--teal)" : "var(--muted)",
            boxShadow: tab === "signin" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setTab("signup")}
          style={{
            flex: 1,
            padding: "8px 12px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            background: tab === "signup" ? "#fff" : "transparent",
            color: tab === "signup" ? "var(--teal)" : "var(--muted)",
            boxShadow: tab === "signup" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          Sign Up
        </button>
      </div>

      {tab === "signin" ? (
        <ActionForm action={signInWithPassword} success="লগইন সফল হচ্ছে…">
          <label>
            Email Address
            <input
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              placeholder="আপনার পাসওয়ার্ড"
              autoComplete="current-password"
            />
          </label>
          <button
            className="button"
            style={{ marginTop: 8, width: "100%", fontWeight: 600 }}
          >
            Sign In with Password
          </button>
        </ActionForm>
      ) : (
        <ActionForm
          action={async (form: FormData) => {
            const res = await signUpWithPassword(form);
            if (res?.message) {
              alert(res.message);
            }
          }}
          success="অ্যাকাউন্ট তৈরি সফল হয়েছে! লগইন হচ্ছে…"
        >
          <label>
            Full Name
            <input
              name="name"
              type="text"
              required
              placeholder="আপনার নাম"
              autoComplete="name"
            />
          </label>
          <label>
            Email Address
            <input
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
              autoComplete="new-password"
            />
          </label>
          <button
            className="button primary"
            style={{ marginTop: 8, width: "100%", fontWeight: 600 }}
          >
            Create Free Account
          </button>
        </ActionForm>
      )}
    </div>
  );
}
