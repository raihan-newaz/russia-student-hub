import Link from "next/link";
import { ArrowUpRight, MapPin, CheckCircle2, Clock3 } from "lucide-react";
import { labels, type Experience } from "@/lib/model";
export function ExperienceCard({ item }: { item: Experience }) {
  return (
    <Link className="experience-card" href={`/experiences/${item.id}`}>
      <div className="experience-meta">
        <span
          className={`badge ${item.outcome === "approved" ? "green" : "amber"}`}
        >
          {item.outcome === "approved" ? (
            <CheckCircle2 size={13} />
          ) : (
            <Clock3 size={13} />
          )}{" "}
          {labels[item.outcome] || item.outcome}
        </span>
        <span>{labels[item.course]}</span>
      </div>
      <h3>
        {item.title}
        <ArrowUpRight size={19} />
      </h3>
      <p className="excerpt">{item.body}</p>
      <div className="university">
        <MapPin size={14} />
        {item.university}
      </div>
      <div className="author">
        <span className="avatar">{item.alias.slice(0, 1)}</span>
        <span>
          {item.alias}
          <small>নামবিহীন অভিজ্ঞতা</small>
        </span>
        <span className="author-date">
          {new Date(item.created_at).toLocaleDateString("bn-BD", {
            day: "numeric",
            month: "short",
            timeZone: "Asia/Dhaka",
          })}
        </span>
      </div>
    </Link>
  );
}
