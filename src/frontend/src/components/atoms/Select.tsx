
interface SelectProps {
    options: string[]; //opciones del select
    value?: string; //valor del select
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; //evento que se ejecuta al cambiar el valor del select
}

function Select({ options, value, onChange }: SelectProps) {
    return <>
        <select value={value} onChange={onChange} className="form-select">
            {options.map((option, index) => (
                <option key={index} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </>
}

export default Select;