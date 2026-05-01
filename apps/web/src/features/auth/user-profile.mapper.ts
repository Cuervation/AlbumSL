import {
  UserRole,
  type AuthenticatedUserDto,
  type UserProfileUpdateDto,
  type UserRole as UserRoleValue,
} from "@albumsl/contracts";

export interface FirebaseUserProfileSource {
  readonly uid: string;
  readonly displayName: string | null;
  readonly email: string | null;
  readonly photoURL: string | null;
}

export interface InitialUserProfileData extends AuthenticatedUserDto {
  readonly role: typeof UserRole.USER;
}

export interface UserProfileUpdateCandidate extends UserProfileUpdateDto {
  readonly uid?: string;
  readonly email?: string | null;
  readonly role?: UserRoleValue;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export function mapFirebaseUserToAuthenticatedUser(
  firebaseUser: FirebaseUserProfileSource,
): AuthenticatedUserDto {
  return {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName,
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL,
  };
}

export function mapFirebaseUserToInitialProfileData(
  firebaseUser: FirebaseUserProfileSource,
): InitialUserProfileData {
  return {
    ...mapFirebaseUserToAuthenticatedUser(firebaseUser),
    role: UserRole.USER,
  };
}

export function sanitizeUserProfileUpdateFields(
  data: UserProfileUpdateCandidate,
): UserProfileUpdateDto {
  const allowedFields: {
    displayName?: string | null;
    photoURL?: string | null;
  } = {};

  if ("displayName" in data) {
    allowedFields.displayName = data.displayName ?? null;
  }

  if ("photoURL" in data) {
    allowedFields.photoURL = data.photoURL ?? null;
  }

  return allowedFields;
}
