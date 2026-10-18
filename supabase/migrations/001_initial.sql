-- Run once on a new Supabase project. Private records never have anonymous access.
create table public.profiles(id uuid primary key references auth.users on delete cascade, alias text not null default 'শিক্ষার্থী' check(length(alias) between 2 and 60), share_stats boolean not null default true, suspended boolean not null default false);
create table public.admins(user_id uuid primary key references auth.users on delete cascade);
alter table public.admins enable row level security;
create function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from admins where user_id=auth.uid())$$;
create function public.is_active() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from profiles where id=auth.uid() and not suspended)$$;
create function public.new_user() returns trigger language plpgsql security definer set search_path=public as $$begin insert into profiles(id) values(new.id);return new;end$$;
create trigger new_user after insert on auth.users for each row execute function public.new_user();
create table public.records(id uuid primary key default gen_random_uuid(),owner_id uuid not null references profiles on delete cascade,kind text not null check(kind in ('study','document','visa','cost','flight')),plan_id uuid references records on delete cascade,data jsonb not null,updated_at timestamptz not null default now());
create index records_owner on records(owner_id,kind);
create index records_plan on records(plan_id);
create function public.guard_record() returns trigger language plpgsql set search_path=public as $$declare k text; d text;begin
 if jsonb_typeof(new.data)<>'object' or octet_length(new.data::text)>100000 then raise exception 'Invalid data';end if;
 new.data=jsonb_build_object('funding','self','course','bachelor','outcome','pending','service','regular','currency','BDT')||new.data;
 if new.data->>'funding' not in ('self','scholarship') or new.data->>'course' not in ('preparatory','bachelor','masters','phd') or new.data->>'outcome' not in ('pending','approved','rejected','withdrawn') or new.data->>'service' not in ('regular','express') or new.data->>'currency' not in ('BDT','RUB','USD') then raise exception 'Invalid enum';end if;
 foreach k in array array['admission_date','offer_date','invitation_date','submission_date','collection_date','interview_date','decision_date','delivery_date','payment_date','arrival_date'] loop
 d=new.data->>k;if coalesce(d,'')<>'' then if d!~'^\d{4}-\d{2}-\d{2}$' then raise exception 'Invalid date';end if;perform d::date;end if;
 end loop;
 if coalesce(new.data->>'decision_date','')<>'' and coalesce(new.data->>'submission_date','')<>'' and (new.data->>'decision_date')::date<(new.data->>'submission_date')::date then raise exception 'Decision precedes submission';end if;
 if coalesce(new.data->>'amount','')<>'' and (new.data->>'amount'!~'^\d+(\.\d{1,2})?$' or length(new.data->>'amount')>14) then raise exception 'Invalid amount';end if;
 if new.kind='study' and new.plan_id is not null then raise exception 'Study plan cannot have a parent';end if;
 if new.kind<>'study' and not exists(select 1 from records where id=new.plan_id and owner_id=new.owner_id and kind='study') then raise exception 'Invalid study plan';end if;
 if tg_op='UPDATE' and (new.owner_id<>old.owner_id or new.kind<>old.kind or new.plan_id is distinct from old.plan_id) then raise exception 'Record identity is immutable';end if;
 new.updated_at=now();return new;end$$;
create trigger record_guard before insert or update on records for each row execute function public.guard_record();
create table public.experience_versions(id uuid primary key default gen_random_uuid(),owner_id uuid not null references profiles on delete cascade,story_id uuid not null default gen_random_uuid(),title text not null check(length(title) between 5 and 160),body text not null check(length(body) between 20 and 12000),university text not null default '',city text not null default '',course text not null default '',funding text not null default '',outcome text not null default 'pending',status text not null default 'pending' check(status in ('pending','approved','returned','hidden','superseded')),review_note text not null default '',created_at timestamptz not null default now());
create unique index one_published_version on experience_versions(story_id) where status='approved';
create table public.comments(id uuid primary key default gen_random_uuid(),experience_id uuid not null references experience_versions on delete cascade,owner_id uuid not null references profiles on delete cascade,parent_id uuid references comments on delete cascade,body text not null check(length(body) between 1 and 2000),hidden boolean not null default false,created_at timestamptz not null default now());
create table public.comment_events(owner_id uuid not null references profiles on delete cascade,created_at timestamptz not null default now());
alter table public.comment_events enable row level security;
create index comment_rate_lookup on comment_events(owner_id,created_at);
create table public.reports(id uuid primary key default gen_random_uuid(),owner_id uuid not null references profiles on delete cascade,comment_id uuid not null references comments on delete cascade,reason text not null check(length(reason) between 3 and 1000),resolved boolean not null default false,created_at timestamptz not null default now(),unique(owner_id,comment_id));
create table public.notifications(id uuid primary key default gen_random_uuid(),owner_id uuid not null references profiles on delete cascade,message text not null,read boolean not null default false,created_at timestamptz not null default now());
create table public.moderation_actions(id uuid primary key default gen_random_uuid(),admin_id uuid references profiles on delete set null,action text not null,target uuid,note text,created_at timestamptz not null default now());
create table public.cities(id uuid primary key default gen_random_uuid(),name text unique not null);
create table public.universities(id uuid primary key default gen_random_uuid(),name text unique not null);
create function public.catalog_record() returns trigger language plpgsql security definer set search_path=public as $$declare k text;n text;begin
 if new.kind='study' then
 foreach k in array array['city','prep_city','university','prep_university'] loop
 n=trim(new.data->>k);if coalesce(n,'')<>'' and length(n)<=200 then
 if k in ('city','prep_city') then insert into cities(name) values(n) on conflict do nothing;else insert into universities(name) values(n) on conflict do nothing;end if;
 end if;end loop;end if;return new;end$$;
create trigger record_catalog after insert or update on records for each row execute function public.catalog_record();
insert into cities(name) values('Arkhangelsk'),('Astrakhan'),('Barnaul'),('Belgorod'),('Chelyabinsk'),('Irkutsk'),('Ivanovo'),('Izhevsk'),('Kaliningrad'),('Kazan'),('Kemerovo'),('Khabarovsk'),('Krasnodar'),('Krasnoyarsk'),('Kursk'),('Makhachkala'),('Moscow'),('Nalchik'),('Nizhny Novgorod'),('Novosibirsk'),('Omsk'),('Orenburg'),('Penza'),('Perm'),('Petrozavodsk'),('Rostov-on-Don'),('Ryazan'),('Saint Petersburg'),('Samara'),('Saratov'),('Simferopol'),('Stavropol'),('Tambov'),('Tolyatti'),('Tomsk'),('Tver'),('Tyumen'),('Ufa'),('Ulyanovsk'),('Vladikavkaz'),('Vladivostok'),('Volgograd'),('Voronezh'),('Yakutsk'),('Yaroslavl'),('Yekaterinburg') on conflict do nothing;
insert into universities(name) values('Altai State Medical University (ASMU)'),('Altai State University (AltSU)'),('Astrakhan State Medical University (ASMU)'),('Astrakhan State University (ASU)'),('Bashkir State Medical University (BSMU)'),('Bauman Moscow State Technical University (BMSTU)'),('Belgorod State National Research University (BelSU)'),('Crimean Federal University (CFU)'),('Don State Technical University (DSTU)'),('Far Eastern Federal University (FEFU)'),('Financial University under the Government of the Russian Federation'),('First Pavlov State Medical University of St. Petersburg'),('Higher School of Economics (HSE University)'),('I.M. Sechenov First Moscow State Medical University'),('ITMO University'),('Immanuel Kant Baltic Federal University (IKBFU)'),('Industrial University of Tyumen (IUT)'),('Irkutsk State Medical University (ISMU)'),('Irkutsk State University (ISU)'),('Ivanovo State Medical Academy'),('Kabardino-Balkarian State University (KBSU)'),('Kazan Federal University (KFU)'),('Kazan National Research Technical University (KNRTU-KAI)'),('Kazan National Research Technological University (KNRTU)'),('Kazan State Medical University (KSMU)'),('Kazan State University of Architecture and Engineering'),('Krasnoyarsk State Medical University (KrasSMU)'),('Kuban State Medical University (KubSMU)'),('Kuban State University (KubSU)'),('Kursk State Medical University (KSMU)'),('Lobachevsky University (UNN)'),('Lomonosov Moscow State University (MSU)'),('Moscow Aviation Institute (MAI)'),('Moscow Institute of Physics and Technology (MIPT)'),('Moscow Power Engineering Institute (MPEI)'),('Moscow State Institute of International Relations (MGIMO)'),('Moscow State University of Civil Engineering (MGSU)'),('National Research Nuclear University MEPhI'),('National University of Science and Technology MISIS'),('Nizhny Novgorod State Technical University (NNSTU)'),('North-Caucasus Federal University (NCFU)'),('North-Eastern Federal University (NEFU)'),('North-Western State Medical University named after I.I. Mechnikov'),('Northern (Arctic) Federal University (NArFU)'),('Northern State Medical University (NSMU)'),('Novosibirsk State Medical University (NSMU)'),('Novosibirsk State Technical University (NSTU)'),('Novosibirsk State University (NSU)'),('Omsk State Medical University (OSMU)'),('Orenburg State Medical University (OrSMU)'),('Pacific State Medical University (PSMU)'),('Penza State University (PSU)'),('Peoples'' Friendship University of Russia (RUDN University)'),('Perm National Research Polytechnic University (PNRPU)'),('Perm State Medical University (PSMU)'),('Perm State University (PSU)'),('Peter the Great St. Petersburg Polytechnic University (SPbPU)'),('Pirogov Russian National Research Medical University (RNRMU)'),('Privolzhsky Research Medical University (PRMU)'),('Rostov State Medical University (RSMU)'),('Russian State Agrarian University - Moscow Timiryazev Agricultural Academy'),('Russian State University for the Humanities (RSUH)'),('Ryazan State Medical University (RyazGMU)'),('Saint Petersburg Electrotechnical University (LETI)'),('Saint Petersburg Mining University'),('Saint Petersburg State Chemical Pharmaceutical University'),('Saint Petersburg State Pediatric Medical University'),('Saint Petersburg State University (SPbU)'),('Saint Petersburg State University of Architecture and Civil Engineering (SPSUACE)'),('Samara National Research University (Samara University)'),('Samara State Medical University (SamSMU)'),('Samara State Technical University'),('Saratov State Medical University (SSMU)'),('Saratov State University (SSU)'),('Siberian Federal University (SibFU)'),('Siberian State Medical University (SSMU)'),('South Ural State Medical University (SUSMU)'),('South Ural State University (SUSU)'),('Southern Federal University (SFU)'),('Stavropol State Medical University (StSMU)'),('Tambov State University named after G.R. Derzhavin'),('Tomsk Polytechnic University (TPU)'),('Tomsk State University (TSU)'),('Tver State Medical University (TSMU)'),('Tyumen State Medical University (TSMU)'),('Ufa State Petroleum Technological University (USPTU)'),('Ufa University of Science and Technology (UUST)'),('Ulyanovsk State University (UlSU)'),('University of Tyumen (UTMN)'),('Ural Federal University (UrFU)'),('Ural State Medical University (USMU)'),('Volgograd State Medical University (VolgGMU)'),('Volgograd State Technical University (VSTU)'),('Voronezh State Medical University (VSMU)'),('Voronezh State Technical University (VSTU)'),('Voronezh State University (VSU)'),('Yaroslavl State Medical University') on conflict do nothing;
alter table profiles enable row level security;
alter table records enable row level security;
alter table experience_versions enable row level security;
alter table comments enable row level security;
alter table reports enable row level security;
alter table notifications enable row level security;
alter table moderation_actions enable row level security;
alter table cities enable row level security;
alter table universities enable row level security;
create policy own_profile on profiles for select to authenticated using(id=auth.uid() or is_admin());
create policy edit_profile on profiles for update to authenticated using(id=auth.uid() and is_active()) with check(id=auth.uid());
revoke update on profiles from authenticated;
grant update(alias,share_stats) on profiles to authenticated;
create policy own_records on records for all to authenticated using(owner_id=auth.uid() and is_active()) with check(owner_id=auth.uid() and is_active());
create policy own_versions on experience_versions for select to authenticated using(owner_id=auth.uid() or is_admin());
create policy own_comments on comments for select to authenticated using(owner_id=auth.uid() or is_admin());
create policy own_reports on reports for select to authenticated using(owner_id=auth.uid() or is_admin());
create policy own_notifications on notifications for select to authenticated using(owner_id=auth.uid());
create policy read_notifications on notifications for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
revoke update on notifications from authenticated;
grant update(read) on notifications to authenticated;
create policy admin_logs on moderation_actions for select to authenticated using(is_admin());
create policy read_cities on cities for select using(true);
create policy read_universities on universities for select using(true);
create view public.public_experiences as select e.id,p.alias,e.title,e.body,e.university,e.city,e.course,e.funding,e.outcome,e.created_at from experience_versions e join profiles p on p.id=e.owner_id where e.status='approved' and not p.suspended;
create view public.public_comments as select c.id,c.experience_id,c.parent_id,c.body,c.created_at,p.alias,(c.owner_id=auth.uid()) as mine from comments c join profiles p on p.id=c.owner_id join experience_versions e on e.id=c.experience_id where not c.hidden and not p.suspended and e.status='approved';
grant select on public_experiences,public_comments to anon,authenticated;

create function public.submit_experience(payload jsonb, previous_id uuid default null) returns uuid language plpgsql security definer set search_path=public as $$declare result uuid; story uuid;begin
 if not is_active() then raise exception 'Authentication required';end if;
 if previous_id is not null then select story_id into story from experience_versions where id=previous_id and owner_id=auth.uid();if story is null then raise exception 'Not found';end if;end if;
 insert into experience_versions(owner_id,story_id,title,body,university,city,course,funding,outcome) values(auth.uid(),coalesce(story,gen_random_uuid()),payload->>'title',payload->>'body',coalesce(payload->>'university',''),coalesce(payload->>'city',''),coalesce(payload->>'course',''),coalesce(payload->>'funding',''),coalesce(payload->>'outcome','pending')) returning id into result;return result;end$$;
create function public.unpublish_experience(target uuid) returns void language plpgsql security definer set search_path=public as $$begin
 update experience_versions set status='hidden' where story_id=(select story_id from experience_versions where id=target and owner_id=auth.uid()) and owner_id=auth.uid();end$$;
create function public.write_comment(target uuid, content text, parent uuid default null, editing uuid default null) returns void language plpgsql security definer set search_path=public as $$declare recipient uuid;begin
 if not is_active() then raise exception 'Authentication required';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 if not exists(select 1 from public_experiences where id=target) then raise exception 'Experience not available';end if;
 if editing is not null then update comments set body=content where id=editing and owner_id=auth.uid() and experience_id=target and not hidden;if not found then raise exception 'Comment unavailable';end if;return;end if;
 delete from comment_events where owner_id=auth.uid() and created_at<=now()-interval '1 minute';
 if (select count(*) from comment_events where owner_id=auth.uid())>=5 then raise exception 'এক মিনিটে সর্বোচ্চ ৫টি মন্তব্য করা যাবে';end if;
 if parent is not null then select owner_id into recipient from comments where id=parent and experience_id=target and parent_id is null and not hidden;if recipient is null then raise exception 'Invalid reply';end if;end if;
 insert into comments(experience_id,owner_id,parent_id,body) values(target,auth.uid(),parent,content);
 insert into comment_events(owner_id) values(auth.uid());
 if recipient is not null and recipient<>auth.uid() then insert into notifications(owner_id,message) values(recipient,'আপনার মন্তব্যে একটি নতুন উত্তর এসেছে।');end if;end$$;
create function public.delete_comment(target uuid) returns void language plpgsql security definer set search_path=public as $$begin delete from comments where id=target and owner_id=auth.uid();end$$;
create function public.report_comment(target uuid, content text) returns void language plpgsql security definer set search_path=public as $$begin if not is_active() then raise exception 'Authentication required';end if;if not exists(select 1 from public_comments where id=target) then raise exception 'Comment unavailable';end if;insert into reports(owner_id,comment_id,reason) values(auth.uid(),target,content) on conflict(owner_id,comment_id) do update set reason=excluded.reason;end$$;
create function public.moderate(action_name text,target uuid,note text default '') returns void language plpgsql security definer set search_path=public as $$declare recipient uuid;story uuid;begin
 if not is_admin() then raise exception 'Forbidden';end if;
 if action_name in ('approved','returned','hidden') then
 select owner_id,story_id into recipient,story from experience_versions where id=target for update;
 perform pg_advisory_xact_lock(hashtextextended(story::text,1));
 if action_name='approved' then update experience_versions set status='superseded' where story_id=story and status='approved';end if;
 update experience_versions set status=action_name,review_note=note where id=target;
 if recipient is not null then insert into notifications(owner_id,message) values(recipient,'অভিজ্ঞতার review: '||action_name||'। '||note);end if;
 elsif action_name='hide_comment' then update comments set hidden=true where id=target;update reports set resolved=true where comment_id=target;
 elsif action_name='resolve_report' then update reports set resolved=true where id=target;
 elsif action_name='suspend' then update profiles set suspended=true,share_stats=false where id=target;
 elsif action_name='restore' then update profiles set suspended=false where id=target;
 else raise exception 'Invalid action';end if;
 insert into moderation_actions(admin_id,action,target,note) values(auth.uid(),action_name,target,note);end$$;
create function public.merge_catalog(kind_name text,source_name text,target_name text) returns void language plpgsql security definer set search_path=public as $$declare k text;begin
 if not is_admin() or kind_name not in ('city','university') or length(trim(target_name))=0 then raise exception 'Forbidden';end if;
 foreach k in array case when kind_name='city' then array['city','prep_city'] else array['university','prep_university'] end loop
 update records set data=jsonb_set(data,array[k],to_jsonb(target_name)) where kind='study' and data->>k=source_name;
 end loop;
 if kind_name='city' then insert into cities(name) values(target_name) on conflict do nothing;delete from cities where name=source_name and name<>target_name;update experience_versions set city=target_name where city=source_name;
 else insert into universities(name) values(target_name) on conflict do nothing;delete from universities where name=source_name and name<>target_name;update experience_versions set university=target_name where university=source_name;end if;
 insert into moderation_actions(admin_id,action,note) values(auth.uid(),'merge_'||kind_name,source_name||' → '||target_name);end$$;

-- Only aggregated values leave this function. A cohort needs five distinct owners.
create function public.dashboard(filters jsonb default '{}') returns jsonb language plpgsql stable security definer set search_path=public as $$declare result jsonb;begin
 with plans as(select r.* from records r join profiles p on p.id=r.owner_id where r.kind='study' and p.share_stats and not p.suspended
 and not exists(select 1 from jsonb_each_text(filters) f where f.key in ('intake','course','funding','university','city') and f.value<>'' and (case when f.key='intake' then r.data->>'intake' not ilike '%'||f.value||'%' else r.data->>f.key is distinct from f.value end))
 and (coalesce(filters->>'service','')='' and coalesce(filters->>'outcome','')='' or exists(select 1 from records v where v.plan_id=r.id and v.kind='visa' and (coalesce(filters->>'service','')='' or v.data->>'service'=filters->>'service') and (coalesce(filters->>'outcome','')='' or v.data->>'outcome'=filters->>'outcome')))),
 visas as(select v.* from records v join plans p on p.id=v.plan_id where v.kind='visa' and (coalesce(filters->>'service','')='' or v.data->>'service'=filters->>'service') and (coalesce(filters->>'outcome','')='' or v.data->>'outcome'=filters->>'outcome')),
 counts as(select count(distinct owner_id) students,count(distinct nullif(data->>'university','')) universities,count(distinct nullif(data->>'city','')) cities,max(updated_at) updated from plans),
 costs as(select r.owner_id,r.data->>'currency' currency,case when r.kind='flight' then 'airfare' else r.data->>'category' end category,(r.data->>'amount')::numeric amount from records r join plans p on p.id=r.plan_id where r.kind in ('cost','flight') and r.data->>'amount' ~ '^\d+(\.\d{1,2})?$' and (r.kind='flight' or r.data->>'category'<>'airfare')),
 cost_groups as(select currency,category,percentile_cont(0.5) within group(order by amount) median,count(*) samples from costs group by currency,category having count(distinct owner_id)>=5),
 processing as(select data->>'service' service,percentile_cont(0.5) within group(order by (data->>'decision_date')::date-(data->>'submission_date')::date) days,count(*) samples from visas where data->>'decision_date' ~ '^\d{4}-\d{2}-\d{2}$' and data->>'submission_date' ~ '^\d{4}-\d{2}-\d{2}$' and data->>'outcome' in ('approved','rejected') group by data->>'service' having count(distinct owner_id)>=5)
 select jsonb_build_object('students',students,'universities',universities,'cities',cities,'updated',updated,'suppressed',students<5,'applications',case when students>=5 then(select count(*) from visas)else 0 end,'outcomes',case when students>=5 then(select coalesce(jsonb_object_agg(outcome,n),'{}') from(select data->>'outcome' outcome,count(*) n from visas group by data->>'outcome')v)else '{}'end,'funding',case when students>=5 then(select coalesce(jsonb_object_agg(funding,n),'{}')from(select data->>'funding' funding,count(distinct owner_id)n from plans group by data->>'funding')p)else '{}'end,'courses',case when students>=5 then(select coalesce(jsonb_object_agg(course,n),'{}')from(select data->>'course' course,count(distinct owner_id)n from plans group by data->>'course')p)else '{}'end,'costs',(select coalesce(jsonb_agg(to_jsonb(c)),'[]')from cost_groups c),'processing',(select coalesce(jsonb_agg(to_jsonb(t)),'[]')from processing t)) into result from counts;
 return result;end$$;
-- RPCs default to executable by PUBLIC in PostgreSQL: explicitly restrict mutations.
revoke execute on all functions in schema public from public,anon,authenticated;
grant execute on function is_admin(),is_active() to authenticated;
grant execute on function dashboard(jsonb) to anon,authenticated;
grant execute on function submit_experience(jsonb,uuid),unpublish_experience(uuid),write_comment(uuid,text,uuid,uuid),delete_comment(uuid),report_comment(uuid,text),moderate(text,uuid,text),merge_catalog(text,text,text) to authenticated;
