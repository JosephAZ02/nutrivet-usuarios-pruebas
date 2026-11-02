import { useNavigate } from "react-router-dom";
import "./SideBar.css";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Button from "../atoms/Button";



function SideBar() {

    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState("");
    const { logout, hasPermission } = useAuth();

    return (
        <div className="d-flex flex-column flex-shrink-0  text-bg-dark align-items-left" id="sidebar">
            <a id="title" href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-4">NutriVet</span>
            </a>
            <hr />

            <ul className="nav nav-pills flex-column mb-auto sidebar-nav">
                <li>
                    <Button className={activeItem === "resumen" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/dashboard"); setActiveItem("resumen"); }} >
                        <i className="bi bi-bar-chart me-2" aria-hidden="true"></i>
                        Resumen
                    </Button>
                </li>
                <li>
                    <Button className={activeItem === "nueva-venta" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/new-sale"); setActiveItem("nueva-venta"); }}>
                        <i className="bi bi-cart-plus me-2" aria-hidden="true"></i>
                        Nueva venta
                    </Button>
                </li>
                <li>
                    <Button className={activeItem === "productos" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/products"); setActiveItem("productos"); }} >
                        <i className="bi bi-box-seam me-2" aria-hidden="true"></i>
                        Productos
                    </Button>
                </li>
                <li>
                    <Button className={activeItem === "inventario" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/inventory"); setActiveItem("inventario"); }}>
                        <i className="bi bi-boxes me-2" aria-hidden="true"></i>
                        Inventario
                    </Button>
                </li>
                <li>
                    <Button className={activeItem === "reportes" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/reports"); setActiveItem("reportes"); }} >
                        <i className="bi bi-file-earmark-bar-graph me-2" aria-hidden="true"></i>
                        Reportes
                    </Button>
                </li>
                <li>

                    <Button className={activeItem === "cuentas-por-pagar" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/accounts-payable"); setActiveItem("cuentas-por-pagar"); }} >
                        <i className="bi bi-person me-2" aria-hidden="true"></i>
                        Cuentas por pagar
                    </Button>

                </li>
                <li>
                    {hasPermission("USER_CREATE") && (
                        <Button className={activeItem === "roles-usuarios" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/roles-users"); setActiveItem("roles-usuarios"); }} >
                            <i className="bi bi-person me-2" aria-hidden="true"></i>
                            Roles y Usuarios
                        </Button>
                    )}
                </li>
            </ul>

            <hr />
            <div className="dropdown">
                <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="https://github.com/mdo.png" alt="" width="32" height="32" className="rounded-circle me-2" />
                    <strong>mdo</strong>
                </a>
                <ul className="dropdown-menu dropdown-menu-dark text-small shadow ">

                    <li><Button className="dropdown-item" onClick={logout}>
                        Cerrar sesión
                    </Button></li>
                </ul>
            </div>
        </div>
    );
}

export default SideBar;
