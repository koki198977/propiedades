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
    <div className="futuristic-bg" style={{ minHeight: '100vh', color: 'white' }}>
      {/* Header Showcase Premium Futuristic */}
      <header className="futuristic-glass" style={{ 
        padding: '5rem 1rem', 
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        marginBottom: '2rem'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2rem' }}>
            <div style={{ position: 'absolute', inset: '-10px', background: 'var(--primary)', filter: 'blur(30px)', opacity: 0.3, borderRadius: '50%' }}></div>
            <img 
              src="/logo.png?v=3" 
              alt="Logo" 
              style={{ height: '100px', width: 'auto', position: 'relative', zIndex: 1, filter: 'brightness(1.5)' }} 
            />
          </div>
          
          <h1 className="animated-gradient-text" style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 4rem)', 
            fontWeight: 950, 
            marginBottom: '1rem', 
            letterSpacing: '-0.05em',
            lineHeight: 1
          }}>
             Catálogo Exclusivo
          </h1>
          
          <p style={{ fontSize: '1.25rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Explora la colección seleccionada por <span style={{ color: 'white', fontWeight: 800, borderBottom: '2px solid var(--primary)' }}>{owner?.name || 'Nuestro Equipo'}</span>
          </p>
        </div>
        
        {/* Animated Orbs for flair */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '0', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
      </header>

      {/* Grid de Propiedades */}
      <main className="container animate-fade-in" style={{ padding: '0 1rem 8rem 1rem' }}>
        {paginatedProperties && paginatedProperties.length > 0 ? (
          <>
            <div className="property-grid" style={{ gap: '2.5rem' }}>
              {paginatedProperties.map((property: any) => (
              <Link 
                key={property.id} 
                to={`/showcase/${userId}/property/${property.id}`}
                className="card-link"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="futuristic-card" style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                }}>
                  
                  {/* Cuadro de imagen */}
                  <div style={{ width: '100%', height: '280px', position: 'relative', overflow: 'hidden' }}>
                    {property.photos && property.photos.length > 0 ? (
                      <img 
                        src={property.photos[0].url} 
                        alt={property.address}
                        className="card-img-zoom"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }}>🌌</span>
                      </div>
                    )}
                    
                    {/* Badge Categoría - Futuristic Bubble */}
                    <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}>
                      <span className="badge futuristic-glass" style={{ 
                        color: 'white', 
                        fontWeight: 900, 
                        padding: '0.6rem 1.2rem', 
                        borderRadius: '2rem',
                        fontSize: '0.75rem',
                        letterSpacing: '0.1em'
                      }}>
                        {property.category === PropertyCategory.OTHER && property.customCategory
                          ? property.customCategory
                          : (PropertyCategoryLabels[property.category as PropertyCategory] || 'Propiedad')}
                      </span>
                    </div>

                    {/* Rent Tag Overlay */}
                    <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(to top, rgba(15,23,42,0.9), transparent)', padding: '2rem 1.25rem 1.25rem 1.25rem' }}>
                       <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '0.2rem' }}>VALOR MENSUAL</div>
                       <div className="neon-glow-text" style={{ fontSize: '1.75rem', fontWeight: 950, color: 'white' }}>
                         {typeof property.expectedRent === 'number' ? `$${property.expectedRent.toLocaleString('es-CL')}` : 'Consultar'}
                       </div>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem', lineHeight: '1.3', flex: 1 }}>
                      {property.address}
                    </h3>
                    
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', fontWeight: 600 }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <span style={{ color: 'var(--primary)' }}>✦</span> {property.city || 'Ubicación Premium'}
                       </span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <span style={{ color: 'var(--accent)' }}>✦</span> {PropertyCategoryLabels[property.category as PropertyCategory] || 'Inmueble'}
                       </span>
                    </div>

                    {/* Acciones */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                      <div className="cyber-button" style={{ flex: 1, textAlign: 'center', padding: '0.8rem', fontSize: '0.85rem' }}>
                         DESCUBRIR MAS
                      </div>
                      <button 
                        onClick={(e) => handleContact(e, property)}
                        className="futuristic-glass"
                        style={{ 
                          width: '56px', 
                          height: '52px', 
                          color: '#22c55e', 
                          border: '1px solid rgba(34, 197, 94, 0.3)', 
                          borderRadius: '1rem', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          boxShadow: '0 0 15px rgba(34, 197, 94, 0.1)'
                        }}
                        title="Enviar WhatsApp"
                      >
                        <span style={{ fontSize: '1.5rem' }}>📲</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Paginación - Futuristic Dots */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6" style={{ marginTop: '6rem' }}>
              <button
                onClick={() => {
                  setPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page === 1}
                className="futuristic-glass"
                style={{ padding: '0.75rem 1.5rem', color: 'white', borderRadius: '1rem', cursor: 'pointer', opacity: page === 1 ? 0.3 : 1, fontWeight: 700 }}
              >
                ❮ PREV
              </button>

              <div className="flex gap-3">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setPage(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: 'none',
                      background: p === page ? 'linear-gradient(to bottom, #818cf8, #c084fc)' : 'rgba(255,255,255,0.1)',
                      boxShadow: p === page ? '0 0 15px #818cf8' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      transform: p === page ? 'scale(1.3)' : 'scale(1)'
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
                className="futuristic-glass"
                style={{ padding: '0.75rem 1.5rem', color: 'white', borderRadius: '1rem', cursor: 'pointer', opacity: page === totalPages ? 0.3 : 1, fontWeight: 700 }}
              >
                NEXT ❯
              </button>
            </div>
          )}
          </>
        ) : (
          <div className="futuristic-glass" style={{ textAlign: 'center', padding: '6rem 2rem', borderRadius: '3rem' }}>
            <div style={{ fontSize: '5rem', marginBottom: '2rem', animation: 'float 3s ease-in-out infinite' }}>🛸</div>
            <h3 className="neon-glow-text" style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>Horizonte Vacío</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem' }}>Actualmente todas nuestras naves están en órbita. Vuelve pronto.</p>
          </div>
        )}
      </main>

      <footer className="futuristic-glass" style={{ padding: '4rem 2rem', textAlign: 'center', marginTop: '4rem', borderBottom: 'none' }}>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2rem', textTransform: 'uppercase', fontWeight: 700 }}>
          Powered by Nexo Realty Technology • 2026
        </p>
      </footer>
    </div>
  );
}
