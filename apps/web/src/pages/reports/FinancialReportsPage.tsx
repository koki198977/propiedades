import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { FinancialStatementDto, UtilityType, UtilityTypeLabels } from '@propiedades/types';
import { formatDate, toLocalDateFormat } from '../../utils/dateUtils';

// Componente para una tabla paginada y con búsqueda
function DataTable<T extends { id: string | number; date: string; amount: number }>({ 
  title, 
  data, 
  columns, 
  renderRow,
  totalLabel = "TOTAL",
  footerColor = "var(--primary)"
}: { 
  title: string; 
  data: T[]; 
  columns: string[];
  renderRow: (item: T) => React.ReactNode;
  totalLabel?: string;
  footerColor?: string;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrado por cualquier campo
  const filteredData = useMemo(() => {
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Buscar en esta tabla..." 
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              border: '1px solid var(--border)', 
              fontSize: '0.875rem', 
              width: '250px',
              background: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          />
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: '#fafafa' }}>
              {columns.map(col => (
                <th key={col} style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron registros.</td></tr>
            ) : currentItems.map(item => renderRow(item))}
          </tbody>
          <tfoot style={{ background: 'rgba(0,0,0,0.01)', fontWeight: 700 }}>
            <tr>
              <td colSpan={columns.length - 1} style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem' }}>
                {totalLabel} {searchTerm && <span style={{ fontWeight: 400, fontSize: '0.75rem' }}>(Filtrado)</span>}
              </td>
              <td style={{ padding: '1rem', textAlign: 'right', fontSize: '1.125rem', color: footerColor }}>
                ${totalAmount.toLocaleString('es-CL')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Mostrando <strong>{Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)}</strong> a <strong>{Math.min(filteredData.length, currentPage * itemsPerPage)}</strong> de <strong>{filteredData.length}</strong> registros
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="btn btn-outline" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              Anterior
            </button>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = currentPage;
                if (totalPages > 5) {
                    if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                } else {
                    pageNum = i + 1;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`btn ${currentPage === pageNum ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.4rem 0.7rem', fontSize: '0.75rem', minWidth: '32px' }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="btn btn-outline" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function WithdrawalModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Retiro de Dinero');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/utilities/expenses', {
        amount: Number(amount),
        date: new Date().toISOString(),
        category: 'Retiro',
        description: description,
      });
      onClose();
      window.location.reload();
    } catch (e) {
      alert('Error al registrar retiro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '2rem' }}>
        <h2 className="font-heading" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>💸 Registrar Retiro</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Monto del Retiro ($)</label>
            <input 
              type="number" 
              required 
              autoFocus
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Ej: 100000"
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '1rem' }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Descripción / Motivo</label>
            <input 
              type="text" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.9rem' }}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 1 }}>
              {isSubmitting ? 'Procesando...' : 'Confirmar Retiro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FinancialReportsPage() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'all' | 'custom'>('month');
  const [customRange, setCustomRange] = useState({
    startDate: toLocalDateFormat(),
    endDate: toLocalDateFormat(),
  });

  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

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
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case 'all':
        start = new Date(2000, 0, 1); 
        break;
      case 'custom':
        return `startDate=${customRange.startDate}&endDate=${customRange.endDate}`;
    }

    return `startDate=${toLocalDateFormat(start)}&endDate=${toLocalDateFormat(end)}`;
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
          <h1 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {dateRange === 'all' ? 'Balance General' : 'Rendición de Caja'}
          </h1>
          <p className="text-muted">
            {dateRange === 'all' 
              ? 'Consolidado acumulado de todos los ingresos y gastos desde el origen.' 
              : 'Balance detallado de ingresos y egresos por periodo.'}
          </p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setIsWithdrawalModalOpen(true)}
            className="btn btn-outline"
            style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', borderColor: 'var(--accent)', color: 'var(--accent)', fontWeight: 700 }}
          >
            💸 Registrar Retiro de Dinero
          </button>
        </div>

        <WithdrawalModal 
          isOpen={isWithdrawalModalOpen} 
          onClose={() => setIsWithdrawalModalOpen(false)} 
        />

        <div className="flex gap-2 p-1 glass" style={{ borderRadius: '0.75rem' }}>
          {(['today', 'week', 'month', 'year', 'all', 'custom'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`btn ${dateRange === range ? 'btn-primary' : ''}`}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem', border: 'none', background: dateRange === range ? '' : 'transparent' }}
            >
              {range === 'today' ? 'Hoy' : 
               range === 'week' ? 'Semana' : 
               range === 'month' ? 'Mes' : 
               range === 'year' ? 'Año' : 
               range === 'all' ? 'Histórico' : 'Filtro'}
            </button>
          ))}
        </div>
      </div>

      {dateRange === 'custom' && (
        <div className="card flex gap-4 items-end animate-fade-in" style={{ maxWidth: 'fit-content' }}>
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
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ borderLeft: '6px solid var(--success)', background: 'linear-gradient(to right, rgba(46, 204, 113, 0.05), white)' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ingresos Totales</span>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#27ae60', marginTop: '0.5rem' }}>
                ${data.summary.totalIncome.toLocaleString('es-CL')}
              </div>
            </div>
            <div className="card" style={{ borderLeft: '6px solid var(--danger)', background: 'linear-gradient(to right, rgba(231, 76, 60, 0.05), white)' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Egresos y Costos</span>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#c0392b', marginTop: '0.5rem' }}>
                ${(data.summary.totalExpenses + data.summary.totalCosts).toLocaleString('es-CL')}
              </div>
            </div>
            <div className="card" style={{ background: 'var(--primary)', color: 'white', boxShadow: '0 10px 20px rgba(74, 58, 255, 0.2)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.05em' }}>Resultado Neto Final</span>
              <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.5rem' }}>
                ${data.summary.netResult.toLocaleString('es-CL')}
              </div>
            </div>
          </div>

          <DataTable 
            title="Ventas / Ingresos Detallados"
            data={data.income.items}
            columns={['Fecha', 'Propiedad', 'Inquilino', 'Método', 'Monto']}
            totalLabel="TOTAL RECAUDADO"
            footerColor="var(--success)"
            renderRow={(item: any) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{formatDate(item.date)}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{item.propertyAddress}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{item.tenantName}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  <span style={{ padding: '0.2rem 0.5rem', background: '#f0f0f0', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 600 }}>
                    {item.method}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700, textAlign: 'right' }}>${item.amount.toLocaleString('es-CL')}</td>
              </tr>
            )}
          />

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            <DataTable 
              title="Egresos (Servicios y Retiros)"
              data={data.expenses.items}
              columns={['Fecha', 'Item / Descripción', 'Propiedad', 'Monto']}
              totalLabel="TOTAL EGRESOS"
              footerColor="var(--danger)"
              renderRow={(item: any) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{formatDate(item.date)}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {item.type === UtilityType.OTHER ? (
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.description || 'Otro'}</div>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontWeight: 600 }}>{UtilityTypeLabels[item.type as UtilityType] || 'Gasto'}</div>
                        {item.description && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.description}</div>}
                      </>
                    )}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.propertyAddress?.split(',')[0] || 'General'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700, textAlign: 'right', color: 'var(--danger)' }}>
                    ${item.amount.toLocaleString('es-CL')}
                  </td>
                </tr>
              )}
            />

            <DataTable 
              title="Costos de Mantenimiento / Inversión"
              data={data.costs.items}
              columns={['Fecha', 'Item / Descripción', 'Propiedad', 'Monto']}
              totalLabel="TOTAL COSTOS"
              renderRow={(item: any) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{formatDate(item.date)}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {item.type === UtilityType.OTHER ? (
                      <div style={{ fontWeight: 600 }}>{item.description || 'Gastos de Propiedad'}</div>
                    ) : (
                      <>
                        <div style={{ fontWeight: 600 }}>{UtilityTypeLabels[item.type as UtilityType] || 'Costo'}</div>
                        {item.description && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.description}</div>}
                      </>
                    )}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.propertyAddress?.split(',')[0] || 'General'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700, textAlign: 'right' }}>
                    ${item.amount.toLocaleString('es-CL')}
                  </td>
                </tr>
              )}
            />
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '3rem', borderRadius: '1.5rem', border: '1px solid var(--border)' }}>
            <h2 className="font-heading" style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '2rem' }}>Resumen Consolidado</h2>
            <div className="flex flex-col gap-6" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div className="flex justify-between items-center" style={{ fontSize: '1.125rem' }}>
                <span className="text-muted">Ingresos Brutos Acumulados</span>
                <span style={{ fontWeight: 800, color: '#27ae60' }}>+ ${data.summary.totalIncome.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between items-center" style={{ fontSize: '1.125rem' }}>
                <span className="text-muted">Servicios y Egresos Operativos</span>
                <span style={{ fontWeight: 800, color: '#c0392b' }}>- ${data.summary.totalExpenses.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between items-center" style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>
                <span className="text-muted">Mantenimiento y Costos Fijos</span>
                <span style={{ fontWeight: 800, color: '#c0392b' }}>- ${data.summary.totalCosts.toLocaleString('es-CL')}</span>
              </div>
              <div style={{ height: '2px', background: 'var(--border)', margin: '1rem 0' }}></div>
              <div className="flex justify-between items-center">
                <span style={{ fontWeight: 800, fontSize: '1.5rem' }}>SALDO LÍQUIDO</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: '2.5rem', color: data.summary.netResult >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                    ${data.summary.netResult.toLocaleString('es-CL')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '-0.5rem' }}>
                    {data.summary.netResult >= 0 ? 'Excedente' : 'Déficit'}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
              <button 
                onClick={() => window.print()} 
                className="btn btn-primary"
                style={{ padding: '1rem 2.5rem', borderRadius: '3rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 20px rgba(74, 58, 255, 0.2)' }}
              >
                🖨 Exportar Reporte Completo (PDF)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
