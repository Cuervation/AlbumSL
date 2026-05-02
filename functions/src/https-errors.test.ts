import { ApplicationError } from "@albumsl/application";
import { describe, expect, it } from "vitest";

import { toHttpsError } from "./https-errors.js";

describe("toHttpsError", () => {
  it("maps known ApplicationError safely", () => {
    const error = toHttpsError(new ApplicationError("INVALID_ARGUMENT", "Invalid input"));

    expect(error.code).toBe("invalid-argument");
    expect(error.message).toBe("Invalid input");
    expect(error.details).toEqual({
      code: "INVALID_ARGUMENT",
      details: [],
    });
  });

  it("maps unknown errors as internal without exposing details", () => {
    const error = toHttpsError(new Error("database exploded"));

    expect(error.code).toBe("internal");
    expect(error.message).toBe("Unexpected internal error");
    expect(error.details).toEqual({
      code: "INTERNAL_ERROR",
    });
  });
});
