import type { ProductForm } from "../../../interfaces/ProductPayload";
import type Product from "../../../interfaces/Product";
import type ProductCategory from "../../../interfaces/ProductCategory";
import type { Dispatch, SetStateAction } from "react";

interface ProductModalProps {
    editingProduct: Product | null;
    productForm: ProductForm;
    setProductForm: Dispatch<SetStateAction<ProductForm>>;
    setProductImage: Dispatch<SetStateAction<File | null>>;
    categories: ProductCategory[];
    savingProduct: boolean;
    onClose: () => void;
    onCancel: () => void;
    onSave: () => void;
}

function ProductModal({ editingProduct, productForm, setProductForm, setProductImage, categories, savingProduct, onClose, onCancel, onSave }: ProductModalProps) {
    return (
        <div
            className="modal d-block"
            tabIndex={-1}
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow">
                    {/* encabezado */}
                    <div className="modal-header">
                        <h5 className="modal-title fw-bold">
                            {editingProduct ? "Editar producto" : "Agregar producto"}
                        </h5>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    {/* form */}
                    <div className="modal-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label text-dark">Código</label>
                                <input
                                    type="text"
                                    style={{ borderColor: '#000' }}
                                    className="form-control"
                                    placeholder="Código del producto"
                                    value={productForm.code}
                                    onChange={(e) => setProductForm({
                                        ...productForm,
                                        code: e.target.value
                                    })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-dark">Nombre</label>
                                <input
                                    type="text"
                                    style={{ borderColor: '#000' }}
                                    className="form-control"
                                    placeholder="Nombre del producto"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({
                                        ...productForm,
                                        name: e.target.value
                                    })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-dark">Categoría</label>
                                <select
                                    className="form-select"
                                    style={{ borderColor: '#000' }}
                                    value={productForm.category.id}
                                    onChange={(e) => setProductForm({
                                        ...productForm,
                                        category: { id: Number(e.target.value) }
                                    })}
                                >
                                    <option value={0}>Seleccionar categoría</option>

                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {!editingProduct && (
                                <div className="col-md-6">
                                    <label className="form-label text-dark">Existencias iniciales</label>
                                    <input
                                        type="number"
                                        style={{ borderColor: '#000' }}
                                        min="0"
                                        className="form-control"
                                        value={productForm.productAmount}
                                        onChange={(e) => setProductForm({
                                            ...productForm,
                                            productAmount: e.target.value === "" ? "" : Number(e.target.value)
                                        })}
                                    />
                                </div>
                            )}
                            <div className="col-md-4">
                                <label className="form-label text-dark">Costo del producto (₡)</label>
                                <input
                                    type="number"
                                    style={{ borderColor: '#000' }}
                                    min="0"
                                    step="0.01"
                                    className="form-control"
                                    value={productForm.productCost}
                                    onChange={(e) => setProductForm({
                                        ...productForm,
                                        productCost: e.target.value === "" ? "" : Number(e.target.value)
                                    })}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-dark">Costo de transporte (₡)</label>
                                <input
                                    type="number"
                                    min="0"
                                    style={{ borderColor: '#000' }}
                                    step="0.01"
                                    className="form-control"
                                    value={productForm.transportCost}
                                    onChange={(e) => setProductForm({
                                        ...productForm,
                                        transportCost: e.target.value === "" ? "" : Number(e.target.value)
                                    })}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-dark">Precio de venta (₡)</label>
                                <input
                                    type="number"
                                    min="0"
                                    style={{ borderColor: '#000' }}
                                    step="0.01"
                                    className="form-control"
                                    value={productForm.unitPrice}
                                    onChange={(e) => setProductForm({
                                        ...productForm,
                                        unitPrice: e.target.value === "" ? "" : Number(e.target.value)
                                    })}
                                />
                            </div>
                            <div className="col-md-6">
                                <div className="form-check mt-2">
                                    <input
                                        type="checkbox"
                                        style={{ borderColor: '#000' }}
                                        className="form-check-input "
                                        id="bulkSale"
                                        checked={productForm.bulkSale}
                                        onChange={(e) => setProductForm({
                                            ...productForm,
                                            bulkSale: e.target.checked
                                        })}
                                    />
                                    <label className="form-check-label text-dark" htmlFor="bulkSale">
                                        Permitir venta a granel
                                    </label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-dark">Fotografía (opcional)</label>
                                <input
                                    type="file"
                                    style={{ borderColor: '#000' }}
                                    className="form-control"
                                    accept="image/png, image/jpeg"
                                    onChange={(e) => setProductImage(e.target.files?.[0] ?? null)}
                                />
                            </div>

                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onCancel}
                            disabled={savingProduct}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn btn-success px-4"
                            onClick={onSave}
                            disabled={savingProduct || categories.length === 0}
                        >
                            {savingProduct ? "Guardando..." : editingProduct ? "Guardar cambios" : "Guardar producto"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductModal;