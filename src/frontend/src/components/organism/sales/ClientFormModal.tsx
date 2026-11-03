import { useState } from "react";
import type Client from "../../../interfaces/Client";
import Button from "../../atoms/Button";
import Input from "../../atoms/Input";
import Label from "../../atoms/Label";

interface ClientFormModalProps {
    client?: Client; 
    saving: boolean; 
    onSave: (client: Client) => void; 
    onClose: () => void; 
}

function ClientFormModal({ client, saving, onSave, onClose }: ClientFormModalProps) {
    const isEditing = client !== undefined;

    const [id, setId] = useState(client?.id ?? "");
    const [name, setName] = useState(client?.name ?? "");
    const [phone, setPhone] = useState(client?.phone ?? "");
    const [email, setEmail] = useState(client?.email ?? "");

    // el botón se activa cuando están los datos obligatorios
    const canSave = id.trim() !== "" && name.trim() !== "" && phone.trim() !== "";

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSave({
            id: id.trim(),
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() === "" ? null : email.trim(),
        });
    }

    return (
        <div className="modal d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title">{isEditing ? "Editar cliente" : "Nuevo cliente"}</h5>
                        <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <Label text="Cédula" />
                                {isEditing ? (
                                    <input type="text" className="form-control" value={id} disabled />
                                ) : (
                                    <Input
                                        placeholder="Solo números, sin guiones"
                                        value={id}
                                        onChange={(e) => setId(e.target.value.replace(/\D/g, "").slice(0, 12))}
                                        autoFocus
                                    />
                                )}
                            </div>
                            <div className="mb-3">
                                <Label text="Nombre completo" />
                                <Input placeholder="Nombre del cliente" value={name} onChange={(e) => setName(e.target.value)} autoFocus={isEditing} />
                            </div>
                            <div className="mb-3">
                                <Label text="Teléfono" />
                                <Input placeholder="8888-8888" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                            <div>
                                <Label text="Correo (opcional)" />
                                <Input type="email" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="success" disabled={!canSave || saving}>
                                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Guardar cliente"}
                            </Button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}

export default ClientFormModal;