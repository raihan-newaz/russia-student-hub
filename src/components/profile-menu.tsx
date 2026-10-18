"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Route,
  BookOpen,
  Bell,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { GoogleIcon } from "./shell";

export function ProfileMenu({
  alias,
  avatar,
  email,
  name,
  admin,
}: {
  alias?: string;
  avatar?: string | null;
  email?: string;
  name?: string | null;
  admin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!alias && !email) {
    return (
      <Link
        href="/account"
        className="login-button"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "9px 18px",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        Login
      </Link>
    );
  }

  // When Gmail profile image is not available, always show an English initial letter
  const getEnglishInitial = (): string => {
    if (name) {
      const match = name.trim().match(/^[a-zA-Z]/);
      if (match) return match[0].toUpperCase();
    }
    if (email) {
      const prefix = email.split("@")[0].trim();
      const match = prefix.match(/[a-zA-Z]/);
      if (match) return match[0].toUpperCase();
    }
    if (alias) {
      const match = alias.trim().match(/^[a-zA-Z]/);
      if (match) return match[0].toUpperCase();
    }
    const anyMatch = `${name || ""} ${email || ""} ${alias || ""}`.match(/[a-zA-Z]/);
    if (anyMatch) return anyMatch[0].toUpperCase();
    return "U";
  };

  const initial = getEnglishInitial();

  return (
    <div className="profile-menu-container" ref={menuRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="profile-avatar-button"
        aria-label="Profile Menu"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "transparent",
          border: "none",
          padding: 2,
          cursor: "pointer",
          borderRadius: 9999,
          transition: "transform 0.15s ease",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 40,
            height: 40,
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 0 0 2px #fff, 0 0 0 4px var(--teal)",
            backgroundColor: "var(--teal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {avatar && !imgError ? (
            <img
              src={avatar}
              alt="Profile"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
                display: "block",
              }}
              onError={() => setImgError(true)}
            />
          ) : (
            <span
              style={{
                color: "#fff",
                fontSize: 17,
                fontWeight: 700,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                textTransform: "uppercase",
                lineHeight: 1,
                letterSpacing: "0.5px",
              }}
            >
              {initial}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div
          className="profile-dropdown"
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            right: 0,
            width: 250,
            background: "#ffffff",
            borderRadius: 14,
            boxShadow: "0 12px 36px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)",
            zIndex: 1000,
            padding: "8px 0",
            overflow: "hidden",
            animation: "fadeIn 0.15s ease",
          }}
        >
          {/* Header Info */}
          <div
            style={{
              padding: "12px 18px 14px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                overflow: "hidden",
                background: "var(--teal)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              {avatar && !imgError ? (
                <img
                  src={avatar}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    textTransform: "uppercase",
                    lineHeight: 1,
                  }}
                >
                  {initial}
                </span>
              )}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#0f172a",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {name || alias}
              </div>
              {email && (
                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                >
                  {email}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ padding: "6px" }}>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="dropdown-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                fontSize: 13,
                color: "#334155",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <User size={16} color="#64748b" /> Account Settings
            </Link>

            <Link
              href="/journey"
              onClick={() => setOpen(false)}
              className="dropdown-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                fontSize: 13,
                color: "#334155",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <Route size={16} color="#64748b" /> My Journey
            </Link>

            <Link
              href="/account#stories"
              onClick={() => setOpen(false)}
              className="dropdown-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                fontSize: 13,
                color: "#334155",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <BookOpen size={16} color="#64748b" /> My Stories
            </Link>

            <Link
              href="/account#notifications"
              onClick={() => setOpen(false)}
              className="dropdown-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                fontSize: 13,
                color: "#334155",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <Bell size={16} color="#64748b" /> Notifications
            </Link>

            {admin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="dropdown-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  fontSize: 13,
                  color: "#0f766e",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                <ShieldCheck size={16} color="#0f766e" /> Admin Panel
              </Link>
            )}
          </div>

          {/* Logout Action */}
          <div
            style={{
              borderTop: "1px solid #f1f5f9",
              padding: "6px",
            }}
          >
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="dropdown-item logout"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: 13,
                  color: "#dc2626",
                  background: "transparent",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 500,
                  textAlign: "left",
                }}
              >
                <LogOut size={16} color="#dc2626" /> Logout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
