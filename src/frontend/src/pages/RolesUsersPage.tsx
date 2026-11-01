
import { useEffect, useState } from 'react';
import { UserService, type UserResponse } from '../services/UserService';
import { RoleService, type RoleResponse } from '../services/RoleService';
import { PermissionService, type PermissionResponse } from '../services/PermissionService';
import { RolePermissionService } from '../services/RolePermissionService';

export default function RolesUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);
  const [allPermissions, setAllPermissions] = useState<PermissionResponse[]>([]);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, rolesData, permissionsData] = await Promise.all([
          UserService.getAll(),
          RoleService.getAll(),
          PermissionService.getAll()
        ]);
        setUsers(usersData);
        setRoles(rolesData);
        setAllPermissions(permissionsData);
      } catch (err) {
        console.error("Error cargando datos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRoleName = (roleId: number) =>
    roles.find(role => role.id === roleId)?.name || 'Sin rol';

  const handleManagePermissions = async (role: RoleResponse) => {
    setSelectedRole(role);
    setMessage({ type: '', text: '' });
    try {
      const currentPermissions = await RolePermissionService.getByRole(role.id);
      setRolePermissions(currentPermissions);
      setShowModal(true);
    } catch (err) {
      console.error("Error al cargar permisos del rol", err);
    }
  };

  const handleTogglePermission = (permissionId: number) => {
    setRolePermissions(current =>
      current.includes(permissionId)
        ? current.filter(id => id !== permissionId)
        : [...current, permissionId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await RolePermissionService.update(selectedRole.id, rolePermissions);
      setMessage({ type: 'success', text: 'Permisos actualizados correctamente' });
      setTimeout(() => setShowModal(false), 1500);
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al guardar los permisos' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container mt-5"><div className="spinner-border text-success" /></div>;

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">Gestión de Accesos</h2>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Roles y Permisos</h5>
          <button className="btn btn-success btn-sm">+ Nuevo Rol</button>
        </div>

        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre del Rol</th>
                <th>Descripción</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.id}>
                  <td><strong>{role.name}</strong></td>
                  <td>{role.description}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleManagePermissions(role)}
                    >
                      Permisos
                    </button>
                    <button className="btn btn-sm btn-outline-secondary">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Usuarios del Sistema</h5>
          <button className="btn btn-success btn-sm">+ Nuevo Usuario</button>
        </div>

        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre Completo</th>
                <th>Username</th>
                <th>Rol</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.username}</td>
                  <td><span className="badge bg-secondary">{getRoleName(user.idRole)}</span></td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2">Editar</button>
                    <button className="btn btn-sm btn-outline-danger">Desactivar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedRole && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Permisos para el Rol: {selectedRole.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
                <div className="list-group">
                  {allPermissions.map(permission => (
                    <label key={permission.id} className="list-group-item d-flex gap-3 align-items-center" style={{ cursor: 'pointer' }}>
                      <input
                        className="form-check-input flex-shrink-0"
                        type="checkbox"
                        checked={rolePermissions.includes(permission.id)}
                        onChange={() => handleTogglePermission(permission.id)}
                      />
                      <div>
                        <strong>{permission.name}</strong>
                        <div className="text-muted small">{permission.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleSavePermissions} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
