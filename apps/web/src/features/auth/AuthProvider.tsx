import type { User } from "firebase/auth";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { UserProfileDto } from "@albumsl/contracts";

import { firebaseAuth, firestoreDb, googleAuthProvider } from "../../lib/firebase";
import { getAuthErrorMessage } from "./auth-errors";
import { AuthContext } from "./auth-context";
import { createUserProfileIfMissing, getUserProfile } from "./user-profile.service";

export interface AuthContextValue {
  readonly user: User | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly currentUserProfile: UserProfileDto | null;
  readonly signInWithGoogle: () => Promise<void>;
  readonly signOut: () => Promise<void>;
  readonly refreshUserProfile: () => Promise<void>;
}

export function AuthProvider({ children }: { readonly children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = useCallback(async (firebaseUser: User): Promise<void> => {
    const profile = await createUserProfileIfMissing(firestoreDb, firebaseUser);
    setCurrentUserProfile(profile);
  }, []);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setLoading(true);
      setUser(nextUser);
      setError(null);

      if (!nextUser) {
        setCurrentUserProfile(null);
        setLoading(false);
        return;
      }

      void loadUserProfile(nextUser)
        .catch((loadError: unknown) => {
          if (mounted) {
            setCurrentUserProfile(null);
            setError(getAuthErrorMessage(loadError));
          }
        })
        .finally(() => {
          if (mounted) {
            setLoading(false);
          }
        });
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [loadUserProfile]);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      await signInWithPopup(firebaseAuth, googleAuthProvider);
    } catch (signInError) {
      setError(getAuthErrorMessage(signInError));
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      await firebaseSignOut(firebaseAuth);
      setCurrentUserProfile(null);
    } catch (signOutError) {
      setError(getAuthErrorMessage(signOutError));
    }
  }, []);

  const refreshUserProfile = useCallback(async (): Promise<void> => {
    if (!user) {
      setCurrentUserProfile(null);
      return;
    }

    setError(null);

    try {
      const profile = await getUserProfile(firestoreDb, user.uid);
      setCurrentUserProfile(profile ?? (await createUserProfileIfMissing(firestoreDb, user)));
    } catch (profileError) {
      setError(getAuthErrorMessage(profileError));
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      currentUserProfile,
      signInWithGoogle,
      signOut,
      refreshUserProfile,
    }),
    [currentUserProfile, error, loading, refreshUserProfile, signInWithGoogle, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
