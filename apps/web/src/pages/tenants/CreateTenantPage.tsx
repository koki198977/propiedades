import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateTenantDto } from '@propiedades/types';
import api from '@/api/axios';

const tenantSchema = z.object({
  name: z.string().min(3, 'Nombre demasiado corto'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  documentId: z.string().optional(),
});

export default function CreateTenantPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreateTenantDto>({
    resolver: zodResolver(tenantSchema),
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: CreateTenantDto) => {
      const resp = await api.post('/tenants', data);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      navigate('/tenants');
    },
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0', maxWidth: '600px' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Nuevo Arrendatario</h2>
        <p className="text-muted">Ingresa los datos de contacto de tu nuevo cliente</p>
      </div>

      <div className="card">
        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
            {(error as any)?.response?.data?.message || 'Hubo un error al registrar el arrendatario.'}
          </div>
        )}

        <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nombre Completo</label>
            <input 
              {...register('name')}
              type="text"
              placeholder="Ej: Pedro Valdivia"
              style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: `1px solid ${errors.name ? 'var(--danger)' : 'var(--border)'}`,
                outlineColor: 'var(--primary)',
              }}
            />
            {errors.name && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>RUT / Documento de Identidad</label>
            <input 
              {...register('documentId')}
              type="text"
              placeholder="Ej: 12.345.678-k"
              style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                outlineColor: 'var(--primary)',
              }}
            />
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email</label>
              <input 
                {...register('email')}
                type="email"
                placeholder="pedro@correo.com"
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${errors.email ? 'var(--danger)' : 'var(--border)'}`,
                  outlineColor: 'var(--primary)',
                }}
              />
              {errors.email && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Teléfono</label>
              <input 
                {...register('phone')}
                type="tel"
                placeholder="Ej: +56 9 1234 5678"
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border)',
                  outlineColor: 'var(--primary)',
                }}
              />
            </div>
          </div>

          <div className="flex gap-4" style={{ marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={() => navigate('/tenants')}
              className="btn btn-outline" 
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button 
              disabled={isPending}
              className="btn btn-primary" 
              style={{ flex: 2 }}
            >
              {isPending ? 'Registrando...' : 'Registrar Arrendatario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
