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
import {
  Search,
  Plus,
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  User,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";

const PartiesPage: React.FC = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAdminOrCoord = user?.role === "admin" || user?.role === "coordinator";

  const [search, setSearch] = useState("");
  const [agentQuery, setAgentQuery] = useState("");
  const [agentOpen, setAgentOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<UserLite | null>(null);
  const [allAgents, setAllAgents] = useState<boolean>(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parties"] });
      setShowCreateForm(false);
      setForm({ name: "", address: "", gstNumber: "", email: "", phone: "" });
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createParty(form);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedAgent(null);
    setAgentQuery("");
    setAllAgents(true);
    setShowFilters(false);
  };

  const hasActiveFilters = search || (!allAgents && selectedAgent);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 px-4 sm:py-6 sm:px-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Parties
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage your business partners and customers
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 w-full sm:w-auto"
            size="lg"
          >
            <Plus className="h-4 w-4" />
            Add Party
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg border border-border p-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search parties by name..."
              className="h-12 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Mobile Filter Toggle */}
          {isAdminOrCoord && (
            <div className="sm:hidden">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between"
                size="lg"
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
          )}

          {/* Desktop Filters */}
          {isAdminOrCoord && (
            <div className="hidden sm:flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={allAgents}
                  onChange={(e) => setAllAgents(e.target.checked)}
                  className="rounded border-border h-4 w-4"
                />
                All agents
              </label>

              {!allAgents && (
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <input
                      className="h-10 w-48 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      placeholder="Filter by agent..."
                      value={agentQuery}
                      onChange={(e) => setAgentQuery(e.target.value)}
                      onFocus={() => setAgentOpen(true)}
                      onBlur={() => setTimeout(() => setAgentOpen(false), 120)}
                    />
                  </div>

                  {agentOpen && (
                    <div className="absolute left-0 right-0 z-50 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-border bg-card shadow-lg">
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
                            className={`w-full text-left px-3 py-3 text-sm hover:bg-accent hover:text-accent-foreground ${selectedAgent?.id === a.id ? "bg-accent/40" : ""}`}
                          >
                            <div className="font-medium">{a.name}</div>
                            <div className="text-xs text-muted-foreground">
                              ID: {a.id}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-sm text-muted-foreground">
                          No agents found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mobile Filters Panel */}
          {isAdminOrCoord && showFilters && (
            <div className="sm:hidden space-y-4 p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mobileAllAgents"
                  checked={allAgents}
                  onChange={(e) => setAllAgents(e.target.checked)}
                  className="rounded border-border h-4 w-4"
                />
                <label
                  htmlFor="mobileAllAgents"
                  className="text-sm text-foreground"
                >
                  All agents
                </label>
              </div>

              {!allAgents && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Filter by agent
                  </label>
                  <div className="relative">
                    <input
                      className="h-12 w-full rounded-lg border border-border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      placeholder="Search agents..."
                      value={agentQuery}
                      onChange={(e) => setAgentQuery(e.target.value)}
                      onFocus={() => setAgentOpen(true)}
                      onBlur={() => setTimeout(() => setAgentOpen(false), 120)}
                    />
                  </div>

                  {agentOpen && (
                    <div className="absolute left-0 right-0 z-50 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-border bg-card shadow-lg">
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
                            className={`w-full text-left px-4 py-4 text-base hover:bg-accent hover:text-accent-foreground ${selectedAgent?.id === a.id ? "bg-accent/40" : ""}`}
                          >
                            <div className="font-medium">{a.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {a.id}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-base text-muted-foreground">
                          No agents found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-center sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Create Party Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-card rounded-lg border border-border shadow-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border sticky top-0 bg-card">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                  Create New Party
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Party Name
                  </label>
                  <input
                    className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder="Enter party name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Address
                  </label>
                  <input
                    className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder="Enter address"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    GST Number
                  </label>
                  <input
                    className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder="Enter GST number"
                    value={form.gstNumber}
                    onChange={(e) =>
                      setForm({ ...form, gstNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder="Enter email address"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Phone
                  </label>
                  <input
                    className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 h-12"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 h-12"
                  >
                    {isPending ? "Creating..." : "Create Party"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Parties List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              All Parties ({parties?.length || 0})
            </h2>
            {hasActiveFilters && (
              <div className="text-sm text-muted-foreground">
                Filtered results
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-lg border border-border p-4 sm:p-6 animate-pulse"
                >
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/4 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : parties?.length ? (
            <div className="grid gap-3 sm:gap-4">
              {parties.map((party) => (
                <div
                  key={party.id}
                  className="bg-card rounded-lg border border-border p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-base sm:text-lg truncate">
                          {party.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Hash className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{party.gstNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span className="break-words">{party.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{party.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{party.phone}</span>
                      </div>
                      {isAdminOrCoord && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <span>Agent ID: {party.createdBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border p-8 sm:p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {hasActiveFilters ? "No parties found" : "No parties yet"}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first party"}
              </p>
              {!hasActiveFilters && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Party
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartiesPage;
