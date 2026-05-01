import { describe, expect, it } from "vitest";

import { createApplicationContext } from "./index";

describe("application package", () => {
  it("creates a context without depending on Firebase directly", () => {
    const context = createApplicationContext({ infrastructure: { provider: "test" } });

    expect(context).toMatchObject({
      domainPackage: "@albumsl/domain",
      infrastructureProvider: "test",
      serviceName: "albumsl-functions",
    });
  });
});
