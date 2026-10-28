import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
}

function Button({ children, variant = "primary", className, ...props }: ButtonProps) {
    return (
        <button {...props} className={`btn btn-${variant} ${className ?? ""}`}>
            {children}
        </button>
    );
}

export default Button;
