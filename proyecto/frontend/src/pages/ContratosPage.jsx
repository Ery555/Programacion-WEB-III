import { useEffect, useState } from 'react';
import clienteAxios from '../api/axios';
import { 
    FileText, Plus, X, Trash2, Building2, 
    Calendar, DollarSign, FileSignature, UserPlus 
} from 'lucide-react';

const ContratosPage = () => {
    const [contratos, setContratos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [usuarios, setUsuarios] = useState([]); // Para la lista de asesores
    const [mostrarForm, setMostrarForm] = useState(false);
    const [error, setError] = useState(null);
    const rol = localStorage.getItem('rol');

    // Estado para el modal de Asignación de Asesor
    const [modalAsignar, setModalAsignar] = useState({
        visible: false,
        id_contrato: null,
        codigo_contrato: '',
        id_usuario: ''
    });

    const [nuevoContrato, setNuevoContrato] = useState({
        id_cliente: '', codigo: '', objeto: '',
        fecha_inicio: '', fecha_fin: '', importe: ''
    });

    const cargarDatos = async () => {
        try {
            // Traemos Contratos y Clientes
            const [resContratos, resClientes] = await Promise.all([
                clienteAxios.get('/contratos'),
                clienteAxios.get('/clientes')
            ]);
            setContratos(resContratos.data);
            setClientes(resClientes.data);

            // Si es Admin, traemos la lista de usuarios para poder asignarlos
            if (rol === 'admin') {
                const resUsuarios = await clienteAxios.get('/auth');
                // Filtramos por si acaso solo queremos mostrar asesores (opcional)
                setUsuarios(resUsuarios.data);
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await clienteAxios.post('/contratos', nuevoContrato);
            setNuevoContrato({ id_cliente: '', codigo: '', objeto: '', fecha_inicio: '', fecha_fin: '', importe: '' });
            setMostrarForm(false);
            cargarDatos();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al guardar el contrato');
        }
    };

    const handleEliminar = async (id_contrato) => {
        if (!window.confirm('¿Estás seguro de anular/desactivar este contrato de forma permanente?')) return;
        try {
            await clienteAxios.put(`/contratos/eliminar/${id_contrato}`);
            setContratos(contratos.filter(c => c.id_contrato !== id_contrato));
        } catch (err) {
            alert('No se pudo eliminar el contrato');
        }
    };

    const handleAsignarAsesor = async (e) => {
        e.preventDefault();
        try {
            await clienteAxios.post('/contratos/asignar', {
                id_contrato: modalAsignar.id_contrato,
                id_usuario: modalAsignar.id_usuario
            });
            alert('¡Asesor asignado correctamente al contrato!');
            setModalAsignar({ visible: false, id_contrato: null, codigo_contrato: '', id_usuario: '' });
        } catch (err) {
            alert(err.response?.data?.mensaje || 'Error al asignar asesor');
        }
    };

    const inputStyle = "w-full px-4 py-2.5 bg-fondo border border-gray-700 rounded-lg text-textoBase focus:outline-none focus:ring-2 focus:ring-primario focus:border-transparent transition-all";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-textoBase tracking-tight flex items-center gap-3">
                        <FileSignature className="text-secundario" size={32} />
                        Gestión de Contratos
                    </h2>
                    <p className="text-textoMuteado mt-1">Administración de convenios y asesorías corporativas</p>
                </div>

                {rol === 'admin' && (
                    <button 
                        onClick={() => setMostrarForm(!mostrarForm)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium ${
                            mostrarForm 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                            : 'bg-secundario hover:bg-emerald-600 text-white'
                        }`}
                    >
                        {mostrarForm ? <X size={20} /> : <Plus size={20} />}
                        {mostrarForm ? 'Cancelar Registro' : 'Nuevo Contrato'}
                    </button>
                )}
            </div>

            {/* FORMULARIO DE CONTRATOS */}
            {mostrarForm && (
                <div className="bg-tarjeta p-8 rounded-2xl shadow-xl border border-gray-800">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-textoBase">Registro de Contrato Legal</h3>
                        <p className="text-textoMuteado text-sm">Vincule el contrato a una institución registrada.</p>
                    </div>

                    {error && (
                        <div className="bg-peligro/20 border border-peligro text-peligro px-4 py-3 rounded-lg mb-6 text-sm font-semibold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Institución / Cliente</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <select 
                                        value={nuevoContrato.id_cliente}
                                        onChange={(e) => setNuevoContrato({ ...nuevoContrato, id_cliente: e.target.value })}
                                        required
                                        className={`${inputStyle} pl-10 appearance-none`}
                                    >
                                        <option value="">-- Seleccione una Institución --</option>
                                        {clientes.map(c => (
                                            <option key={c.id_cliente} value={c.id_cliente}>
                                                {c.nombre} {c.sigla ? `(${c.sigla})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Código del Contrato</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input type="text" placeholder="Ej: CON-2026-001" value={nuevoContrato.codigo} onChange={(e) => setNuevoContrato({ ...nuevoContrato, codigo: e.target.value })} required className={`${inputStyle} pl-10`} />
                                </div>
                            </div>

                            <div className="lg:col-span-3">
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Objeto / Título del Contrato</label>
                                <textarea 
                                    value={nuevoContrato.objeto}
                                    onChange={(e) => setNuevoContrato({ ...nuevoContrato, objeto: e.target.value })}
                                    placeholder="Ej: Asesoría técnica integral para la licitación y renovación de pólizas de aeronavegación..."
                                    required
                                    className={`${inputStyle} h-20 resize-none`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Importe del Contrato (Bs.)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 text-secundario" size={18} />
                                    <input type="number" step="0.01" placeholder="0.00" value={nuevoContrato.importe} onChange={(e) => setNuevoContrato({ ...nuevoContrato, importe: e.target.value })} required className={`${inputStyle} pl-10`} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Fecha de Inicio</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input type="date" value={nuevoContrato.fecha_inicio} onChange={(e) => setNuevoContrato({ ...nuevoContrato, fecha_inicio: e.target.value })} required className={`${inputStyle} pl-10`} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Fecha de Vencimiento</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-peligro" size={18} />
                                    <input type="date" value={nuevoContrato.fecha_fin} onChange={(e) => setNuevoContrato({ ...nuevoContrato, fecha_fin: e.target.value })} required className={`${inputStyle} pl-10`} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800 flex justify-end">
                            <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-secundario hover:bg-emerald-600 text-white font-bold rounded-lg shadow-lg transition-colors">
                                <FileSignature size={20} />
                                Registrar Contrato
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TABLA DE CONTRATOS */}
            <div className="bg-tarjeta rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 border-b border-gray-700">
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Código / Objeto</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Institución Cliente</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Vigencia</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider text-right">Importe</th>
                                {rol === 'admin' && <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider text-center">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {contratos.map((c) => (
                                <tr key={c.id_contrato} className="hover:bg-gray-800/30 transition-colors">
                                    
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="font-bold text-textoBase flex items-center gap-2">
                                            <FileText size={16} className="text-secundario"/> {c.codigo}
                                        </div>
                                        <div className="text-sm text-textoMuteado mt-1 truncate" title={c.objeto}>
                                            {c.objeto}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-textoBase flex items-center gap-2">
                                            <Building2 size={16} className="text-primario"/> {c.cliente_nombre}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-sm">
                                        <div className="text-textoMuteado">
                                            Ini: {c.fecha_inicio.substring(0, 10)}
                                        </div>
                                        <div className="text-peligro font-semibold mt-0.5">
                                            Fin: {c.fecha_fin.substring(0, 10)}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-bold text-secundario bg-secundario/10 inline-block px-3 py-1 rounded-lg border border-secundario/20">
                                            Bs. {parseFloat(c.importe).toLocaleString()}
                                        </div>
                                    </td>

                                    {rol === 'admin' && (
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => setModalAsignar({ visible: true, id_contrato: c.id_contrato, codigo_contrato: c.codigo, id_usuario: '' })}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primario/10 text-primario hover:bg-primario hover:text-white border border-primario/20 rounded-md transition-colors text-sm font-medium"
                                                    title="Asignar Asesor"
                                                >
                                                    <UserPlus size={16} /> Asignar
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleEliminar(c.id_contrato)}
                                                    className="inline-flex items-center gap-1 p-2 text-peligro hover:bg-peligro/10 rounded-lg transition-colors"
                                                    title="Eliminar Contrato"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {contratos.length === 0 && (
                                <tr>
                                    <td colSpan={rol === 'admin' ? 5 : 4} className="px-6 py-8 text-center text-textoMuteado">
                                        No hay contratos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE ASIGNACIÓN DE ASESOR (Solo Admin) */}
            {modalAsignar.visible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-tarjeta border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                        
                        <button 
                            onClick={() => setModalAsignar({ visible: false, id_contrato: null, codigo_contrato: '', id_usuario: '' })} 
                            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-fondo/50 hover:bg-peligro rounded-full p-1 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-6 border-b border-gray-800 flex items-center gap-3 bg-primario/10">
                            <UserPlus size={28} className="text-primario" />
                            <div>
                                <h3 className="text-xl font-bold text-primario">Asignar Asesor</h3>
                                <p className="text-sm text-textoBase font-medium">Contrato: {modalAsignar.codigo_contrato}</p>
                            </div>
                        </div>

                        <form onSubmit={handleAsignarAsesor} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-2">Seleccione un Asesor de la lista:</label>
                                <select 
                                    value={modalAsignar.id_usuario}
                                    onChange={(e) => setModalAsignar({...modalAsignar, id_usuario: e.target.value})}
                                    required
                                    className={`${inputStyle} appearance-none`}
                                >
                                    <option value="">-- Seleccionar Usuario --</option>
                                    {usuarios.map(u => (
                                        <option key={u.id_usuario} value={u.id_usuario}>
                                            {u.nombre} ({u.rol})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="pt-2">
                                <button type="submit" className="w-full py-3 bg-primario hover:bg-blue-600 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
                                    <UserPlus size={18}/>
                                    Confirmar Asignación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ContratosPage;