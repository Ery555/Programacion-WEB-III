import { useEffect, useState } from 'react';
import clienteAxios from '../api/axios';
import { 
    AlertTriangle, Plus, X, Trash2, 
    CheckCircle, Activity, Box, MapPin, DollarSign 
} from 'lucide-react';

const SiniestrosPage = () => {
    const [siniestros, setSiniestros] = useState([]);
    const [polizas, setPolizas] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [error, setError] = useState(null);
    const rol = localStorage.getItem('rol');

    const [nuevoSiniestro, setNuevoSiniestro] = useState({
        id_poliza: '',
        fecha_ocurrencia: '',
        fecha_denuncia: '',
        descripcion_general: '',
        lugar: '',
        estado: 'abierto',
        monto_reclamado: '',
        tipo_bien: 'automotor',
        identificador_bien: ''
    });

    const [extraMecanico, setExtraMecanico] = useState('');
    const [extraConductor, setExtraConductor] = useState('');

    const cargarDatos = async () => {
        try {
            const [resSiniestros, resPolizas] = await Promise.all([
                clienteAxios.get('/siniestros'),
                clienteAxios.get('/polizas')
            ]);
            setSiniestros(resSiniestros.data);
            setPolizas(resPolizas.data);
        } catch (err) {
            console.error("Error al cargar datos de siniestros:", err);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const datos_especificos = {
            referencia_tecnica: extraMecanico,
            responsable_operacion: extraConductor,
            fecha_registro_sistema: new Date().toISOString()
        };

        try {
            await clienteAxios.post('/siniestros', {
                ...nuevoSiniestro,
                datos_especificos 
            });

            setNuevoSiniestro({
                id_poliza: '', fecha_ocurrencia: '', fecha_denuncia: '',
                descripcion_general: '', lugar: '', estado: 'abierto',
                monto_reclamado: '', tipo_bien: 'automotor', identificador_bien: ''
            });
            setExtraMecanico('');
            setExtraConductor('');
            setMostrarForm(false);
            cargarDatos();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al registrar el siniestro');
        }
    };

    const handleCerrarSiniestro = async (id_siniestro) => {
        const monto = window.prompt("Ingrese el monto final indemnizado por la aseguradora (Bs.):");
        if (monto === null || isNaN(monto)) return;

        try {
            await clienteAxios.put(`/siniestros/actualizar/${id_siniestro}`, {
                estado: 'cerrado',
                monto_indemnizado: parseFloat(monto)
            });
            cargarDatos();
        } catch (err) {
            alert('No se pudo actualizar el siniestro');
        }
    };

    const handleEliminar = async (id_siniestro) => {
        if (!window.confirm('¿Estás seguro de anular este registro de siniestro?')) return;
        try {
            await clienteAxios.put(`/siniestros/eliminar/${id_siniestro}`);
            cargarDatos();
        } catch (err) {
            alert('Error al eliminar');
        }
    };

    const inputStyle = "w-full px-4 py-2.5 bg-fondo border border-gray-700 rounded-lg text-textoBase focus:outline-none focus:ring-2 focus:ring-primario focus:border-transparent transition-all";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-textoBase tracking-tight flex items-center gap-3">
                        <AlertTriangle className="text-orange-500" size={32} />
                        Control de Siniestros
                    </h2>
                    <p className="text-textoMuteado mt-1">Seguimiento de reclamaciones y peritajes de siniestros</p>
                </div>

                <button 
                    onClick={() => setMostrarForm(!mostrarForm)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium ${
                        mostrarForm 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                >
                    {mostrarForm ? <X size={20} /> : <Plus size={20} />}
                    {mostrarForm ? 'Cancelar Reporte' : 'Reportar Siniestro'}
                </button>
            </div>

            {mostrarForm && (
                <div className="bg-tarjeta p-8 rounded-2xl shadow-xl border border-gray-800">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-textoBase">Declaración de Siniestro</h3>
                        <p className="text-textoMuteado text-sm">Registre los detalles técnicos y administrativos del incidente.</p>
                    </div>

                    {error && (
                        <div className="bg-peligro/20 border border-peligro text-peligro px-4 py-3 rounded-lg mb-6 text-sm font-semibold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Vincular a Póliza Activa</label>
                                <select value={nuevoSiniestro.id_poliza} onChange={(e) => setNuevoSiniestro({...nuevoSiniestro, id_poliza: e.target.value})} required className={inputStyle}>
                                    <option value="" className="bg-gray-800 text-gray-400">-- Seleccione Código de Póliza (Aseguradora - Cliente) --</option>
                                    {polizas.map(p => (
                                        <option key={p.id_poliza} value={p.id_poliza} className="bg-gray-800 text-textoBase">
                                            Pol: {p.numero_codigo_poliza} | {p.aseguradora_nombre} ➝ {p.cliente_nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Fecha de Ocurrencia</label>
                                <input type="date" value={nuevoSiniestro.fecha_ocurrencia} onChange={(e) => setNuevoSiniestro({...nuevoSiniestro, fecha_ocurrencia: e.target.value})} required className={inputStyle} style={{ colorScheme: 'dark' }} />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Fecha de Denuncia</label>
                                <input type="date" value={nuevoSiniestro.fecha_denuncia} onChange={(e) => setNuevoSiniestro({...nuevoSiniestro, fecha_denuncia: e.target.value})} required className={inputStyle} style={{ colorScheme: 'dark' }} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Lugar del Hecho</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                    <input type="text" placeholder="Ej: Carretera La Paz - Oruro Km 45" value={nuevoSiniestro.lugar} onChange={(e) => setNuevoSiniestro({...nuevoSiniestro, lugar: e.target.value})} required className={`${inputStyle} pl-10`} />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Descripción General de los Daños</label>
                                <textarea value={nuevoSiniestro.descripcion_general} onChange={(e) => setNuevoSiniestro({...nuevoSiniestro, descripcion_general: e.target.value})} required className={`${inputStyle} resize-none h-24`} placeholder="Detalle cronológico y estado general..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Tipo de Bien Afectado</label>
                                <select value={nuevoSiniestro.tipo_bien} onChange={(e) => setNuevoSiniestro({...nuevoSiniestro, tipo_bien: e.target.value})} className={inputStyle}>
                                    <option value="automotor" className="bg-gray-800">Automotor (Vehículo)</option>
                                    <option value="dron" className="bg-gray-800">Dron / Aeronave</option>
                                    <option value="maquinaria" className="bg-gray-800">Maquinaria Pesada</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Identificador del Bien</label>
                                <div className="relative">
                                    <Box className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                    <input type="text" placeholder="Ej: Placa 123-XYZ / Nro Serie" value={nuevoSiniestro.identificador_bien} onChange={(e) => setNuevoSiniestro({...nuevoSiniestro, identificador_bien: e.target.value})} required className={`${inputStyle} pl-10`} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Monto Estimado Reclamado (Bs.)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                    <input type="number" step="0.01" value={nuevoSiniestro.monto_reclamado} onChange={(e) => setNuevoSiniestro({...nuevoSiniestro, monto_reclamado: e.target.value})} required className={`${inputStyle} pl-10`} placeholder="0.00" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Estado Inicial</label>
                                <select value={nuevoSiniestro.estado} onChange={(e) => setNuevoSiniestro({...nuevoSiniestro, estado: e.target.value})} className={inputStyle}>
                                    <option value="abierto" className="bg-gray-800 text-yellow-400">Abierto (En Evaluación)</option>
                                    <option value="en tramite" className="bg-gray-800 text-blue-400">En Trámite Legal</option>
                                </select>
                            </div>

                            {/* Sección JSONB Dinámica */}
                            <div className="md:col-span-2 bg-gray-800/30 p-5 rounded-xl border border-gray-700/50">
                                <h5 className="text-sm font-semibold text-primario mb-4 flex items-center gap-2">
                                    <Activity size={16} /> Metadatos Técnicos Adicionales
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" placeholder={nuevoSiniestro.tipo_bien === 'automotor' ? "Marca/Modelo del Auto" : "Especificaciones Técnicas"} value={extraMecanico} onChange={(e) => setExtraMecanico(e.target.value)} className={inputStyle} />
                                    <input type="text" placeholder={nuevoSiniestro.tipo_bien === 'automotor' ? "Nombre del Conductor" : "Nombre del Operador Certificado"} value={extraConductor} onChange={(e) => setExtraConductor(e.target.value)} className={inputStyle} />
                                </div>
                            </div>

                        </div>

                        <div className="pt-4 border-t border-gray-800 flex justify-end">
                            <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-lg transition-colors">
                                <AlertTriangle size={20} /> Registrar Reclamación
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-tarjeta rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 border-b border-gray-700">
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Poliza / Entidades</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Bien / ID</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Económico (Bs.)</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Metadatos</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {siniestros.map(s => {
                                const isAbierto = s.estado === 'abierto';
                                const isTramite = s.estado === 'en tramite';
                                const isCerrado = s.estado === 'cerrado';

                                return (
                                <tr key={s.id_siniestro} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-textoBase text-sm">{s.numero_codigo_poliza}</div>
                                        <div className="text-xs font-medium text-textoMuteado mt-1">{s.cliente_nombre}</div>
                                        <div className="text-[11px] text-gray-500">{s.aseguradora_nombre}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className="bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
                                                {s.tipo_bien}
                                            </span>
                                            <strong className="text-textoBase text-sm">{s.identificador_bien}</strong>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border 
                                            ${isAbierto ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                                            ${isTramite ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                                            ${isCerrado ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
                                        `}>
                                            {s.estado.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="text-textoMuteado">Rec: <span className="text-textoBase font-medium">{s.monto_reclamado}</span></div>
                                        <div className={`mt-0.5 font-semibold ${s.monto_indemnizado ? 'text-emerald-400' : 'text-gray-500'}`}>
                                            Ind: {s.monto_indemnizado ? s.monto_indemnizado : 'Pendiente'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-400 max-w-[150px] truncate" title={s.datos_especificos?.referencia_tecnica}>
                                            <span className="font-semibold text-gray-500">Ref:</span> {s.datos_especificos?.referencia_tecnica || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-400 max-w-[150px] truncate mt-1" title={s.datos_especificos?.responsable_operacion}>
                                            <span className="font-semibold text-gray-500">Resp:</span> {s.datos_especificos?.responsable_operacion || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {s.estado !== 'cerrado' && (
                                                <button 
                                                    onClick={() => handleCerrarSiniestro(s.id_siniestro)} 
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-md transition-colors text-xs font-bold"
                                                >
                                                    <CheckCircle size={14} /> Liquidar
                                                </button>
                                            )}
                                            {rol === 'admin' && (
                                                <button 
                                                    onClick={() => handleEliminar(s.id_siniestro)} 
                                                    className="p-1.5 text-peligro hover:bg-peligro/10 rounded-md transition-colors"
                                                    title="Eliminar Siniestro"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )})}
                            {siniestros.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-textoMuteado">
                                        No se registran siniestros activos en el sistema.
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

export default SiniestrosPage;