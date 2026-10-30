import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "success" | "outline";
}

function Button({ children, variant = "primary", className, ...props }: ButtonProps) {
    const bootstrapVariant = variant === "outline" ? "outline-secondary" : variant;

    return (
        <button
            {...props}
            className={`btn btn-${bootstrapVariant} px-4 py-2 fw-semibold rounded-3 ${variant === "success" ? "shadow-sm" : ""} ${className ?? ""}`}
        >
            {children}
        </button>
    );
}

export default Button;
