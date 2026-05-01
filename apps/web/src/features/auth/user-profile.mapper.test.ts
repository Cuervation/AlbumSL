import { describe, expect, it } from "vitest";

import { UserRole } from "@albumsl/contracts";

import {
  mapFirebaseUserToAuthenticatedUser,
  mapFirebaseUserToInitialProfileData,
  sanitizeUserProfileUpdateFields,
} from "./user-profile.mapper";

const firebaseUser = {
  uid: "user-1",
  displayName: "Socio Cuervo",
  email: "socio@example.com",
  photoURL: "https://example.com/avatar.png",
};

describe("user profile mapper", () => {
  it("maps Firebase user data to an authenticated user dto", () => {
    expect(mapFirebaseUserToAuthenticatedUser(firebaseUser)).toEqual(firebaseUser);
  });

  it("creates initial user profile data with USER role", () => {
    expect(mapFirebaseUserToInitialProfileData(firebaseUser)).toEqual({
      ...firebaseUser,
      role: UserRole.USER,
    });
  });

  it("keeps only profile fields that frontend is allowed to update", () => {
    expect(
      sanitizeUserProfileUpdateFields({
        uid: "other-user",
        displayName: "Nuevo nombre",
        email: "otro@example.com",
        photoURL: null,
        role: UserRole.ADMIN,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    ).toEqual({
      displayName: "Nuevo nombre",
      photoURL: null,
    });
  });
});
