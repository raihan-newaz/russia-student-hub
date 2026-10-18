import type { Experience } from "./model";
import { DEFAULT_UNIVERSITIES, DEFAULT_CITIES } from "./constants";
export function demoDashboard(filters: Record<string, string>) {
  const universities = DEFAULT_UNIVERSITIES.slice(0, 20);
  const cities = DEFAULT_CITIES.slice(0, 15);
  const plans = Array.from({ length: 450 }, (_, i) => ({
    id: i,
    intake:
      i % 5 === 0
        ? "February 2026"
        : i % 7 === 0
          ? "September 2025"
          : "September 2026",
    course:
      i < 90
        ? "preparatory"
        : i < 270
          ? "bachelor"
          : i < 405
            ? "masters"
            : "phd",
    funding: i % 3 === 0 ? "scholarship" : "self",
    university: universities[i % universities.length],
    city: cities[i % cities.length],
  }));

  // Visa attempts modeling:
  // - First 25 users: Reapplied! (1st regular rejected, 2nd express approved)
  // - Next 15 users (25..39): Rejected only
  // - Next 20 users (40..59): Pending
  // - Remaining users (60..449): Approved
  const attempts: { plan: number; service: "regular" | "express"; outcome: "approved" | "rejected" | "pending" }[] = [];
  for (let i = 0; i < 450; i++) {
    if (i < 25) {
      // Reapplied user: 1st rejected, 2nd approved
      attempts.push({ plan: i, service: "regular", outcome: "rejected" });
      attempts.push({ plan: i, service: "express", outcome: "approved" });
    } else if (i < 40) {
      // Rejected only
      attempts.push({ plan: i, service: "regular", outcome: "rejected" });
    } else if (i < 60) {
      // Pending
      attempts.push({ plan: i, service: i % 2 === 0 ? "express" : "regular", outcome: "pending" });
    } else {
      // Approved
      attempts.push({ plan: i, service: i % 4 === 0 ? "express" : "regular", outcome: "approved" });
    }
  }
  const matchingVisa = (v: (typeof attempts)[number]) =>
    (!filters.service || v.service === filters.service) &&
    (!filters.outcome || v.outcome === filters.outcome);
  const cohort = plans.filter(
    (p) =>
      Object.entries(filters).every(([k, v]) => {
        if (!v || ["service", "outcome"].includes(k)) return true;
        if (k === "intake")
          return p.intake.toLowerCase().includes(v.toLowerCase());
        return p[k as keyof typeof p] === v;
      }) &&
      (!(filters.service || filters.outcome) ||
        attempts.some((v) => v.plan === p.id && matchingVisa(v))),
  );
  const chosen = new Set(cohort.map((p) => p.id));
  const visas = attempts.filter((v) => chosen.has(v.plan) && matchingVisa(v));
  const suppressed = cohort.length < 5;
  const count = (values: string[]) =>
    values.reduce(
      (a, v) => {
        a[v] = (a[v] || 0) + 1;
        return a;
      },
      {} as Record<string, number>,
    );
  return {
    students: cohort.length,
    universities: new Set(cohort.map((p) => p.university)).size,
    cities: new Set(cohort.map((p) => p.city)).size,
    applications: suppressed ? 0 : visas.length,
    suppressed,
    outcomes: suppressed ? {} : count(visas.map((v) => v.outcome)),
    funding: suppressed ? {} : count(cohort.map((p) => p.funding)),
    courses: suppressed ? {} : count(cohort.map((p) => p.course)),
    processing: ["regular", "express"].flatMap((service) => {
      const samples = visas.filter(
        (v) => v.service === service && v.outcome !== "pending",
      );
      return new Set(samples.map((v) => v.plan)).size >= 5
        ? [
            {
              service,
              days: service === "regular" ? 8 : 2,
              samples: samples.length,
            },
          ]
        : [];
    }),
    costs: suppressed
      ? []
      : [
          {
            category: "visa",
            currency: "BDT",
            median: 11150,
            samples: cohort.length,
          },
          {
            category: "airfare",
            currency: "BDT",
            median: 68000,
            samples: cohort.length,
          },
          {
            category: "legalization",
            currency: "BDT",
            median: 9150,
            samples: cohort.length,
          },
        ],
    updated: cohort.length ? "2026-10-18" : null,
  };
}
export const demoExperiences: Experience[] = [
  {
    id: "e1111111-1111-4111-8111-111111111111",
    alias: "আহমেদ তানভীর",
    title: "কাজান ফেডারেল ইউনিভার্সিটিতে সিএস (CS) ও স্কলারশিপের পুরো জার্নি",
    body: "2025 সালের রাশিয়ান গভর্নমেন্ট স্কলারশিপ (Open Doors / Russian House Dhaka) নিয়ে আমার কাজান ফেডারেল ইউনিভার্সিটিতে আসা। পুরো প্রসেসটা শেয়ার করছি যাতে নতুনদের কাজে লাগে।\n\n1. স্কলারশিপ ও সিলেকশন:\nধানমন্ডি রাশিয়ান হাউজে ইন্টারভিউ ও পেপারস ভেরিফিকেশনের পর কোটায় সিলেক্ট হই। কাজান ফেডারেল বিশ্ববিদ্যালয় চয়েস লিস্টের 1 নাম্বারে রেখেছিলাম। জুন মাসে সিলেকশন নিশ্চিত হয় এবং আগস্টের প্রথম সপ্তাহে ইনভিটেশন লেটার ইস্যু হয়।\n\n2. ডকুমেন্ট লিগালাইজেশন:\nএসএসসি ও এইচএসসি সার্টিফিকেট শিক্ষা মন্ত্রণালয় ও পররাষ্ট্র মন্ত্রণালয় থেকে সত্যায়িত করে রাশিয়ান সেন্টারের মাধ্যমে নোটারি ও রাশিয়ান অনুবাদ করিয়ে নিয়েছিলাম। রাশিয়ান সেন্টারে অনুবাদ ও সত্যায়নে সময় লেগেছিল প্রায় 7 কার্যদিবস।\n\n3. ভিসা আবেদন ও ইন্টারভিউ (ঢাকা এম্বাসি):\nগুলশানে রাশিয়ান ভিসা সেন্টারে এক্সপ্রেস সার্ভিসে জমা দিই। ইন্টারভিউতে মূলত 4টি বিষয় জানতে চেয়েছিল—কাজান কেন পছন্দ করলাম, ভবিষ্যৎ ক্যারিয়ার প্ল্যান, ও কোর্সের ভাষা। 4 কার্যদিবসের মধ্যে ভিসা পেয়ে যাই।\n\n4. কাজান আসার অভিজ্ঞতা:\nএয়ার অ্যারাবিয়াতে ঢাকা থেকে শারজাহ হয়ে মস্কো এবং সেখান থেকে ট্রেনে কাজান আসি। কাজান সিটি খুবই সুন্দর ও আন্তর্জাতিক শিক্ষার্থীদের জন্য নিরাপদ। ডর্মেটরি খরচ মাসে মাত্র 600-800 রুবল।",
    university: "Kazan Federal University (KFU)",
    city: "Kazan",
    course: "bachelor",
    funding: "scholarship",
    outcome: "approved",
    created_at: "2026-10-16",
  },
  {
    id: "e2222222-2222-4222-8222-222222222222",
    alias: "ফারহান সাদিক",
    title: "মস্কো স্টেট ইউনিভার্সিটিতে (MSU) মাস্টার্স: ভিসা ও এম্বাসি ফেস করার অভিজ্ঞতা",
    body: "ঢাকা থেকে মস্কো স্টেট ইউনিভার্সিটিতে (MSU) অ্যাপ্লাইড ম্যাথমেটিক্স ও ইনফরম্যাটিক্সে মাস্টার্সে আসার অভিজ্ঞতা নতুনদের জন্য শেয়ার করছি।\n\nভিসা প্রসেসিং ও প্রয়োজনীয় ডকুমেন্টস:\n- পাসপোর্ট (কমপক্ষে দেড় বছর মেয়াদ থাকা জরুরি)\n- অরিজিনাল ইনভিটেশন ও স্টাডি কন্ট্রাক্ট\n- এইডস/এইচআইভি (HIV) টেস্ট রিপোর্ট (অবশ্যই 3 মাসের ভ্যালিডিটি থাকতে হবে)\n- শিক্ষা ও পররাষ্ট্র মন্ত্রণালয় কর্তৃক লিগালাইজড গ্র্যাজুয়েশন সার্টিফিকেট ও মার্কশিট।\n\nইন্টারভিউয়ের গুরুত্বপূর্ণ পয়েন্ট:\nএম্বাসিতে কনস্যুলার অফিসার খুব খুঁটিয়ে রিসার্চ টপিক জানতে চান। আমার টপিক ছিল Machine Learning in Data Analytics। পূর্বে কোনো রিসার্চ পেপার আছে কি না এবং বাংলাদেশে ব্যাচেলর সাবজেক্ট কী ছিল তা জানতে চেয়েছিলেন। ফিল্ড সম্পর্কে স্পষ্ট ধারণা থাকলে কোনো সমস্যা হয় না।\n\nখরচ ও আবাসন:\nস্কলারশিপে টিউশন ফি ফ্রি এবং মান্থলি স্টাইপেন্ড দেওয়া হয়। মস্কো স্টেট ইউনিভার্সিটির প্রধান ভবনের (Main Building) ডর্মেটরি চমৎকার। খাওয়ার খরচ বাবদ প্রতি মাসে প্রায় 15,000 থেকে 20,000 রুবল যথেষ্ট।",
    university: "Lomonosov Moscow State University (MSU)",
    city: "Moscow",
    course: "masters",
    funding: "scholarship",
    outcome: "approved",
    created_at: "2026-10-14",
  },
  {
    id: "e3333333-3333-4333-8333-333333333333",
    alias: "নুসরাত জাহান",
    title: "সেন্ট পিটার্সবার্গে মেডিসিন (General Medicine) পড়ার প্রথম বছরের অভিজ্ঞতা ও পরামর্শ",
    body: "অনেকেই রাশিয়ায় সেলফ-ফান্ডিংয়ে মেডিসিন বা এমবিবিএস পড়তে আসার ব্যাপারে দ্বিধায় থাকেন। ফার্স্ট পাভলভ সেন্ট পিটার্সবার্গ মেডিকেল ইউনিভার্সিটিতে আমার 1ম বর্ষের অভিজ্ঞতা তুলে ধরছি।\n\n1. অ্যাডমিশন ও এন্ট্রান্স এক্সাম:\nঅফিসিয়াল পোর্টাল দিয়ে সরাসরি আবেদন করেছিলাম। বায়োলজি ও কেমিস্ট্রি পরীক্ষা অনলাইনে ইংরেজিতে হয়েছিল। রেজাল্টের পর সরাসরি অফার লেটার ও ইনভিটেশন পাই। ইনভিটেশন আসতে প্রায় 35-40 দিন লেগেছিল।\n\n2. ভিসা ইন্টারভিউতে কী জানতে চাওয়া হয়েছিল:\n- মেডিকেল পড়তে কেন রাশিয়া বেছে নিলেন?\n- পড়াশোনার সম্পূর্ণ খরচ কে বহন করবে? (বাবার ব্যাংক স্টেটমেন্ট ও স্পন্সরশিপ এফিডেভিট সাথে ছিল)।\n- কোর্স শেষ করে দেশে ফিরে বিএমডিসি (BMDC) এক্সাম দেওয়ার পরিকল্পনা কী।\n\n3. বাস্তব পরামর্শ:\nমেডিসিনে প্রথম 2 বছর ইংরেজি মাধ্যমে হলেও 3য় বর্ষ থেকে ক্লিনিক্যাল পোস্টিংয়ে রাশিয়ান রোগীদের সাথে কথা বলতে হয়। তাই 1ম বর্ষ থেকেই রাশিয়ান ভাষা গুরুত্ব দিয়ে শেখা অপরিহার্য। সেন্ট পিটার্সবার্গ অত্যন্ত মার্জিত এবং সাংস্কৃতিক শহর।",
    university: "First Pavlov State Medical University of St. Petersburg",
    city: "Saint Petersburg",
    course: "bachelor",
    funding: "self",
    outcome: "approved",
    created_at: "2026-10-12",
  },
  {
    id: "e4444444-4444-4444-8444-444444444444",
    alias: "মেহেদী হাসান",
    title: "আইটিএমও (ITMO) ইউনিভার্সিটিতে এআই ও সফটওয়্যার ইঞ্জিনিয়ারিং: ইন্টারভিউ ও ট্রানজিট টিপস",
    body: "আইটিএমও বিশ্ববিদ্যালয় আইটি ও প্রোগ্রামিংয়ের জন্য আন্তর্জাতিকভাবে অত্যন্ত খ্যাতনামা। ওপেন ডোরস প্রতিযোগিতার মাধ্যমে এখানে ফুল-ফ্রি স্কলারশিপে সুযোগ পাই।\n\nভ্রমণ ও বিমান টিপস (Dhaka to SPb):\nআমি ঢাকা থেকে কুয়েত এয়ারওয়েজ হয়ে মস্কো শেরেমিতিয়েভো এয়ারপোর্টে ল্যান্ড করি। মস্কো ইমিগ্রেশনে স্টুডেন্টদের আলাদা রুমে নিয়ে ইনভিটেশন ও পাসপোর্ট মিলিয়ে দেখে এবং মাইগ্রেশন কার্ড দেয়। মাইগ্রেশন কার্ডটি অত্যন্ত সতর্কতার সাথে রাখতে হবে, কোনোভাবেই যেন না হারায়। এরপর সাপসান হাই-স্পিড ট্রেনে মাত্র 4 ঘণ্টায় সেন্ট পিটার্সবার্গে পৌঁছাই।\n\nপরামর্শ:\nআইটিএমও-তে পড়ার চাপ অনেক বেশি, বিশেষ করে ল্যাব অ্যাসাইনমেন্ট এবং গিটহাব প্রজেক্টের ওপর মূল মূল্যায়ন হয়। যদি কেউ প্রোগ্রামিং ভালোবাসেন, তবে আইটিএমও সেরা সিদ্ধান্ত হবে।",
    university: "ITMO University",
    city: "Saint Petersburg",
    course: "masters",
    funding: "scholarship",
    outcome: "approved",
    created_at: "2026-10-10",
  },
  {
    id: "e5555555-5555-4555-8555-555555555555",
    alias: "রাকিবুল ইসলাম",
    title: "রুডন (RUDN) ইউনিভার্সিটিতে প্রিপারেটরি (Podfak) কোর্স: খরচ, আবাসন ও অভিজ্ঞতা",
    body: "রাশিয়ান ভাষায় ইঞ্জিনিয়ারিং পড়ার জন্য আমি আরইউডিএন (RUDN) ইউনিভার্সিটির প্রিপারেটরি ফ্যাকাল্টিতে (Подфак) ভর্তি হয়েছিলাম।\n\nখরচের হিসাব (বাস্তব অভিজ্ঞতা):\n- প্রিপারেটরি কোর্স টিউশন ফি: বছরে প্রায় 280,000 রুবল।\n- হোস্টেল ফি: ব্লকে শেয়ারিং রুম প্রতি মাসে 4,500 - 6,000 রুবল।\n- হেলথ ইন্স্যুরেন্স ও মেডিকেল টেস্ট: বছরে প্রায় 15,000 রুবল।\n- ব্যক্তিগত খাওয়া-দাওয়া: মাসে 12,000 - 15,000 রুবল।\n\nক্লাস ও পড়াশোনা:\nসপ্তাহে 5 দিন ক্লাস হয়। প্রথম 3 মাস শুধু নিবিড় রাশিয়ান ভাষা শেখানো হয়। এরপর পদার্থবিজ্ঞান ও গণিত রাশিয়ান পরিভাষায় পড়ানো শুরু হয়। শিক্ষকরা আন্তর্জাতিক শিক্ষার্থীদের প্রতি আন্তরিক। আগে থেকেই বর্ণমালা ও প্রাথমিক কিছু শব্দ শিখে এলে শুরুতে অনেক সুবিধা হয়।",
    university: "Peoples' Friendship University of Russia (RUDN University)",
    city: "Moscow",
    course: "preparatory",
    funding: "self",
    outcome: "approved",
    created_at: "2026-10-08",
  },
  {
    id: "e6666666-6666-4666-8666-666666666666",
    alias: "তাহমিদ চৌধুরী",
    title: "পলিটেকনিক ইউনিভার্সিটিতে মেকানিক্যাল ইঞ্জিনিয়ারিং: এম্বাসি ডকুমেন্টস ও প্রথম দিনগুলো",
    body: "পলিটেকনিক ইউনিভার্সিটিতে ব্যাচেলরে ভর্তি হতে গিয়ে ভিসা প্রসেসে যে বিষয়গুলো খেয়াল রাখা উচিত তা তুলে ধরছি:\n\n1. এম্বাসির ফাইল সাজানো:\nফাইল সাজানোর ক্ষেত্রে সব ডকুমেন্টের আসল কপি এবং নোটারাইজড অনুবাদ আলাদা ফোল্ডারে রাখুন। গুলশান ভিসা সেন্টারে সিরিয়াল অনুযায়ী খুব দ্রুত ফাইল গ্রহণ করে।\n\n2. ব্যাংক স্টেটমেন্ট:\nসেলফ-ফান্ডিং স্টুডেন্টদের ক্ষেত্রে পিতা বা অভিভাবকের 6 মাসের সলভেন্সি স্টেটমেন্ট দেখাতে হয়। আমার ফাইলে প্রায় 7-8 লাখ টাকার ব্যালেন্স দেখানো হয়েছিল।\n\n3. পৌঁছানোর পর করণীয়:\nবিশ্ববিদ্যালয়ে পৌঁছানোর 3 কার্যদিবসের মধ্যে ইন্টারন্যাশনাল ডিপার্টমেন্টে গিয়ে ভিসা এক্সটেনশন এবং পুলিশ রেজিস্ট্রেশন প্রসেস শুরু করতে হয়। বিশ্ববিদ্যালয় সব ধরনের সাহায্য করে, কোনো এজেন্সির দরকার হয় না।",
    university: "Peter the Great St. Petersburg Polytechnic University (SPbPU)",
    city: "Saint Petersburg",
    course: "bachelor",
    funding: "self",
    outcome: "approved",
    created_at: "2026-10-05",
  },
  {
    id: "e7777777-7777-4777-8777-777777777777",
    alias: "অনিকা তাসনিম",
    title: "এইচএসই মস্কোতে (HSE) মাস্টার্স ও স্কলারশিপ ইন্টারভিউ প্রস্তুতি",
    body: "এইচএসই (Higher School of Economics) রাশিয়ার অন্যতম শীর্ষস্থানীয় এবং আধুনিক বিশ্ববিদ্যালয়। পুরো মাস্টার্স প্রোগ্রামটি সম্পূর্ণ ইংরেজিতে পরিচালিত হয়।\n\nইন্টারভিউ প্রস্তুতি:\nঅনলাইন ভাইভাতে আমার আন্ডারগ্র্যাজুয়েট সিজিপিএ, রিসার্চ ইন্টারেস্ট এবং মোটিভেশন লেটার নিয়ে বিশদ আলোচনা হয়। বিশেষ করে গণিত ও স্ট্যাটিস্টিকসের বেসিক থেকে প্রশ্ন করা হয়েছিল।\n\nমস্কো শহরের জীবনযাত্রা:\nমেট্রো যোগাযোগ ব্যবস্থা বিশ্বের অন্যতম সেরা। ট্রয়কা স্টুডেন্ট কার্ড দিয়ে মাত্র 500-600 রুবলে পুরো মাস আনলিমিটেড মেট্রো ও বাসে যাতায়াত করা যায়। মেয়েদের জন্য মস্কো অত্যন্ত নিরাপদ একটি শহর।",
    university: "Higher School of Economics (HSE University)",
    city: "Moscow",
    course: "masters",
    funding: "scholarship",
    outcome: "approved",
    created_at: "2026-10-02",
  },
  {
    id: "e8888888-8888-4888-8888-888888888888",
    alias: "সাইফুল ইসলাম",
    title: "টমস্ক পলিটেকনিক ইউনিভার্সিটিতে (TPU) নিউক্লিয়ার ইঞ্জিনিয়ারিং ও সাইবেরিয়ার অভিজ্ঞতা",
    body: "বাংলাদেশের রূপপুর পারমাণবিক বিদ্যুৎ কেন্দ্রের প্রেক্ষাপটে রাশিয়ায় নিউক্লিয়ার সায়েন্সে উচ্চশিক্ষা নেওয়ার স্বপ্ন ছিল। সেই লক্ষ্যেই টমস্ক পলিটেকনিকে পিএইচডিতে আসা।\n\nসাইবেরিয়ার শীত ও প্রস্তুতি:\nটমসকে শীতকালে তাপমাত্রা মাইনাস 30 থেকে 40 ডিগ্রি পর্যন্ত নেমে যায়। তবে প্রত্যেকটি ভবন, ডর্মেটরি ও ল্যাব সেন্ট্রাল হিটিং সিস্টেমের কারণে ভেতরে চমৎকার উষ্ণ থাকে। ঢাকা থেকে নরমাল থার্মাল ইনার আনলেই হয়, ভারী উইন্টার জ্যাকেট ও স্নো বুট রাশিয়াতে এসেই কম খরচে ভালো মানের কেনা যায়।\n\nগবেষণাগার ও সুযোগ-সুবিধা:\nটিপিইউ-র নিজস্ব রিসার্চ রিঅ্যাক্টর রয়েছে যেখানে হ্যান্ডস-অন কাজের অবারিত সুযোগ রয়েছে। রাশিয়ান সরকার পিএইচডি গবেষকদের জন্য পর্যাপ্ত ফান্ডিং ও কনফারেন্স গ্রান্ট প্রদান করে।",
    university: "Tomsk Polytechnic University (TPU)",
    city: "Tomsk",
    course: "phd",
    funding: "scholarship",
    outcome: "approved",
    created_at: "2026-09-28",
  },
];
