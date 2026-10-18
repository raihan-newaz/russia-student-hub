import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty">
      <h1>এই পৃষ্ঠাটি পাওয়া যায়নি</h1>
      <p>অভিজ্ঞতাটি অপ্রকাশিত বা মুছে ফেলা হয়ে থাকতে পারে।</p>
      <Link className="button primary" href="/">
        Back to Dashboard
      </Link>
    </div>
  );
}
