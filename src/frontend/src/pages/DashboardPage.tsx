// src/pages/DashboardPage.tsx

import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { logout } = useAuth();
  return (
    <>

      <div className="container mt-5">
        <h1>Panel Principal de NutriVet</h1>
        <p>¡Has ingresado exitosamente al sistema!</p>
        <p>Desde aquí puedes acceder a todas las funcionalidades del sistema.</p>

        <button style={{ marginLeft: "100px" }} className="btn btn-danger" onClick={logout}>
          Cerrar Sesión
        </button>
      </div>

    </>
  );
}