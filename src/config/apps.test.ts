import { describe, expect, it } from "vitest";
import { ATTENDANCE_URL, attendanceUrl, returnTarget } from "./apps";

const q = (params: Record<string, string>) => `?${new URLSearchParams(params).toString()}`;

describe("returnTarget: where the login sends a user another app sent here", () => {
  it("goes back to the Attendance page that asked", () => {
    const next = `${ATTENDANCE_URL}/attendance?month=2026-11`;
    expect(returnTarget(q({ app: "attendance", next }))).toEqual({ app: "attendance", url: next });
  });

  it("never to another site: an outside or broken next becomes Attendance's dashboard", () => {
    for (const next of ["https://evil.test/phish", "javascript:alert(1)", "//evil.test", "not a url"]) {
      expect(returnTarget(q({ app: "attendance", next }))).toEqual({ app: "attendance", url: attendanceUrl() });
    }
  });

  it("nothing without a known app", () => {
    expect(returnTarget("")).toBeNull();
    expect(returnTarget(q({ next: `${ATTENDANCE_URL}/dashboard` }))).toBeNull();
    expect(returnTarget(q({ app: "payroll", next: `${ATTENDANCE_URL}/dashboard` }))).toBeNull();
  });
});

describe("attendanceUrl", () => {
  it("names the company and branch for Attendance to open", () => {
    const url = new URL(attendanceUrl("Z1", "B2"));
    expect(url.pathname).toBe("/dashboard");
    expect(url.searchParams.get("zodu_id")).toBe("Z1");
    expect(url.searchParams.get("branch_id")).toBe("B2");
  });

  it("a branch only with its company", () => {
    expect(new URL(attendanceUrl(null, "B2")).search).toBe("");
  });
});
