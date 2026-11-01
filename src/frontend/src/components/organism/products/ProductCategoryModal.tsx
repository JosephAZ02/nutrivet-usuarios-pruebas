import type { Dispatch, SetStateAction } from "react";

interface ProductCategoryModalProps {
    categoryName: string;
    setCategoryName: Dispatch<SetStateAction<string>>;
    savingCategory: boolean;
    onClose: () => void;
    onSave: () => void;
}

function ProductCategoryModal({categoryName,setCategoryName,savingCategory,onClose,onSave}: ProductCategoryModalProps) {
    return (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header">
                        <h5 className="modal-title">Agregar categoría</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>

                    <div className="modal-body">
                        <label className="form-label text-dark">Nombre de la categoría</label>
                        <input
                            type="text"
                            style={{ borderColor: '#000' }}
                            className="form-control"
                            placeholder="Ingrese el nombre de la categoría"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                        />
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                            disabled={savingCategory}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={onSave}
                            disabled={savingCategory}
                        >
                            {savingCategory ? "Guardando..." : "Guardar categoría"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductCategoryModal;