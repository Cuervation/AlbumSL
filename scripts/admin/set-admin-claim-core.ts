export type AdminClaimOptions = {
  readonly uid?: string;
  readonly email?: string;
  readonly admin: boolean;
  readonly dryRun: boolean;
  readonly confirm: boolean;
};

const BOOLEAN_VALUES = new Set(["true", "false"]);

export function parseAdminClaimArgs(args: readonly string[]): AdminClaimOptions {
  const values = parseFlags(args);
  const uid = values.get("uid");
  const email = values.get("email");
  const adminValue = values.get("admin");
  const dryRun = values.has("dry-run") || !values.has("confirm");
  const confirm = values.has("confirm");

  if (!uid && !email) {
    throw new Error("Provide --uid USER_UID or --email USER_EMAIL.");
  }

  if (uid && email) {
    throw new Error("Provide only one identifier: --uid or --email.");
  }

  if (!adminValue || !BOOLEAN_VALUES.has(adminValue)) {
    throw new Error("Provide --admin true or --admin false.");
  }

  if (uid && !isValidUid(uid)) {
    throw new Error("Invalid --uid value.");
  }

  if (email && !isValidEmail(email)) {
    throw new Error("Invalid --email value.");
  }

  return {
    uid,
    email,
    admin: adminValue === "true",
    dryRun,
    confirm,
  };
}

export function assertCanApplyAdminClaim(options: AdminClaimOptions): void {
  if (options.dryRun) {
    return;
  }

  if (!options.confirm) {
    throw new Error("Real changes require --confirm.");
  }
}

export function getTargetDescription(options: AdminClaimOptions): string {
  return options.uid ? `uid:${options.uid}` : `email:${options.email ?? ""}`;
}

function parseFlags(args: readonly string[]): Map<string, string> {
  const values = new Map<string, string>();

  for (let index = 0; index < args.length; index += 1) {
    const rawArg = args[index];
    if (!rawArg?.startsWith("--")) {
      throw new Error(`Unexpected argument: ${rawArg ?? ""}`);
    }

    const key = rawArg.slice(2);
    if (key === "confirm" || key === "dry-run") {
      values.set(key, "true");
      continue;
    }

    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}.`);
    }

    values.set(key, value);
    index += 1;
  }

  return values;
}

function isValidUid(uid: string): boolean {
  return uid.trim().length > 0 && uid.length <= 128 && !uid.includes("/");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
