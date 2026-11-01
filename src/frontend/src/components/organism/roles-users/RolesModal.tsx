import Button from "../../atoms/Button";

interface Props {
    show: boolean;
    onClose: () => void;
    isEditing: boolean;
    formData: { name: string; description: string };
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    saving: boolean;
    message: { type: string; text: string };
}

export default function RoleModal({
    show, onClose, isEditing, formData, setFormData, onSubmit, saving, message
}: Props) {
    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={onSubmit}>
                        <div className="modal-body">
                            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

                            <div className="mb-3">
                                <label className="form-label-bold">Nombre del Rol</label>
                                <input type="text" className="form-control" required
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label-bold">Descripción</label>
                                <textarea className="form-control" rows={3} required
                                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</Button>
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