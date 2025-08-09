import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  authService,
  type AdminUserLite,
  type AdminUserRole,
} from "@/services/auth.service";

const inputBase =
  "h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 ring-ring";

const UsersPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | "">("");
  const [form, setForm] = useState<{
    name: string;
    email: string;
    phone: string;
    role: AdminUserRole;
  }>({ name: "", email: "", phone: "", role: "agent" });

  // Confirmation state
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    user: AdminUserLite;
    newRole: AdminUserRole;
  } | null>(null);
  const [lastInvite, setLastInvite] = useState<{
    email: string;
    link: string;
  } | null>(null);

  const { data: users, isLoading } = useQuery<AdminUserLite[]>({
    queryKey: ["admin-users", { search, roleFilter }],
    queryFn: () =>
      authService.adminListUsers(roleFilter || undefined, search || undefined),
  });

  const { mutateAsync: createUser, isPending: creating } = useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      phone: string;
      role: AdminUserRole;
    }) => authService.adminCreateUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
  const { mutateAsync: updateUser } = useMutation({
    mutationFn: (p: {
      id: number;
      updates: Partial<{ role: AdminUserRole; isActive: boolean }>;
    }) => authService.adminUpdateUser(p.id, p.updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
  const { mutateAsync: deleteUser } = useMutation({
    mutationFn: (id: number) => authService.adminDeleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmCreateOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="container py-6 space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h1 className="text-2xl font-bold">Users</h1>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className={inputBase + " w-64"}
              placeholder="Search name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className={inputBase}
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value as AdminUserRole | "")
              }
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="coordinator">Coordinator</option>
              <option value="agent">Agent</option>
            </select>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Create User</h2>
            <form onSubmit={onSubmit} className="grid gap-3">
              <input
                className={inputBase}
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className={inputBase}
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                className={inputBase}
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <div className="grid grid-cols-1">
                <select
                  className={inputBase}
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as AdminUserRole })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
              <Button type="submit" disabled={creating}>
                Create
              </Button>
              <p className="text-xs text-muted-foreground">
                User will set their password via the invite link.
              </p>
            </form>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">All Users</h2>
            <div className="grid gap-2">
              {isLoading && (
                <div className="rounded border border-border p-3">
                  Loading...
                </div>
              )}
              {users?.length
                ? users.map((u) => (
                    <div
                      key={u.id}
                      className="rounded-xl border border-border p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {u.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className={inputBase}
                          value={u.role}
                          onChange={(e) =>
                            setPendingRoleChange({
                              user: u,
                              newRole: e.target.value as AdminUserRole,
                            })
                          }
                        >
                          <option value="admin">Admin</option>
                          <option value="coordinator">Coordinator</option>
                          <option value="agent">Agent</option>
                        </select>
                        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={u.isActive}
                            onChange={(e) =>
                              updateUser({
                                id: u.id,
                                updates: { isActive: e.target.checked },
                              })
                            }
                          />{" "}
                          Active
                        </label>
                        <Button
                          variant="outline"
                          onClick={() => deleteUser(u.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                : !isLoading && (
                    <div className="text-sm text-muted-foreground">
                      No users
                    </div>
                  )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Create User */}
      {confirmCreateOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmCreateOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-xl">
              <div className="p-6 text-center space-y-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  Create User?
                </h3>
                <p className="text-sm text-muted-foreground">
                  {form.name} • {form.email} • {form.role}
                </p>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    variant="ghost"
                    className="h-11"
                    onClick={() => setConfirmCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-11"
                    onClick={async () => {
                      try {
                        const res = await createUser(form);
                        setForm({
                          name: "",
                          email: "",
                          phone: "",
                          role: "agent",
                        });
                        const origin = window.location.origin;
                        const link = `${origin}/onboarding?token=${res.setupToken}`;
                        setLastInvite({
                          email: (res as any).user?.email || form.email,
                          link,
                        });
                      } finally {
                        setConfirmCreateOpen(false);
                      }
                    }}
                  >
                    Yes, Create
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Role Update */}
      {pendingRoleChange && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setPendingRoleChange(null)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-xl">
              <div className="p-6 text-center space-y-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  Change Role?
                </h3>
                <p className="text-sm text-muted-foreground">
                  {pendingRoleChange.user.name} → {pendingRoleChange.newRole}
                </p>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    variant="ghost"
                    className="h-11"
                    onClick={() => setPendingRoleChange(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-11"
                    onClick={async () => {
                      try {
                        await updateUser({
                          id: pendingRoleChange.user.id,
                          updates: { role: pendingRoleChange.newRole },
                        });
                      } finally {
                        setPendingRoleChange(null);
                      }
                    }}
                  >
                    Yes, Update
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Last invite link */}
      {lastInvite && (
        <div className="fixed bottom-4 right-4 z-40 rounded-xl border border-border bg-background p-4 shadow-lg">
          <div className="text-sm font-medium">Invite Link</div>
          <div className="text-xs text-muted-foreground">
            {lastInvite.email}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              className={inputBase + " w-72"}
              value={lastInvite.link}
              readOnly
            />
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(lastInvite.link);
                } catch {}
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
