

interface LabelProps {
    text: string; //texto que se muestra en el label

}

function Label({ text }: LabelProps) {
    return (
        <label className="form-label">
            {text}
        </label>
    );
}

export default Label;