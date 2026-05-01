export type ApplicationErrorCode =
  | "INVALID_ARGUMENT"
  | "PERMISSION_DENIED"
  | "ALREADY_CLAIMED"
  | "INVALID_CLAIM"
  | "CLAIM_EXPIRED"
  | "CLAIM_ALREADY_CONSUMED"
  | "PACK_NOT_AVAILABLE"
  | "NO_ACTIVE_STICKERS"
  | "STICKER_NOT_FOUND"
  | "INSUFFICIENT_QUANTITY"
  | "INTERNAL_ERROR";

export class ApplicationError extends Error {
  public readonly code: ApplicationErrorCode;
  public readonly details: readonly string[];

  public constructor(code: ApplicationErrorCode, message: string, details: readonly string[] = []) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
    this.details = details;
  }
}
