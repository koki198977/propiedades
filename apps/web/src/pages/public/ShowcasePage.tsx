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
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header Showcase */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border)', padding: '2.5rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <img 
            src="/logo.png?v=3" 
            alt="Logo" 
            style={{ height: '80px', width: 'auto', marginBottom: '1rem', objectFit: 'contain' }} 
          />
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Propiedades de {owner?.name || 'Administrador'}
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem', fontWeight: 500 }}>Explora nuestras unidades exclusivas disponibles para arriendo.</p>
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
                <div className="card showcase-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
                  
                  {/* Cuadro de imagen */}
                  <div style={{ width: '100%', height: '240px', backgroundColor: 'var(--bg-surface)', position: 'relative', overflow: 'hidden' }}>
                    {property.photos && property.photos.length > 0 ? (
                      <img 
                        src={property.photos[0].url} 
                        alt={property.address}
                        className="card-img-zoom"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                        <span className="text-muted">Sin Foto</span>
                      </div>
                    )}
                    
                    {/* Badge Categoría */}
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                      <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'black', fontWeight: 700, padding: '0.4rem 0.8rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backdropFilter: 'blur(4px)' }}>
                        {property.category === PropertyCategory.OTHER && property.customCategory
                          ? property.customCategory
                          : (PropertyCategoryLabels[property.category as PropertyCategory] || 'Propiedad')}
                      </span>
                    </div>

                    <div style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}>
                       <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 800 }}>PRO</span>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Arriendo Mensual</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      {typeof property.expectedRent === 'number' ? `$${property.expectedRent.toLocaleString('es-CL')}` : 'Consultar'}
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', lineHeight: '1.3' }}>
                      {property.address}
                    </h3>
                    
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                       <span>📍 Ubicación estelar</span>
                       <span>✨ Lista para habitar</span>
                    </div>

                    {/* Acciones */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                      <div 
                        style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '0.5rem', fontWeight: 700, textAlign: 'center', fontSize: '0.85rem' }}
                      >
                         Ver Detalles
                      </div>
                      <button 
                        onClick={(e) => handleContact(e, property)}
                        style={{ width: '50px', height: '45px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        title="Contactar por WhatsApp"
                      >
                        <span style={{ fontSize: '1.2rem' }}>💬</span>
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
