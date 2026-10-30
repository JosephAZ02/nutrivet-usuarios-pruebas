import { Outlet } from "react-router-dom";
import SideBar from "../organism/SideBar";

function AppLayout() {
    return (
        <>
            <SideBar />

            <main className="app-content">
                <Outlet />
            </main>
        </>
    );
}
export default AppLayout;