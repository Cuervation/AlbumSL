import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../features/auth/useAuth";
import { SignOutButton } from "./SignOutButton";

export function AppLayout(): React.JSX.Element {
  const { currentUserProfile, user } = useAuth();
  const showAdminLink = currentUserProfile?.role === "ADMIN";

  return (
    <div className="app-frame">
      <header className="topbar">
        <NavLink className="brand" to="/">
          AlbumSL
        </NavLink>
        <nav className="nav-links" aria-label="Principal">
          <NavLink to="/">Inicio</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/album">Mi Album</NavLink>
              <NavLink to="/duplicates">Repetidas</NavLink>
              <NavLink to="/catalog">Catalogo</NavLink>
              <NavLink to="/open-pack">Sobres</NavLink>
              {showAdminLink ? <NavLink to="/admin">Admin</NavLink> : null}
            </>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </nav>
        {user ? <SignOutButton compact /> : null}
      </header>
      <Outlet />
    </div>
  );
}
