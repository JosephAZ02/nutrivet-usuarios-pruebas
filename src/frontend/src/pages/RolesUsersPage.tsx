// src/pages/RolesUsersPage.tsx
import { useEffect, useState } from 'react';
import { UserService, type UserResponse } from '../services/UserService';
import { RoleService, type RoleResponse } from '../services/RoleService';
import { PermissionService, type PermissionResponse } from '../services/PermissionService';
import { RolePermissionService } from '../services/RolePermissionService';

import UsersTable from '../components/organism/roles-users/UsersTable';
import RolesTable from '../components/organism/roles-users/RolesTable';
import PermissionsModal from '../components/organism/roles-users/PermissionsModals';
import UserModal from '../components/organism/roles-users/UserModal';
import RoleModal from '../components/organism/roles-users/RolesModal';

export default function RolesUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [allPermissions, setAllPermissions] = useState<PermissionResponse[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [savingUser, setSavingUser] = useState(false);
  const [userMessage, setUserMessage] = useState({ type: '', text: '' });
  const [userFormData, setUserFormData] = useState({ username: '', password: '', name: '', roleId: 1 });

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const [roleMessage, setRoleMessage] = useState({ type: '', text: '' });
  const [roleFormData, setRoleFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
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

  const getRoleName = (roleId: number) => roles.find(role => role.id === roleId)?.name || 'Sin rol';

  const handleManagePermissions = async (role: RoleResponse) => {
    setSelectedRole(role);
    setMessage({ type: '', text: '' });
    try {
      const currentPermissions = await RolePermissionService.getByRole(role.id);
      setRolePermissions(currentPermissions);
      setShowModal(true);
    } catch (err) { console.error(err); }
  };

  const handleTogglePermission = (permissionId: number) => {
    setRolePermissions(current => current.includes(permissionId) ? current.filter(id => id !== permissionId) : [...current, permissionId]);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await RolePermissionService.update(selectedRole.id, rolePermissions);
      setMessage({ type: 'success', text: 'Permisos actualizados' });
      setTimeout(() => setShowModal(false), 1500);
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al guardar' });
    } finally { setSaving(false); }
  };

  const handleOpenCreateRoleModal = () => {
    setIsEditingRole(false);
    setEditingRoleId(null);
    setRoleFormData({ name: '', description: '' });
    setRoleMessage({ type: '', text: '' });
    setShowRoleModal(true);
  };

  const handleOpenEditRoleModal = (role: RoleResponse) => {
    setIsEditingRole(true);
    setEditingRoleId(role.id);
    setRoleFormData({ name: role.name, description: role.description });
    setRoleMessage({ type: '', text: '' });
    setShowRoleModal(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRole(true);
    try {
      if (isEditingRole && editingRoleId) {
        await RoleService.update(editingRoleId, roleFormData);
      } else {
        await RoleService.create(roleFormData);
      }
      setRoleMessage({ type: 'success', text: 'Guardado exitosamente' });
      fetchData();
      setTimeout(() => setShowRoleModal(false), 1500);
    } catch (err: any) {
      setRoleMessage({ type: 'danger', text: err.response?.data || 'Error al guardar' });
    } finally { setSavingRole(false); }
  };


  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setUserFormData({ username: '', password: '', name: '', roleId: roles[0]?.id || 1 });
    setUserMessage({ type: '', text: '' });
    setShowUserModal(true);
  };

  const handleOpenEditModal = (user: UserResponse) => {
    setIsEditing(true);
    setEditingUserId(user.id);
    setUserFormData({ username: user.username, password: '', name: user.name, roleId: user.idRole });
    setUserMessage({ type: '', text: '' });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      if (isEditing && editingUserId) {
        await UserService.update(editingUserId, userFormData);
      } else {
        await UserService.create(userFormData);
      }
      setUserMessage({ type: 'success', text: 'Guardado exitosamente' });
      fetchData();
      setTimeout(() => setShowUserModal(false), 1500);
    } catch (err: any) {
      setUserMessage({ type: 'danger', text: err.response?.data || 'Error al guardar' });
    } finally { setSavingUser(false); }
  };

  const handleDeleteUser = async (user: UserResponse) => {
    if (!window.confirm(`¿Está seguro de eliminar al usuario ${user.name}?`)) return;

    try {
      await UserService.delete(user.id);
      setUserMessage({ type: 'success', text: 'Usuario eliminado exitosamente' });
      fetchData();
    } catch (err: any) {
      setUserMessage({ type: 'danger', text: err.response?.data || 'Error al eliminar usuario' });
    }
  };

  if (loading) return <div className="container mt-5"><div className="spinner-border text-success" /></div>;

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">Gestión de Accesos</h2>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Roles y Permisos</h5>
          <button className="btn btn-success btn-sm" onClick={handleOpenCreateRoleModal}>
            Crear Rol
          </button>
        </div>
        <RolesTable
          roles={roles}
          onManagePermissions={handleManagePermissions}
          onEditRole={handleOpenEditRoleModal}
        />
      </div>

      <hr className="my-4" />

      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Usuarios del Sistema</h5>
          <button className="btn btn-success btn-sm" onClick={handleOpenCreateModal}>
            Crear Usuario
          </button>
        </div>
        <UsersTable users={users} getRoleName={getRoleName} onEdit={handleOpenEditModal} onDelete={handleDeleteUser} />
      </div>


      <PermissionsModal
        show={showModal} onClose={() => setShowModal(false)} selectedRole={selectedRole}
        allPermissions={allPermissions} rolePermissions={rolePermissions}
        onTogglePermission={handleTogglePermission} onSave={handleSavePermissions}
        saving={saving} message={message}
      />

      <UserModal
        show={showUserModal} onClose={() => setShowUserModal(false)} isEditing={isEditing}
        formData={userFormData} setFormData={setUserFormData} onSubmit={handleSaveUser}
        saving={savingUser} message={userMessage} roles={roles}
      />

      <RoleModal
        show={showRoleModal} onClose={() => setShowRoleModal(false)} isEditing={isEditingRole}
        formData={roleFormData} setFormData={setRoleFormData} onSubmit={handleSaveRole}
        saving={savingRole} message={roleMessage}
      />
    </div>
  );
}