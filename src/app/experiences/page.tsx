import Link from "next/link";
import { Shell, Heading, Empty } from "@/components/shell";
import { ExperienceCard } from "@/components/experience-card";
import { experiences, identity, isDemo } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function Experiences({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Math.max(
    1,
    Math.min(10000, Number((await searchParams).page) || 1),
  );
  const [user, result] = await Promise.all([identity(), experiences(page)]);
  return (
    <Shell
      active="/experiences"
      alias={user?.profile?.alias}
      avatar={user?.avatar}
      email={user?.email}
      name={user?.name}
      unreadNotices={user?.unreadNotices}
      admin={user?.admin}
      demo={isDemo()}
    >
      <Heading
        eyebrow="বাস্তব অভিজ্ঞতা, সহজ প্রস্তুতি"
        title="তাঁদের গল্প, আপনার প্রস্তুতি"
        description="ইন্টারভিউয়ের প্রশ্ন, বিশ্ববিদ্যালয় আর রাশিয়ায় পড়তে যাওয়ার অভিজ্ঞতা।"
        action={
          <Link className="button primary" href="/experiences/new">
            Write Experience
          </Link>
        }
      />
      <div className="experience-grid">
        {result.items.map((item) => (
          <ExperienceCard key={item.id} item={item} />
        ))}
      </div>
      {!result.items.length && (
        <div style={{ textAlign: "center" }}>
          <Empty
            title="অভিজ্ঞতা আসছে"
            description="প্রথম অভিজ্ঞতাটি যোগ করে অন্য শিক্ষার্থীদের সাহায্য করুন।"
          />
          <div style={{ marginTop: 16 }}>
            <Link className="button primary" href="/experiences/new">
              Write Experience
            </Link>
          </div>
        </div>
      )}
      <div className="pagination">
        {page > 1 && (
          <Link className="button" href={`?page=${page - 1}`}>
            Previous
          </Link>
        )}
        {result.more && (
          <Link className="button" href={`?page=${page + 1}`}>
            Next
          </Link>
        )}
      </div>
    </Shell>
  );
}
