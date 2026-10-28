
export default function ForgotPasswordPage() {

  return (
    <div className="container mt-5">
      <h1>Recuperar Contraseña</h1>
      <p>Ingresa tu correo electrónico para recuperar tu contraseña.</p>
        <div>
            <input type="email" placeholder="Correo electrónico" />
        </div>
      <button className="btn btn-danger" onClick={() => window.location.href = '/login'}>
        Regresar
      </button>
    </div>
  );
}