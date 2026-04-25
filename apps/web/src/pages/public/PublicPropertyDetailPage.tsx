import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { PropertyCategoryLabels, PropertyCategory } from '@propiedades/types';

export default function PublicPropertyDetailPage() {
  const { userId, propertyId } = useParams<{ userId: string; propertyId: string }>();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-property', propertyId],
    queryFn: async () => {
      const resp = await api.get(`/showcase/${userId}/property/${propertyId}`);
      return resp.data;
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: '#f9fafb' }}>
        <p className="text-muted" style={{ fontWeight: 600 }}>Cargando detalles...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: '#f9fafb' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Propiedad no disponible</h2>
          <p className="text-muted">No pudimos encontrar esta propiedad o ya no está disponible para arriendo.</p>
          <Link to={`/showcase/${userId}`} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Volver al Catálogo</Link>
        </div>
      </div>
    );
  }

  const { property, owner } = data;

  const handleContact = () => {
    const message = `Hola ${owner.name}, me interesa la propiedad "${property.address}" que vi en su sitio web. ¿Me podría dar más información?`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${owner.whatsapp?.replace(/\+/g, '') || ''}?text=${encoded}`, '_blank');
  };

  return (
    <div className="futuristic-bg" style={{ minHeight: '100vh', color: 'white' }}>
      {/* Sticky Header Futuristic */}
      <nav className="futuristic-glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '1.25rem' }}>
        <div className="container flex justify-between items-center" style={{ padding: '0 1rem' }}>
          <Link to={`/showcase/${userId}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'white' }}>
             <img src="/logo.png?v=3" alt="Logo" style={{ height: '45px', filter: 'brightness(1.5)' }} />
             <div className="animated-gradient-text" style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>EXECUTIVE SHOWROOM</div>
          </Link>
          <Link to={`/showcase/${userId}`} className="futuristic-glass" style={{ textDecoration: 'none', color: 'white', fontSize: '0.8rem', padding: '0.6rem 1.25rem', borderRadius: '1rem', fontWeight: 700 }}>
            ← VOLVER AL CATÁLOGO
          </Link>
        </div>
      </nav>

      <main className="container animate-fade-in" style={{ padding: '3rem 1rem 8rem 1rem' }}>
        {/* Main Layout Grid */}
        <div className="flex flex-col lg:grid" style={{ gridTemplateColumns: '1.8fr 1fr', gap: '3rem' }}>
          
          {/* Left Side: Photos & Content */}
          <div className="flex flex-col gap-8">
            
            {/* Gallery Wrapper - Cinematic View */}
            <div className="futuristic-card" style={{ padding: '1.5rem', backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
              {/* Feature Photo */}
              <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '1.5rem', overflow: 'hidden', backgroundColor: 'black', position: 'relative', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
                {property.photos && property.photos.length > 0 ? (
                  <img 
                    src={property.photos[selectedPhotoIndex].url} 
                    alt="Propiedad" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.2)' }}>IMAGEN NO DISPONIBLE</div>
                )}
                
                {/* Badge Overlay - Glass */}
                <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
                   <span className="badge futuristic-glass" style={{ color: 'white', fontWeight: 900, padding: '0.6rem 1.25rem', borderRadius: '2rem' }}>
                      {PropertyCategoryLabels[property.category as PropertyCategory] || 'Propiedad'}
                   </span>
                </div>
              </div>

              {/* Thumbnails - Horizontal Scroll */}
              {property.photos && property.photos.length > 1 && (
                <div className="flex gap-4" style={{ marginTop: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                  {property.photos.map((ph: any, i: number) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedPhotoIndex(i)}
                      style={{ 
                        flexShrink: 0, 
                        width: '120px', 
                        height: '80px', 
                        borderRadius: '1rem', 
                        overflow: 'hidden', 
                        cursor: 'pointer',
                        border: i === selectedPhotoIndex ? '2px solid #818cf8' : '2px solid rgba(255,255,255,0.1)',
                        boxShadow: i === selectedPhotoIndex ? '0 0 15px rgba(129, 140, 248, 0.4)' : 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: i === selectedPhotoIndex ? 'scale(1.05)' : 'none',
                        opacity: i === selectedPhotoIndex ? 1 : 0.6
                      }}
                    >
                      <img src={ph.url} alt={`Vista ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="futuristic-card" style={{ padding: '3rem', backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
              <div style={{ marginBottom: '3rem' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="neon-glow-text" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', marginBottom: '0.5rem', fontWeight: 950 }}>{property.address}</h1>
                      {property.city && <p style={{ fontWeight: 700, fontSize: '1.5rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.02em' }}>{property.city}</p>}
                    </div>
                  </div>
                  <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }}></span> SISTEMA DISPONIBLE PARA ADJUDICACIÓN
                  </div>
              </div>

              {/* Características - Pulse Icons */}
              <div className="grid" style={{ 
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '2rem', 
                marginBottom: '4rem'
              }}>
                {[
                  { icon: '🛏️', label: 'Dormitorios', value: property.bedrooms ?? '0' },
                  { icon: '🚿', label: 'Baños', value: property.bathrooms ?? '0' },
                  { icon: '📐', label: 'Dimensión', value: property.m2Built ? `${property.m2Built} m²` : '—' },
                  { icon: '🚗', label: 'Parking', value: property.hasParking ? 'Incluido' : 'N/A' },
                  { icon: '📦', label: 'Bodega', value: property.hasStorage ? 'Incluida' : 'N/A' }
                ].map((item, idx) => (
                  <div key={idx} className="futuristic-glass" style={{ padding: '1.5rem', borderRadius: '2rem', textAlign: 'center', transition: 'transform 0.3s ease' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' }}>{item.icon}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{item.label}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '3rem' }}>
                <h3 style={{ fontSize: '2rem', color: 'white', marginBottom: '2rem', fontWeight: 900, letterSpacing: '-0.04em' }}>Especificaciones de la Unidad</h3>
                {property.notes ? (
                  <div 
                    style={{ fontSize: '1.25rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }} 
                    className="rich-text-content"
                    dangerouslySetInnerHTML={{ __html: property.notes }}
                  />
                ) : (
                  <p style={{ fontStyle: 'italic', fontSize: '1.1rem', color: 'rgba(255,255,255,0.3)' }}>Este activo no posee descripción técnica detallada en el sistema.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Command Center Contact */}
          <div className="flex flex-col gap-8">
            <div className="futuristic-glass" style={{ position: 'sticky', top: '7rem', padding: '3rem 2rem', textAlign: 'center', borderRadius: '2.5rem' }}>
               <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '0.2em' }}>INVERSIÓN MENSUAL</div>
               <div className="neon-glow-text" style={{ fontSize: '3rem', fontWeight: 950, color: 'white', marginBottom: '3rem' }}>
                  {typeof property.expectedRent === 'number' ? `$${property.expectedRent.toLocaleString('es-CL')}` : 'CONSULTAR'}
               </div>
               
               <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem', marginBottom: '2.5rem' }}>
                  <div className="flex items-center gap-4" style={{ marginBottom: '2.5rem', textAlign: 'left', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '1.5rem' }}>
                     <div style={{ width: '56px', height: '56px', borderRadius: '1.25rem', background: 'linear-gradient(135deg, #818cf8, #c084fc)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 950, fontSize: '1.5rem', boxShadow: '0 0 20px rgba(129, 140, 248, 0.4)' }}>
                        {owner.name[0]}
                     </div>
                     <div>
                        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'white' }}>{owner.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase' }}>CHIEF OFFICER OPERATIVE</div>
                     </div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                     <button 
                        onClick={handleContact}
                        className="cyber-button"
                        style={{ width: '100%', height: '64px', fontSize: '1.1rem', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)' }}
                     >
                        INICIAR PROTOCOLO WHATSAPP
                     </button>
                     <a 
                        href={`mailto:${owner.email}`}
                        className="futuristic-glass"
                        style={{ width: '100%', height: '58px', color: 'white', textDecoration: 'none', borderRadius: '1rem', fontWeight: 800, fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}
                     >
                        SOLICITAR DOSSIER POR EMAIL
                     </a>
                  </div>
               </div>
               
               <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, fontWeight: 500 }}>
                  * Nexo Realty Core v4.0 • Sistema de Encriptación de Datos Activo.
               </p>
            </div>
          </div>

        </div>
      </main>

      <footer className="futuristic-glass" style={{ padding: '6rem 1rem', textAlign: 'center', borderBottom: 'none' }}>
         <div className="container">
            <img src="/logo.png?v=3" alt="Logo" style={{ height: '80px', filter: 'brightness(2)', marginBottom: '2rem', opacity: 0.8 }} />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>SISTEMA DE GESTIÓN PATRIMONIAL DE ALTA DISPONIBILIDAD</p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginTop: '3rem' }}>&copy; 2026 NEXO REALTY CORE. TERMINACIÓN DE ENLACE SEGURO.</p>
         </div>
      </footer>
    </div>
  );
}
