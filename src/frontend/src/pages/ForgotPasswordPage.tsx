import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { showError } from '../utils/alerts';
import { showSuccess } from '../utils/alerts';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await AuthService.forgotPassword(email);
            setMessage({ type: 'success', text: 'Si el correo está registrado, recibirás un código. Revisa la consola del servidor (Backend).' });
            setStep(2);
        } catch (err: any) {
            setMessage({ type: 'danger', text: 'Error al procesar la solicitud.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            if (newPassword !== confirmPassword) {
                showError({ type: 'danger', text: 'Las contraseñas no coinciden.' }, 'Las contraseñas deben coincidir.');
                return;
            }
            await AuthService.resetPassword(token, newPassword);
            showSuccess('Éxito', 'Contraseña cambiada correctamente. Redirigiendo al login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            showError({ type: 'danger', text: err.response?.data || 'Código inválido o expirado.' }, 'Error al restablecer la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-sm p-4" style={{ width: '100%', maxWidth: '400px' }}>
                <h4 className="text-center mb-4">Recuperar Contraseña</h4>

                {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

                {step === 1 ? (
                    <form onSubmit={handleRequestCode}>
                        <div className="mb-3">
                            <label className="form-label-bold">Correo Electrónico</label>
                            <input type="email" className="form-control" required
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="Ingresa tu correo registrado"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar Código'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="mb-3">
                            <label className="form-label-bold">Código de Recuperación</label>
                            <input type="text" className="form-control" required
                                value={token} onChange={(e) => setToken(e.target.value)}
                                placeholder="Pega el código de la consola"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label-bold">Nueva Contraseña</label>
                            <input type="password" className="form-control" required
                                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label-bold">Confirmar Contraseña</label>
                            <input type="password" className="form-control" required
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-success w-100" disabled={loading}>
                            {loading ? 'Guardando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>
                )}

                <div className="text-center mt-3">
                    <Link to="/login" className="btn btn-outline-danger">Cancelar</Link>
                </div>
            </div>
        </div>
    );
}