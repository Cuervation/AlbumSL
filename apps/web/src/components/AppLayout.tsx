import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../features/auth/useAuth";
import { SignOutButton } from "./SignOutButton";

export function AppLayout(): React.JSX.Element {
  const { user } = useAuth();
  const location = useLocation();
  const isImmersivePage = location.pathname === "/" || location.pathname === "/duplicates";

  return (
    <div className={`app-frame${isImmersivePage ? " app-frame--immersive-home" : ""}`}>
      {isImmersivePage ? null : (
        <header className="topbar">
          <NavLink className="brand" to="/">
            AlbumSL
          </NavLink>
          {user ? <SignOutButton compact /> : null}
        </header>
      )}
      <Outlet />
    </div>
  );
}
