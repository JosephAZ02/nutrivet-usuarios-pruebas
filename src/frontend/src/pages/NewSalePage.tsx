import Button from "../components/atoms/Button";
import { useAuth } from "../context/AuthContext";



export default function NewSalePage() {
  const { logout } = useAuth();

  return (
    <>

      <div className="container mt-5">
        <h1>Panel De Ventas</h1>
        
        <p>Desde aquí puedes registrar una nueva venta en el sistema.</p>


        <Button className="btn btn-outline-danger flex-grow-1" onClick={logout}>
          Cerrar Sesión
        </Button>
      </div>
    </>
  );
}