import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TenantDto, PaginatedResponse } from '@propiedades/types';
import api from '@/api/axios';

export default function TenantsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, error } = useQuery<PaginatedResponse<TenantDto>>({
    queryKey: ['tenants', page, limit],
    queryFn: async () => {
      const resp = await api.get('/tenants', {
        params: { page, limit }
      });
      return resp.data;
    },
  });

  const tenants = data?.data || [];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '3rem' }}>
          <div className="skeleton" style={{ width: '250px', height: '3rem' }}></div>
          <div className="skeleton" style={{ width: '150px', height: '2.5rem' }}></div>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--bg-surface)' }}>
              <tr>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <th key={i} style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>
                    <div className="skeleton" style={{ width: '60%', height: '1rem' }}></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i} style={{ borderTop: '1px solid var(--border-light)' }}>
                  {[1, 2, 3, 4, 5, 6].map(j => (
                    <td key={j} style={{ padding: '1rem 1.5rem' }}>
                      <div className="skeleton" style={{ width: j === 1 ? '70%' : '50%', height: '1.25rem' }}></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '1.5rem 0' }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6" style={{ marginBottom: '3rem' }}>
        <div>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Mis Arrendatarios</h2>
          <p className="text-muted">Gestiona el contacto e información de tus clientes</p>
        </div>
        <Link to="/tenants/new" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', width: window.innerWidth < 640 ? '100%' : 'auto' }}>
          <span>+</span> Nuevo Arrendatario
        </Link>
      </div>

      {error && (
        <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
          Error al cargar los arrendatarios.
        </div>
      )}

      {!data || tenants.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>👤</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No tienes arrendatarios registrados</h3>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Registra la información de contacto de las personas que alquilan tus propiedades.</p>
          <Link to="/tenants/new" className="btn btn-primary">Registrar mi primer arrendatario</Link>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                <thead style={{ backgroundColor: 'var(--bg-surface)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <tr>
                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, width: '20%' }}>Nombre</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, width: '25%' }}>Propiedad</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, width: '15%' }}>RUT / ID</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, width: '20%' }}>Email</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, width: '10%' }}>Teléfono</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textAlign: 'right', width: '10%' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant.name}</td>
                      <td style={{ padding: '1.25rem 1.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tenant.currentProperty ? (
                          <Link to={`/properties/${tenant.currentProperty.id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                            {tenant.currentProperty.address.split(',')[0]}
                          </Link>
                        ) : (
                          <span className="text-muted">Sin propiedad</span>
                        )}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant.documentId || '-'}</td>
                      <td style={{ padding: '1.25rem 1.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant.email || '-'}</td>
                      <td style={{ padding: '1.25rem 1.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant.phone || '-'}</td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <Link to={`/tenants/${tenant.id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.7rem' }}>Detalle</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex justify-between items-center" style={{ marginTop: '2rem', padding: '0 1rem' }}>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                Mostrando {tenants.length} de {meta.total} arrendatarios
              </div>
              <div className="flex gap-2">
                <button 
                  className="btn btn-outline" 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`btn ${page === p ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.5rem 1rem', minWidth: '40px' }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button 
                  className="btn btn-outline" 
                  disabled={page === meta.totalPages}
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
