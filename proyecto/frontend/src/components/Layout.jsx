import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-fondo text-textoBase">
            {/* El menú lateral se queda fijo a la izquierda */}
            <Sidebar />
            
            {/* El contenido principal empuja el margen izquierdo para no quedar detrás del Sidebar */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;