import { notFound } from "next/navigation";
import { isDemo } from "@/lib/data";
export const dynamic = "force-dynamic";
export default function Preview() {
  if (!isDemo()) notFound();
  return (
    <div
      style={{
        padding: 20,
        display: "flex",
        justifyContent: "center",
        gap: 24,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1 style={{ fontSize: 20 }}>Mobile preview · 360px</h1>
        <p className="muted">কাল্পনিক তথ্য দিয়ে responsive preview</p>
        <iframe
          title="360 pixel mobile preview"
          src="/"
          width="360"
          height="780"
          style={{
            border: "1px solid #dce5e1",
            borderRadius: 14,
            marginTop: 15,
            background: "white",
            maxWidth: "100%",
          }}
        />
      </div>
    </div>
  );
}
