interface InputProps {
    type?: "text" | "password" | "email" | "date" | "number"; //tipo de input (text, password, email, number)
    placeholder?: string; //texto que se muestra cuando el input esta vacio
    value?: string; //valor del input
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; //evento que se ejecuta al cambiar el valor del input
    autoFocus?: boolean; //el cursor queda en el input al cargar la pantalla
}
function Input({ type = "text", placeholder, value, onChange, autoFocus }: InputProps) {

    return <>
        <input type={type} placeholder={placeholder} value={value} onChange={onChange} autoFocus={autoFocus} className="form-control" />
    </>
}

export default Input;