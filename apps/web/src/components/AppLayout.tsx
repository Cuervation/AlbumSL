import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../features/auth/useAuth";
import { SignOutButton } from "./SignOutButton";

export function AppLayout(): React.JSX.Element {
  const { user } = useAuth();

  return (
    <div className="app-frame">
      <header className="topbar">
        <NavLink className="brand" to="/">
          AlbumSL
        </NavLink>
        {user ? <SignOutButton compact /> : null}
      </header>
      <Outlet />
    </div>
  );
}
