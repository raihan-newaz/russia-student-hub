"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty">
      <h1>তথ্য লোড করা যায়নি</h1>
      <p>সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।</p>
      <button className="button primary" onClick={reset}>
        Try Again
      </button>
    </div>
  );
}
