import type { UserResponse } from "../../../services/UserService";


interface Props {
    users: UserResponse[];
    getRoleName: (id: number) => string;
    onEdit: (user: UserResponse) => void;
    onDelete: (user: UserResponse) => void;
}

export default function UsersTable({ users, getRoleName, onEdit, onDelete }: Props) {
    return (
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
                                
                                <button className="btn btn-sm btn-outline-danger me-2" onClick={() => onDelete(user)}>
                                    Eliminar
                                </button>
                                <button className="btn btn-sm btn-outline-warning" onClick={() => onEdit(user)}>
                                    Editar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}