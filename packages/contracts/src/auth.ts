export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface AuthenticatedUserDto {
  readonly uid: string;
  readonly displayName: string | null;
  readonly email: string | null;
  readonly photoURL: string | null;
}

export interface UserProfileDto extends AuthenticatedUserDto {
  readonly role: UserRole;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserProfileUpdateDto {
  readonly displayName?: string | null;
  readonly photoURL?: string | null;
}
