export const ApiErrorCode = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  INVALID_ARGUMENT: "INVALID_ARGUMENT",
  ALREADY_CLAIMED: "ALREADY_CLAIMED",
  INVALID_CLAIM: "INVALID_CLAIM",
  CLAIM_EXPIRED: "CLAIM_EXPIRED",
  CLAIM_ALREADY_CONSUMED: "CLAIM_ALREADY_CONSUMED",
  PACK_NOT_AVAILABLE: "PACK_NOT_AVAILABLE",
  NO_ACTIVE_STICKERS: "NO_ACTIVE_STICKERS",
  STICKER_NOT_FOUND: "STICKER_NOT_FOUND",
  INSUFFICIENT_QUANTITY: "INSUFFICIENT_QUANTITY",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export interface ApiErrorResponse {
  readonly error: {
    readonly code: ApiErrorCode;
    readonly message: string;
    readonly details?: readonly string[];
  };
}
