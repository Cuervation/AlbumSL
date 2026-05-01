export type ApplicationErrorCode =
  | "INVALID_ARGUMENT"
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
