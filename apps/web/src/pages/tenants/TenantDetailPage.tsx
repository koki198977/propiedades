import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TenantDto, UpdateTenantDto } from '@propiedades/types';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');

  const { data: tenant, isLoading, error } = useQuery<TenantDto>({
    queryKey: ['tenant', id],
    queryFn: async () => {
      const resp = await api.get(`/tenants/${id}`);
      return resp.data;
    },
    enabled: !!id,
  });

  const { mutate: deleteTenant, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      await api.delete(`/tenants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Arrendatario removido con éxito (archivado para reportes históricos).');
      navigate('/tenants');
    },
    onError: () => {
      toast.error('Error al remover el arrendatario.');
    },
  });

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este arrendatario? Se ocultará de la lista pero sus pagos registrados se mantendrán para tus informes históricos.')) {
      deleteTenant();
    }
  };

  if (isLoading) {
    return (
      <div className="container animate-fade-in" style={{ padding: '2rem 0', maxWidth: '680px' }}>
        <div className="skeleton" style={{ width: '120px', height: '1.5rem', marginBottom: '2rem' }} />
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="skeleton" style={{ width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '60%', height: '1.75rem', marginBottom: '0.5rem' }} />
              <div className="skeleton" style={{ width: '35%', height: '1rem' }} />
            </div>
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
              <div className="skeleton" style={{ width: '25%', height: '0.875rem', marginBottom: '0.5rem' }} />
              <div className="skeleton" style={{ width: '50%', height: '1.1rem' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h3 style={{ marginBottom: '1rem' }}>Arrendatario no encontrado</h3>
        <button className="btn btn-outline" onClick={() => navigate('/tenants')}>Volver</button>
      </div>
    );
  }

  const initials = tenant.name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="container animate-fade-in" style={{ padding: '1.5rem 0', maxWidth: '680px' }}>
      {/* Back */}
      <button
        className="btn btn-outline"
        onClick={() => navigate('/tenants')}
        style={{ marginBottom: '2rem', padding: '0.4rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
      >
        ← Volver
      </button>

      {/* Profile Card / Edit Form */}
      {isEditing && tenant ? (
        <div className="card" style={{ padding: '2.5rem', marginBottom: '1.5rem' }}>
          <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Editar Arrendatario</h3>
          <EditTenantForm tenant={tenant} onDone={() => setIsEditing(false)} />
        </div>
      ) : (
        <div className="card" style={{ padding: '2.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
            color: 'white',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <h2 className="font-heading" style={{ fontSize: '1.75rem', margin: 0, marginBottom: '0.25rem' }}>{tenant.name}</h2>
            {tenant.documentId && (
              <span style={{
                display: 'inline-block',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '999px',
                padding: '0.2rem 0.75rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}>
                RUT {tenant.documentId}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', borderTop: '1px solid var(--border-light)' }}>
          <InfoRow icon="✉️" label="Email" value={tenant.email || 'No registrado'} />
          <InfoRow icon="📱" label="Teléfono" value={tenant.phone || 'No registrado'} />
          <InfoRow icon="🪪" label="RUT / Documento" value={tenant.documentId || 'No registrado'} />
        </div>
      </div>
    )}

      {/* Actions */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          className="btn btn-outline"
          onClick={() => setIsEditing(!isEditing)}
          style={{ flex: 1, minWidth: '140px' }}
        >
          {isEditing ? '🚫 Cancelar' : '✏️ Editar'}
        </button>
        <button
          className="btn"
          onClick={handleDelete}
          disabled={isDeleting}
          style={{
            flex: 1,
            minWidth: '140px',
            background: 'var(--danger)',
            color: 'white',
            border: 'none',
            opacity: isDeleting ? 0.7 : 1,
          }}
        >
          {isDeleting ? 'Eliminando...' : '🗑️ Eliminar'}
        </button>
      </div>
    </div>
  );
}

const tenantSchema = z.object({
  name: z.string().min(3, 'Nombre demasiado corto'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  documentId: z.string().optional(),
});

function EditTenantForm({ tenant, onDone }: { tenant: TenantDto, onDone: () => void }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateTenantDto>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: tenant.name,
      email: tenant.email || '',
      phone: tenant.phone || '',
      documentId: tenant.documentId || '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: UpdateTenantDto) => {
      const resp = await api.patch(`/tenants/${tenant.id}`, data);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', tenant.id] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Información actualizada');
      onDone();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al actualizar');
    },
  });

  const inputStyle = {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border)',
    width: '100%',
    outlineColor: 'var(--primary)',
  };

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nombre Completo</label>
        <input {...register('name')} style={inputStyle} />
        {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.name.message}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email</label>
        <input {...register('email')} type="email" style={inputStyle} />
        {errors.email && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.email.message}</span>}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="flex flex-col gap-2">
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>RUT / ID</label>
          <input {...register('documentId')} style={inputStyle} />
        </div>
        <div className="flex flex-col gap-2">
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Teléfono</label>
          <input {...register('phone')} type="tel" style={inputStyle} />
        </div>
      </div>

      <div className="flex gap-4" style={{ marginTop: '1rem' }}>
        <button type="button" onClick={onDone} className="btn btn-outline" style={{ flex: 1 }}>
          Cancelar
        </button>
        <button disabled={isPending} className="btn btn-primary" style={{ flex: 2 }}>
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}

type InfoRowProps = { icon: string; label: string; value: string };
function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem 0',
      borderBottom: '1px solid var(--border-light)',
    }}>
      <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ margin: 0, fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  );
}
