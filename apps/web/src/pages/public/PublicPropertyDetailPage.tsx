import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { PropertyCategoryLabels, PropertyCategory } from '@propiedades/types';

const publicFeatureStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const publicFeatureLabelStyle = {
  fontSize: '0.65rem',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  color: '#6b7280',
  letterSpacing: '0.05em',
};

const publicFeatureValueStyle = {
  fontSize: '1rem',
  fontWeight: 800,
  color: '#111827',
};

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
    <div style={{ backgroundColor: '#f4f5f7', minHeight: '100vh' }}>
      {/* Sticky Header */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', padding: '1rem' }}>
        <div className="container flex justify-between items-center" style={{ padding: '0 1rem' }}>
          <Link to={`/showcase/${userId}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'var(--text-main)' }}>
             <img src="/logo.png?v=3" alt="Logo" style={{ height: '40px' }} />
             <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Vitrina Inmobiliaria</div>
          </Link>
          <Link to={`/showcase/${userId}`} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
            ← Ver Catálogo
          </Link>
        </div>
      </nav>

      <main className="container animate-fade-in" style={{ padding: '2rem 1rem 5rem 1rem' }}>
        {/* Main Layout Grid */}
        <div className="flex flex-col lg:grid" style={{ gridTemplateColumns: '1.8fr 1fr', gap: '2rem' }}>
          
          {/* Left Side: Photos & Content */}
          <div className="flex flex-col gap-6">
            
            {/* Gallery Wrapper */}
            <div className="card" style={{ padding: '1rem', border: 'none', boxShadow: 'var(--shadow-md)' }}>
              {/* Feature Photo */}
              <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '1rem', overflow: 'hidden', backgroundColor: 'black', position: 'relative' }}>
                {property.photos && property.photos.length > 0 ? (
                  <img 
                    src={property.photos[selectedPhotoIndex].url} 
                    alt="Propiedad" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'white' }}>Sin Fotos Disponibles</div>
                )}
                
                {/* Badge Overlay */}
                <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                   <span className="badge" style={{ backgroundColor: 'white', color: 'black', fontWeight: 800, padding: '0.5rem 1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      {PropertyCategoryLabels[property.category as PropertyCategory] || 'Propiedad'}
                   </span>
                </div>
              </div>

              {/* Thumbnails */}
              {property.photos && property.photos.length > 1 && (
                <div className="flex gap-2" style={{ marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {property.photos.map((ph: any, i: number) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedPhotoIndex(i)}
                      style={{ 
                        flexShrink: 0, 
                        width: '100px', 
                        height: '70px', 
                        borderRadius: '0.5rem', 
                        overflow: 'hidden', 
                        cursor: 'pointer',
                        border: i === selectedPhotoIndex ? '3px solid var(--primary)' : '2px solid transparent',
                        transition: 'all 0.2s',
                        transform: i === selectedPhotoIndex ? 'scale(1.05)' : 'none'
                      }}
                    >
                      <img src={ph.url} alt={`Vista ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                 <div className="flex justify-between items-start">
                    <div>
                      <h1 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.25rem', lineHeight: '1.1' }}>{property.address}</h1>
                      {property.city && <p className="text-muted" style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '1rem' }}>{property.city}</p>}
                    </div>
                 </div>
                 <div className="text-muted" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>●</span> Disponible para arriendo inmediato
                 </div>
              </div>

              {/* Características Clave (Iconos Premium) */}
              <div className="grid" style={{ 
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                gap: '1.5rem', 
                marginBottom: '3rem', 
                padding: '2rem', 
                background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)', 
                borderRadius: '1.25rem', 
                border: '1px solid #e5e7eb',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ ...publicFeatureStyle, flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: 'white', borderRadius: '12px', display: 'grid', placeItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <span style={{ fontSize: '1.25rem' }}>🛏️</span>
                  </div>
                  <div>
                    <div style={publicFeatureLabelStyle}>Dormitorios</div>
                    <div style={{ ...publicFeatureValueStyle, fontSize: '1.25rem' }}>{property.bedrooms ?? '0'}</div>
                  </div>
                </div>
                <div style={{ ...publicFeatureStyle, flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: 'white', borderRadius: '12px', display: 'grid', placeItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <span style={{ fontSize: '1.25rem' }}>🚿</span>
                  </div>
                  <div>
                    <div style={publicFeatureLabelStyle}>Baños</div>
                    <div style={{ ...publicFeatureValueStyle, fontSize: '1.25rem' }}>{property.bathrooms ?? '0'}</div>
                  </div>
                </div>
                <div style={{ ...publicFeatureStyle, flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: 'white', borderRadius: '12px', display: 'grid', placeItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <span style={{ fontSize: '1.25rem' }}>📐</span>
                  </div>
                  <div>
                    <div style={publicFeatureLabelStyle}>Superficie</div>
                    <div style={{ ...publicFeatureValueStyle, fontSize: '1.25rem' }}>{property.m2Built ? `${property.m2Built} m²` : '—'}</div>
                  </div>
                </div>
                <div style={{ ...publicFeatureStyle, flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: 'white', borderRadius: '12px', display: 'grid', placeItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <span style={{ fontSize: '1.25rem' }}>🚗</span>
                  </div>
                  <div>
                    <div style={publicFeatureLabelStyle}>Estac.</div>
                    <div style={{ ...publicFeatureValueStyle, fontSize: '1.25rem' }}>{property.hasParking ? 'Sí' : 'No'}</div>
                  </div>
                </div>
                <div style={{ ...publicFeatureStyle, flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: 'white', borderRadius: '12px', display: 'grid', placeItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <span style={{ fontSize: '1.25rem' }}>📦</span>
                  </div>
                  <div>
                    <div style={publicFeatureLabelStyle}>Bodega</div>
                    <div style={{ ...publicFeatureValueStyle, fontSize: '1.25rem' }}>{property.hasStorage ? 'Sí' : 'No'}</div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '2.5rem' }}>
                <h3 className="font-heading" style={{ fontSize: '1.75rem', marginBottom: '1.5rem', fontWeight: 800 }}>Descripción</h3>
                {property.notes ? (
                  <div 
                    style={{ fontSize: '1.15rem', lineHeight: 1.8, color: '#4b5563', letterSpacing: '-0.01em' }} 
                    className="rich-text-content"
                    dangerouslySetInnerHTML={{ __html: property.notes }}
                  />
                ) : (
                  <p className="text-muted" style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>Sin descripción detallada por el momento.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Sticky Contact Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="card" style={{ position: 'sticky', top: '5rem', padding: '2rem', textAlign: 'center', background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
               <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Valor Mensual</div>
               <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '2rem' }}>
                  {typeof property.expectedRent === 'number' ? `$${property.expectedRent.toLocaleString('es-CL')}` : 'Consultar'}
               </div>
               
               <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '2rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                     <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: '1.25rem' }}>
                        {owner.name[0]}
                     </div>
                     <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{owner.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Agente Inmobiliario</div>
                     </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                     <button 
                        onClick={handleContact}
                        style={{ width: '100%', padding: '1rem', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)' }}
                     >
                        <span>🟢</span> Contactar por WhatsApp
                     </button>
                     <a 
                        href={`mailto:${owner.email}`}
                        style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', textDecoration: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border)' }}
                     >
                        <span>✉️</span> Enviar Email
                     </a>
                  </div>
               </div>
               
               <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  * Al hacer clic en contactar estás aceptando los términos y condiciones de la plataforma.
               </p>
            </div>
          </div>

        </div>
      </main>

      <footer style={{ padding: '3rem 1rem', textAlign: 'center', backgroundColor: '#1f2937', color: 'white' }}>
         <div className="container">
            <img src="/logo.png?v=3" alt="Logo" style={{ height: '60px', filter: 'brightness(10)', marginBottom: '1.5rem' }} />
            <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Gestión Profesional de Propiedades e Inmuebles</p>
            <p style={{ opacity: 0.4, fontSize: '0.75rem', marginTop: '2rem' }}>&copy; 2026 AMO Inmobiliaria. Todos los derechos reservados.</p>
         </div>
      </footer>
    </div>
  );
}
