import { useEffect, useState } from 'react';
import clienteAxios from '../api/axios';
import { generarReporteGerencial } from '../utils/reportePdf';
import { 
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { Users, Briefcase, ShieldCheck, AlertTriangle, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [alertasPolizas, setAlertasPolizas] = useState([]);
    const [alertasContratos, setAlertasContratos] = useState([]);
    const [cargando, setCargando] = useState(true);

    const COLORES = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    const navigate = useNavigate();
    const rolActual = localStorage.getItem('rol');
    const cargarDatos = async () => {
        try {
            const [resStats, resPolizas, resContratos] = await Promise.all([
                clienteAxios.get('/stats'),
                clienteAxios.get('/polizas'),
                clienteAxios.get('/contratos')
            ]);
            
            const siniestrosFormateados = resStats.data.siniestrosPorEstado.map(s => ({
                estado: s.estado.toUpperCase(),
                Reclamado: parseFloat(s.total_reclamado),
                Pagado: parseFloat(s.total_indemnizado)
            }));

            const distribucionFormateada = resStats.data.distribucionAseguradoras.map(a => ({
                aseguradora: a.aseguradora,
                cantidad: parseInt(a.cantidad, 10)
            }));

            setStats({
                ...resStats.data,
                siniestrosPorEstado: siniestrosFormateados,
                distribucionAseguradoras: distribucionFormateada
            });

            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const limite30Dias = new Date(hoy);
            limite30Dias.setDate(limite30Dias.getDate() + 30);

            const parsearFechaLocal = (fechaString) => {
                const [year, month, day] = fechaString.substring(0, 10).split('-');
                return new Date(year, month - 1, day); 
            };

            const polizasProximas = resPolizas.data.filter(p => {
                const fechaVencimiento = parsearFechaLocal(p.fin_vigencia);
                return fechaVencimiento >= hoy && fechaVencimiento <= limite30Dias;
            });

            const contratosProximos = resContratos.data.filter(c => {
                const fechaVencimiento = parsearFechaLocal(c.fecha_fin);
                return fechaVencimiento >= hoy && fechaVencimiento <= limite30Dias;
            });

            setAlertasPolizas(polizasProximas);
            setAlertasContratos(contratosProximos);
            setCargando(false);

        } catch (error) {
            console.error("Error al cargar el panel analítico:", error);
            setCargando(false);
        }
    };

    useEffect(() => {
        
        cargarDatos();
    }, []);
    const handleDescargarPDF = async () => {
        try {
            await generarReporteGerencial(alertasPolizas, alertasContratos);
        } catch (error) {
            console.error("Error detallado:", error);
            alert("Hubo un problema al recopilar los datos. Revisa la consola para más detalles.");
        }
    };

    if (cargando) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-xl text-textoMuteado animate-pulse">Recopilando analíticas del servidor...</div>
            </div>
        );
    }

    if (!stats) return <div className="text-peligro">Error al conectar con los datos analíticos.</div>;

    return (
        <div className="space-y-6">
            
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-textoBase tracking-tight">Panel de Control</h2>
                    <p className="text-textoMuteado mt-1">Resumen analítico y alertas del sistema</p>
                </div>
                <button 
                    onClick={handleDescargarPDF}
                    className="flex items-center gap-2 px-5 py-2.5 bg-tarjeta border border-gray-700 hover:bg-gray-800 text-textoBase rounded-lg shadow-md transition-all duration-200 font-medium"
                >
                    <FileDown size={20} className="text-primario" />
                    Exportar Reporte
                </button>
            </div>

            {/* SECCIÓN 1: KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-tarjeta p-6 rounded-2xl border border-gray-800 shadow-lg flex items-center gap-4">
                    <div className="p-4 bg-primario/10 rounded-xl">
                        <Users size={28} className="text-primario" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-textoMuteado">Clientes Activos</p>
                        <h3 className="text-2xl font-bold text-textoBase">{stats.resumenGeneral.total_clientes}</h3>
                    </div>
                </div>

                <div className="bg-tarjeta p-6 rounded-2xl border border-gray-800 shadow-lg flex items-center gap-4">
                    <div className="p-4 bg-secundario/10 rounded-xl">
                        <Briefcase size={28} className="text-secundario" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-textoMuteado">Volumen Contratos</p>
                        <h3 className="text-2xl font-bold text-textoBase">Bs. {stats.resumenGeneral.total_monto_contratos.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-tarjeta p-6 rounded-2xl border border-gray-800 shadow-lg flex items-center gap-4">
                    <div className="p-4 bg-indigo-500/10 rounded-xl">
                        <ShieldCheck size={28} className="text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-textoMuteado">Pólizas Vigentes</p>
                        <h3 className="text-2xl font-bold text-textoBase">{stats.resumenGeneral.total_polizas}</h3>
                    </div>
                </div>
                
                <div className={`p-6 rounded-2xl border shadow-lg flex items-center gap-4 transition-colors ${stats.resumenGeneral.polizas_por_vencer > 0 ? 'bg-peligro/5 border-peligro/50' : 'bg-tarjeta border-gray-800'}`}>
                    <div className={`p-4 rounded-xl ${stats.resumenGeneral.polizas_por_vencer > 0 ? 'bg-peligro/20' : 'bg-yellow-500/10'}`}>
                        <AlertTriangle size={28} className={stats.resumenGeneral.polizas_por_vencer > 0 ? 'text-peligro' : 'text-yellow-500'} />
                    </div>
                    <div>
                        <p className={`text-sm font-medium ${stats.resumenGeneral.polizas_por_vencer > 0 ? 'text-peligro/80' : 'text-textoMuteado'}`}>Pólizas por Vencer</p>
                        <h3 className={`text-2xl font-bold flex items-baseline gap-2 ${stats.resumenGeneral.polizas_por_vencer > 0 ? 'text-peligro' : 'text-textoBase'}`}>
                            {stats.resumenGeneral.polizas_por_vencer}
                            <span className="text-xs font-normal opacity-70">en 30 días</span>
                        </h3>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: GRÁFICOS ANALÍTICOS (RECHARTS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-tarjeta p-6 rounded-2xl border border-gray-800 shadow-lg">
                    <h3 className="text-lg font-semibold text-textoBase mb-4">Distribución de Aseguradoras</h3>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie 
                                    data={stats.distribucionAseguradoras} 
                                    dataKey="cantidad" 
                                    nameKey="aseguradora" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={100} 
                                    label={{ fill: '#f8fafc', fontSize: 12 }} 
                                >
                                    {stats.distribucionAseguradoras.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} stroke="#1e293b" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-tarjeta p-6 rounded-2xl border border-gray-800 shadow-lg">
                    <h3 className="text-lg font-semibold text-textoBase mb-4">Finanzas de Siniestralidad</h3>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer>
                            <BarChart data={stats.siniestrosPorEstado}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="estado" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                <Tooltip 
                                    formatter={(value) => `Bs. ${value.toLocaleString()}`} 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                                />
                                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                                <Bar dataKey="Reclamado" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Pagado" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* SECCIÓN 3: ALERTAS DE VENCIMIENTO DETALLADAS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pólizas */}
                <div className="bg-tarjeta p-6 rounded-2xl border border-gray-800 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-peligro" size={20} />
                        <h3 className="text-lg font-semibold text-textoBase">Pólizas a Vencer (30 días)</h3>
                    </div>
                    {alertasPolizas.length > 0 ? (
                        <div className="space-y-3">
                            {alertasPolizas.map(p => (
                                <div key={p.id_poliza} className="flex justify-between items-center p-3 bg-fondo/50 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition-colors">
                                    <div>
                                        <p className="font-semibold text-textoBase">{p.numero_codigo_poliza} <span className="text-xs font-normal text-textoMuteado ml-1">({p.aseguradora_nombre})</span></p>
                                        <p className="text-sm text-textoMuteado">{p.cliente_nombre}</p>
                                    </div>
                                    <div className="text-sm font-bold text-peligro bg-peligro/10 px-3 py-1 rounded-full border border-peligro/20">
                                        {p.fin_vigencia.substring(0,10)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-6 bg-fondo/30 rounded-lg border border-dashed border-gray-700 text-secundario font-medium">
                            No hay pólizas que requieran renovación urgente.
                        </div>
                    )}
                </div>

                {/* Contratos */}
                <div className="bg-tarjeta p-6 rounded-2xl border border-gray-800 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <FileDown className="text-orange-500" size={20} />
                        <h3 className="text-lg font-semibold text-textoBase">Contratos a Vencer (30 días)</h3>
                    </div>
                    {alertasContratos.length > 0 ? (
                        <div className="space-y-3">
                            {alertasContratos.map(c => (
                                <div key={c.id_contrato} className="flex justify-between items-center p-3 bg-fondo/50 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition-colors">
                                    <div>
                                        <p className="font-semibold text-textoBase">{c.codigo}</p>
                                        <p className="text-sm text-textoMuteado">{c.cliente_nombre}</p>
                                    </div>
                                    <div className="text-sm font-bold text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                                        {c.fecha_fin.substring(0,10)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-6 bg-fondo/30 rounded-lg border border-dashed border-gray-700 text-secundario font-medium">
                            No hay contratos de asesoría por vencer pronto.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Dashboard;