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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: 'var(--secondary)' }}>
      {/* Sticky Header Clean */}
      <nav style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        padding: '1rem', 
        backgroundColor: 'white', 
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="container flex justify-between items-center" style={{ padding: '0 1rem' }}>
          <Link to={`/showcase/${userId}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
             <img src="/logo.png?v=3" alt="Logo" style={{ height: '40px' }} />
             <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--secondary)', letterSpacing: '-0.02em' }}>CATÁLOGO</div>
          </Link>
          <Link to={`/showcase/${userId}`} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
            ← VOLVER
          </Link>
        </div>
      </nav>

      <main className="container animate-fade-in" style={{ padding: '3rem 1rem 8rem 1rem' }}>
        <div className="flex flex-col lg:grid" style={{ gridTemplateColumns: '1.8fr 1fr', gap: '2.5rem' }}>
          
          {/* Left Side: Photos & Content */}
          <div className="flex flex-col gap-6">
            
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'white' }}>
              <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '1rem', overflow: 'hidden', backgroundColor: '#f1f5f9', position: 'relative' }}>
                {property.photos && property.photos.length > 0 ? (
                  <img 
                    src={property.photos[selectedPhotoIndex].url} 
                    alt="Propiedad" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>IMAGEN NO DISPONIBLE</div>
                )}
                
                <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                   <span className="badge" style={{ backgroundColor: 'white', color: 'var(--secondary)', boxShadow: 'var(--shadow-sm)' }}>
                      {PropertyCategoryLabels[property.category as PropertyCategory] || 'Propiedad'}
                   </span>
                </div>
              </div>

              {property.photos && property.photos.length > 1 && (
                <div className="flex gap-3" style={{ marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {property.photos.map((ph: any, i: number) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedPhotoIndex(i)}
                      style={{ 
                        flexShrink: 0, 
                        width: '100px', 
                        height: '65px', 
                        borderRadius: '0.75rem', 
                        overflow: 'hidden', 
                        cursor: 'pointer',
                        border: i === selectedPhotoIndex ? '2.5px solid var(--primary)' : '2px solid var(--border-light)',
                        transition: 'all 0.2s',
                        opacity: i === selectedPhotoIndex ? 1 : 0.7
                      }}
                    >
                      <img src={ph.url} alt={`Vista ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ padding: '2.5rem', backgroundColor: 'white' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: 'var(--secondary)', marginBottom: '0.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{property.address}</h1>
                {property.city && <p style={{ fontWeight: 600, fontSize: '1.25rem', color: 'var(--text-muted)' }}>{property.city}</p>}
                
                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span> DISPONIBLE
                </div>
              </div>

              <div className="grid" style={{ 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '1rem', 
                marginBottom: '3rem'
              }}>
                {[
                  { icon: '🛏️', label: 'Dormitorios', value: property.bedrooms ?? '0' },
                  { icon: '🚿', label: 'Baños', value: property.bathrooms ?? '0' },
                  { icon: '📐', label: 'M2 Útiles', value: property.m2Built ? `${property.m2Built}` : '—' },
                  { icon: '🚗', label: 'Estacionam.', value: property.hasParking ? 'Sí' : 'No' },
                  { icon: '📦', label: 'Bodega', value: property.hasStorage ? 'Sí' : 'No' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{item.label}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary)' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '2.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '1.5rem', fontWeight: 800 }}>Descripción de la Propiedad</h3>
                {property.notes ? (
                  <div 
                    style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--text-main)' }} 
                    className="rich-text-content"
                    dangerouslySetInnerHTML={{ __html: property.notes }}
                  />
                ) : (
                  <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Sin descripción detallada disponible.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Contact Card */}
          <div className="flex flex-col gap-6">
            <div className="card" style={{ position: 'sticky', top: '6rem', padding: '2.5rem 2rem', textAlign: 'center' }}>
               <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Valor Arriendo</div>
               <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '2.5rem' }}>
                  {typeof property.expectedRent === 'number' ? `$${property.expectedRent.toLocaleString('es-CL')}` : 'Consultar'}
               </div>
               
               <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '2rem', marginBottom: '2rem' }}>
                  <div className="flex items-center gap-4" style={{ marginBottom: '2rem', textAlign: 'left', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '1rem' }}>
                     <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
                        {owner.name[0]}
                     </div>
                     <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--secondary)' }}>{owner.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>AGENTE INMOBILIARIO</div>
                     </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                     <button 
                        onClick={handleContact}
                        className="btn btn-primary"
                        style={{ width: '100%', height: '56px', fontSize: '1rem' }}
                     >
                        Contactar por WhatsApp
                     </button>
                     <a 
                        href={`mailto:${owner.email}`}
                        className="btn btn-outline"
                        style={{ width: '100%', height: '56px', textDecoration: 'none' }}
                     >
                        Enviar Email
                     </a>
                  </div>
               </div>
               
               <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Al contactar, aceptas nuestros términos de servicio y políticas de privacidad.
               </p>
            </div>
          </div>

        </div>
      </main>

      <footer style={{ padding: '4rem 1rem', textAlign: 'center', borderTop: '1px solid var(--border)', backgroundColor: 'white' }}>
         <div className="container">
            <img src="/logo.png?v=3" alt="Logo" style={{ height: '60px', marginBottom: '1.5rem', opacity: 0.8 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>&copy; 2026 Nexo Realty. Todos los derechos reservados.</p>
         </div>
      </footer>
    </div>
  );
}

