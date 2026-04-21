import React from 'react';
import { useOrganization } from '../providers/OrganizationProvider';

const OrganizationSwitcher: React.FC = () => {
  const { organizations, activeOrganization, setActiveOrganization, isLoading } = useOrganization();

  if (isLoading || organizations.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        <label className="hide-on-tablet" style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '2px' }}>
          Espacio Seleccionado
        </label>
        <div className="org-switcher-refined">
          <span style={{ fontSize: '1rem' }}>🏢</span>
          <select 
            value={activeOrganization?.id || ''} 
            onChange={(e) => setActiveOrganization(e.target.value)}
            style={{ 
              border: 'none', 
              background: 'transparent', 
              fontWeight: 700, 
              fontSize: '0.875rem', 
              cursor: 'pointer',
              color: 'var(--secondary)',
              outline: 'none',
              paddingRight: '0.5rem',
              maxWidth: '120px',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              display: 'inline-block'
            }}
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSwitcher;
