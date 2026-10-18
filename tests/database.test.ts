import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const ids = Array.from(
  { length: 7 },
  (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
);
test("database ownership, moderation, aggregation, rate limit and deletion", async (t) => {
  const db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;alter default privileges in schema public grant select,insert,update,delete on tables to anon,authenticated;`,
  );
  await db.exec(
    await readFile(
      new URL("../supabase/migrations/001_initial.sql", import.meta.url),
      "utf8",
    ),
  );
  for (const id of ids)
    await db.query("insert into auth.users(id) values($1)", [id]);
  await db.query("insert into admins values($1)", [ids[6]]);
  async function as(id: string, role = "authenticated") {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await db.exec(`set role ${role}`);
  }
  async function one(sql: string, args: unknown[] = []) {
    return (await db.query(sql, args)).rows[0] as Record<string, any>;
  }
  let plan = "";
  let story = "";
  let comment = "";
  await t.test(
    "owner can create, reload, edit; other owner sees nothing",
    async () => {
      await as(ids[0]);
      const r = await one(
        "insert into records(owner_id,kind,data) values(auth.uid(),'study',$1) returning id",
        [
          {
            title: "Plan",
            funding: "self",
            course: "bachelor",
            university: "Kazan",
            city: "Kazan",
            intake: "2026",
          },
        ],
      );
      plan = r.id;
      assert.equal((await db.query("select * from records")).rows.length, 1);
      await as(ids[1]);
      assert.equal((await db.query("select * from records")).rows.length, 0);
      assert.equal(
        (
          await db.query(
            "update records set data='{}' where id=$1 returning id",
            [plan],
          )
        ).rows.length,
        0,
      );
      await assert.rejects(() =>
        db.query(
          "insert into records(owner_id,kind,plan_id,data) values(auth.uid(),'visa',$1,'{}')",
          [plan],
        ),
      );
      await assert.rejects(() =>
        db.query("update profiles set suspended=false where id=auth.uid()"),
      );
      await assert.rejects(() =>
        db.query("insert into admins values(auth.uid())"),
      );
    },
  );
  await t.test(
    "five-person privacy threshold, currencies and multiple attempts",
    async () => {
      for (let i = 0; i < 5; i++) {
        await as(ids[i]);
        await db.exec(
          "update profiles set share_stats=true where id=auth.uid()",
        );
        const p =
          i === 0
            ? plan
            : (
                await one(
                  "insert into records(owner_id,kind,data) values(auth.uid(),'study',$1) returning id",
                  [
                    {
                      title: "Plan",
                      funding: i % 2 ? "scholarship" : "self",
                      course: "bachelor",
                      university: "Kazan",
                      city: "Kazan",
                      intake: "2026",
                    },
                  ],
                )
              ).id;
        for (const data of [
          {
            service: "regular",
            outcome: "approved",
            submission_date: "2026-09-01",
            decision_date: "2026-09-13",
          },
        ])
          await db.query(
            "insert into records(owner_id,kind,plan_id,data) values(auth.uid(),'visa',$1,$2)",
            [p, data],
          );
        await db.query(
          "insert into records(owner_id,kind,plan_id,data) values(auth.uid(),'cost',$1,$2)",
          [
            p,
            {
              category: "visa",
              currency: "BDT",
              amount: String(1000 + i * 100),
            },
          ],
        );
        await db.query(
          "insert into records(owner_id,kind,plan_id,data) values(auth.uid(),'cost',$1,$2)",
          [p, { category: "visa", currency: "USD", amount: "50" }],
        );
        if (i === 3) {
          const x = await one("select dashboard('{}') stats");
          assert.equal(x.stats.suppressed, true);
          assert.deepEqual(x.stats.costs, []);
        }
      }
      await as(ids[0]);
      await db.query(
        "insert into records(owner_id,kind,plan_id,data) values(auth.uid(),'visa',$1,$2)",
        [plan, { service: "regular", outcome: "pending" }],
      );
      await as("", "anon");
      const x = await one("select dashboard('{}') stats");
      assert.equal(x.stats.students, 5);
      assert.equal(x.stats.applications, 6);
      assert.equal(x.stats.outcomes.approved, 5);
      assert.equal(x.stats.processing[0].days, 12);
      assert.equal(x.stats.costs.length, 2);
      assert.equal(
        x.stats.costs.find((c: any) => c.currency === "BDT").median,
        1200,
      );
      assert.equal((await db.query("select * from records")).rows.length, 0);
    },
  );
  await t.test(
    "public snapshots require review, edits preserve old publication",
    async () => {
      await as(ids[0]);
      story = (
        await one("select submit_experience($1,null) id", [
          {
            title: "My interview experience",
            body: "This is a long enough public experience.",
            university: "Kazan",
          },
        ])
      ).id;
      await as("", "anon");
      assert.equal(
        (await db.query("select * from public_experiences")).rows.length,
        0,
      );
      await assert.rejects(() =>
        db.query("select moderate('approved',$1,'')", [story]),
      );
      await as(ids[6]);
      await db.query("select moderate('approved',$1,'Approved')", [story]);
      await as("", "anon");
      const publicRow = await one("select * from public_experiences");
      assert.equal(publicRow.title, "My interview experience");
      assert.equal("owner_id" in publicRow, false);
      assert.equal("email" in publicRow, false);
      await as(ids[0]);
      await db.query("select submit_experience($1,$2)", [
        {
          title: "Edited experience",
          body: "An edited version needs another review.",
        },
        story,
      ]);
      await as("", "anon");
      assert.equal((await one("select * from public_experiences")).id, story);
    },
  );
  await t.test(
    "comments, one-level replies, notifications, atomic rate limit",
    async () => {
      await as(ids[0]);
      await db.query("select write_comment($1,$2,null,null)", [
        story,
        "First comment",
      ]);
      comment = (await one("select id from comments")).id;
      await as(ids[1]);
      await db.query("select write_comment($1,$2,$3,null)", [
        story,
        "Reply",
        comment,
      ]);
      const reply = (await one("select id from comments")).id;
      await assert.rejects(() =>
        db.query("select write_comment($1,$2,$3,null)", [
          story,
          "Nested reply",
          reply,
        ]),
      );
      for (let i = 0; i < 4; i++)
        await db.query("select write_comment($1,$2,null,null)", [
          story,
          "Another comment",
        ]);
      await assert.rejects(() =>
        db.query("select write_comment($1,$2,null,null)", [
          story,
          "Rate limited",
        ]),
      );
      await as(ids[0]);
      assert.equal(
        (await db.query("select * from notifications")).rows.length,
        2,
      );
      await as(ids[1]);
      await db.query("select delete_comment($1)", [reply]);
      await assert.rejects(() =>
        db.query("select write_comment($1,$2,null,null)", [
          story,
          "Cannot reset rate limit by deleting",
        ]),
      );
      await as("", "anon");
      const row = await one("select * from public_comments");
      assert.equal("owner_id" in row, false);
      assert.equal(row.mine, null);
    },
  );
  await t.test(
    "report and moderation hide, owner unpublish, consent withdrawal",
    async () => {
      await as(ids[1]);
      await db.query("select report_comment($1,$2)", [
        comment,
        "Please review this comment",
      ]);
      await as(ids[6]);
      await db.query("select moderate('hide_comment',$1,'reviewed')", [
        comment,
      ]);
      await as("", "anon");
      assert.equal(
        (await db.query("select * from public_comments where id=$1", [comment]))
          .rows.length,
        0,
      );
      await as(ids[0]);
      await db.query("select unpublish_experience($1)", [story]);
      await db.exec(
        "update profiles set share_stats=false where id=auth.uid()",
      );
      await as("", "anon");
      assert.equal(
        (await db.query("select * from public_experiences")).rows.length,
        0,
      );
      const x = await one("select dashboard('{}') stats");
      assert.equal(x.stats.students, 4);
      assert.equal(x.stats.suppressed, true);
    },
  );
  await t.test(
    "catalog suggestions and admin merge preserve private ownership",
    async () => {
      await as(ids[0]);
      await db.query("update records set data=data||$1 where id=$2", [
        {
          university: "Kazan typo",
          prep_university: "Prep College",
          prep_city: "Moscow",
        },
        plan,
      ]);
      assert.equal(
        (await db.query("select * from universities where name='Prep College'"))
          .rows.length,
        1,
      );
      await as(ids[6]);
      assert.equal((await db.query("select * from records")).rows.length, 0);
      await db.query("select merge_catalog('university','Kazan typo','Kazan')");
      await as(ids[0]);
      assert.equal(
        (await one("select data from records where id=$1", [plan])).data
          .university,
        "Kazan",
      );
    },
  );
  await t.test(
    "suspended accounts cannot insert records or submit public experiences",
    async () => {
      await as(ids[6]);
      await db.query("select moderate('suspend',$1,'test')", [ids[5]]);
      await as(ids[5]);
      await assert.rejects(() =>
        db.query(
          "insert into records(owner_id,kind,data) values(auth.uid(),'study','{}')",
        ),
      );
      await assert.rejects(() =>
        db.query("select submit_experience($1,null)", [
          {
            title: "Suspended story",
            body: "This content should not be accepted.",
          },
        ]),
      );
    },
  );
  await t.test("auth deletion cascades all authored data", async () => {
    await db.exec("reset role");
    await db.query("delete from auth.users where id=$1", [ids[0]]);
    assert.equal(
      (await db.query("select * from records where owner_id=$1", [ids[0]])).rows
        .length,
      0,
    );
    assert.equal(
      (
        await db.query("select * from experience_versions where owner_id=$1", [
          ids[0],
        ])
      ).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from comments where owner_id=$1", [ids[0]]))
        .rows.length,
      0,
    );
  });
  await db.close();
});
