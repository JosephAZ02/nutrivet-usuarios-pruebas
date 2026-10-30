import Button from "../components/atoms/Button";
import { useAuth } from "../context/AuthContext";



export default function ProductsPage() {
  const { logout } = useAuth();

  return (
    <>

      <div className="container mt-5">
        <h1>Panel De Productos</h1>
        
        <p>Desde aquí puedes observar todos los productos registrados en el sistema.</p>


        <Button className="btn btn-outline-danger flex-grow-1" onClick={logout}>
          Cerrar Sesión
        </Button>
      </div>
    </>
  );
}