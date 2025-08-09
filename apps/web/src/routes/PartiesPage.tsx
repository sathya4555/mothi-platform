import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  partyService,
  type CreatePartyInput,
  type Party,
  userService,
  type UserLite,
} from "@/services/party.service";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const PartiesPage: React.FC = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAdminOrCoord = user?.role === "admin" || user?.role === "coordinator";

  const [search, setSearch] = useState("");
  const [agentQuery, setAgentQuery] = useState("");
  const [agentOpen, setAgentOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<UserLite | null>(null);
  const [allAgents, setAllAgents] = useState<boolean>(true);
  const [form, setForm] = useState<CreatePartyInput>({
    name: "",
    address: "",
    gstNumber: "",
    email: "",
    phone: "",
  });

  const { data: parties, isLoading } = useQuery<Party[]>({
    queryKey: [
      "parties",
      { search, selectedAgentId: allAgents ? "" : (selectedAgent?.id ?? "") },
    ],
    queryFn: () => {
      if (isAdminOrCoord && !allAgents && selectedAgent?.id) {
        return partyService.listByAgent(
          Number(selectedAgent.id),
          search || undefined
        );
      }
      return partyService.list(search || undefined);
    },
  });

  const { data: agents } = useQuery<UserLite[]>({
    queryKey: ["agents", { agentQuery }],
    queryFn: () => userService.listAgents(agentQuery || undefined),
    enabled: isAdminOrCoord && !allAgents,
  });

  const { mutateAsync: createParty, isPending } = useMutation({
    mutationFn: (input: CreatePartyInput) => partyService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parties"] }),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createParty(form);
    setForm({ name: "", address: "", gstNumber: "", email: "", phone: "" });
  };

  return (
    <div className="min-h-screen">
      <div className="container py-6 space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h1 className="text-2xl font-bold">Parties</h1>
          <div className="relative w-full md:w-auto flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
            <input
              placeholder="Search by name"
              className="h-10 w-full md:w-60 rounded-md border border-border bg-background px-3 text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {isAdminOrCoord && (
              <>
                <label className="sm:ml-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={allAgents}
                    onChange={(e) => setAllAgents(e.target.checked)}
                  />
                  All agents
                </label>
                {!allAgents && (
                  <div className="relative w-full md:w-auto">
                    <input
                      className="h-10 w-full md:w-56 rounded-md border border-border bg-background px-3 text-sm outline-none"
                      placeholder="Filter by agent"
                      value={agentQuery}
                      onChange={(e) => setAgentQuery(e.target.value)}
                      onFocus={() => setAgentOpen(true)}
                      onBlur={() => setTimeout(() => setAgentOpen(false), 120)}
                    />
                    {agentOpen && (
                      <div className="absolute left-0 right-0 z-50 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-border bg-background shadow-sm">
                        {agents?.length ? (
                          agents.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setSelectedAgent(a);
                                setAgentQuery(a.name);
                                setAgentOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${selectedAgent?.id === a.id ? "bg-accent/40" : ""}`}
                            >
                              <div className="font-medium">{a.name}</div>
                              <div className="text-xs text-muted-foreground">
                                ID: {a.id}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No agents
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Create Party</h2>
            <form onSubmit={onSubmit} className="grid gap-3">
              <input
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="Party Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
              <input
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="GST Number"
                value={form.gstNumber}
                onChange={(e) =>
                  setForm({ ...form, gstNumber: e.target.value })
                }
                required
              />
              <input
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Party"}
              </Button>
            </form>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Party List</h2>
            <div className="grid gap-3">
              {isLoading && (
                <div className="rounded-lg border border-border p-4">
                  Loading...
                </div>
              )}
              {parties?.length
                ? parties.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-muted-foreground">
                        GST: {p.gstNumber}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {p.address}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {p.email} • {p.phone}
                      </div>
                      {isAdminOrCoord && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Agent ID: {p.createdBy}
                        </div>
                      )}
                    </div>
                  ))
                : !isLoading && (
                    <div className="text-muted-foreground">
                      No parties found
                    </div>
                  )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartiesPage;
