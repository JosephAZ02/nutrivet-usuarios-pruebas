
import type { PermissionResponse } from "../../../services/PermissionService";
import type { RoleResponse } from "../../../services/RoleService";
import Button from "../../atoms/Button";


interface Props {
    show: boolean;
    onClose: () => void;
    selectedRole: RoleResponse | null;
    allPermissions: PermissionResponse[];
    rolePermissions: number[];
    onTogglePermission: (id: number) => void;
    onSave: () => void;
    saving: boolean;
    message: { type: string; text: string };
}

export default function PermissionsModal({
    show, onClose, selectedRole, allPermissions, rolePermissions, onTogglePermission, onSave, saving, message
}: Props) {
    if (!show || !selectedRole) return null;

    return (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Permisos para el Rol: {selectedRole.name}</h5>
                        <Button type="button" className="btn-close" onClick={onClose} />
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
                                        onChange={() => onTogglePermission(permission.id)}
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
                        <Button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}