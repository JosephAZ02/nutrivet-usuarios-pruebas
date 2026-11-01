import "./Pagination.css";
interface PaginationProps {
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void; //se ejecuta al elegir otra página
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    // con una sola página no hace falta mostrar nada
    if (totalPages <= 1) {
        return null;
    }

    const pages = [];
    for (let page = 1; page <= totalPages; page++) {
        pages.push(page);
    }

    return (
        <nav aria-label="Páginas del catálogo">
            <ul className="pagination pagination-sm justify-content-center mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button type="button" className="page-link" onClick={() => onPageChange(currentPage - 1)}>
                        Anterior
                    </button>
                </li>

                {pages.map((page) => (
                    <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                        <button type="button" className="page-link" onClick={() => onPageChange(page)}>
                            {page}
                        </button>
                    </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button type="button" className="page-link" onClick={() => onPageChange(currentPage + 1)}>
                        Siguiente
                    </button>
                </li>
            </ul>
        </nav>
    );
}

export default Pagination;