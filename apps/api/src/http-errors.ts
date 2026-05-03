import { ApplicationError, type ApplicationErrorCode } from "@albumsl/application";
import type { ApiErrorCode } from "@albumsl/contracts";

export class HttpApiError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly details?: readonly string[];

  constructor(
    statusCode: number,
    code: ApiErrorCode,
    message: string,
    details?: readonly string[],
  ) {
    super(message);
    this.name = "HttpApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function toHttpApiError(error: unknown): HttpApiError {
  if (error instanceof HttpApiError) {
    return error;
  }

  if (error instanceof ApplicationError) {
    return new HttpApiError(toHttpStatusCode(error.code), error.code, error.message, error.details);
  }

  return new HttpApiError(500, "INTERNAL_ERROR", "Internal server error");
}

function toHttpStatusCode(code: ApplicationErrorCode): number {
  switch (code) {
    case "INVALID_ARGUMENT":
      return 400;
    case "PERMISSION_DENIED":
      return 403;
    case "INVALID_CLAIM":
    case "STICKER_NOT_FOUND":
      return 404;
    case "ALREADY_CLAIMED":
    case "CLAIM_EXPIRED":
    case "CLAIM_ALREADY_CONSUMED":
    case "PACK_NOT_AVAILABLE":
    case "INSUFFICIENT_QUANTITY":
      return 409;
    case "NO_ACTIVE_STICKERS":
    case "INTERNAL_ERROR":
      return 500;
  }

  return 500;
}
