import { useState } from "react";
import type Product from "../../../interfaces/Product";
import Select from "react-select";
import Swal from "sweetalert2";

interface InventoryMovementModalProps {
    products: Product[];
    show: boolean;
    saving: boolean;
    onClose: () => void;
    onSave: (movement: {
        type: string;
        amount: number;
        reason: string;
        product: { id: number };
        idInvoice: number | null;
    }) => Promise<boolean>;
}

export default function InventoryMovementModal({
    products,
    show,
    saving,
    onClose,
    onSave,
}: InventoryMovementModalProps) {
    const [productId, setProductId] = useState("");
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");

    // Limpiar los campos del formulario
    const resetForm = () => {
        setProductId("");
        setAmount("");
        setReason("");
    };

    // Registrar entrada
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar producto
        if (!productId) {
            Swal.fire({
                icon: "warning",
                title: "Producto requerido",
                text: "Debe seleccionar un producto para registrar la entrada.",
                confirmButtonColor: "#198754",
            });
            return;
        }

        // Validar que el producto seleccionado exista
        const selectedProduct = products.find(
            (product) => product.id === Number(productId)
        );

        if (!selectedProduct) {
            Swal.fire({
                icon: "warning",
                title: "Producto inválido",
                text: "El producto seleccionado no es válido. Seleccione uno de la lista.",
                confirmButtonColor: "#198754",
            });
            return;
        }

        // Validar cantidad
        if (!amount.trim() || Number(amount) <= 0 || !Number.isInteger(Number(amount))) {
            Swal.fire({
                icon: "warning",
                title: "Cantidad inválida",
                text: "La cantidad debe ser un número entero mayor que cero.",
                confirmButtonColor: "#198754",
            });
            return;
        }

        // Validar motivo
        if (!reason.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Motivo requerido",
                text: "Debe indicar el motivo de la entrada de inventario.",
                confirmButtonColor: "#198754",
            });
            return;
        }

        // Registrar movimiento
        const saved = await onSave({
            type: "ENTRADA",
            amount: Number(amount),
            reason: reason.trim(),
            product: { id: Number(productId) },
            idInvoice: null,
        });

        // Limpiar formulario únicamente si se guardó correctamente
        if (saved) {
            resetForm();
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!show) return null;

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            Registrar entrada de inventario
                        </h5>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleClose}
                            disabled={saving}
                        />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label text-dark">
                                    Producto
                                </label>

                                <Select
                                    options={products.map((product) => ({
                                        value: product.id,
                                        label: `${product.name} (${product.code})`,
                                    }))}
                                    value={
                                        products
                                            .filter(
                                                (product) =>
                                                    String(product.id) === productId
                                            )
                                            .map((product) => ({
                                                value: product.id,
                                                label: `${product.name} (${product.code})`,
                                            }))[0] || null
                                    }
                                    onChange={(selectedOption) => {
                                        setProductId(
                                            selectedOption
                                                ? String(selectedOption.value)
                                                : ""
                                        );
                                    }}
                                    placeholder="Buscar producto..."
                                    noOptionsMessage={() =>
                                        "No se encontraron productos"
                                    }
                                    isClearable
                                    isSearchable
                                    theme={(theme) => ({
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            primary: "#000",
                                            primary25: "#e5e5e5",
                                            primary50: "#d4d4d4",
                                            primary75: "#a3a3a3",
                                            neutral20: "#000",
                                            neutral30: "#333",
                                        },
                                    })}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-dark">
                                    Cantidad ingresada
                                </label>

                                <input
                                    type="number"
                                    style={{ borderColor: "#000" }}
                                    className="form-control"
                                    min="1"
                                    step="1"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Ingrese la cantidad"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-dark">
                                    Motivo de la entrada
                                </label>

                                <textarea
                                    style={{ borderColor: "#000" }}
                                    className="form-control"
                                    rows={3}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Ej. Compra a proveedor"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleClose}
                                disabled={saving}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="btn btn-success"
                                disabled={saving}
                            >
                                {saving ? "Registrando..." : "Registrar entrada"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}