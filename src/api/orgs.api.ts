// src/api/orgs.api.ts
import api from '@/lib/axios';
import type { Organization, CreateOrgDTO, OrgMember, OrgRole } from '@/types';

export const orgsApi = {
  async createOrg(data: CreateOrgDTO): Promise<Organization> {
    const response = await api.post<Organization>('/orgs', data);
    return response.data;
  },

  async getMyOrgs(): Promise<Organization[]> {
    const response = await api.get<Organization[]>('/orgs/my');
    return response.data;
  },

  async getOrgById(id: string): Promise<Organization> {
    const response = await api.get<Organization>(`/orgs/${id}`);
    return response.data;
  },

  async addMember(orgId: string, data: { userEmail: string; role: OrgRole }): Promise<OrgMember> {
    const response = await api.post<OrgMember>(`/orgs/${orgId}/members`, data);
    return response.data;
  },

  async removeMember(orgId: string, userId: string): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>(`/orgs/${orgId}/members/${userId}`);
    return response.data;
  },
};
