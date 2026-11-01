interface QuantityStepperProps {
    quantity: number; 
    max: number; 
    onChange: (quantity: number) => void; //se ejecuta con la nueva cantidad
}

function QuantityStepper({ quantity, max, onChange }: QuantityStepperProps) {
    return (
        <div className="d-flex align-items-center gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onChange(quantity - 1)} aria-label="Quitar una unidad">
                <i className="bi bi-dash" aria-hidden="true"></i>
            </button>

            <span className="fw-semibold px-1">{quantity}</span>

            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onChange(quantity + 1)} disabled={quantity >= max} aria-label="Agregar una unidad">
                <i className="bi bi-plus" aria-hidden="true"></i>
            </button>
        </div>
    );
}

export default QuantityStepper;