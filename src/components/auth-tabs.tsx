"use client";

import { useState } from "react";
import { ActionForm } from "./action-form";
import {
  signInWithPassword,
  signUpWithPassword,
  resetPasswordRequest,
} from "@/lib/actions";

export function AuthTabs() {
  const [tab, setTab] = useState<"signin" | "signup" | "forgot">("signin");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [signUpSuccessMsg, setSignUpSuccessMsg] = useState("");

  return (
    <div className="email-login-box">
      {tab !== "forgot" ? (
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
            onClick={() => {
              setTab("signin");
              setResetSuccess(false);
              setSignUpSuccessMsg("");
            }}
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
            onClick={() => {
              setTab("signup");
              setResetSuccess(false);
              setSignUpSuccessMsg("");
            }}
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
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <strong style={{ fontSize: 15 }}>পাসওয়ার্ড রিসেট করুন</strong>
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setResetSuccess(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--teal)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            ← ফিরে যান
          </button>
        </div>
      )}

      {tab === "signin" && (
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Password</span>
              <button
                type="button"
                onClick={() => setTab("forgot")}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 12,
                  color: "var(--teal)",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Forgot Password?
              </button>
            </div>
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
      )}

      {tab === "signup" && (
        signUpSuccessMsg ? (
          <div
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: 8,
              padding: 16,
              fontSize: 13,
              color: "#065f46",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: 6 }}>ইমেইল চেক করুন!</p>
            <p>{signUpSuccessMsg}</p>
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setSignUpSuccessMsg("");
              }}
              className="button"
              style={{ marginTop: 12, width: "100%", fontSize: 12 }}
            >
              Sign In এ যান
            </button>
          </div>
        ) : (
          <ActionForm
            action={async (form: FormData) => {
              const res = await signUpWithPassword(form);
              if (res?.message) {
                setSignUpSuccessMsg(res.message);
              }
            }}
            success="অ্যাকাউন্ট তৈরি হচ্ছে…"
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
        )
      )}

      {tab === "forgot" && (
        resetSuccess ? (
          <div
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: 8,
              padding: 16,
              fontSize: 13,
              color: "#065f46",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: 6 }}>ইমেইল পাঠানো হয়েছে!</p>
            <p>
              পাসওয়ার্ড রিসেটের লিংক আপনার ইমেইলে পৌঁছেছে। ইনবক্স অথবা স্প্যাম (Spam) ফোল্ডার চেক করে লিংকে ক্লিক করুন।
            </p>
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setResetSuccess(false);
              }}
              className="button"
              style={{ marginTop: 12, width: "100%", fontSize: 12 }}
            >
              Sign In এ ফিরে যান
            </button>
          </div>
        ) : (
          <ActionForm
            action={async (form: FormData) => {
              await resetPasswordRequest(form);
              setResetSuccess(true);
            }}
            success="রিসেট লিংক পাঠানো হয়েছে…"
          >
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
              আপনার অ্যাকাউন্টের ইমেইল ঠিকানাটি দিন। আমরা পাসওয়ার্ড রিসেট করার লিংক পাঠিয়ে দেব।
            </p>
            <label>
              Registered Email
              <input
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                autoComplete="email"
              />
            </label>
            <button
              className="button primary"
              style={{ marginTop: 8, width: "100%", fontWeight: 600 }}
            >
              Send Reset Link
            </button>
          </ActionForm>
        )
      )}
    </div>
  );
}
