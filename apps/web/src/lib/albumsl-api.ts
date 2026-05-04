import type { ApiErrorCode, ApiErrorResponse } from "@albumsl/contracts";

import { firebaseAuth } from "./firebase";

export class AlbumslApiError extends Error {
  readonly code: ApiErrorCode;
  readonly details?: readonly string[];

  constructor(code: ApiErrorCode, message: string, details?: readonly string[]) {
    super(message);
    this.name = "AlbumslApiError";
    this.code = code;
    this.details = details;
  }
}

function getApiBaseUrl(): string {
  const value = import.meta.env.VITE_ALBUMSL_API_BASE_URL;

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AlbumslApiError(
      "INTERNAL_ERROR",
      "Missing VITE_ALBUMSL_API_BASE_URL environment variable",
    );
  }

  return value.replace(/\/+$/, "");
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorResponse).error?.code === "string" &&
    typeof (value as ApiErrorResponse).error?.message === "string"
  );
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AlbumslApiError("INTERNAL_ERROR", "Backend returned invalid JSON");
  }
}

export async function postAuthenticatedJson<TRequest extends object, TResponse>(
  path: string,
  body: TRequest,
): Promise<TResponse> {
  const user = firebaseAuth.currentUser;
  if (!user) {
    throw new AlbumslApiError("UNAUTHENTICATED", "Authentication is required");
  }

  const idToken = await user.getIdToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await readJsonResponse(response);

  if (!response.ok) {
    if (isApiErrorResponse(payload)) {
      throw new AlbumslApiError(
        payload.error.code,
        payload.error.message,
        payload.error.details,
      );
    }

    throw new AlbumslApiError("INTERNAL_ERROR", "Backend request failed");
  }

  return payload as TResponse;
}
