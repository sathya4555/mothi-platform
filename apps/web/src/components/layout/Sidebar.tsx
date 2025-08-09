import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({
  to,
  children,
}) => {
  const { pathname } = useLocation();
  const active = pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`block rounded-md px-3 py-2 text-sm ${active ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`}
    >
      {children}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  return (
    <aside className="w-56 border-r border-border p-4 space-y-2">
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/purchases">Purchases</NavLink>
      <NavLink to="/parties">Parties</NavLink>
      {isAdmin && <NavLink to="/products">Products</NavLink>}
      {isAdmin && <NavLink to="/users">Users</NavLink>}
    </aside>
  );
};

export default Sidebar;
