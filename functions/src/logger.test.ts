import { afterEach, describe, expect, it, vi } from "vitest";

import { logInfo } from "./logger.js";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not fail with empty metadata", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    expect(() => logInfo("test_event")).not.toThrow();
    expect(infoSpy).toHaveBeenCalledWith({
      event: "test_event",
      severity: "info",
      metadata: {},
    });
  });
});
