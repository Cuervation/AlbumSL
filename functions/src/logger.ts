type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };

export type LogMetadata = {
  readonly functionName?: string;
  readonly userId?: string;
  readonly source?: string;
  readonly claimId?: string;
  readonly stickerId?: string;
  readonly packOpeningId?: string;
  readonly errorCode?: string;
  readonly admin?: boolean;
};

type LogLevel = "info" | "warning" | "error";

const ALLOWED_METADATA_KEYS = new Set<keyof LogMetadata>([
  "functionName",
  "userId",
  "source",
  "claimId",
  "stickerId",
  "packOpeningId",
  "errorCode",
  "admin",
]);

export function logInfo(event: string, metadata: LogMetadata = {}): void {
  writeLog("info", event, metadata);
}

export function logWarning(event: string, metadata: LogMetadata = {}): void {
  writeLog("warning", event, metadata);
}

export function logError(event: string, metadata: LogMetadata = {}): void {
  writeLog("error", event, metadata);
}

function writeLog(level: LogLevel, event: string, metadata: LogMetadata): void {
  const entry = {
    event,
    severity: level,
    metadata: sanitizeMetadata(metadata),
  };

  if (level === "error") {
    console.error(entry);
    return;
  }

  if (level === "warning") {
    console.warn(entry);
    return;
  }

  console.info(entry);
}

function sanitizeMetadata(metadata: LogMetadata): Record<string, JsonValue> {
  const safeMetadata: Record<string, JsonValue> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (!ALLOWED_METADATA_KEYS.has(key as keyof LogMetadata) || value === undefined) {
      continue;
    }

    if (isJsonSafe(value)) {
      safeMetadata[key] = value;
    }
  }

  return safeMetadata;
}

function isJsonSafe(value: unknown): value is JsonValue {
  if (value === null) {
    return true;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return Number.isFinite(value) || typeof value !== "number";
  }

  if (Array.isArray(value)) {
    return value.every(isJsonSafe);
  }

  if (typeof value === "object") {
    return Object.values(value).every(isJsonSafe);
  }

  return false;
}
