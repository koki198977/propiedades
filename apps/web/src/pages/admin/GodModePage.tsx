import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/api/axios';
import { OrganizationDto, UserProfileDto } from '@propiedades/types';
import toast from 'react-hot-toast';

export default function GodModePage() {
  const queryClient = useQueryClient();
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');

  // Queries
  const { data: organizations, isLoading: isLoadingOrgs } = useQuery<OrganizationDto[]>({
    queryKey: ['admin-organizations'],
    queryFn: async () => (await api.get('/admin/organizations')).data,
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<UserProfileDto[]>({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/admin/users')).data,
  });

  // Mutations
  const createOrgMutation = useMutation({
    mutationFn: async (name: string) => (await api.post('/admin/organizations', { name })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      toast.success('Organización creada');
      setNewOrgName('');
      setIsCreatingOrg(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al crear'),
  });

  const assignAdminMutation = useMutation({
    mutationFn: async ({ orgId, userId }: { orgId: string, userId: string }) => 
      (await api.post(`/admin/organizations/${orgId}/assign-admin`, { userId })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      toast.success('Administrador asignado correctamente');
      setSelectedOrgId(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al asignar'),
  });

  const filteredUsers = users?.filter(u => 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (isLoadingOrgs || isLoadingUsers) return <div className="container p-8">Cargando base de datos maestra...</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Master Control Panel</h1>
        <p className="text-muted">Gestión global de corredoras y usuarios (Modo Dios)</p>
      </header>

      <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '3rem', alignItems: 'start' }}>
        {/* Organizations List */}
        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
            <h3 className="font-heading" style={{ fontSize: '1.5rem' }}>Corredoras Registradas</h3>
            <button onClick={() => setIsCreatingOrg(!isCreatingOrg)} className="btn btn-primary">
              {isCreatingOrg ? 'Cancelar' : '+ Nueva Corredora'}
            </button>
          </div>

          {isCreatingOrg && (
            <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 700 }}>Crear Organización Administrativa</h4>
              <div className="flex gap-2">
                <input 
                  value={newOrgName} 
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Nombre de la Corredora" 
                  className="input" 
                />
                <button 
                  onClick={() => createOrgMutation.mutate(newOrgName)} 
                  disabled={createOrgMutation.isPending || !newOrgName}
                  className="btn btn-primary"
                >
                  {createOrgMutation.isPending ? '...' : 'Crear'}
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {organizations?.map((org) => (
              <div key={org.id} style={{ 
                padding: '1.25rem', 
                backgroundColor: 'white', 
                borderRadius: '0.75rem', 
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{org.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>ID: {org.id} | Slug: {org.slug}</div>
                </div>
                <button 
                  onClick={() => setSelectedOrgId(org.id)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                >
                  👤 Asignar Admin
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* User Assignment / Search */}
        <div className="card">
          <h3 className="font-heading" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
            {selectedOrgId ? 'Seleccionar Administrador' : 'Usuarios del Sistema'}
          </h3>
          
          <input 
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Buscar por nombre o email..." 
            className="input" 
            style={{ marginBottom: '1.5rem' }}
          />

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredUsers?.map((u) => (
              <div key={u.id} style={{ 
                padding: '1rem', 
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.fullName}</div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>{u.email}</div>
                  {u.role === 'SUPER_ADMIN' && <span className="badge badge-success" style={{ fontSize: '0.5rem' }}>GOD</span>}
                </div>
                {selectedOrgId && (
                  <button 
                    onClick={() => assignAdminMutation.mutate({ orgId: selectedOrgId, userId: u.id })}
                    disabled={assignAdminMutation.isPending}
                    className="btn btn-primary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}
                  >
                    Vincular
                  </button>
                )}
              </div>
            ))}
          </div>

          {selectedOrgId && (
            <button 
              onClick={() => setSelectedOrgId(null)}
              className="btn btn-outline" 
              style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.875rem' }}
            >
              Cancelar Asignación
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
