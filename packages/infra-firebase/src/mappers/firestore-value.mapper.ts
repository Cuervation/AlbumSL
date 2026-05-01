import { Timestamp } from "firebase-admin/firestore";

export type FirestoreMetadata = Readonly<Record<string, string | number | boolean | null>>;

export function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

export function numberValue(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

export function optionalStringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function optionalDateValue(value: unknown): Date | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return dateValue(value);
}

export function dateValue(value: unknown): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
  }

  return new Date(0);
}

export function metadataValue(value: unknown): FirestoreMetadata {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string | number | boolean | null] => {
      const item = entry[1];
      return (
        item === null ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean"
      );
    }),
  );
}

export function enumValue<T extends string>(
  enumObject: Record<string, T>,
  value: unknown,
  fallback: T,
): T {
  return typeof value === "string" && Object.values(enumObject).includes(value as T)
    ? (value as T)
    : fallback;
}
