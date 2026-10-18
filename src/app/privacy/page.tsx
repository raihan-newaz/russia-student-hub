import { Shell, Heading } from "@/components/shell";
export default function Privacy() {
  return (
    <Shell>
      <Heading
        title="গোপনীয়তা ও তথ্যনীতি"
        description="কোন তথ্য কোথায় ব্যবহৃত হয়, সহজ ভাষায়।"
      />
      <article className="panel prose">
        <h2>নিজের তথ্য আপনার নিয়ন্ত্রণে</h2>
        <p>
          আপনার private tracker কেবল আপনার account থেকে দেখা ও পরিবর্তন করা যায়।
          Google নাম, email, ছবি, exact appointment, flight schedule ও ব্যক্তিগত
          notes public dashboard-এ দেখানো হয় না।
        </p>
        <h2>পরিসংখ্যান ও অভিজ্ঞতার সম্মতি আলাদা</h2>
        <p>
          আপনি সম্মতি দিলে নামবিহীন aggregate statistics-এ আপনার study plan,
          visa ও খরচের তথ্য যুক্ত হয়। কমপক্ষে পাঁচজনের cohort ছাড়া সংবেদনশীল
          breakdown দেখানো হয় না। Account থেকে যেকোনো সময় sharing বন্ধ করতে
          পারবেন। Public অভিজ্ঞতা admin review-এর পরে alias-সহ প্রকাশিত হয়;
          নিজের লেখা থেকে পরিচয় প্রকাশ পেতে পারে এমন তথ্য বাদ দিন।
        </p>
        <h2>Comments ও moderation</h2>
        <p>
          মন্তব্য সরাসরি প্রকাশিত হয়। অন্যের ব্যক্তিগত তথ্য, হয়রানি বা spam
          রিপোর্ট করা যায়। Moderation-এর প্রয়োজনে admin অভিজ্ঞতা, comments,
          reports ও account alias/status দেখতে পারেন। Admin-এর public content
          moderation ক্ষমতা ব্যক্তিগত tracker পড়ার অনুমতি দেয় না।
        </p>
        <h2>তথ্য মুছে ফেলা</h2>
        <p>
          নিজের tracker edit/delete, অভিজ্ঞতা unpublish এবং account delete করার
          ব্যবস্থা আছে। Account delete করলে সংশ্লিষ্ট tracker, অভিজ্ঞতা ও
          comments মুছে যায়। পরিচয়বিহীন moderation audit record থেকে যেতে পারে।
        </p>
        <h2>সেবার সীমা</h2>
        <p>
          এটি শিক্ষার্থীদের self-reported তথ্যের community। Embassy বা কোনো
          university-এর সরকারি service নয়। তথ্যকে official visa requirement,
          নির্দিষ্ট সময় বা অনুমোদনের নিশ্চয়তা হিসেবে ব্যবহার করবেন না। Passport
          scan, passport number বা ticket PNR এখানে জমা দেওয়ার প্রয়োজন নেই।
        </p>
      </article>
    </Shell>
  );
}
