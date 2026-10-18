import { Shell } from "@/components/shell";

export default function ExperiencesLoading() {
  return (
    <Shell active="/experiences">
      {/* Heading Skeleton */}
      <div style={{ marginBottom: 30 }}>
        <div
          className="skeleton"
          style={{ width: 140, height: 14, marginBottom: 12 }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              className="skeleton"
              style={{ width: "40%", height: 32, marginBottom: 12, borderRadius: 10 }}
            />
            <div
              className="skeleton"
              style={{ width: "60%", height: 16 }}
            />
          </div>
          <div
            className="skeleton"
            style={{ width: 140, height: 42, borderRadius: 8 }}
          />
        </div>
      </div>

      {/* Experience Cards Grid Skeleton (6 cards) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 24,
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton-card" style={{ minHeight: 240 }}>
            {/* Author row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div
                className="skeleton"
                style={{ width: 42, height: 42, borderRadius: "50%" }}
              />
              <div style={{ flex: 1 }}>
                <div
                  className="skeleton"
                  style={{ width: 110, height: 14, marginBottom: 6 }}
                />
                <div className="skeleton" style={{ width: 70, height: 11 }} />
              </div>
            </div>

            {/* Title & Tags */}
            <div
              className="skeleton"
              style={{ width: "85%", height: 20, marginBottom: 14, borderRadius: 6 }}
            />
            <div
              className="skeleton"
              style={{ width: "100%", height: 14, marginBottom: 8 }}
            />
            <div
              className="skeleton"
              style={{ width: "70%", height: 14, marginBottom: 20 }}
            />

            {/* Footer tags */}
            <div style={{ display: "flex", gap: 8 }}>
              <div
                className="skeleton"
                style={{ width: 65, height: 24, borderRadius: 6 }}
              />
              <div
                className="skeleton"
                style={{ width: 80, height: 24, borderRadius: 6 }}
              />
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}
