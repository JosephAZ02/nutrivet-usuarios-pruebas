//Para mostrar existencias 
interface BadgeProps {
    text: string; //texto que se muestra en la etiqueta
    variant?: "success" | "warning" | "danger" | "secondary"; //color de la etiqueta
}

function Badge({ text, variant = "secondary" }: BadgeProps) {
    return (
        <span className={`badge text-bg-${variant}`}>
            {text}
        </span>
    );
}

export default Badge;