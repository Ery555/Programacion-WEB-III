import { useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Users, Building2, FileText, 
    ShieldCheck, AlertTriangle, LogOut, Activity 
} from 'lucide-react'; 
import clienteAxios from '../api/axios'; 
import logoEmpresa from '../assets/logo-previcor.png';
const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const rol = localStorage.getItem('rol');

    // Actualizamos la función para que notifique al backend
    const handleLogout = async () => {
        try {
            // Avisamos al backend para que registre la "Salida"
            await clienteAxios.post('/auth/logout');
        } catch (error) {
            console.error("Error al notificar salida al servidor:", error);
        } finally {
            // Destruimos credenciales y redirigimos siempre, aunque el servidor falle
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            navigate('/login');
        }
    };

    const isActive = (path) => location.pathname === path;

    const botonClase = (path) => `
        flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 font-medium
        ${isActive(path) 
            ? 'bg-primario text-white shadow-md' 
            : 'text-textoMuteado hover:bg-tarjeta hover:text-textoBase'}
    `;

    return (
        <aside className="w-64 h-screen bg-fondo border-r border-gray-800 flex flex-col fixed left-0 top-0">
            {/* Cabecera / Logo ampliado */}
            <div className="p-6 border-b border-gray-800 flex justify-center">
                <img 
                    src={logoEmpresa} 
                    alt="Logo de la Empresa" 
                    className="w-full h-16 object-contain bg-white rounded-lg shadow-sm" 
                />
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {rol === 'admin' && (
                    <button onClick={() => navigate('/dashboard')} className={botonClase('/dashboard')}>
                        <LayoutDashboard size={20} />
                        <span>Panel de Control</span>
                    </button>
                )}
                
                <button onClick={() => navigate('/clientes')} className={botonClase('/clientes')}>
                    <Building2 size={20} />
                    <span>Gestión de Clientes</span>
                </button>
                
                <button onClick={() => navigate('/contratos')} className={botonClase('/contratos')}>
                    <FileText size={20} />
                    <span>Contratos</span>
                </button>
                
                <button onClick={() => navigate('/aseguradoras')} className={botonClase('/aseguradoras')}>
                    <ShieldCheck size={20} />
                    <span>Aseguradoras</span>
                </button>
                
                <button onClick={() => navigate('/polizas')} className={botonClase('/polizas')}>
                    <FileText size={20} />
                    <span>Pólizas</span>
                </button>
                
                <button onClick={() => navigate('/siniestros')} className={botonClase('/siniestros')}>
                    <AlertTriangle size={20} />
                    <span>Siniestros</span>
                </button>

                {rol === 'admin' && (
                    <>
                        <button onClick={() => navigate('/usuarios')} className={botonClase('/usuarios')}>
                            <Users size={20} />
                            <span>Personal</span>
                        </button>
                        
                        {/* Nuevo botón para el panel de logs */}
                        <button onClick={() => navigate('/logs')} className={botonClase('/logs')}>
                            <Activity size={20} />
                            <span>Auditoría</span>
                        </button>
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-3 w-full px-4 py-3 text-peligro hover:bg-peligro/10 rounded-lg transition-colors font-medium"
                >
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;