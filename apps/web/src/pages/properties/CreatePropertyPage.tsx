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
  city: z.string().optional(),
  category: z.nativeEnum(PropertyCategory),
  customCategory: z.string().optional(),
  bedrooms: z.preprocess((val) => (val === '' || val === undefined ? undefined : Number(val)), z.number().min(0).optional()),
  bathrooms: z.preprocess((val) => (val === '' || val === undefined ? undefined : Number(val)), z.number().min(0).optional()),
  m2Total: z.preprocess((val) => (val === '' || val === undefined ? undefined : Number(val)), z.number().min(0).optional()),
  m2Built: z.preprocess((val) => (val === '' || val === undefined ? undefined : Number(val)), z.number().min(0).optional()),
  hasParking: z.boolean().optional().default(false),
  hasStorage: z.boolean().optional().default(false),
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
      hasParking: false,
      hasStorage: false,
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
    <div className="container animate-fade-in" style={{ padding: '2rem 0', maxWidth: '750px' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Nueva Propiedad</h2>
        <p className="text-muted">Ingresa los datos técnicos y legales de tu nuevo activo.</p>
      </div>

      <div className="card">
        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
            {(error as any)?.response?.data?.message || 'Hubo un error al crear la propiedad.'}
          </div>
        )}

        <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-8">

          {/* Sección 1: Ubicación y Tipo */}
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '1.25rem' }}>1. Ubicación y Tipo</p>
             <div className="flex flex-col gap-2" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nombre de la Propiedad (Título Público)</label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Ej: Departamento 404 Plaza"
                  style={inputStyle}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Este es el nombre que se mostrará públicamente en la vitrina.</span>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Dirección Exacta (Privada)</label>
                  <input
                    {...register('address')}
                    type="text"
                    placeholder="Ej: Av. Providencia 1234, Depto 404"
                    style={{ ...inputStyle, border: `1px solid ${errors.address ? 'var(--danger)' : 'var(--border)'}` }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>La dirección no se muestra en la vitrina pública.</span>
                </div>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Ciudad / Comuna</label>
                  <input {...register('city')} type="text" placeholder="Ej: Santiago" style={inputStyle} />
                </div>
              </div>
            
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
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
                    placeholder="Especifique categoría"
                    style={{ ...inputStyle, marginTop: '0.5rem' }}
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Día de Cobro (1-31)</label>
                <input
                  {...register('paymentDueDay', { valueAsNumber: true })}
                  type="number" min="1" max="31"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Especificaciones Técnicas */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '1.25rem' }}>2. Especificaciones Técnicas</p>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Dormit.</label>
                <input {...register('bedrooms')} type="number" min="0" placeholder="0" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Baños</label>
                <input {...register('bathrooms')} type="number" min="0" placeholder="0" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>m² Útiles</label>
                <input {...register('m2Built')} type="number" step="0.1" placeholder="0.0" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>m² Totales</label>
                <input {...register('m2Total')} type="number" step="0.1" placeholder="0.0" style={inputStyle} />
              </div>
            </div>
            
            <div className="flex gap-8" style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                <input type="checkbox" {...register('hasParking')} style={{ width: '18px', height: '18px' }} />
                <span>¿Tiene Estacionamiento?</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                <input type="checkbox" {...register('hasStorage')} style={{ width: '18px', height: '18px' }} />
                <span>¿Tiene Bodega?</span>
              </label>
            </div>
          </div>

          {/* Sección 3: Datos Legales y Vitrina */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '1.25rem' }}>3. Datos Legales y Vitrina</p>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>ROL de Avalúo</label>
                <input {...register('rol')} type="text" placeholder="Ej: 1234-56" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Término Contrato</label>
                <input {...register('contractEndDate')} type="date" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Arriendo Público</label>
                <input {...register('expectedRent')} type="number" placeholder="$450.000" style={inputStyle} />
              </div>
            </div>

            <div className="flex flex-col gap-2" style={{ marginTop: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Notas Detalladas</label>
              <textarea
                {...register('notes')}
                rows={4}
                placeholder="Describe características especiales, reglas del condominio, etc."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="flex gap-4" style={{ marginTop: '1rem' }}>
            <button type="button" onClick={() => navigate('/properties')} className="btn btn-outline" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button disabled={isPending} className="btn btn-primary" style={{ flex: 2 }}>
              {isPending ? 'Procesando...' : 'Guardar Propiedad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
