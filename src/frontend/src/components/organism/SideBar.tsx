import { useNavigate } from "react-router-dom";
import "./SideBar.css";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Button from "../atoms/Button";



function SideBar() {

    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState("");
    const { logout, hasPermission, user } = useAuth();

    return (
        <div className="d-flex flex-column flex-shrink-0  text-bg-dark align-items-center" id="sidebar">
            <img onClick={() => navigate("/")} src="/logonutrivet.png" alt="Logo NutriVet" style={{ width: '150px', height: '150px', objectFit: 'contain' }} className="me-2" />

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
                    {hasPermission("CLIENT_GET_ALL") && (
                        <Button className={activeItem === "clientes" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/clients"); setActiveItem("clientes"); }} >
                            <i className="bi bi-people me-2" aria-hidden="true"></i>
                            Clientes
                        </Button>
                    )}
                </li>
                <li>
                    <Button className={activeItem === "reportes" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/reports"); setActiveItem("reportes"); }} >
                        <i className="bi bi-file-earmark-bar-graph me-2" aria-hidden="true"></i>
                        Reportes
                    </Button>
                </li>
                <li>

                    <Button className={activeItem === "cuentas-por-pagar" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/accounts-payable"); setActiveItem("cuentas-por-pagar"); }} >
                        <i className="bi bi-wallet me-2" aria-hidden="true"></i>
                        Cuentas por pagar
                    </Button>

                </li>

                <li>
                    {hasPermission("RECEIVABLE_ACCOUNT_GET_ALL") && (
                        <Button className={activeItem === "cuentas-por-cobrar" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/accounts-receivable"); setActiveItem("cuentas-por-cobrar"); }} >
                            <i className="bi bi-credit-card me-2" aria-hidden="true"></i>
                            Cuentas por cobrar
                        </Button>
                    )}
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
            <div className="d-flex flex-column align-items-center mb-2">

                <span className="text-white fw-bold" style={{ fontSize: '0.9rem' }}>
                    {(user?.name || 'Usuario')}
                </span>

            </div>

            <div className="align-items-center text-center px-3 pb-3">
                <Button className="dropdown-item text-danger w-100 rounded" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-2"></i> Cerrar sesión
                </Button>
            </div>
        </div>

    );
}

export default SideBar;