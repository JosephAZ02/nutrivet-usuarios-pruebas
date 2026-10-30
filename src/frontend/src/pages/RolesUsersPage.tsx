import Button from "../components/atoms/Button";
import { useAuth } from "../context/AuthContext";



export default function RolesUsersPage() {
  const { logout } = useAuth();

  return (
    <>

      <div className="container mt-5">
        <h1>Panel De Gestión de Usuarios y Roles</h1>
        
        <p>Desde aquí puedes gestionar los usuarios y roles del sistema.</p>


        <Button className="btn btn-outline-danger flex-grow-1" onClick={logout}>
          Cerrar Sesión
        </Button>
      </div>
    </>
  );
}