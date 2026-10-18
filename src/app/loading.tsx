import { Shell } from "@/components/shell";

export default function Loading() {
  return (
    <Shell active="/">
      {/* Page Heading Skeleton */}
      <div style={{ marginBottom: 30 }}>
        <div
          className="skeleton"
          style={{ width: 140, height: 14, marginBottom: 12 }}
        />
        <div
          className="skeleton"
          style={{ width: "45%", height: 32, marginBottom: 12, borderRadius: 10 }}
        />
        <div
          className="skeleton"
          style={{ width: "65%", height: 16 }}
        />
      </div>

      {/* 4 Stats Cards Skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18,
          marginBottom: 35,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div className="skeleton" style={{ width: 90, height: 14 }} />
              <div
                className="skeleton"
                style={{ width: 34, height: 34, borderRadius: 10 }}
              />
            </div>
            <div
              className="skeleton"
              style={{ width: 80, height: 36, marginBottom: 10, borderRadius: 8 }}
            />
            <div className="skeleton" style={{ width: 130, height: 12 }} />
          </div>
        ))}
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div className="skeleton-card" style={{ marginBottom: 35, padding: "20px 24px" }}>
        <div className="skeleton" style={{ width: 150, height: 18, marginBottom: 18 }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 42, borderRadius: 8 }}
            />
          ))}
        </div>
      </div>

      {/* 2 Big Content Panels Skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 22,
        }}
      >
        <div className="skeleton-card" style={{ minHeight: 280 }}>
          <div className="skeleton" style={{ width: 180, height: 20, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: "90%", height: 14, marginBottom: 25 }} />
          <div
            className="skeleton"
            style={{ width: "100%", height: 160, borderRadius: 10 }}
          />
        </div>
        <div className="skeleton-card" style={{ minHeight: 280 }}>
          <div className="skeleton" style={{ width: 180, height: 20, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: "90%", height: 14, marginBottom: 25 }} />
          <div
            className="skeleton"
            style={{ width: "100%", height: 160, borderRadius: 10 }}
          />
        </div>
      </div>
    </Shell>
  );
}
