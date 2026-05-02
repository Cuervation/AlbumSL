import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type UserRecord } from "firebase-admin/auth";

import {
  assertCanApplyAdminClaim,
  getTargetDescription,
  parseAdminClaimArgs,
} from "./set-admin-claim-core.js";

async function main(): Promise<void> {
  const options = parseAdminClaimArgs(process.argv.slice(2));
  assertCanApplyAdminClaim(options);
  assertBackendConfiguration();

  const app = getApps()[0] ?? initializeApp();
  const auth = getAuth(app);
  const user = await findUser(options, auth);
  const nextClaims = {
    ...user.customClaims,
    admin: options.admin,
  };

  const summary = {
    target: getTargetDescription(options),
    resolvedUid: user.uid,
    admin: options.admin,
    mode: options.dryRun ? "dry-run" : "apply",
  };

  if (options.dryRun) {
    console.info({
      event: "admin_claim_dry_run",
      summary,
      message: "No changes were written. Re-run with npm run admin:claim -- ... --confirm.",
    });
    return;
  }

  await auth.setCustomUserClaims(user.uid, nextClaims);
  console.info({
    event: "admin_claim_updated",
    summary,
  });
}

function assertBackendConfiguration(): void {
  if (!process.env.FIREBASE_PROJECT_ID && !process.env.GCLOUD_PROJECT) {
    throw new Error("Set FIREBASE_PROJECT_ID or GCLOUD_PROJECT before running this script.");
  }
}

async function findUser(
  options: {
    readonly uid?: string;
    readonly email?: string;
  },
  auth: ReturnType<typeof getAuth>,
): Promise<UserRecord> {
  if (options.uid) {
    return auth.getUser(options.uid);
  }

  if (options.email) {
    return auth.getUserByEmail(options.email);
  }

  throw new Error("Provide --uid or --email.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown admin claim error.";
  console.error({
    event: "admin_claim_failed",
    message,
  });
  process.exitCode = 1;
});
