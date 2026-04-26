import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { PropertyCategoryLabels, PropertyCategory } from '@propiedades/types';

export default function ShowcasePage() {
  const { userId } = useParams<{ userId: string }>();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8; // 2 filas de 4 en desktop

  const { data, isLoading, error } = useQuery({
    queryKey: ['showcase', userId],
    queryFn: async () => {
      const resp = await api.get(`/showcase/${userId}`);
      return resp.data;
    },
    retry: 1,
  });

  const { owner, properties } = (data as any) || {};

  // Paginación local
  const totalItems = properties?.length || 0;
  const totalPages = useMemo(() => Math.ceil(totalItems / PAGE_SIZE), [totalItems]);
  const paginatedProperties = useMemo(() => {
    if (!properties) return [];
    return properties.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [properties, page]);

  const handleContact = (e: React.MouseEvent, property: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!owner) return;
    const message = `Hola ${owner.name}, me interesa la propiedad "${property.address}" que tienes disponible. ¿Me podrías dar más información?`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${owner.whatsapp?.replace(/\+/g, '') || ''}?text=${encoded}`, '_blank');
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: '#f9fafb' }}>
        <p className="text-muted" style={{ fontWeight: 600 }}>Cargando catálogo...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: '#f9fafb' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😞</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Catálogo no encontrado</h2>
          <p className="text-muted">No pudimos encontrar propiedades públicas para este enlace o el enlace es incorrecto.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: 'var(--secondary)' }}>
      {/* Header Showcase Clean & Professional */}
      <header style={{ 
        padding: '4rem 1rem', 
        textAlign: 'center',
        backgroundColor: 'white',
        borderBottom: '1px solid var(--border)',
        marginBottom: '4rem'
      }}>
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <img 
              src="/logo.png?v=3" 
              alt="Logo" 
              style={{ height: '80px', width: 'auto' }} 
            />
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', 
            fontWeight: 800, 
            marginBottom: '1rem', 
            letterSpacing: '-0.04em',
            color: 'var(--secondary)',
            lineHeight: 1.1
          }}>
             Catálogo de Propiedades
          </h1>
          
          <p style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Explora las mejores oportunidades seleccionadas por <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{owner?.name || 'Nuestro Equipo'}</span>
          </p>
        </div>
      </header>

      {/* Grid de Propiedades */}
      <main className="container animate-fade-in" style={{ padding: '0 1rem 8rem 1rem' }}>
        {paginatedProperties && paginatedProperties.length > 0 ? (
          <>
            <div className="property-grid" style={{ gap: '2rem' }}>
              {paginatedProperties.map((property: any) => (
              <Link 
                key={property.id} 
                to={`/showcase/${userId}/property/${property.id}`}
                className="card-link"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card" style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: 0,
                  overflow: 'hidden',
                  border: '1px solid var(--border)'
                }}>
                  
                  {/* Cuadro de imagen */}
                  <div style={{ width: '100%', height: '240px', position: 'relative', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                    {property.photos && property.photos.length > 0 ? (
                      <img 
                        src={property.photos[0].url} 
                        alt={property.address}
                        className="card-img-zoom"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                        <span style={{ fontSize: '3rem', opacity: 0.2 }}>🏠</span>
                      </div>
                    )}
                    
                    {/* Badge Categoría */}
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                      <span className="badge" style={{ 
                        backgroundColor: 'white',
                        color: 'var(--secondary)', 
                        boxShadow: 'var(--shadow-sm)',
                        padding: '0.5rem 1rem'
                      }}>
                        {property.category === PropertyCategory.OTHER && property.customCategory
                          ? property.customCategory
                          : (PropertyCategoryLabels[property.category as PropertyCategory] || 'Propiedad')}
                      </span>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {property.city || 'Ubicación Premium'}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '1rem', lineHeight: '1.4', flex: 1 }}>
                      {property.address}
                    </h3>
                    
                    <div className="flex items-center justify-between" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                       <div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Valor Mensual</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>
                            {typeof property.expectedRent === 'number' ? `$${property.expectedRent.toLocaleString('es-CL')}` : 'Consultar'}
                          </div>
                       </div>
                       <button 
                        onClick={(e) => handleContact(e, property)}
                        style={{ 
                          width: '44px', 
                          height: '44px', 
                          color: '#10b981', 
                          border: '1.5px solid #10b981', 
                          borderRadius: '0.75rem', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          background: 'transparent',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        title="Enviar WhatsApp"
                      >
                        <span style={{ fontSize: '1.25rem' }}>📲</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6" style={{ marginTop: '6rem' }}>
              <button
                onClick={() => {
                  setPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page === 1}
                className="btn btn-outline"
                style={{ padding: '0.6rem 1.25rem' }}
              >
                Anterior
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setPage(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      border: 'none',
                      background: p === page ? 'var(--primary)' : 'var(--border)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      transform: p === page ? 'scale(1.2)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  setPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page === totalPages}
                className="btn btn-outline"
                style={{ padding: '0.6rem 1.25rem' }}
              >
                Siguiente
              </button>
            </div>
          )}
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '6rem 2rem', borderRadius: '1.5rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🏠</div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.5rem' }}>Sin propiedades disponibles</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Vuelve pronto para ver nuestras nuevas ofertas.</p>
          </div>
        )}
      </main>

      <footer style={{ padding: '4rem 2rem', textAlign: 'center', borderTop: '1px solid var(--border)', backgroundColor: 'white' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Powered by Nexo Realty Technology • 2026
        </p>
      </footer>
    </div>
  );
}
