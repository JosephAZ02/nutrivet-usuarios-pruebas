
export default function ForgotPasswordPage() {

  return (
    <div className="container mt-5">
      <h1>Recuperar Contraseña</h1>
      <p>Ingresa tu correo electrónico para recuperar tu contraseña.</p>
        <div>
            <label>Usuario</label>
            <br></br>
            <input type="text" placeholder="Usuario" />
            <br></br>
            <label>Nueva contraseña</label>
            <br></br>
            <input type="password" placeholder="Nueva Contraseña"/>
            <br></br>
            <label>Clave de recuperación</label>
            <br></br>
            <input type="password" placeholder="Clave" />
        </div>
      <button className="btn btn-danger" onClick={() => window.location.href = '/login'}>
        Regresar
      </button>
    </div>
  );
}