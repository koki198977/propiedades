import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrganizationDto } from '@propiedades/types';
import api from '../api/axios';

interface OrganizationContextType {
  organizations: OrganizationDto[];
  activeOrganization: OrganizationDto | null;
  isLoading: boolean;
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
        // First selection
        setActiveOrgState(orgs[0]);
        localStorage.setItem('activeOrganizationId', orgs[0].id);
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
      // We might want to reload page or state here to refresh all data
      window.location.reload(); 
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrganization,
        isLoading,
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
