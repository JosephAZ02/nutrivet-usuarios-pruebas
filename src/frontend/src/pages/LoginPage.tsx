

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/atoms/Button';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ username, password });
            navigate('/dashboard');
        } catch {
            setError('Credenciales incorrectas. Verifica tu usuario y contraseña.');
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
                                width: '125px',
                                height: '125px',
                                objectFit: 'contain',
                                marginBottom: '20px'
                            }}
                        />

                        <h2 className="fw-bold mb-2">NutriVet</h2>

                        

                        <div className="d-flex align-items-center gap-2 small">
                            <i className="bi bi-heart-pulse"></i>
                            <span>Administración veterinaria</span>
                        </div>
                    </div>

                    <div className="col-md-7 p-4 p-lg-5">
                        <div className="mb-4">
                            <p className="text-success fw-semibold small mb-2">
                                BIENVENIDO
                            </p>
                            <h3 className="fw-bold mb-2" style={{ color: '#20352a' }}>
                                Iniciar sesión
                            </h3>
                            <p className="text-muted mb-0">
                                Ingresa tus credenciales para acceder al sistema.
                            </p>
                        </div>

                        {error && (
                            <div className="alert alert-danger py-2">
                                <i className="bi bi-exclamation-circle me-2"></i>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: '#20352a' }}>
                                    Usuario
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light">
                                        <i className="bi bi-person text-success"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ingresa tu usuario"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        autoComplete="username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: '#20352a' }}>
                                    Contraseña
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light">
                                        <i className="bi bi-lock text-success"></i>
                                    </span>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Ingresa tu contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="text-end mb-4">
                                <Link
                                    to="/forgot-password"
                                    className="text-success text-decoration-none small fw-semibold">
                                    Recuperar acceso al perfil
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="btn btn-success w-100 py-2 fw-semibold"
                                disabled={loading}>
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span> Ingresando...</>
                                ) : (<>Iniciar sesión</>
                                )}
                            </Button>
                        </form>

                        <div className="text-center mt-4">
                            <small className="text-muted">
                                NutriVet · Sistema de gestión veterinaria
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

