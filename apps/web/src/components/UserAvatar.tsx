interface UserAvatarProps {
  readonly displayName: string | null;
  readonly email: string | null;
  readonly photoURL: string | null;
}

export function UserAvatar({ displayName, email, photoURL }: UserAvatarProps): React.JSX.Element {
  const fallbackText = (displayName ?? email ?? "U").trim().charAt(0).toUpperCase();

  if (photoURL) {
    return <img className="user-avatar" src={photoURL} alt={displayName ?? "Usuario"} />;
  }

  return (
    <div className="user-avatar user-avatar-fallback" aria-hidden="true">
      {fallbackText || "U"}
    </div>
  );
}
