import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { PropertyCategoryLabels, PropertyCategory } from '@propiedades/types';

export default function ShowcasePage() {
  const { userId } = useParams<{ userId: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['showcase', userId],
    queryFn: async () => {
      const resp = await api.get(`/showcase/${userId}`);
      return resp.data;
    },
    retry: 1, // Si no encuentra el public link, no seguir iterando
  });

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

  const { owner, properties } = data;

  const handleContact = (property: any) => {
    // Generar mensaje de WhatsApp pre-rellenado
    const message = `Hola ${owner.name}, me interesa la propiedad "${property.address}" que tienes disponible. ¿Me podrías dar más información?`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${owner.whatsapp.replace(/\+/g, '')}?text=${encoded}`, '_blank');
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header Showcase */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border)', padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '1.5rem', fontWeight: 700, margin: '0 auto 1rem auto' }}>
            {owner.name.charAt(0).toUpperCase()}
          </div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Propiedades de {owner.name}
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Vitrina de inmuebles actualmente disponibles para arriendo.</p>
        </div>
      </header>

      {/* Grid de Propiedades */}
      <main className="container animate-fade-in" style={{ padding: '3rem 1rem' }}>
        {properties && properties.length > 0 ? (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {properties.map((property: any) => (
              <div key={property.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* Cuadro de imagen */}
                <div style={{ width: '100%', height: '240px', backgroundColor: 'var(--bg-surface)', position: 'relative' }}>
                  {property.photos && property.photos.length > 0 ? (
                    <img 
                      src={property.photos[0].url} 
                      alt={property.address}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                      <span className="text-muted">Sin Foto</span>
                    </div>
                  )}
                  
                  {/* Badge Categoría */}
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                    <span className="badge" style={{ backgroundColor: 'white', color: 'black', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {property.category === PropertyCategory.OTHER && property.customCategory
                        ? property.customCategory
                        : (PropertyCategoryLabels[property.category as PropertyCategory] || 'Propiedad')}
                    </span>
                  </div>
                </div>

                {/* Detalles */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                    {property.address}
                  </h3>
                  
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                    {property.expectedRent ? `$${property.expectedRent.toLocaleString('es-CL')}` : 'Consultar Valor'}
                  </div>

                  {property.notes && (
                    <div 
                      className="text-muted" 
                      style={{ 
                        fontSize: '0.85rem', 
                        marginBottom: '1.5rem', 
                        flex: 1,
                        maxHeight: '4.5rem',
                        overflow: 'hidden'
                      }}
                      dangerouslySetInnerHTML={{ __html: property.notes }}
                    />
                  )}

                  {/* Acciones */}
                  <div style={{ marginTop: 'auto' }}>
                    <button 
                      onClick={() => handleContact(property)}
                      style={{ width: '100%', padding: '0.75rem', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <span>💬</span> Contactar Propietario
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
