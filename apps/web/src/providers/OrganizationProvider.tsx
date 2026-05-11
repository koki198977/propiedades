import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrganizationDto } from '@propiedades/types';
import api from '../api/axios';

interface OrganizationContextType {
  organizations: OrganizationDto[];
  activeOrganization: OrganizationDto | null;
  isLoading: boolean;
  canEdit: boolean;
  isAdmin: boolean;
  setActiveOrganization: (orgId: string) => void;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [activeOrganization, setActiveOrgState] = useState<OrganizationDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/organizations');
      const orgs = response.data;
      setOrganizations(orgs);

      // Try to restore active org from localStorage
      const savedOrgId = localStorage.getItem('activeOrganizationId');
      if (savedOrgId) {
        const found = orgs.find((o: OrganizationDto) => o.id === savedOrgId);
        if (found) {
          setActiveOrgState(found);
        } else if (orgs.length > 0) {
          // If saved org not found but there are others, pick the first
          setActiveOrgState(orgs[0]);
          localStorage.setItem('activeOrganizationId', orgs[0].id);
        }
      } else if (orgs.length > 0) {
        // First selection: Prefer an organization that is NOT the default "Mi Propiedad"
        const defaultOrg = orgs.find((o: OrganizationDto) => o.name !== 'Mi Propiedad') || orgs[0];
        setActiveOrgState(defaultOrg);
        localStorage.setItem('activeOrganizationId', defaultOrg.id);
      } else {
        setActiveOrgState(null);
        localStorage.removeItem('activeOrganizationId');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      // toast.error('Error al cargar espacios de trabajo');
      setOrganizations([]);
      setActiveOrgState(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      fetchOrganizations();
    } else {
      setIsLoading(false);
    }
  }, []);

  const setActiveOrganization = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setActiveOrgState(org);
      localStorage.setItem('activeOrganizationId', org.id);
      window.location.reload(); 
    }
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isGlobalAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const canEdit = !!activeOrganization && (
    activeOrganization.role === 'ADMIN' || 
    activeOrganization.role === 'EDITOR' || 
    isGlobalAdmin
  );

  const isAdmin = !!activeOrganization && (
    activeOrganization.role === 'ADMIN' || 
    isGlobalAdmin
  );

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrganization,
        isLoading,
        canEdit,
        isAdmin,
        setActiveOrganization,
        refreshOrganizations: fetchOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
