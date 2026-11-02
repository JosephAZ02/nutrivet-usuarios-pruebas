import Input from "../atoms/Input";

interface ProductSearchBarProps {
    value: string;
    onChange: (text: string) => void; //se ejecuta al escribir
    onSubmit: () => void; //se ejecuta al presionar Enter (el lector de código lo envía solo)
}

function ProductSearchBar({ value, onChange, onSubmit }: ProductSearchBarProps) {

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); //evita que la página se recargue
        onSubmit();
    }

    return (
        <form onSubmit={handleSubmit} className="input-group">
            <span className="input-group-text bg-white">
                <i className="bi bi-search" aria-hidden="true"></i>
            </span>
            <Input autoFocus placeholder="Buscar por nombre o escanear código de barras..." value={value} onChange={(e) => onChange(e.target.value)} />
        </form>
    );
}

export default ProductSearchBar;