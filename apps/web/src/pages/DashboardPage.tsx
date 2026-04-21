import { useQuery } from '@tanstack/react-query';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import api from '@/api/axios';
import { Link } from 'react-router-dom';

import { useOrganization } from '../providers/OrganizationProvider';

export default function DashboardPage() {
  const { activeOrganization } = useOrganization();
  const { data, isLoading } = useQuery<any>({
    queryKey: ['dashboard-metrics', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization) return null;
      const resp = await api.get('/reports/dashboard');
      return resp.data;
    },
    enabled: !!activeOrganization,
  });

  if (!activeOrganization && !isLoading) {
    return (
      <div className="container animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div className="card glass" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Bienvenido a Propiedades</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '2.5rem' }}>
            Para comenzar a gestionar tus propiedades, primero necesitas crear un **Espacio de Trabajo**. 
            Esto te permitirá organizar tus activos de forma profesional.
          </p>
          <div className="flex justify-center gap-4">
            <button className="btn btn-primary" style={{ padding: '1rem 2rem' }}>Crear mi primer espacio</button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p className="text-muted">Cargando métricas clave...</p>
      </div>
    );
  }

  const { kpis, incomeHistory } = data || { kpis: {}, incomeHistory: [] };

  return (
    <div className="container animate-slide-up" style={{ padding: '0' }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.25rem', color: 'var(--secondary)' }}>Dashboard</h2>
          <p className="text-muted" style={{ fontSize: '1rem' }}>Visión analítica de tu portafolio inmobiliario</p>
        </div>
        <div className="hide-on-mobile flex gap-3">
           <Link to="/properties/new" className="btn btn-primary">+ Nueva Propiedad</Link>
        </div>
      </div>

      <div className="grid" style={{ marginBottom: '3rem', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="card" style={{ background: 'white' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
             <span className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>Ingresos Mes</span>
             <span style={{ fontSize: '1.25rem' }}>💰</span>
          </div>
          <div className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>
            ${kpis.monthlyIncomeSum?.toLocaleString('es-CL') || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Recaudación actual</div>
        </div>

        <div className="card" style={{ background: 'white' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
             <span className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>Egresos Mes</span>
             <span style={{ fontSize: '1.25rem' }}>📉</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>
            ${kpis.monthlyExpensesSum?.toLocaleString('es-CL') || 0}
          </div>
           <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gastos y servicios</div>
        </div>

        <div className="card" style={{ background: 'white' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
             <span className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>Flujo Neto</span>
             <span style={{ fontSize: '1.25rem' }}>⚖️</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: (kpis.netIncomeSum >= 0) ? 'var(--success)' : 'var(--danger)' }}>
            ${kpis.netIncomeSum?.toLocaleString('es-CL') || 0}
          </div>
           <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Utilidad del periodo</div>
        </div>

        <div className="card" style={{ background: 'white' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
             <span className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>Ocupación</span>
             <span style={{ fontSize: '1.25rem' }}>🏠</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>
            {kpis.occupancyRate}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{kpis.activeTenants} / {kpis.totalProperties} arrendadas</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Chart Card */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
            <h3 className="font-heading" style={{ fontSize: '1.5rem' }}>Historial Financiero</h3>
            <div className="badge badge-outline" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>MÉTRICAS 6 MESES</div>
          </div>
          
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomeHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 13, fill: 'var(--text-muted)', fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 13, fill: 'var(--text-muted)', fontWeight: 600 }} 
                  tickFormatter={(val) => `$${(val / 1000)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '1.25rem', 
                    border: '1px solid var(--border)', 
                    boxShadow: 'var(--shadow-lg)',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)'
                  }}
                  formatter={(val: number, name: string) => [`$${val.toLocaleString('es-CL')}`, name]}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  name="Ingresos"
                  stroke="var(--primary)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  name="Egresos"
                  stroke="var(--accent)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Widgets inside Dashboard */}
        <div className="flex flex-col gap-6">
          <div className="card glass" style={{ background: 'linear-gradient(135deg, white, #fef2f2)', borderColor: 'rgba(79, 70, 229, 0.1)' }}>
            <h3 className="font-heading" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Estatus Operativo</h3>
            
            <div style={{ marginBottom: '2rem' }}>
              <div className="flex justify-between" style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 700 }}>Tasa de Ocupación</span>
                <span className="text-gradient" style={{ fontWeight: 800 }}>{kpis.occupancyRate}%</span>
              </div>
              <div style={{ height: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '10px', overflow: 'hidden', display: 'flex', border: '1px solid var(--border)' }}>
                <div style={{ width: `${kpis.occupancyRate}%`, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}></div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--primary)' }}></div>
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>{kpis.activeTenants} Propiedades alquiladas</span>
              </div>
              <div className="flex items-center gap-3">
                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--border)' }}></div>
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>{kpis.totalProperties - kpis.activeTenants} Unidades vacantes</span>
              </div>
            </div>
          </div>
          {/* IA Section Removed as requested */}
        </div>
      </div>
    </div>
  );
}
