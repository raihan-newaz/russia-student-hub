import test from "node:test";
import assert from "node:assert/strict";
import { recordSchema, digits } from "../src/lib/model";
test("Bangla amounts normalize without losing decimals", () => {
  assert.equal(digits("১২৩.৪৫"), "123.45");
  const r = recordSchema.parse({ kind: "cost", data: { amount: "১২৫০০.৫০" } });
  assert.equal(r.data.amount, "12500.50");
});
test("draft fields remain optional and unknown amounts do not become zero", () => {
  const r = recordSchema.parse({ kind: "study", data: {} });
  assert.equal(r.data.amount, "");
  assert.equal(r.data.invitation_date, "");
});
test("negative and invalid amounts fail", () => {
  for (const amount of ["-1", "abc", "10.123", "Infinity"])
    assert.equal(
      recordSchema.safeParse({ kind: "cost", data: { amount } }).success,
      false,
    );
});
test("decision cannot precede submission", () => {
  assert.equal(
    recordSchema.safeParse({
      kind: "visa",
      data: { submission_date: "2026-10-10", decision_date: "2026-10-01" },
    }).success,
    false,
  );
});
test("impossible calendar dates fail", () => {
  assert.equal(
    recordSchema.safeParse({
      kind: "visa",
      data: { submission_date: "2026-02-30" },
    }).success,
    false,
  );
  assert.equal(
    recordSchema.safeParse({
      kind: "flight",
      data: { departure_time: "2026-10-01T25:00" },
    }).success,
    false,
  );
});
test("timezone validation and unknown-field rejection", () => {
  assert.equal(
    recordSchema.safeParse({
      kind: "flight",
      data: { departure_timezone: "Fake/City" },
    }).success,
    false,
  );
  assert.equal(
    recordSchema.safeParse({ kind: "study", data: { owner_id: "spoof" } })
      .success,
    false,
  );
});
test("course supports preparatory, bachelor, masters, and phd", () => {
  for (const course of ["preparatory", "bachelor", "masters", "phd"] as const) {
    const res = recordSchema.safeParse({ kind: "study", data: { course } });
    assert.equal(res.success, true);
    if (res.success) {
      assert.equal(res.data.data.course, course);
    }
  }
});

