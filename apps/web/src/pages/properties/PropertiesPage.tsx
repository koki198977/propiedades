import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PropertyDto, PropertyCategoryLabels, PropertyCategory } from '@propiedades/types';
import api from '@/api/axios';
import toast from 'react-hot-toast';

const PAGE_SIZE = 9;

export default function PropertiesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: properties, isLoading, error } = useQuery<PropertyDto[]>({
    queryKey: ['properties'],
    queryFn: async () => {
      const resp = await api.get('/properties');
      return resp.data;
    },
  });

  const totalPages = properties ? Math.ceil(properties.length / PAGE_SIZE) : 1;
  const paginated = properties
    ? properties.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : [];

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '3rem' }}>
          <div className="skeleton" style={{ width: '200px', height: '3rem' }}></div>
          <div className="skeleton" style={{ width: '150px', height: '2.5rem' }}></div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ height: '240px' }}>
              <div className="skeleton" style={{ width: '60%', height: '1.5rem', marginBottom: '1rem' }}></div>
              <div className="skeleton" style={{ width: '90%', height: '1.25rem', marginBottom: '0.5rem' }}></div>
              <div className="skeleton" style={{ width: '40%', height: '1rem' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '1.5rem 0' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6" style={{ marginBottom: '3.5rem' }}>
        <div>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Mis Propiedades</h2>
          <p className="text-muted">
            {properties?.length
              ? `${properties.length} propiedad${properties.length !== 1 ? 'es' : ''} registrada${properties.length !== 1 ? 's' : ''}`
              : 'Gestiona y revisa el estado de tus inmuebles'}
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            type="button"
            className="btn btn-outline" 
            style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => {
              const u = localStorage.getItem('user');
              if(u) {
                const parsed = JSON.parse(u);
                const link = `${window.location.origin}/showcase/${parsed.id}`;
                navigator.clipboard.writeText(link);
                toast.success('¡Enlace de vitrina copiado! Envíalo a tus contactos.');
              }
            }}
          >
            <span>🔗</span> Compartir Vitrina
          </button>
          
          <Link to="/properties/new" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            <span>+</span> Agregar Propiedad
          </Link>
        </div>
      </div>

      {error && (
        <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
          Error al cargar las propiedades. Por favor intenta de nuevo.
        </div>
      )}

      {!properties || properties.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🏘️</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No tienes propiedades registradas</h3>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Comienza agregando tu primera casa, departamento o local comercial.</p>
          <Link to="/properties/new" className="btn btn-primary">Registrar mi primera propiedad</Link>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="property-grid" style={{ marginBottom: '4rem', gap: '2rem' }}>
            {paginated.map((property) => (
              <div key={property.id} className="card flex flex-col justify-between" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Vista Previa de Imagen / Placeholder */}
                  <div style={{ width: '100%', height: '160px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border-light)' }}>
                    {property.photos && property.photos.length > 0 ? (
                      <>
                        <img 
                          src={property.photos[0].url} 
                          alt={property.address} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                          <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'black', fontWeight: 800, fontSize: '0.7rem', border: 'none', backdropFilter: 'blur(4px)' }}>
                            📸 {property.photos.length}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'grid', 
                        placeItems: 'center', 
                        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                        color: 'var(--text-muted)'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                           <div style={{ fontSize: '2rem', opacity: 0.5 }}>🏗️</div>
                           <div style={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sin Fotos</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Badge Categoría & Estado Flotantes */}
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                      <span className="badge" style={{ backgroundColor: 'rgba(31, 41, 55, 0.7)', color: 'white', border: 'none', backdropFilter: 'blur(4px)', fontWeight: 700, fontSize: '0.65rem' }}>
                        {property.category === PropertyCategory.OTHER && property.customCategory 
                          ? property.customCategory 
                          : PropertyCategoryLabels[property.category]}
                      </span>
                      <span 
                        className="badge"
                        style={{ 
                          backgroundColor: property.activeTenant ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          color: property.activeTenant ? 'white' : '#6b7280',
                          border: 'none',
                          backdropFilter: 'blur(4px)',
                          fontWeight: 800,
                          fontSize: '0.65rem'
                        }}
                      >
                        {property.activeTenant ? 'OCUPADA' : 'DISPONIBLE'}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem' }}>
                    <h3 className="font-heading" style={{ 
                      fontSize: '1.25rem', 
                      marginBottom: '0.75rem', 
                      lineHeight: 1.2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '3rem'
                    }}>
                      {property.name || property.address}
                    </h3>

                    <div className="flex flex-col gap-2" style={{ marginBottom: '1.25rem' }}>
                      <div className="flex items-center gap-3 text-muted" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        <span className="flex items-center gap-1">📅 Día {property.paymentDueDay}</span>
                        {property.rol && (
                          <>
                            <span style={{ opacity: 0.2 }}>|</span>
                            <span className="flex items-center gap-1">📜 ROL {property.rol}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div 
                      className="text-muted" 
                      style={{ 
                        fontSize: '0.85rem', 
                        lineHeight: '1.5',
                        height: '3.5rem',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        padding: '0.75rem',
                        background: '#f9fafb',
                        borderRadius: '0.5rem',
                        border: '1px solid #f1f5f9'
                      }}
                      dangerouslySetInnerHTML={{ __html: property.notes || 'Sin observaciones.' }}
                    />
                  </div>
                </div>

                <div style={{ margin: '0 1.5rem 1.5rem 1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem' }}>
                  <Link
                    to={`/properties/${property.id}`}
                    className="btn btn-outline"
                    style={{ flex: 1, fontSize: '0.8rem', borderRadius: '0.75rem' }}
                  >
                    Detalles
                  </Link>
                  <button
                    onClick={() => navigate(`/properties/${property.id}?manage=true`)}
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '0.8rem', borderRadius: '0.75rem' }}
                  >
                    Gestionar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2" style={{ paddingBottom: '2rem' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: page === 1 ? 0.4 : 1 }}
              >
                ← Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '0.5rem',
                    border: p === page ? 'none' : '1px solid var(--border)',
                    background: p === page ? 'var(--primary)' : 'transparent',
                    color: p === page ? 'white' : 'inherit',
                    cursor: 'pointer',
                    fontWeight: p === page ? 700 : 400,
                    fontSize: '0.875rem',
                    transition: 'all 0.15s',
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: page === totalPages ? 0.4 : 1 }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
