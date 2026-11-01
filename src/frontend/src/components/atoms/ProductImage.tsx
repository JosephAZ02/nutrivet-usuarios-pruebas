import { useState } from "react";

const IMAGE_URL = "http://localhost:8080/uploads/"; //ruta donde el backend sirve las fotos

interface ProductImageProps {
    photo: string | null; //ruta de la foto guardada en el producto (ej: products/abc.png)
    alt: string; //texto alternativo de la imagen
    className?: string; //clases para darle el tamaño desde donde se use
}

function ProductImage({ photo, alt, className }: ProductImageProps) {
    const [failed, setFailed] = useState(false); //true si la foto no se pudo cargar

    if (!photo || failed) {
        return (
            <div className={`d-flex align-items-center justify-content-center bg-light text-secondary ${className ?? ""}`}>
                <i className="bi bi-image fs-3" aria-hidden="true"></i>
            </div>
        );
    }

    return (
        <img src={IMAGE_URL + photo} alt={alt} onError={() => setFailed(true)} className={`object-fit-cover ${className ?? ""}`} />
    );
}

export default ProductImage;