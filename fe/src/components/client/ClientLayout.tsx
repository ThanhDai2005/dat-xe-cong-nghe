import { Outlet } from "react-router";
import Header from "./Header";
import Footer from "./Footer";

const ClientLayout = () => {
    return (
        <>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main>
                    <Outlet />
                </main>
                <Footer />
            </div>
        </>
    );
};

export default ClientLayout;