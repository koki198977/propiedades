import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { RegisterDto } from '@propiedades/types';
import api from '@/api/axios';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  fullName: z.string().min(3, 'Nombre demasiado corto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: RegisterDto) => {
      const resp = await api.post('/auth/register', data);
      return resp.data;
    },
    onSuccess: () => {
      toast.success('Cuenta creada exitosamente. Ya puedes iniciar sesión.');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la cuenta');
    }
  });

  return (
    <div className="animate-fade-in" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img src="/logo-premium.png" alt="Logo" style={{ height: '70px', width: 'auto', marginBottom: '1.5rem' }} />
          <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Únete</h2>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>Crea tu cuenta en la plataforma líder de gestión premium</p>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            Por favor, revisa que todos los campos sean correctos.
          </div>
        )}

        <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nombre Completo</label>
            <input 
              {...register('fullName')}
              type="text"
              placeholder="Juan Pérez"
              className="input"
              style={{
                borderColor: errors.fullName ? 'var(--danger)' : 'var(--border)',
              }}
            />
            {errors.fullName && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.fullName.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email</label>
            <input 
              {...register('email')}
              type="email"
              placeholder="ejemplo@correo.com"
              className="input"
              style={{
                borderColor: errors.email ? 'var(--danger)' : 'var(--border)',
              }}
            />
            {errors.email && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.email.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Contraseña</label>
            <input 
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="input"
              style={{
                borderColor: errors.password ? 'var(--danger)' : 'var(--border)',
              }}
            />
            {errors.password && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.password.message}</span>}
          </div>

          <button 
            disabled={isPending}
            className="btn btn-primary" 
            style={{ marginTop: '1rem', width: '100%', height: '3rem' }}
          >
            {isPending ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <span className="text-muted">¿Ya tienes cuenta? </span>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
}
