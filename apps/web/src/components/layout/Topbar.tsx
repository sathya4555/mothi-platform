import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type TopbarProps = {
  onMenuClick?: () => void;
};

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { logout, user } = useAuth();
  const [isDark, setIsDark] = React.useState(false);
  const userInitial = (user?.email?.[0] || "M").toUpperCase();

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    const next = document.documentElement.classList.contains("dark");
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  React.useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  return (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="h-14 flex items-center justify-between px-2.5 md:container md:px-2.5">
        {/* Brand + Menu */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            onClick={onMenuClick}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-background/60 hover:bg-accent hover:text-accent-foreground transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm.75 5.25a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="relative h-7 w-7 overflow-hidden rounded-md ring-1 ring-border">
              <img
                src="/images/mothi-logo.png"
                alt="Mothi"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-black/5" />
            </div>
            <div className="font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                Mothi Tex
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/60 hover:bg-accent hover:text-accent-foreground transition"
          >
            <span
              className={`transition-transform ${isDark ? "rotate-0" : "-rotate-90"}`}
            >
              {isDark ? (
                // Sun
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-5 w-5"
                >
                  <path d="M12 3v2m0 14v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M3 12h2m14 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              ) : (
                // Moon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-5 w-5"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                </svg>
              )}
            </span>
          </button>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-border/70" />

          {/* User pill */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-2.5 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold ring-1 ring-primary/20">
              {userInitial}
            </div>
            <div className="text-xs text-muted-foreground max-w-[160px] truncate">
              {user?.email}
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="outline"
            onClick={logout}
            className="hidden md:inline-flex h-9 rounded-full"
          >
            Logout
          </Button>
        </div>
      </div>
      {/* subtle gradient line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
};

export default Topbar;
