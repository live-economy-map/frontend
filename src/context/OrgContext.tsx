// src/context/OrgContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { orgsApi } from '@/api/orgs.api';
import { useAuth } from './AuthContext';
import type { Organization, CreateOrgDTO, OrgRole } from '@/types';
import { useToast } from './ToastContext';
import { formatApiError } from '@/lib/axios';

interface OrgContextValue {
  organizations: Organization[];
  activeOrg: Organization | null;
  activeOrgId: string | null;
  setActiveOrgId: (orgId: string | null) => void;
  isLoading: boolean;
  createOrg: (data: CreateOrgDTO) => Promise<Organization>;
  refreshOrgs: () => Promise<void>;
  inviteMember: (orgId: string, email: string, role: OrgRole) => Promise<void>;
  removeMember: (orgId: string, userId: string) => Promise<void>;
}

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

const ACTIVE_ORG_KEY = 'active_org_id';

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_ORG_KEY)
  );
  const [isLoading, setIsLoading] = useState(false);

  const setActiveOrgId = useCallback((id: string | null) => {
    setActiveOrgIdState(id);
    if (id) {
      localStorage.setItem(ACTIVE_ORG_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_ORG_KEY);
    }
  }, []);

  const refreshOrgs = useCallback(async () => {
    if (!isAuthenticated) {
      setOrganizations([]);
      setActiveOrgId(null);
      return;
    }
    setIsLoading(true);
    try {
      const orgs = await orgsApi.getMyOrgs();
      setOrganizations(orgs);
      if (activeOrgId && !orgs.some((o) => o.id === activeOrgId)) {
        setActiveOrgId(null);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeOrgId, setActiveOrgId]);

  useEffect(() => {
    refreshOrgs();
  }, [isAuthenticated, refreshOrgs]);

  const createOrg = async (data: CreateOrgDTO) => {
    try {
      const newOrg = await orgsApi.createOrg(data);
      setOrganizations((prev) => [...prev, newOrg]);
      setActiveOrgId(newOrg.id);
      toast.success(`Organization "${newOrg.name}" created!`);
      return newOrg;
    } catch (err) {
      toast.error(formatApiError(err), { title: 'Failed to create organization' });
      throw err;
    }
  };

  const inviteMember = async (orgId: string, email: string, role: OrgRole) => {
    try {
      await orgsApi.addMember(orgId, { userEmail: email, role });
      await refreshOrgs();
      toast.success(`Invitation sent to ${email}`);
    } catch (err) {
      toast.error(formatApiError(err), { title: 'Failed to invite member' });
      throw err;
    }
  };

  const removeMember = async (orgId: string, userId: string) => {
    try {
      await orgsApi.removeMember(orgId, userId);
      await refreshOrgs();
      toast.success('Member removed from organization.');
    } catch (err) {
      toast.error(formatApiError(err), { title: 'Failed to remove member' });
      throw err;
    }
  };

  const activeOrg = organizations.find((o) => o.id === activeOrgId) || null;

  return (
    <OrgContext.Provider
      value={{
        organizations,
        activeOrg,
        activeOrgId,
        setActiveOrgId,
        isLoading,
        createOrg,
        refreshOrgs,
        inviteMember,
        removeMember,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
}
