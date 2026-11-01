import type { RoleResponse } from "../../../services/RoleService";


interface Props {
    roles: RoleResponse[];
    onManagePermissions: (role: RoleResponse) => void;
    onEditRole: (role: RoleResponse) => void; 
}

export default function RolesTable({ roles, onManagePermissions, onEditRole }: Props) {
    return (
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
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onManagePermissions(role)}>
                                    Permisos
                                </button>
                                <button className="btn btn-sm btn-outline-warning" onClick={() => onEditRole(role)}>
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