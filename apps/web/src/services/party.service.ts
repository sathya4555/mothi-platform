import { api } from "@/services/api";

export interface Party {
  id: number;
  name: string;
  address: string;
  gstNumber: string;
  email: string;
  phone: string;
  createdBy?: number;
}

export interface CreatePartyInput {
  name: string;
  address: string;
  gstNumber: string;
  email: string;
  phone: string;
}

export const partyService = {
  async list(search?: string) {
    const { data } = await api.get("/parties", {
      params: search ? { search } : undefined,
    });
    return data as Party[];
  },
  async listByAgent(agentId: number, search?: string) {
    const { data } = await api.get("/parties", { params: { search, agentId } });
    return data as Party[];
  },
  async create(input: CreatePartyInput) {
    const { data } = await api.post("/parties", input);
    return data as Party;
  },
};

export interface UserLite {
  id: number;
  name: string;
  role: string;
}
export const userService = {
  async listAgents(search?: string) {
    const { data } = await api.get("/users", {
      params: { role: "agent", search },
    });
    return data as UserLite[];
  },
};
