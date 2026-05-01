import type { UserProfileDto, UserProfileUpdateDto } from "@albumsl/contracts";
import { UserRole } from "@albumsl/contracts";
import type { User } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type Firestore,
} from "firebase/firestore";

import {
  mapFirebaseUserToInitialProfileData,
  sanitizeUserProfileUpdateFields,
} from "./user-profile.mapper";

const USERS_COLLECTION = "users";

export async function getUserProfile(db: Firestore, uid: string): Promise<UserProfileDto | null> {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));

  if (!snapshot.exists()) {
    return null;
  }

  return mapUserProfileDocument(snapshot.data());
}

export async function createUserProfileIfMissing(
  db: Firestore,
  firebaseUser: User,
): Promise<UserProfileDto> {
  const existingProfile = await getUserProfile(db, firebaseUser.uid);

  if (existingProfile) {
    return existingProfile;
  }

  const profileData = mapFirebaseUserToInitialProfileData(firebaseUser);
  const profileRef = doc(db, USERS_COLLECTION, firebaseUser.uid);

  await setDoc(profileRef, {
    ...profileData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const createdProfile = await getUserProfile(db, firebaseUser.uid);

  if (!createdProfile) {
    throw new Error("User profile could not be created");
  }

  return createdProfile;
}

export async function updateUserProfileAllowedFields(
  db: Firestore,
  uid: string,
  data: UserProfileUpdateDto,
): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    ...sanitizeUserProfileUpdateFields(data),
    updatedAt: serverTimestamp(),
  });
}

function mapUserProfileDocument(data: Record<string, unknown>): UserProfileDto {
  return {
    uid: stringOrEmpty(data.uid),
    displayName: nullableString(data.displayName),
    email: nullableString(data.email),
    photoURL: nullableString(data.photoURL),
    role: data.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER,
    createdAt: timestampToIsoString(data.createdAt),
    updatedAt: timestampToIsoString(data.updatedAt),
  };
}

function stringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function timestampToIsoString(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return new Date(0).toISOString();
}
