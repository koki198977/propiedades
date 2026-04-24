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
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      {/* Header Showcase Premium */}
      <header style={{ 
        background: 'linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%)', 
        borderBottom: '1px solid #e5e7eb', 
        padding: '3rem 1rem', 
        textAlign: 'center',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <img 
            src="/logo.png?v=3" 
            alt="Logo" 
            style={{ height: '80px', width: 'auto', marginBottom: '1.5rem', objectFit: 'contain' }} 
          />
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 900, 
            fontFamily: 'var(--font-heading)', 
            color: '#111827', 
            marginBottom: '0.5rem', 
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
             Explora las propiedades de {owner?.name || 'Administrador'}
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem', fontWeight: 500, color: '#6b7280' }}>Unidades exclusivas seleccionadas para su próximo hogar.</p>
        </div>
      </header>

      {/* Grid de Propiedades */}
      <main className="container animate-fade-in" style={{ padding: '3rem 1rem' }}>
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
                <div className="card showcase-card" style={{ 
                  padding: 0, 
                  borderRadius: '1.5rem',
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: 'white'
                }}>
                  
                  {/* Cuadro de imagen */}
                  <div style={{ width: '100%', height: '240px', backgroundColor: '#f3f4f6', position: 'relative', overflow: 'hidden' }}>
                    {property.photos && property.photos.length > 0 ? (
                      <img 
                        src={property.photos[0].url} 
                        alt={property.address}
                        className="card-img-zoom"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', backgroundColor: '#f9fafb' }}>
                        <span style={{ fontSize: '3rem' }}>🏢</span>
                        <span className="text-muted" style={{ fontWeight: 600, fontSize: '0.8rem' }}>SIN FOTOGRAFÍAS</span>
                      </div>
                    )}
                    
                    {/* Badge Categoría */}
                    <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}>
                      <span className="badge" style={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        color: '#111827', 
                        fontWeight: 800, 
                        padding: '0.5rem 1rem', 
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                        backdropFilter: 'blur(8px)',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {property.category === PropertyCategory.OTHER && property.customCategory
                          ? property.customCategory
                          : (PropertyCategoryLabels[property.category as PropertyCategory] || 'Propiedad')}
                      </span>
                    </div>

                    <div style={{ position: 'absolute', bottom: '1.25rem', right: '1.25rem' }}>
                       <span style={{ 
                         background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', 
                         color: 'white', 
                         padding: '0.4rem 0.8rem', 
                         borderRadius: '0.75rem', 
                         fontSize: '0.65rem', 
                         fontWeight: 900,
                         boxShadow: '0 4px 6px rgba(99, 102, 241, 0.3)'
                       }}>VERIFICADA</span>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: '#6b7280' }}>Arriendo Mensual</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 950, color: '#4f46e5', letterSpacing: '-0.02em' }}>
                        {typeof property.expectedRent === 'number' ? `$${property.expectedRent.toLocaleString('es-CL')}` : 'Consultar'}
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginBottom: '1rem', lineHeight: '1.2', flex: 1 }}>
                      {property.address}
                    </h3>
                    
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', fontWeight: 500 }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>📍 Zona Estratégica</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>✨ Equipada</span>
                    </div>

                    {/* Acciones */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                      <div 
                        style={{ 
                          flex: 1, 
                          padding: '0.85rem', 
                          backgroundColor: '#f9fafb', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '1rem', 
                          fontWeight: 800, 
                          textAlign: 'center', 
                          fontSize: '0.9rem',
                          color: '#374151'
                        }}
                      >
                         Ver Detalles
                      </div>
                      <button 
                        onClick={(e) => handleContact(e, property)}
                        style={{ 
                          width: '54px', 
                          height: '48px', 
                          backgroundColor: '#22c55e', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '1rem', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          boxShadow: '0 4px 6px rgba(34, 197, 94, 0.2)'
                        }}
                        title="WhatsApp"
                      >
                        <span style={{ fontSize: '1.25rem' }}>💬</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2" style={{ marginTop: '4rem' }}>
              <button
                onClick={() => {
                  setPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page === 1}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: page === 1 ? 0.4 : 1 }}
              >
                ← Anterior
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setPage(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
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
              </div>

              <button
                onClick={() => {
                  setPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page === totalPages}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: page === totalPages ? 0.4 : 1 }}
              >
                Siguiente →
              </button>
            </div>
          )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🏡</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>No hay propiedades disponibles</h3>
            <p className="text-muted">Actualmente todas las propiedades están arrendadas.</p>
          </div>
        )}
      </main>

      <footer style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-main)', borderTop: '1px solid var(--border)' }}>
        <p className="text-muted" style={{ fontSize: '0.8rem' }}>
          Plataforma de Gestión de Propiedades
        </p>
      </footer>
    </div>
  );
}
