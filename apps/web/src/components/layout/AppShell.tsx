import React from "react";
import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  React.useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Topbar onMenuClick={toggle} />
      {/* Full-bleed on mobile; container on md+ */}
      <div className="px-3 py-4 md:container md:px-0 flex gap-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={close} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border p-4 shadow-lg">
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-accent hover:text-accent-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M16.5 6.75a.75.75 0 0 1 0 1.06L13.31 11l3.19 3.19a.75.75 0 1 1-1.06 1.06L12.25 12.06 9.06 15.25a.75.75 0 0 1-1.06-1.06L11.19 11 8 7.81a.75.75 0 0 1 1.06-1.06l3.19 3.19 3.19-3.19a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <Sidebar />
          </div>
        </>
      )}
    </div>
  );
};

export default AppShell;
