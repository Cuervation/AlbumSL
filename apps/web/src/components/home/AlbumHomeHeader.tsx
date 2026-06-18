import { Link, useLocation } from "react-router-dom";

import { UserAvatar } from "../UserAvatar";
import { HomeIcon } from "./HomeIcon";

interface AlbumHomeHeaderProps {
  readonly displayName: string;
  readonly email: string | null;
  readonly photoURL: string | null;
  readonly authenticated: boolean;
}

const HOME_NAV_ITEMS = [
  { label: "Inicio", to: "/", icon: "home" },
  { label: "Mi álbum", to: "/album", icon: "album" },
  { label: "Mis cromos", to: "/duplicates", icon: "stickers" },
  { label: "Intercambio", to: "/duplicates#exchange", icon: "exchange" },
  { label: "Sobres", to: "/open-pack", icon: "pack" },
] as const;

export function AlbumHomeHeader({
  displayName,
  email,
  photoURL,
  authenticated,
}: AlbumHomeHeaderProps): React.JSX.Element {
  const location = useLocation();

  return (
    <header className="album-home-header">
      <Link className="album-home-brand" to="/" aria-label="El Álbum Cuervo, inicio">
        <span className="album-home-shield" aria-hidden="true">
          <span>AC</span>
        </span>
        <span className="album-home-brand-copy">
          <strong>El Álbum Cuervo</strong>
          <small>La colección azulgrana</small>
        </span>
      </Link>

      <nav className="album-home-nav" aria-label="Navegación principal">
        {HOME_NAV_ITEMS.map((item) => {
          const isExchangeLink = item.to.includes("#exchange");
          const isActive = isExchangeLink
            ? location.pathname === "/duplicates" && location.hash === "#exchange"
            : location.pathname === item.to &&
              !(item.to === "/duplicates" && location.hash === "#exchange");

          return (
            <Link
              key={`${item.label}-${item.to}`}
              className={isActive ? "active" : undefined}
              to={item.to}
            >
              <HomeIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link className="album-home-profile" to={authenticated ? "/album" : "/login"}>
        <UserAvatar displayName={displayName} email={email} photoURL={photoURL} />
        <span>
          <strong>{authenticated ? displayName : "Ingresar"}</strong>
          <small>{authenticated ? "Perfil cuervo" : "Con Google"}</small>
        </span>
      </Link>
    </header>
  );
}
