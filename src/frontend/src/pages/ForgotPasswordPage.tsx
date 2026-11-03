

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { showError, showSuccess } from '../utils/alerts';

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
            setMessage({
                type: 'success',
                text: 'Si el correo está registrado, recibirás un código. Revisa tu bandeja de entrada.'
            });
            setStep(2);
        } catch {
            setMessage({ type: 'danger', text: 'Error al procesar la solicitud.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showError(
                { type: 'danger', text: 'Las contraseñas no coinciden.' },
                'Las contraseñas deben coincidir.'
            );
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await AuthService.resetPassword(token, newPassword);
            showSuccess('Éxito', 'Contraseña cambiada correctamente.');
            setTimeout(() => navigate('/login'), 1000);
        } catch (err: any) {
            showError(
                { type: 'danger', text: err.response?.data || 'Código inválido o expirado.' },
                'Error al restablecer la contraseña.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-vh-100 d-flex align-items-center justify-content-center p-3"
            style={{
                background: 'linear-gradient(135deg, #eaf5ee 0%, #f7faf8 55%, #dcefe3 100%)'
            }}
        >
            <div
                className="card border-0 shadow-lg overflow-hidden"
                style={{ width: '100%', maxWidth: '900px', borderRadius: '20px' }}
            >
                <div className="row g-0">

                    <div
                        className="col-md-5 d-flex flex-column justify-content-center align-items-center text-white text-center p-4 p-lg-5"
                        style={{
                            background: 'linear-gradient(160deg, #176b45, #104d34)'
                        }}
                    >
                        <img
                            src="/logonutrivet.png"
                            alt="Logo NutriVet"
                            style={{
                                width: '115px',
                                height: '115px',
                                objectFit: 'contain',
                                marginBottom: '20px'
                            }}
                        />

                        <h2 className="fw-bold mb-2">NutriVet</h2>
                        <p className="mb-4" style={{ color: '#d7eadf' }}>
                            Recupera el acceso a tu perfil de forma segura
                        </p>

                        <div className="d-flex align-items-center gap-2 small">
                            <i className="bi bi-shield-lock"></i>
                            <span>Reestablecer contraseña</span>
                        </div>
                    </div>

                    <div className="col-md-7 p-4 p-lg-5">
                        <div className="mb-4">
                            <p className="text-success fw-semibold small mb-2">
                                CAMBIO DE CONTRASEÑA
                            </p>

                            <h3 className="fw-bold mb-2" style={{ color: '#20352a' }}>
                                {step === 1 ? '¿Olvidaste tu contraseña?' : 'Crear nueva contraseña'}
                            </h3>

                            <p className="text-muted mb-0">
                                {step === 1
                                    ? 'Ingresa tu correo registrado y te enviaremos un código de recuperación.'
                                    : 'Introduce el código recibido y establece tu nueva contraseña.'}
                            </p>
                        </div>

                        <div className="d-flex align-items-center gap-2 mb-4">
                            <span
                                className={`rounded-circle d-flex align-items-center justify-content-center ${step === 1 ? 'bg-success text-white' : 'bg-success text-white'
                                    }`}
                                style={{ width: '30px', height: '30px' }}
                            >
                                1
                            </span>
                            <div className="flex-grow-1 bg-success" style={{ height: '2px' }}></div>
                            <span
                                className={`rounded-circle d-flex align-items-center justify-content-center ${step === 2 ? 'bg-success text-white' : 'bg-light text-muted'
                                    }`}
                                style={{ width: '30px', height: '30px' }}
                            >
                                2
                            </span>
                        </div>

                        {message.text && (
                            <div className={`alert alert-${message.type} py-2`}>
                                {message.text}
                            </div>
                        )}

                        {step === 1 ? (
                            <form onSubmit={handleRequestCode}>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold" style={{ color: '#20352a' }}>
                                        Correo electrónico
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light">
                                            <i className="bi bi-envelope text-success"></i>
                                        </span>
                                        <input
                                            type="email"
                                            className="form-control"
                                            required
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="correo@ejemplo.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success w-100 py-2 fw-semibold"
                                    disabled={loading}
                                >
                                    {loading ? 'Enviando...' : 'Enviar código'}
                                    {!loading && <i className="bi bi-arrow-right ms-2"></i>}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ color: '#20352a' }}>
                                        Código de recuperación
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light">
                                            <i className="bi bi-key text-success"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                            placeholder="Código recibido por correo"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ color: '#20352a' }}>
                                        Nueva contraseña
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light">
                                            <i className="bi bi-lock text-success"></i>
                                        </span>
                                        <input
                                            type="password"
                                            className="form-control"
                                            required
                                            autoComplete="new-password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Nueva contraseña"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold" style={{ color: '#20352a' }}>
                                        Confirmar contraseña
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light">
                                            <i className="bi bi-lock-fill text-success"></i>
                                        </span>
                                        <input
                                            type="password"
                                            className="form-control"
                                            required
                                            autoComplete="new-password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repite la contraseña"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success w-100 py-2 fw-semibold"
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : 'Cambiar contraseña'}
                                    {!loading}
                                </button>
                            </form>
                        )}

                        <div className="text-center mt-4">
                            <Link to="/login" className="btn btn-outline-danger btn-sm px-3 py-2 fw-semibold">
                                Volver 
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
