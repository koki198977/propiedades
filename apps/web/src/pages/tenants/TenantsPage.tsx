import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { TenantDto, PaginatedResponse } from '@propiedades/types';
import api from '@/api/axios';
import { useOrganization } from '../../providers/OrganizationProvider';
import { useDebounce } from '../../hooks/useDebounce';

export default function TenantsPage() {
  const { activeOrganization, isLoading: isLoadingOrg } = useOrganization();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const page = Number(searchParams.get('page')) || 1;

  const { data, isLoading, error } = useQuery<PaginatedResponse<TenantDto>>({
    queryKey: ['tenants', activeOrganization?.id, page, debouncedSearch],
    queryFn: async () => {
      const resp = await api.get(`/tenants?page=${page}&limit=10&search=${debouncedSearch}`);
      return resp.data;
    },
    enabled: !!activeOrganization,
  });

  if (isLoadingOrg) {
    return (
      <div className="flex justify-center p-20">
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      </div>
    );
  }

  if (!activeOrganization) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center animate-fade-in">
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🏢</div>
        <h2 className="font-heading">Selecciona un Espacio de Trabajo</h2>
        <p className="text-muted" style={{ maxWidth: '400px', margin: '1rem 0 2rem' }}>
          Para gestionar tus arrendatarios, primero debes seleccionar una organización en el menú superior.
        </p>
      </div>
    );
  }

  const tenants = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Arrendatarios</h1>
          <p className="text-muted">Gestiona la base de datos de clientes y sus contratos activos.</p>
        </div>
        <Link to="/tenants/new" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
          <span>+</span> Nuevo Arrendatario
        </Link>
      </div>

      <div className="card" style={{ padding: '1rem', border: '1.5px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '1.25rem', opacity: 0.5 }}>🔍</span>
          <input
            type="text"
            className="input"
            placeholder="Buscar por nombre, RUT o email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              const params = new URLSearchParams(searchParams);
              if (e.target.value) {
                params.set('search', e.target.value);
              } else {
                params.delete('search');
              }
              params.set('page', '1'); // Reset to page 1 on search
              setSearchParams(params, { replace: true });
            }}
            style={{ border: 'none', padding: '0.5rem', fontSize: '1rem', background: 'transparent' }}
          />
          {searchTerm && (
            <button 
              onClick={() => {
                setSearchTerm('');
                const params = new URLSearchParams(searchParams);
                params.delete('search');
                setSearchParams(params, { replace: true });
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '1rem' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
          Error al cargar los arrendatarios.
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
        </div>
      ) : tenants.length > 0 ? (
        <>
          <div className="grid gap-6">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div className="flex items-center gap-5">
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '1rem', 
                    background: 'linear-gradient(135deg, var(--primary-light), white)', 
                    display: 'grid', 
                    placeItems: 'center',
                    border: '1px solid var(--border-light)'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>👤</span>
                  </div>
                  <div>
                    <Link to={`/tenants/${tenant.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{tenant.name}</h3>
                    </Link>
                    <div className="flex gap-4 items-center">
                      {tenant.documentId && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tenant.documentId}</span>}
                      {tenant.email && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tenant.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-8 items-center">
                  <div className="flex flex-col">
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Propiedad Actual</span>
                    {tenant.currentProperty ? (
                      <Link to={`/properties/${tenant.currentProperty.id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                        {tenant.currentProperty.address.split(',')[0]}
                      </Link>
                    ) : (
                      <span className="text-muted">Sin propiedad</span>
                    )}
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="badge" style={{ 
                      backgroundColor: tenant.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                      color: tenant.isActive ? 'var(--success)' : 'var(--text-muted)',
                      border: `1px solid ${tenant.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)'}`
                    }}>
                      {tenant.isActive ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
             <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: meta.totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.5rem 1rem' }}
                    onClick={() => {
                       const params = new URLSearchParams(window.location.search);
                       params.set('page', (i + 1).toString());
                       window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                       window.location.reload();
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
             </div>
          )}
        </>
      ) : (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{debouncedSearch ? '🔍' : '📭'}</div>
          <h3 style={{ marginBottom: '0.5rem' }}>
            {debouncedSearch ? 'No se encontraron resultados' : 'No hay arrendatarios registrados'}
          </h3>
          <p className="text-muted" style={{ maxWidth: '400px', marginBottom: '2rem' }}>
            {debouncedSearch 
              ? `No encontramos coincidencias para "${debouncedSearch}". Intenta con otros términos.`
              : 'Empieza registrando a tu primer cliente para gestionar sus cobros y contratos.'}
          </p>
          {!debouncedSearch && (
            <Link to="/tenants/new" className="btn btn-primary">
              + Registrar Arrendatario
            </Link>
          )}
          {debouncedSearch && (
            <button 
              onClick={() => {
                setSearchTerm('');
                const params = new URLSearchParams(searchParams);
                params.delete('search');
                setSearchParams(params, { replace: true });
              }}
              className="btn btn-outline"
            >
              Limpiar Búsqueda
            </button>
          )}
        </div>
      )}
    </div>
  );
}
