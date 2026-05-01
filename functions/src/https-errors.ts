import { ApplicationError, type ApplicationErrorCode } from "@albumsl/application";
import { HttpsError, type FunctionsErrorCode } from "firebase-functions/v2/https";

export function toHttpsError(error: unknown): HttpsError {
  if (error instanceof HttpsError) {
    return error;
  }

  if (error instanceof ApplicationError) {
    return new HttpsError(toFunctionsErrorCode(error.code), error.message, {
      code: error.code,
      details: error.details,
    });
  }

  return new HttpsError("internal", "Unexpected internal error", {
    code: "INTERNAL_ERROR",
  });
}

function toFunctionsErrorCode(code: ApplicationErrorCode): FunctionsErrorCode {
  switch (code) {
    case "PERMISSION_DENIED":
      return "permission-denied";
    case "INVALID_ARGUMENT":
      return "invalid-argument";
    case "INVALID_CLAIM":
    case "STICKER_NOT_FOUND":
      return "not-found";
    case "CLAIM_EXPIRED":
    case "CLAIM_ALREADY_CONSUMED":
    case "PACK_NOT_AVAILABLE":
    case "INSUFFICIENT_QUANTITY":
    case "ALREADY_CLAIMED":
      return "failed-precondition";
    case "NO_ACTIVE_STICKERS":
    case "INTERNAL_ERROR":
      return "internal";
  }

  return "internal";
}
