
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";
import Button from "../components/atoms/Button";

export default function ForgotPasswordPage() {

    const [username, setUsername] = useState("");
    const [masterKey, setMasterKey] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMessage({ type: "", text: "" });
        setLoading(true);

        try {
            const responseMessage = await AuthService.recoverPassword({
                username,
                masterKey,
                newPassword
            });

            setMessage({ type: "success", text: responseMessage });

            setTimeout(() => navigate("/login"), 2000);

        } catch (err: any) {
            const errorMsg = err.response?.data ||
                "Error al intentar recuperar la contraseña";

            setMessage({ type: "danger", text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-sm p-4 w-100" style={{ maxWidth: "420px" }}>

                <h3 className="text-center mb-2">Cambiar contraseña</h3>
                <p className="text-muted text-center mb-4">
                    Ingresa tus datos para restablecer tu contraseña.
                </p>

                {message.text && (
                    <div className={`alert alert-${message.type} text-center py-2`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: 'bold', color: '#000000' }}>
                            Usuario
                        </label>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Ingresa tu usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: 'bold', color: '#000000' }}>
                            Nueva contraseña
                        </label>
                        <input
                            className="form-control"
                            type="password"
                            placeholder="Ingresa tu nueva contraseña"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label" style={{ fontWeight: 'bold', color: '#000000' }}>
                            Clave de recuperación
                        </label>
                        <input
                            className="form-control"
                            type="password"
                            placeholder="Ingresa la clave"
                            value={masterKey}
                            onChange={(e) => setMasterKey(e.target.value)}
                            required
                        />
                    </div>

                    <div className="d-flex gap-2">
                        <Button
                            type="submit"
                            className="btn btn-success flex-grow-1"
                            disabled={loading}
                        >
                            {loading ? "Procesando..." : "Cambiar contraseña"}
                        </Button>

                        <Button
                            type="button"
                            className="btn btn-outline-danger flex-grow-1"
                            onClick={() => navigate("/login")}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
