import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentDto, PaymentMethodLabels } from '@propiedades/types';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const { data: payments, isLoading, error } = useQuery<PaymentDto[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      const resp = await api.get('/payments');
      return resp.data;
    },
  });

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

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de pago?')) {
      deletePayment(id);
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
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Historial de Pagos</h2>
        <p className="text-muted">Revisa todos los ingresos registrados en el sistema</p>
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
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--bg-surface)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <tr>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Fecha</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Propiedad / Inquilino</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Método</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Monto</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Comprobante</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{new Date(payment.paymentDate).toLocaleDateString()}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{payment.notes || 'Arriendo'}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{payment.propertyTenant.property.address}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{payment.propertyTenant.tenant.name}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.75rem' }}>
                        {PaymentMethodLabels[payment.paymentMethod]}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, fontSize: '1rem', color: 'var(--success)' }}>
                      + ${Number(payment.amount).toLocaleString('es-CL')}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      {payment.receiptUrl ? (
                        <a href={payment.receiptUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>Ver Archivo</a>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Sin comprobante</span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(payment.id)}
                        className="btn" 
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.4rem', fontSize: '1rem' }}
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
        </div>
      )}
    </div>
  );
}
