import { ApiErrorCode, type AuthenticatedUserDto } from "@albumsl/contracts";
import { getApps, initializeApp, type App, type AppOptions } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import { HttpApiError } from "./http-errors.js";

function resolveFirebaseProjectId(): string | undefined {
  return process.env.FIREBASE_PROJECT_ID ?? process.env.GCLOUD_PROJECT;
}

export function getOrCreateFirebaseApp(): App {
  const existingApp = getApps()[0];
  if (existingApp) {
    return existingApp;
  }

  const projectId = resolveFirebaseProjectId();
  const options: AppOptions | undefined = projectId ? { projectId } : undefined;
  return initializeApp(options);
}

function parseBearerToken(authorizationHeader: string | undefined): string {
  if (!authorizationHeader) {
    throw new HttpApiError(401, ApiErrorCode.UNAUTHENTICATED, "Authentication token is required");
  }

  const [scheme, token, extra] = authorizationHeader.trim().split(/\s+/);
  const isBearer = scheme?.toLowerCase() === "bearer";
  if (!isBearer || !token || extra) {
    throw new HttpApiError(
      401,
      ApiErrorCode.UNAUTHENTICATED,
      "Authorization header must be in Bearer format",
    );
  }

  return token;
}

export async function authenticateUserFromAuthorizationHeader(
  authorizationHeader: string | undefined,
): Promise<AuthenticatedUserDto> {
  const idToken = parseBearerToken(authorizationHeader);

  try {
    const app = getOrCreateFirebaseApp();
    const decodedToken = await getAuth(app).verifyIdToken(idToken);
    return {
      uid: decodedToken.uid,
      displayName: typeof decodedToken.name === "string" ? decodedToken.name : null,
      email: typeof decodedToken.email === "string" ? decodedToken.email : null,
      photoURL: typeof decodedToken.picture === "string" ? decodedToken.picture : null,
    };
  } catch {
    throw new HttpApiError(401, ApiErrorCode.UNAUTHENTICATED, "Invalid or expired token");
  }
}
