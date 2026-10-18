import { Shell } from "@/components/shell";

export default function AccountLoading() {
  return (
    <Shell active="/account">
      {/* Heading Skeleton */}
      <div style={{ marginBottom: 30 }}>
        <div
          className="skeleton"
          style={{ width: "30%", height: 32, marginBottom: 12, borderRadius: 10 }}
        />
        <div
          className="skeleton"
          style={{ width: "50%", height: 16 }}
        />
      </div>

      <div style={{ display: "grid", gap: 24, maxWidth: 650 }}>
        {/* Profile Card Skeleton */}
        <div
          className="skeleton-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "20px 24px",
          }}
        >
          <div
            className="skeleton"
            style={{ width: 56, height: 56, borderRadius: "50%" }}
          />
          <div style={{ flex: 1 }}>
            <div
              className="skeleton"
              style={{ width: 140, height: 18, marginBottom: 8, borderRadius: 6 }}
            />
            <div className="skeleton" style={{ width: 200, height: 13 }} />
          </div>
        </div>

        {/* Profile Settings Panel */}
        <div className="skeleton-card" style={{ padding: "26px 28px" }}>
          <div
            className="skeleton"
            style={{ width: 130, height: 20, marginBottom: 20, borderRadius: 6 }}
          />
          <div className="skeleton" style={{ width: 90, height: 14, marginBottom: 8 }} />
          <div
            className="skeleton"
            style={{ width: "100%", height: 42, marginBottom: 22, borderRadius: 8 }}
          />
          <div
            className="skeleton"
            style={{ width: 120, height: 38, borderRadius: 8 }}
          />
        </div>

        {/* Security / Privacy Panel */}
        <div className="skeleton-card" style={{ padding: "26px 28px" }}>
          <div
            className="skeleton"
            style={{ width: 150, height: 20, marginBottom: 16, borderRadius: 6 }}
          />
          <div
            className="skeleton"
            style={{ width: "85%", height: 14, marginBottom: 10 }}
          />
          <div className="skeleton" style={{ width: "65%", height: 14 }} />
        </div>
      </div>
    </Shell>
  );
}
