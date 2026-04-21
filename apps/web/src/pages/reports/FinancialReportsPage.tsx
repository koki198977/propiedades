import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { FinancialStatementDto, UtilityType, UtilityTypeLabels } from '@propiedades/types';

export default function FinancialReportsPage() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customRange, setCustomRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const getQueryParams = () => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (dateRange) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // get Monday
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case 'custom':
        return `startDate=${customRange.startDate}&endDate=${customRange.endDate}`;
    }

    return `startDate=${start.toISOString().split('T')[0]}&endDate=${end.toISOString().split('T')[0]}`;
  };

  const { data, isLoading } = useQuery<FinancialStatementDto>({
    queryKey: ['financial-statement', dateRange, customRange],
    queryFn: async () => {
      const resp = await api.get(`/reports/statement?${getQueryParams()}`);
      return resp.data;
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Rendición de Caja</h1>
          <p className="text-muted">Balance detallado de ingresos y egresos por periodo.</p>
        </div>

        <div className="flex gap-2 p-1 glass" style={{ borderRadius: '0.75rem' }}>
          {(['today', 'week', 'month', 'year', 'custom'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`btn ${dateRange === range ? 'btn-primary' : ''}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', border: 'none', background: dateRange === range ? '' : 'transparent' }}
            >
              {range === 'today' ? 'Hoy' : range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : range === 'year' ? 'Año' : 'Filtro'}
            </button>
          ))}
        </div>
      </div>

      {dateRange === 'custom' && (
        <div className="card flex gap-4 items-end animate-fade-in">
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Desde</label>
            <input 
              type="date" 
              value={customRange.startDate} 
              onChange={e => setCustomRange(prev => ({ ...prev, startDate: e.target.value }))}
              style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Hasta</label>
            <input 
              type="date" 
              value={customRange.endDate} 
              onChange={e => setCustomRange(prev => ({ ...prev, endDate: e.target.value }))}
              style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
        </div>
      ) : data && (
        <>
          {/* Summary KPIs */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Ingresos Totales</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.5rem' }}>
                ${data.summary.totalIncome.toLocaleString('es-CL')}
              </div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Egresos y Costos</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.5rem' }}>
                ${(data.summary.totalExpenses + data.summary.totalCosts).toLocaleString('es-CL')}
              </div>
            </div>
            <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>Resultado Neto</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>
                ${data.summary.netResult.toLocaleString('es-CL')}
              </div>
            </div>
          </div>

          {/* Detailed Tables */}
          <div className="flex flex-col gap-6">
            {/* INGRESOS Section */}
            <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: 0 }}>Ventas / Ingresos</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Fecha</th>
                      <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Propiedad</th>
                      <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Inquilino</th>
                      <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Método</th>
                      <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.income.items.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay ingresos registrados en este periodo.</td></tr>
                    ) : data.income.items.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(item.date).toLocaleDateString('es-CL')}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{item.propertyAddress}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{item.tenantName}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{item.method}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700, textAlign: 'right' }}>${item.amount.toLocaleString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{ background: 'rgba(0,0,0,0.01)', fontWeight: 700 }}>
                    <tr>
                      <td colSpan={4} style={{ padding: '1rem', textAlign: 'right' }}>TOTAL RECAUDADO</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontSize: '1.125rem', color: 'var(--success)' }}>${data.income.total.toLocaleString('es-CL')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* EGRESOS Section */}
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'rgba(231, 76, 60, 0.05)' }}>
                  <h4 style={{ margin: 0, color: 'var(--danger)' }}>Egresos (Servicios)</h4>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '0.75rem', fontSize: '0.7rem' }}>Item</th>
                        <th style={{ padding: '0.75rem', fontSize: '0.7rem' }}>Propiedad</th>
                        <th style={{ padding: '0.75rem', fontSize: '0.7rem', textAlign: 'right' }}>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.expenses.items.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.75rem', fontSize: '0.75rem' }}>
                            {item.type === UtilityType.OTHER ? (
                              <strong>{item.description || 'Otro'}</strong>
                            ) : (
                              <>
                                <div>{UtilityTypeLabels[item.type]}</div>
                                {item.description && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.description}</div>}
                              </>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.propertyAddress.split(',')[0]}</td>
                          <td style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, textAlign: 'right' }}>${item.amount.toLocaleString('es-CL')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot style={{ fontWeight: 700 }}>
                      <tr>
                        <td colSpan={2} style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem' }}>TOTAL EGRESOS</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--danger)' }}>${data.expenses.total.toLocaleString('es-CL')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>

              <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.05)' }}>
                  <h4 style={{ margin: 0 }}>Costos de Propiedad</h4>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '0.75rem', fontSize: '0.7rem' }}>Item</th>
                        <th style={{ padding: '0.75rem', fontSize: '0.7rem' }}>Propiedad</th>
                        <th style={{ padding: '0.75rem', fontSize: '0.7rem', textAlign: 'right' }}>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.costs.items.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.75rem', fontSize: '0.75rem' }}>
                            {item.type === UtilityType.OTHER ? (
                              <strong>{item.description || 'Otro'}</strong>
                            ) : (
                              <>
                                <div>{UtilityTypeLabels[item.type]}</div>
                                {item.description && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.description}</div>}
                              </>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.propertyAddress.split(',')[0]}</td>
                          <td style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, textAlign: 'right' }}>${item.amount.toLocaleString('es-CL')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot style={{ fontWeight: 700 }}>
                      <tr>
                        <td colSpan={2} style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem' }}>TOTAL COSTOS</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>${data.costs.total.toLocaleString('es-CL')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            </div>

            {/* FINAL SUMMARY (Rendición) */}
            <div className="card" style={{ background: '#f8fafc', padding: '2rem' }}>
              <h3 className="font-heading" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Resumen de Cierre de Caja</h3>
              <div className="flex flex-col gap-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Total Ventas Bruto (Ingresos)</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>+ ${data.summary.totalIncome.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Total Egresos (Servicios)</span>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>- ${data.summary.totalExpenses.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                  <span className="text-muted">Total Costos Propiedad</span>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>- ${data.summary.totalCosts.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between items-center" style={{ borderTop: '2px solid var(--border)', paddingTop: '1rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>SALDO NETO FINAL</span>
                  <span style={{ fontWeight: 900, fontSize: '1.5rem', color: data.summary.netResult >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                    ${data.summary.netResult.toLocaleString('es-CL')}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button 
                  onClick={() => window.print()} 
                  className="btn btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  🖨 Imprimir Rendición
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
