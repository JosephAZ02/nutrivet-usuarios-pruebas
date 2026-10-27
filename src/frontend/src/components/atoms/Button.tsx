
interface ButtonProps {
    children: React.ReactNode;//texto que se le pasa al boton
    variant?: "primary" | "secondary";//tipo de boton ( primary con color como verde de guardar y el secundario con color como rojo de eliminar)
    //se pueden agregar más variantes
    onClick?: () => void //evento que se ejecuta al hacer click 
}

function Button({ children, variant = "primary", onClick }: ButtonProps) {

    return <>

        <button onClick={onClick} className={`btn btn-${variant}`}>
            {children}
        </button>

    </>
}

export default Button;