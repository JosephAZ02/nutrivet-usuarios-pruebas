import { Outlet, useNavigate } from "react-router-dom";
import "./SideBar.css";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";



function SideBar() {

    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState("");
    const { logout } = useAuth();
    
    return (
        <div className="d-flex flex-column flex-shrink-0  text-bg-dark align-items-left" id="sidebar">
            <a id="title" href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-4">NutriVet</span>
            </a>
            <hr />

            <ul className="nav nav-pills flex-column mb-auto sidebar-nav">
                <li>
                    <a className={activeItem === "resumen" ? "nav-link active" : "nav-link"} onClick={() => { navigate("dashboard"); setActiveItem("resumen"); }} >
                        <i className="bi bi-bar-chart me-2" aria-hidden="true"></i>
                        Resumen
                    </a>
                </li>
                <li>
                    <a className={activeItem === "nueva-venta" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/nueva-venta"); setActiveItem("nueva-venta"); }}>
                        <i className="bi bi-cart-plus me-2" aria-hidden="true"></i>
                        Nueva venta
                    </a>
                </li>
                <li>
                    <a className={activeItem === "productos" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/products"); setActiveItem("productos"); }} >
                        <i className="bi bi-box-seam me-2" aria-hidden="true"></i>
                        Productos
                    </a>
                </li>
                <li>
                    <a className={activeItem === "inventario" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/inventario"); setActiveItem("inventario"); }}>
                        <i className="bi bi-boxes me-2" aria-hidden="true"></i>
                        Inventario
                    </a>
                </li>
                <li>
                    <a className={activeItem === "reportes" ? "nav-link active" : "nav-link"} onClick={() => { navigate("/reports"); setActiveItem("reportes"); }} >
                        <i className="bi bi-file-earmark-bar-graph me-2" aria-hidden="true"></i>
                        Reportes
                    </a>
                </li>
            </ul>

            <hr />
            <div className="dropdown">
                <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="https://github.com/mdo.png" alt="" width="32" height="32" className="rounded-circle me-2" />
                    <strong>mdo</strong>
                </a>
                <ul className="dropdown-menu dropdown-menu-dark text-small shadow ">

                    <li><a className="dropdown-item" href="#" onClick={logout}>
                        Cerrar sesión
                    </a></li>
                </ul>
            </div>
        </div>
    );
}

export default SideBar;
