import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePropertyDto, PropertyCategory } from '@propiedades/types';
import api from '@/api/axios';
import toast from 'react-hot-toast';

const propertySchema = z.object({
  address: z.string().min(5, 'Dirección demasiado corta'),
  category: z.nativeEnum(PropertyCategory),
  customCategory: z.string().optional(),
  paymentDueDay: z.number().min(1).max(31),
  contractEndDate: z.string().optional(),
  rol: z.string().optional(),
  notes: z.string().optional(),
  expectedRent: z.preprocess((val) => (val === '' || val === undefined ? undefined : Number(val)), z.number().positive().optional()),
});

const inputStyle = {
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--border)',
  outlineColor: 'var(--primary)',
  width: '100%',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
};

export default function CreatePropertyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreatePropertyDto>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      category: PropertyCategory.APARTMENT,
      paymentDueDay: 5,
    }
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: CreatePropertyDto) => {
      const resp = await api.post('/properties', data);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Propiedad registrada exitosamente');
      navigate('/properties');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al registrar la propiedad');
    }
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0', maxWidth: '640px' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Nueva Propiedad</h2>
        <p className="text-muted">Ingresa los datos básicos. Los medidores se agregan desde el detalle.</p>
      </div>

      <div className="card">
        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
            {(error as any)?.response?.data?.message || 'Hubo un error al crear la propiedad.'}
          </div>
        )}

        <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-6">

          {/* Dirección */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Dirección Completa</label>
            <input
              {...register('address')}
              type="text"
              placeholder="Ej: Av. Providencia 1234, Santiago"
              style={{ ...inputStyle, border: `1px solid ${errors.address ? 'var(--danger)' : 'var(--border)'}` }}
            />
            {errors.address && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.address.message}</span>}
          </div>

          {/* Categoría y día de pago */}
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Categoría</label>
              <select {...register('category')} style={inputStyle}>
                <option value={PropertyCategory.HOUSE}>Casa</option>
                <option value={PropertyCategory.APARTMENT}>Departamento</option>
                <option value={PropertyCategory.OFFICE}>Oficina/Local</option>
                <option value={PropertyCategory.LAND}>Terreno</option>
                <option value={PropertyCategory.OTHER}>Otro</option>
              </select>
              {watch('category') === PropertyCategory.OTHER && (
                <input
                  {...register('customCategory')}
                  type="text"
                  placeholder="Especifique categoría (Ej: Bodega)"
                  style={{ ...inputStyle, marginTop: '0.5rem' }}
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Día de Pago Vencido</label>
              <input
                {...register('paymentDueDay', { valueAsNumber: true })}
                type="number" min="1" max="31"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Datos Legales / SII */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Datos Legales / SII</p>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>ROL de Avalúo (SII)</label>
                <input {...register('rol')} type="text" placeholder="Ej: 1234-56" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Término de Contrato</label>
                <input {...register('contractEndDate')} type="date" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Notas y Precio Esperado */}
          <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Notas Adicionales</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Ej: Incluye estacionamiento y bodega #54"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Precio Público Estimado</label>
              <input
                {...register('expectedRent')}
                type="number"
                placeholder="Ej: 450000"
                style={inputStyle}
              />
              {errors.expectedRent && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>Dato inválido</span>}
            </div>
          </div>

          <div className="flex gap-4" style={{ marginTop: '1rem' }}>
            <button type="button" onClick={() => navigate('/properties')} className="btn btn-outline" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button disabled={isPending} className="btn btn-primary" style={{ flex: 2 }}>
              {isPending ? 'Creando...' : 'Crear Propiedad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
