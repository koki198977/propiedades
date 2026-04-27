import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentDto, PaymentMethodLabels } from '@propiedades/types';
import { useOrganization } from '../../providers/OrganizationProvider';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const { activeOrganization } = useOrganization();
  
  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: payments, isLoading, error } = useQuery<PaymentDto[]>({
    queryKey: ['payments', activeOrganization?.id],
    queryFn: async () => {
      const resp = await api.get('/payments');
      return resp.data;
    },
    enabled: !!activeOrganization,
  });

  // Lógica de filtrado
  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    return payments.filter(p => {
      const searchStr = `${p.propertyTenant.property.address} ${p.propertyTenant.tenant.name} ${p.notes} ${PaymentMethodLabels[p.paymentMethod]}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [payments, searchTerm]);

  // Lógica de paginación
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage));
  const currentPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  const { mutate: deletePayment } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pago eliminado');
    },
    onError: () => {
      toast.error('Error al eliminar el pago');
    },
  });

  const billingMutation = useMutation({
    mutationFn: async () => {
      if (!activeOrganization) return;
      const resp = await api.post(`/organizations/${activeOrganization.id}/billing/send-all`);
      return resp.data;
    },
    onSuccess: (data) => {
      if (data?.sent > 0) {
        toast.success(`Cobranza emitida: ${data.sent} correos enviados.`);
      } else {
        toast.error(data?.message || 'No se enviaron correos.');
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Error al emitir cobranza. Verifica tus datos bancarios.';
      toast.error(msg);
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de pago?')) {
      deletePayment(id);
    }
  };

  const handleEmitBilling = () => {
    if (window.confirm('¿Estás seguro de emitir la cobranza masiva? Se enviará un correo a todos los inquilinos con contrato activo.')) {
      billingMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <h2 className="font-heading" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Historial de Pagos</h2>
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card" style={{ height: '80px', opacity: 0.5 }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '1.5rem 0' }}>
      <div className="flex justify-between items-start flex-wrap gap-4" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Historial de Pagos</h2>
          <p className="text-muted">Revisa todos los ingresos registrados en el sistema</p>
        </div>
        <button 
          onClick={handleEmitBilling}
          className="btn btn-primary flex items-center gap-2"
          disabled={billingMutation.isPending || !activeOrganization}
        >
          {billingMutation.isPending ? 'Enviando...' : (
            <>
              <span>📧</span>
              Emitir Cobranza
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
          Error al cargar los pagos.
        </div>
      )}

      {!payments || payments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>💰</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No hay pagos registrados</h3>
          <p className="text-muted">Los pagos aparecerán aquí una vez que los registres en el detalle de cada propiedad.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
             <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Pagos Registrados ({filteredPayments.length})</h3>
             <input 
               type="text" 
               placeholder="Buscar propiedad o inquilino..." 
               value={searchTerm}
               onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
               style={{ 
                 padding: '0.5rem 1rem', 
                 borderRadius: '2rem', 
                 border: '1px solid var(--border)', 
                 fontSize: '0.875rem', 
                 width: '300px',
                 background: 'white'
               }}
             />
          </div>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--bg-surface)', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Fecha / Ref</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Propiedad / Inquilino</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Método</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Monto</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Comprobante</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron resultados para "{searchTerm}"</td></tr>
                ) : currentPayments.map((payment) => (
                  <tr key={payment.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{formatDate(payment.paymentDate)}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{payment.notes || 'Arriendo'}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{payment.propertyTenant.property.address}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{payment.propertyTenant.tenant.name}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span className="badge" style={{ backgroundColor: '#f0f0f0', color: 'var(--text-main)', fontSize: '0.7rem', fontWeight: 700 }}>
                        {PaymentMethodLabels[payment.paymentMethod]}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, fontSize: '1rem', color: '#27ae60' }}>
                      + ${Number(payment.amount).toLocaleString('es-CL')}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {payment.receiptUrl ? (
                        <a href={payment.receiptUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>Ver Archivo</a>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Sin comprobante</span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(payment.id)}
                        style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: '0.5rem', fontSize: '1.1rem', opacity: 0.7 }}
                        onMouseOver={e => e.currentTarget.style.opacity = '1'}
                        onMouseOut={e => e.currentTarget.style.opacity = '0.7'}
                        title="Eliminar pago"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Mostrando <strong>{Math.min(filteredPayments.length, (currentPage - 1) * itemsPerPage + 1)}</strong>-<strong>{Math.min(filteredPayments.length, currentPage * itemsPerPage)}</strong> de <strong>{filteredPayments.length}</strong>
              </span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="btn btn-outline" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                  Anterior
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="btn btn-outline" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
