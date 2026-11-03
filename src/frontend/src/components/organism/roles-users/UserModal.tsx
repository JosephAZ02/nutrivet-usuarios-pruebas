
import type { RoleResponse } from "../../../services/RoleService";
import Button from "../../atoms/Button";


interface Props {
    show: boolean;
    onClose: () => void;
    isEditing: boolean;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    saving: boolean;
    message: { type: string; text: string };
    roles: RoleResponse[];
}

export default function UserModal({
    show, onClose, isEditing, formData, setFormData, onSubmit, saving, message, roles
}: Props) {
    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{isEditing ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={onSubmit}>
                        <div className="modal-body">
                            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

                            <div className="mb-3">
                                <label className="form-label-bold">Nombre Completo</label>
                                <input type="text" className="form-control" required
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label-bold">Username</label>
                                <input type="text" className="form-control" required
                                    value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label-bold">
                                    {isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                                </label>
                                <input type="password" className="form-control" required={!isEditing}
                                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                {isEditing && <small className="text-muted">Déjala en blanco si no deseas cambiarla.</small>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label-bold">Correo Electrónico</label>
                                <input type="email" className="form-control" required
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label-bold">Rol</label>
                                <select className="form-select" required
                                    value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}>
                                    <option value="">Seleccione un rol</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="btn btn-success" disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}