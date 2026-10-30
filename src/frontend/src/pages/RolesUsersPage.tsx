// src/pages/RolesUsersPage.tsx
import { useEffect, useState } from 'react';
import { UserService, type UserResponse } from '../services/UserService';

export default function RolesUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    
    const fetchUsers = async () => {
      try {
        const data = await UserService.getAll();
        setUsers(data);
      } catch (err) {
        setError('Error al cargar los usuarios. Verifica tus permisos.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Usuarios</h2>
        
        <button className="btn btn-success">Crear Usuario</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover mb-0">
            <thead className="table-success">
              <tr>
                
                <th>Nombre Completo</th>
                <th>Username</th>
                <th>ID Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                 
                  <td><span className="badge bg-secondary">{user.idRole}</span></td>
                  <td>
                    
                    <button className="btn btn-sm btn-outline-warning me-2">Editar</button>
                    <button className="btn btn-sm btn-outline-danger">Desactivar</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4">No hay usuarios registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}