import type ProductCategory from "../../interfaces/ProductCategory";

interface CategoryFilterProps {
    categories: ProductCategory[]; 
    selectedId: number | null; 
    onSelect: (id: number | null) => void;
}

function CategoryFilter({ categories, selectedId, onSelect }: CategoryFilterProps) {
    return (
        <div className="d-flex flex-wrap gap-2">
            <button type="button" className={chipClass(selectedId === null)} onClick={() => onSelect(null)}>
                Todos
            </button>

            {categories.map((category) => (
                <button key={category.id} type="button" className={chipClass(selectedId === category.id)} onClick={() => onSelect(category.id)}>
                    {category.name}
                </button>
            ))}
        </div>
    );
}

// relleno si el chip está seleccionado, solo borde si no
function chipClass(selected: boolean) {
    return `btn btn-sm rounded-pill ${selected ? "btn-success" : "btn-outline-secondary"}`;
}

export default CategoryFilter;