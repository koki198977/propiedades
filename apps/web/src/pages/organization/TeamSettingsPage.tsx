import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '../../providers/OrganizationProvider';
import { OrganizationRole, OrganizationMemberDto } from '@propiedades/types';
import toast from 'react-hot-toast';
import api from '@/api/axios';

export default function TeamSettingsPage() {
  const { activeOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrganizationRole>(OrganizationRole.VIEWER);

  const { data: members, isLoading, error } = useQuery<OrganizationMemberDto[]>({
    queryKey: ['members', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization) return [];
      const resp = await api.get(`/organizations/${activeOrganization.id}/members`);
      return resp.data;
    },
    enabled: !!activeOrganization,
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: OrganizationRole }) => {
      const resp = await api.post(`/organizations/${activeOrganization?.id}/members`, data);
      return resp.data;
    },
    onSuccess: () => {
      toast.success('Invitación enviada con éxito');
      queryClient.invalidateQueries({ queryKey: ['members', activeOrganization?.id] });
      setEmail('');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Error al invitar usuario';
      toast.error(msg);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/organizations/${activeOrganization?.id}/members/${userId}`);
    },
    onSuccess: () => {
      toast.success('Acceso revocado');
      queryClient.invalidateQueries({ queryKey: ['members', activeOrganization?.id] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Error al remover acceso';
      toast.error(msg);
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    inviteMutation.mutate({ email, role });
  };

  if (isLoading) {
    return <div className="container animate-fade-in"><p>Cargando información del equipo...</p></div>;
  }

  if (!activeOrganization) {
    return (
      <div className="container animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div className="card glass" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 className="font-heading" style={{ fontSize: '2rem', marginBottom: '1rem' }}>No tienes espacios de trabajo</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>
            Para gestionar un equipo, primero debes crear o unirte a un espacio de trabajo.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/dashboard'} // Temporary redirect to dashboard where creation should be handled
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '1.5rem 0' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h2 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Ajustes de Equipo</h2>
        <p className="text-muted">Gestiona el acceso y roles de colaboradores a: <strong>{activeOrganization.name}</strong></p>
      </div>

      <div className="grid team-settings-grid" style={{ gap: '2rem' }}>
        {/* MEMBERS LIST */}
        <div className="card members-card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Miembros Actuales</h3>
          
          {isLoading ? (
            <p className="text-muted">Cargando miembros...</p>
          ) : error ? (
            <p className="text-danger">Error al cargar listado.</p>
          ) : members?.length === 0 ? (
            <p className="text-muted">No hay miembros en esta organización.</p>
          ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: 'var(--bg-surface)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <tr>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Nombre</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Rol</th>
                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {members?.map(m => (
                    <tr key={m.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{m.user?.fullName || '-'}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{m.user?.email || '-'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${m.role === 'ADMIN' ? 'badge-primary' : 'badge-outline'}`} style={{ fontSize: '0.75rem' }}>
                          {m.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de revocar el acceso a este usuario?')) {
                              removeMutation.mutate(m.userId);
                            }
                          }}
                          disabled={removeMutation.isPending}
                        >
                          Revocar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* INVITE FORM */}
        <div className="card glass">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Invitar Colaborador</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            El usuario debe estar registrado previamente en la plataforma para poder ser agregado a este espacio.
          </p>
          <form onSubmit={handleInvite} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Registrado</label>
              <input 
                type="email" 
                className="input" 
                placeholder="colaborador@correo.com" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rol de Acceso</label>
              <select className="input" value={role} onChange={e => setRole(e.target.value as OrganizationRole)}>
                <option value={OrganizationRole.VIEWER}>VIEWER (Solo Lectura)</option>
                <option value={OrganizationRole.EDITOR}>EDITOR (Escritura Básica)</option>
                <option value={OrganizationRole.ADMIN}>ADMIN (Total)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? 'Enviando...' : 'Otorgar Acceso'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
