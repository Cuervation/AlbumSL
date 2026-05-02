import { describe, expect, it } from "vitest";

import { assertCanApplyAdminClaim, parseAdminClaimArgs } from "./set-admin-claim-core.js";

describe("parseAdminClaimArgs", () => {
  it("parses dry-run by default with uid", () => {
    expect(parseAdminClaimArgs(["--uid", "user-1", "--admin", "true"])).toEqual({
      uid: "user-1",
      email: undefined,
      admin: true,
      dryRun: true,
      confirm: false,
    });
  });

  it("parses confirmed removal with uid", () => {
    expect(parseAdminClaimArgs(["--uid", "user-1", "--admin", "false", "--confirm"])).toEqual({
      uid: "user-1",
      email: undefined,
      admin: false,
      dryRun: false,
      confirm: true,
    });
  });

  it("parses email target", () => {
    expect(parseAdminClaimArgs(["--email", "admin@example.test", "--admin", "true"])).toMatchObject(
      {
        email: "admin@example.test",
        admin: true,
      },
    );
  });

  it("rejects invalid admin values", () => {
    expect(() => parseAdminClaimArgs(["--uid", "user-1", "--admin", "yes"])).toThrow(
      "Provide --admin true or --admin false.",
    );
  });

  it("rejects missing identifier", () => {
    expect(() => parseAdminClaimArgs(["--admin", "true"])).toThrow(
      "Provide --uid USER_UID or --email USER_EMAIL.",
    );
  });

  it("rejects using uid and email together", () => {
    expect(() =>
      parseAdminClaimArgs(["--uid", "user-1", "--email", "admin@example.test", "--admin", "true"]),
    ).toThrow("Provide only one identifier: --uid or --email.");
  });

  it("rejects invalid email", () => {
    expect(() => parseAdminClaimArgs(["--email", "not-email", "--admin", "true"])).toThrow(
      "Invalid --email value.",
    );
  });
});

describe("assertCanApplyAdminClaim", () => {
  it("allows dry-run without confirm", () => {
    expect(() =>
      assertCanApplyAdminClaim({
        uid: "user-1",
        admin: true,
        dryRun: true,
        confirm: false,
      }),
    ).not.toThrow();
  });

  it("requires confirm for real changes", () => {
    expect(() =>
      assertCanApplyAdminClaim({
        uid: "user-1",
        admin: true,
        dryRun: false,
        confirm: false,
      }),
    ).toThrow("Real changes require --confirm.");
  });
});
