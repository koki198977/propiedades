import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateProfileDto, UserProfileDto, OrganizationRole, OrganizationRoleLabels, UserRole } from '@propiedades/types';
import toast from 'react-hot-toast';
import api from '@/api/axios';
import { useOrganization } from '../../providers/OrganizationProvider';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}') as UserProfileDto;
  const { activeOrganization } = useOrganization();
  
  const [formData, setFormData] = useState({
    fullName: savedUser.fullName || '',
    email: savedUser.email || '',
    password: '',
    confirmPassword: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: UpdateProfileDto) => {
      const resp = await api.patch('/auth/profile', data);
      return resp.data;
    },
    onSuccess: (updatedUser) => {
      toast.success('Perfil actualizado correctamente');
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Force refresh of local state if needed, though App.tsx usually handles it via localStorage
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Update form with clean state
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      // reload to refresh UI names/avatars
      window.location.reload();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Error al actualizar perfil';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    const updateData: UpdateProfileDto = {
      fullName: formData.fullName,
      email: formData.email,
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    mutation.mutate(updateData);
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Ajustes de Perfil</h2>
        <p className="text-muted">Gestiona tu información personal y credenciales de acceso.</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* LEFT: FORM */}
        <div className="card glass" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nombre Completo</label>
              <input 
                type="text" 
                className="input" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Correo Electrónico</label>
              <input 
                type="email" 
                className="input" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />

            <div style={{ marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Cambiar Contraseña</h4>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Deja en blanco para mantener la contraseña actual.</p>
            </div>

            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nueva Contraseña</label>
              <input 
                type="password" 
                className="input" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Confirmar Contraseña</label>
              <input 
                type="password" 
                className="input" 
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ marginTop: '1rem' }}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Guardando cambios...' : 'Actualizar Perfil'}
            </button>
          </form>
        </div>

        {/* RIGHT: PREVIEW / STATS */}
        <div className="flex flex-col gap-6">
          <div className="card glass flex flex-col items-center text-center" style={{ padding: '3rem 2rem' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '30px', 
              background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
              color: 'white', 
              display: 'grid', 
              placeItems: 'center', 
              fontSize: '3rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)'
            }}>
              {formData.fullName[0]?.toUpperCase() || '?'}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{formData.fullName || 'Usuario'}</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem', fontWeight: 600 }}>
              {activeOrganization?.role ? OrganizationRoleLabels[activeOrganization.role as OrganizationRole] : (savedUser.role === UserRole.ADMIN || savedUser.role === UserRole.SUPER_ADMIN ? 'Administrador' : 'Usuario')}
            </p>
            
            <div className="badge badge-primary-light" style={{ fontSize: '0.75rem' }}>
              Miembro desde {new Date(savedUser.createdAt).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div className="card glass">
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Seguridad de la cuenta</h4>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Autenticación</span>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Activa</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Sesión actual</span>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Chile</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
