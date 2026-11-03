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
import { showConfirm, showError, showSuccess } from '../utils/alerts';

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
  const [userFormData, setUserFormData] = useState({ username: '', password: '', name: '', email: '', roleId: 1 });

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
    if (await showConfirm("Confirmación", `¿Está seguro de actualizar los permisos del rol ${selectedRole.name}?`, "Actualizar") === false) {
      setSaving(false);
      return;
    }
    try {
      await RolePermissionService.update(selectedRole.id, rolePermissions);
      showSuccess("Permisos actualizados", `Los permisos del rol ${selectedRole.name} han sido actualizados correctamente.`);
      setTimeout(() => setShowModal(false), 1);
    } catch (err) {
      showError(err, 'Error al actualizar permisos');
      setTimeout(() => setShowModal(false), 1);
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
        if (await showConfirm("Confirmación", `¿Está seguro de actualizar el rol ${roleFormData.name}?`, "Actualizar") === false) {
          setSavingRole(false);
          return;
        }
        await RoleService.update(editingRoleId, roleFormData);
        showSuccess("Rol actualizado", `El rol ${roleFormData.name} ha sido actualizado correctamente.`);
      } else {
        await RoleService.create(roleFormData);
        showSuccess("Rol guardado", `El rol ${roleFormData.name} ha sido guardado correctamente.`);
      }
      fetchData();
      setTimeout(() => setShowRoleModal(false), 1);
    } catch (err: any) {
      showError(err, 'Error al guardar el rol');
    } finally { setSavingRole(false); }
  };


  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setUserFormData({ username: '', password: '', name: '', email: '', roleId: roles[0]?.id || 1 });
    setUserMessage({ type: '', text: '' });
    setShowUserModal(true);
  };

  const handleOpenEditModal = (user: UserResponse) => {
    setIsEditing(true);
    setEditingUserId(user.id);
    setUserFormData({ username: user.username, password: '', name: user.name, email: user.email, roleId: user.idRole });
    setUserMessage({ type: '', text: '' });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      if (isEditing && editingUserId) {
        if (await showConfirm("Confirmación", `¿Está seguro de actualizar el usuario ${userFormData.username}?`, "Actualizar") === false) {
          setSavingUser(false);
          return;
        }
        await UserService.update(editingUserId, userFormData);
        showSuccess("Usuario actualizado", `El usuario ${userFormData.username} ha sido actualizado correctamente.`);
      } else {
        await UserService.create(userFormData);
        showSuccess("Usuario guardado", `El usuario ${userFormData.username} ha sido guardado correctamente.`);
      }
      fetchData();
      setTimeout(() => setShowUserModal(false), 1);
    } catch (err: any) {
      showError(err, 'Error al guardar el usuario');
    } finally { setSavingUser(false); }
  };

  const handleDeleteUser = async (user: UserResponse) => {

    if (await showConfirm("Confirmación", `¿Está seguro de eliminar al usuario ${user.name}?`, "Eliminar") === false) {
      return;
    }

    try {
      await UserService.delete(user.id);
      showSuccess("Usuario eliminado", `El usuario ${user.name} ha sido eliminado correctamente.`);
      fetchData();
    } catch (err: any) {
      showError(err, 'Error al eliminar el usuario');
    }
  };

  const handleDeleteRole = async (role: RoleResponse) => {
    if (await showConfirm("Confirmación", `¿Está seguro de eliminar el rol ${role.name}?`, "Eliminar") === false) {
      return;
    }

    try {
      await RoleService.delete(role.id);
      showSuccess("Rol eliminado", `El rol ${role.name} ha sido eliminado correctamente.`);
      fetchData();
    } catch (err: any) {
      showError(err, 'Error al eliminar el rol');
    }
  };


  if (loading) return <div className="container mt-5"><div className="spinner-border text-success" /></div>;

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">Gestión de Accesos</h2>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Roles y Permisos</h5>
          <button className="btn btn-outline-success btn-sm" onClick={handleOpenCreateRoleModal}>
            Crear Rol
          </button>
        </div>
        <RolesTable
          roles={roles}
          onManagePermissions={handleManagePermissions}
          onEditRole={handleOpenEditRoleModal}
          onDeleteRole={handleDeleteRole}
        />
      </div>

      <hr className="my-4" />

      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Usuarios del Sistema</h5>
          <button className="btn btn-outline-success btn-sm" onClick={handleOpenCreateModal}>
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