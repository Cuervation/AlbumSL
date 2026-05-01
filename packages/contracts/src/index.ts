export interface HealthResponseDto {
  readonly ok: true;
  readonly service: string;
}

export type SharedErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "VALIDATION_ERROR" | "UNKNOWN";
