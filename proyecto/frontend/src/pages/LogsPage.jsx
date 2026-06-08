import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axios';
import { 
    Activity, LogIn, LogOut, 
    Clock, Monitor, Globe 
} from 'lucide-react';

const LogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const rolActual = localStorage.getItem('rol');

    useEffect(() => {
        // Redirección de seguridad en el frontend
        if (rolActual !== 'admin') {
            navigate('/dashboard');
            return;
        }

        const cargarLogs = async () => {
            try {
                const res = await clienteAxios.get('/auth/logs');
                setLogs(res.data);
            } catch (err) {
                console.error("Error al cargar la auditoría:", err);
                setError('No se pudieron cargar los registros de acceso.');
                if (err.response?.status === 403) {
                    navigate('/dashboard');
                }
            }
        };

        cargarLogs();
    }, [rolActual, navigate]);

    // Función auxiliar para formatear la fecha a un formato más legible
    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return 'Fecha desconocida';
        const fecha = new Date(fechaISO);
        return fecha.toLocaleString('es-BO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-textoBase tracking-tight flex items-center gap-3">
                        <Activity className="text-teal-400" size={32} />
                        Auditoría de Accesos
                    </h2>
                    <p className="text-textoMuteado mt-1">Registro histórico de ingresos y salidas del sistema</p>
                </div>
            </div>

            {error && (
                <div className="bg-peligro/20 border border-peligro text-peligro px-4 py-3 rounded-lg text-sm font-semibold">
                    {error}
                </div>
            )}

            <div className="bg-tarjeta rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 border-b border-gray-700">
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Usuario / Empleado</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Evento</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Fecha y Hora</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Conexión (IP / Nav)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {logs.map((log, index) => {
                                const esIngreso = log.evento.toLowerCase() === 'ingreso';
                                
                                return (
                                <tr key={log.id_log || index} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-textoBase">{log.usuario_nombre}</div>
                                        <div className="text-xs text-textoMuteado mt-0.5">{log.usuario_email}</div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border 
                                            ${esIngreso 
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                            }
                                        `}>
                                            {esIngreso ? <LogIn size={14} /> : <LogOut size={14} />}
                                            {log.evento.toUpperCase()}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-textoBase font-medium">
                                            <Clock size={14} className="text-gray-500" />
                                            {formatearFecha(log.fecha_hora)}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-xs text-gray-300 font-mono">
                                                <Globe size={14} className="text-teal-500/70" />
                                                {log.ip_address || log.ip || 'No registrada'}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500 max-w-[200px] truncate" title={log.browser}>
                                                <Monitor size={14} className="text-gray-600" />
                                                {log.browser || 'Desconocido'}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                            
                            {logs.length === 0 && !error && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-textoMuteado">
                                        No hay registros de acceso en el sistema.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LogsPage;