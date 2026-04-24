import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { UserProfileDto } from '@propiedades/types';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PropertiesPage from './pages/properties/PropertiesPage';
import CreatePropertyPage from './pages/properties/CreatePropertyPage';
import PropertyDetailsPage from './pages/properties/PropertyDetailsPage';
import TenantsPage from './pages/tenants/TenantsPage';
import CreateTenantPage from './pages/tenants/CreateTenantPage';
import TenantDetailPage from './pages/tenants/TenantDetailPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import FinancialReportsPage from './pages/reports/FinancialReportsPage';
import TeamSettingsPage from './pages/organization/TeamSettingsPage';
import DashboardPage from './pages/DashboardPage';
import ChatWidget from './components/ai/ChatWidget';
import NotificationCenter from './components/notifications/NotificationCenter';
import ShowcasePage from './pages/public/ShowcasePage';
import PublicPropertyDetailPage from './pages/public/PublicPropertyDetailPage';
import OrganizationSwitcher from './components/OrganizationSwitcher';
import GodModePage from './pages/admin/GodModePage';
import { UserRole } from '@propiedades/types';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" toastOptions={{
        style: {
          borderRadius: '1.25rem',
          background: '#0f172a',
          color: '#fff',
          fontSize: '0.875rem',
          padding: '1rem',
          border: '1px solid rgba(255,255,255,0.1)'
        },
      }} />

      {/* TOP NAV: Desktop & Mobile Header */}
      <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border)' }}>
        <div className="container flex justify-between items-center" style={{ height: '75px', gap: '2rem' }}>
          {/* ZONE 1: Logo & Switcher */}
          <div className="flex items-center gap-6" style={{ flexShrink: 0, marginLeft: '-1.5rem' }}>
            <Link to="/" className="flex items-center" style={{ textDecoration: 'none', color: 'inherit', overflow: 'hidden', height: '60px', width: '220px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <img src="/logo.png?v=3" alt="Logo" style={{ height: '180px', width: 'auto', objectFit: 'contain', transform: 'translateX(-10%)' }} />
            </Link>
            
            {user && (
              <div className="hide-on-tablet" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1rem', marginLeft: '0.5rem', maxWidth: '220px' }}>
                <OrganizationSwitcher />
              </div>
            )}
          </div>
            
          {/* ZONE 2: Main Navigation */}
          {user && (
            <div className="hide-on-mobile flex items-center nav-menu-container flex-1 justify-start pl-4" style={{ overflowX: 'auto', paddingLeft: '1rem' }}>
              <NavLink to="/dashboard" icon={<DashboardIcon />} label="Dash" hideLabelOnTablet />
              <NavLink to="/properties" icon={<PropertiesIcon />} label="Propiedades" hideLabelOnTablet />
              <NavLink to="/tenants" icon={<TenantsIcon />} label="Arrendatarios" hideLabelOnTablet />
              <NavLink to="/payments" icon={<PaymentsIcon />} label="Recaudación" hideLabelOnTablet />
              <NavLink to="/finances" icon={<FinancesIcon />} label="Finanzas" hideLabelOnTablet />
              <NavLink to="/team" icon={<TeamIcon />} label="Equipo" hideLabelOnTablet />
              {user.role === UserRole.SUPER_ADMIN && (
                 <NavLink to="/admin" icon={<span style={{fontSize: '1.2rem'}}>⚡</span>} label="Admin" hideLabelOnTablet />
              )}
            </div>
          )}

          {/* ZONE 3: User Actions */}
          <div className="flex gap-4 items-center justify-end" style={{ flexShrink: 0 }}>
            {user && (
              <button 
                className="show-on-mobile btn-icon" 
                onClick={() => setIsMobileMenuOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            )}
            
            {!user ? (
              <div className="flex gap-3 items-center">
                <Link to="/login" className="btn btn-outline" style={{ border: 'none' }}>Entrar</Link>
                <Link to="/register" className="btn btn-primary">Comenzar</Link>
              </div>
            ) : (
              <div className="hide-on-mobile flex items-center gap-6">
                <NotificationCenter />
                <div className="flex items-center gap-3">
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
                    color: 'white', 
                    display: 'grid', 
                    placeItems: 'center', 
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                  }}>
                    {user.fullName[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1 }}>{user.fullName.split(' ')[0]}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Administrador</span>
                  </div>
                </div>
                <button onClick={logout} className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Cerrar Sesión">
                  <LogoutIcon />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {user && isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center gap-3">
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '10px', 
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
                  color: 'white', display: 'grid', placeItems: 'center', fontWeight: 'bold'
                }}>
                  {user.fullName[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{user.fullName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Administrador</div>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'var(--surface-50)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>
            
            <div style={{ padding: '1rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
              <OrganizationSwitcher />
            </div>

            <nav className="flex flex-col gap-1" style={{ flex: 1, overflowY: 'auto' }}>
              <Link to="/dashboard" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}><span className="nav-icon"><DashboardIcon /></span> Dashboard</Link>
              <Link to="/properties" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}><span className="nav-icon"><PropertiesIcon /></span> Propiedades</Link>
              <Link to="/tenants" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}><span className="nav-icon"><TenantsIcon /></span> Arrendatarios</Link>
              <Link to="/payments" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}><span className="nav-icon"><PaymentsIcon /></span> Recaudación</Link>
              <Link to="/finances" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}><span className="nav-icon"><FinancesIcon /></span> Finanzas</Link>
              <Link to="/team" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}><span className="nav-icon"><TeamIcon /></span> Equipo</Link>
              {user.role === UserRole.SUPER_ADMIN && (
                <Link to="/admin" className="mobile-nav-link" style={{ color: 'var(--primary)', background: 'var(--primary-light)' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="nav-icon">⚡</span> Administración
                </Link>
              )}
            </nav>
            
            <div className="flex items-center justify-between" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <NotificationCenter />
              <button onClick={logout} className="btn btn-outline" style={{ border: 'none', color: 'var(--error)' }}>
                <span className="nav-icon"><LogoutIcon /></span> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', flex: 1 }}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/showcase/:userId" element={<ShowcasePage />} />
          <Route path="/showcase/:userId/property/:propertyId" element={<PublicPropertyDetailPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/new" element={<CreatePropertyPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/tenants/new" element={<CreateTenantPage />} />
          <Route path="/tenants/:id" element={<TenantDetailPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/finances" element={<FinancialReportsPage />} />
          <Route path="/team" element={<TeamSettingsPage />} />
          <Route path="/admin" element={user && user.role === UserRole.SUPER_ADMIN ? <GodModePage /> : <Navigate to="/" />} />
        </Routes>
      </main>

      {/* Global AI Chat Widget (Only if logged in) */}
      {user && <ChatWidget />}

      <footer style={{ marginTop: '8rem', padding: '6rem 0', borderTop: '1px solid var(--border)', backgroundColor: 'white' }}>
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
            <div>
              <img src="/logo.png" alt="Logo" style={{ height: '32px', marginBottom: '1.5rem' }} />
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>La solución definitiva para la gestión de propiedades premium en Chile.</p>
            </div>
            {/* Quick links could go here */}
          </div>
          <div className="text-muted" style={{ textAlign: 'center', fontSize: '0.75rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
            <p>© 2026 Propiedades Premium. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Home() {
  return (
    <div className="animate-slide-up">
      <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto', marginBottom: '8rem', paddingTop: '6rem' }}>
        <div className="badge badge-outline" style={{ marginBottom: '2rem', color: 'var(--primary)', borderColor: 'var(--primary-light)', background: 'var(--primary-light)' }}>
          NUEVA VERSIÓN 2026 DISPONIBLE
        </div>
        <h2 style={{ fontSize: '4.5rem', marginBottom: '1.5rem', lineHeight: 1, letterSpacing: '-0.05em' }}>
          Gestiona tu patrimonio con <span className="text-gradient">precisión extrema</span>
        </h2>
        <p className="text-muted" style={{ fontSize: '1.4rem', marginBottom: '3.5rem', fontWeight: 500 }}>
          Descubre la plataforma de administración inmobiliaria más avanzada. 
          Diseñosa, intuitiva y potenciada por inteligencia artificial.
        </p>
        
        <div className="flex gap-6 justify-center">
          <Link to="/register" className="btn btn-primary" style={{ padding: '1.25rem 2.5rem', fontSize: '1rem' }}>Comenzar Ahora</Link>
          <a href="#features" className="btn btn-outline" style={{ padding: '1.25rem 2.5rem', fontSize: '1rem' }}>Saber Más</a>
        </div>
      </div>
      
      <div id="features" className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
        <div className="card">
          <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>💎</div>
          <h3 style={{ marginBottom: '0.75rem' }}>Interfaz de Lujo</h3>
          <p className="text-muted">Diseño pensado en la eficiencia y el placer visual. Cada detalle importa.</p>
        </div>
        <div className="card">
          <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>⚡</div>
          <h3 style={{ marginBottom: '0.75rem' }}>IA de Próxima Gen</h3>
          <p className="text-muted">Analiza tus beneficios y proyecciones hablando con nuestro agente experto.</p>
        </div>
        <div className="card">
          <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>📂</div>
          <h3 style={{ marginBottom: '0.75rem' }}>Control Total</h3>
          <p className="text-muted">Inventarios, flujos de caja y gestión de arrendatarios en un solo lugar.</p>
        </div>
      </div>
    </div>
  );
}

export default App;

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
}

// Navigation Components
function NavLink({ to, icon, label, isMobile, hideLabelOnTablet }: { to: string, icon: React.ReactNode, label: string, isMobile?: boolean, hideLabelOnTablet?: boolean }) {
  const className = isMobile ? "bottom-nav-link" : "flex items-center gap-2 nav-link-desktop";
  
  return (
    <Link to={to} className={className} style={{ 
      textDecoration: 'none', 
      color: 'inherit', 
      fontWeight: 700, 
      fontSize: isMobile ? '0.7rem' : '0.825rem',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <span className="nav-icon" style={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>{icon}</span>
      <span className={hideLabelOnTablet ? "hide-on-tablet" : ""}>{label}</span>
    </Link>
  );
}

// Minimalist Icons
function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  );
}

function PropertiesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"></path>
      <path d="M3 7v1a3 3 0 0 0 6 0V7m6 0v1a3 3 0 0 0 6 0V7"></path>
      <path d="M9 17h6"></path>
      <path d="M10 3h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>
    </svg>
  );
}

function TenantsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}

function FinancesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 18h.01"></path>
      <path d="M7 13h10"></path>
      <path d="M10 8h4"></path>
      <path d="M12 2v2"></path>
      <path d="M12 10v4"></path>
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

