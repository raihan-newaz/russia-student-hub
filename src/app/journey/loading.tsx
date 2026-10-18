import { Shell } from "@/components/shell";

export default function JourneyLoading() {
  return (
    <Shell active="/journey">
      {/* Heading Skeleton */}
      <div style={{ marginBottom: 30 }}>
        <div
          className="skeleton"
          style={{ width: 140, height: 14, marginBottom: 12 }}
        />
        <div
          className="skeleton"
          style={{ width: "35%", height: 32, marginBottom: 12, borderRadius: 10 }}
        />
        <div
          className="skeleton"
          style={{ width: "55%", height: 16 }}
        />
      </div>

      <div style={{ display: "grid", gap: 24, maxWidth: 900 }}>
        {/* Step tracker card skeleton */}
        <div className="skeleton-card" style={{ padding: "26px 28px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div className="skeleton" style={{ width: 160, height: 20 }} />
            <div
              className="skeleton"
              style={{ width: 100, height: 34, borderRadius: 8 }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 48, borderRadius: 8 }}
              />
            ))}
          </div>
        </div>

        {/* Timeline item cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card" style={{ padding: "22px 26px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div
                className="skeleton"
                style={{ width: 180, height: 18, borderRadius: 6 }}
              />
              <div
                className="skeleton"
                style={{ width: 70, height: 22, borderRadius: 6 }}
              />
            </div>
            <div
              className="skeleton"
              style={{ width: "80%", height: 14, marginBottom: 8 }}
            />
            <div className="skeleton" style={{ width: "40%", height: 12 }} />
          </div>
        ))}
      </div>
    </Shell>
  );
}
