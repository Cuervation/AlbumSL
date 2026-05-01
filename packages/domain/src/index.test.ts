import { describe, expect, it } from "vitest";

import { getDomainPackageName } from "./index";

describe("domain package", () => {
  it("exposes a stable package identity", () => {
    expect(getDomainPackageName()).toBe("@albumsl/domain");
  });
});
