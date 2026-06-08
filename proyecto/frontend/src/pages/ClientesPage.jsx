import { useEffect, useState } from 'react';
import clienteAxios from '../api/axios';
import { Building2, Plus, X, Trash2, Mail, Phone, User, Briefcase } from 'lucide-react';

const ClientesPage = () => {
    const [clientes, setClientes] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [error, setError] = useState(null);
    const rol = localStorage.getItem('rol');

    const [modalInfo, setModalInfo] = useState({
        visible: false,
        tipo: '', 
        cliente: null
    });

    // CORRECCIÓN: Cambiamos _correo por _email para que coincida con la Base de Datos
    const [nuevoCliente, setNuevoCliente] = useState({
        nombre: '', sigla: '', nit: '', direccion: '',
        representante_nombre: '', representante_email: '', representante_telefono: '',
        contacto_nombre: '', contacto_cargo: '', contacto_email: '', contacto_telefono: ''
    });

    const obtenerClientes = async () => {
        try {
            const res = await clienteAxios.get('/clientes');
            setClientes(res.data);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
        }
    };

    useEffect(() => {
        obtenerClientes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await clienteAxios.post('/clientes', nuevoCliente);
            setNuevoCliente({
                nombre: '', sigla: '', nit: '', direccion: '',
                representante_nombre: '', representante_email: '', representante_telefono: '',
                contacto_nombre: '', contacto_cargo: '', contacto_email: '', contacto_telefono: ''
            });
            setMostrarForm(false);
            obtenerClientes();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al guardar el cliente');
        }
    };

    const handleEliminar = async (id_cliente) => {
        if (!window.confirm('¿Estás seguro de desactivar este cliente de forma permanente?')) return;
        try {
            await clienteAxios.put(`/clientes/eliminar/${id_cliente}`);
            setClientes(clientes.filter(c => c.id_cliente !== id_cliente));
        } catch (err) {
            alert('No se pudo eliminar el cliente');
        }
    };

    const abrirModal = (tipo, cliente) => {
        setModalInfo({ visible: true, tipo, cliente });
    };

    const cerrarModal = () => {
        setModalInfo({ visible: false, tipo: '', cliente: null });
    };

    const inputStyle = "w-full px-4 py-2.5 bg-fondo border border-gray-700 rounded-lg text-textoBase focus:outline-none focus:ring-2 focus:ring-primario focus:border-transparent transition-all";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-textoBase tracking-tight flex items-center gap-3">
                        <Building2 className="text-primario" size={32} />
                        Directorio de Clientes
                    </h2>
                    <p className="text-textoMuteado mt-1">Gestión de instituciones y entidades aseguradas</p>
                </div>

                {rol === 'admin' && (
                    <button 
                        onClick={() => setMostrarForm(!mostrarForm)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium ${
                            mostrarForm 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                            : 'bg-primario hover:bg-blue-600 text-white'
                        }`}
                    >
                        {mostrarForm ? <X size={20} /> : <Plus size={20} />}
                        {mostrarForm ? 'Cancelar Registro' : 'Nueva Entidad'}
                    </button>
                )}
            </div>

            {mostrarForm && (
                <div className="bg-tarjeta p-8 rounded-2xl shadow-xl border border-gray-800">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-textoBase">Formulario de Registro Institucional</h3>
                        <p className="text-textoMuteado text-sm">Ingrese los datos formales de la entidad y sus contactos.</p>
                    </div>

                    {error && (
                        <div className="bg-peligro/20 border border-peligro text-peligro px-4 py-3 rounded-lg mb-6 text-sm font-semibold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h4 className="text-lg font-semibold text-secundario border-b border-gray-800 pb-2 mb-4 flex items-center gap-2">
                                <Building2 size={18} /> Datos de la Institución
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-textoMuteado mb-1">Nombre o Razón Social</label>
                                    <input type="text" placeholder="Ej: Ministerio de Obras Públicas" value={nuevoCliente.nombre} onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} required className={inputStyle} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-textoMuteado mb-1">Sigla</label>
                                    <input type="text" placeholder="Ej: MOPSV" value={nuevoCliente.sigla} onChange={(e) => setNuevoCliente({...nuevoCliente, sigla: e.target.value})} className={inputStyle} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-textoMuteado mb-1">NIT</label>
                                    <input type="text" placeholder="Número de Identificación Tributaria" value={nuevoCliente.nit} onChange={(e) => setNuevoCliente({...nuevoCliente, nit: e.target.value})} className={inputStyle} />
                                </div>
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-textoMuteado mb-1">Dirección Principal</label>
                                    <input type="text" placeholder="Avenida, Calle, Nro de Edificio" value={nuevoCliente.direccion} onChange={(e) => setNuevoCliente({...nuevoCliente, direccion: e.target.value})} className={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold text-primario border-b border-gray-800 pb-2 mb-4 flex items-center gap-2">
                                <User size={18} /> Representante Legal (MAE)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-textoMuteado mb-1">Nombre Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input type="text" placeholder="Nombre de la MAE" value={nuevoCliente.representante_nombre} onChange={(e) => setNuevoCliente({...nuevoCliente, representante_nombre: e.target.value})} className={`${inputStyle} pl-10`} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-textoMuteado mb-1">Correo Institucional</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input type="email" placeholder="correo@institucion.gob.bo" value={nuevoCliente.representante_email} onChange={(e) => setNuevoCliente({...nuevoCliente, representante_email: e.target.value})} className={`${inputStyle} pl-10`} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-textoMuteado mb-1">Teléfono Directo</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input type="text" placeholder="Ej: 2123456" value={nuevoCliente.representante_telefono} onChange={(e) => setNuevoCliente({...nuevoCliente, representante_telefono: e.target.value})} className={`${inputStyle} pl-10`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold text-orange-400 border-b border-gray-800 pb-2 mb-4 flex items-center gap-2">
                                <Briefcase size={18} /> Contacto Operativo (Área Administrativa)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                <div className="lg:col-span-1">
                                    <label className="block text-sm font-medium text-textoMuteado mb-1">Nombre de Contacto</label>
                                    <input type="text" placeholder="Nombre completo" value={nuevoCliente.contacto_nombre} onChange={(e) => setNuevoCliente({...nuevoCliente, contacto_nombre: e.target.value})} className={inputStyle} />
                                </div>
                                <div className="lg:col-span-1">
                                    <label className="block text-sm font-medium text-textoMuteado mb-1">Cargo</label>
                                    <input type="text" placeholder="Ej: Jefe de Activos" value={nuevoCliente.contacto_cargo} onChange={(e) => setNuevoCliente({...nuevoCliente, contacto_cargo: e.target.value})} className={inputStyle} />
                                </div>
                                <div className="lg:col-span-1">
                                    <label className="block text-sm font-medium text-textoMuteado mb-1">Correo Electrónico</label>
                                    <input type="email" placeholder="correo@ejemplo.com" value={nuevoCliente.contacto_email} onChange={(e) => setNuevoCliente({...nuevoCliente, contacto_email: e.target.value})} className={inputStyle} />
                                </div>
                                <div className="lg:col-span-1">
                                    <label className="block text-sm font-medium text-textoMuteado mb-1">Celular / Teléfono</label>
                                    <input type="text" placeholder="Ej: 71234567" value={nuevoCliente.contacto_telefono} onChange={(e) => setNuevoCliente({...nuevoCliente, contacto_telefono: e.target.value})} className={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800 flex justify-end">
                            <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-primario hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg transition-colors">
                                <Building2 size={20} />
                                Guardar Entidad en Base de Datos
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
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Entidad / Institución</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Detalles Legales</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Directorio de Contactos</th>
                                {rol === 'admin' && <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider text-right">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {clientes.map((c) => (
                                <tr key={c.id_cliente} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-textoBase text-base">{c.nombre}</div>
                                        <div className="text-sm text-primario font-medium mt-0.5">{c.sigla || 'Sin Sigla'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-textoMuteado text-sm">
                                        <div><strong className="text-gray-400">NIT:</strong> {c.nit || '-'}</div>
                                        <div className="mt-1 truncate max-w-[200px]" title={c.direccion}><strong className="text-gray-400">Dir:</strong> {c.direccion || '-'}</div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => abrirModal('representante', c)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primario/10 text-primario hover:bg-primario hover:text-white border border-primario/20 rounded-md transition-colors text-sm font-medium"
                                            >
                                                <User size={16} /> MAE
                                            </button>
                                            <button 
                                                onClick={() => abrirModal('contacto', c)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-500/20 rounded-md transition-colors text-sm font-medium"
                                            >
                                                <Briefcase size={16} /> Operativo
                                            </button>
                                        </div>
                                    </td>

                                    {rol === 'admin' && (
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleEliminar(c.id_cliente)}
                                                className="inline-flex items-center gap-1 p-2 text-peligro hover:bg-peligro/10 rounded-lg transition-colors"
                                                title="Eliminar Cliente"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {clientes.length === 0 && (
                                <tr>
                                    <td colSpan={rol === 'admin' ? 4 : 3} className="px-6 py-8 text-center text-textoMuteado">
                                        No hay clientes registrados o asignados en el sistema.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalInfo.visible && modalInfo.cliente && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-tarjeta border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                        
                        <button 
                            onClick={cerrarModal} 
                            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-fondo/50 hover:bg-peligro rounded-full p-1 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className={`p-6 border-b border-gray-800 flex items-center gap-3 ${modalInfo.tipo === 'representante' ? 'bg-primario/10' : 'bg-orange-500/10'}`}>
                            {modalInfo.tipo === 'representante' 
                                ? <User size={28} className="text-primario" /> 
                                : <Briefcase size={28} className="text-orange-500" />
                            }
                            <div>
                                <h3 className={`text-xl font-bold ${modalInfo.tipo === 'representante' ? 'text-primario' : 'text-orange-500'}`}>
                                    {modalInfo.tipo === 'representante' ? 'Representante Legal (MAE)' : 'Contacto Operativo'}
                                </h3>
                                <p className="text-sm text-textoBase font-medium">{modalInfo.cliente.nombre}</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-textoMuteado uppercase tracking-wider mb-1">Nombre Completo</p>
                                <p className="text-lg font-medium text-textoBase">
                                    {modalInfo.tipo === 'representante' ? (modalInfo.cliente.representante_nombre || 'No registrado') : (modalInfo.cliente.contacto_nombre || 'No registrado')}
                                </p>
                            </div>
                            
                            {modalInfo.tipo === 'contacto' && (
                                <div>
                                    <p className="text-xs font-semibold text-textoMuteado uppercase tracking-wider mb-1">Cargo en la Institución</p>
                                    <p className="text-base text-textoBase">{modalInfo.cliente.contacto_cargo || 'No registrado'}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800/50">
                                <div>
                                    <p className="text-xs font-semibold text-textoMuteado uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Mail size={14}/> Correo Electrónico
                                    </p>
                                    <p className="text-sm text-textoBase break-words">
                                        {/* CORRECCIÓN APLICADA AQUÍ */}
                                        {modalInfo.tipo === 'representante' ? (modalInfo.cliente.representante_email || 'N/A') : (modalInfo.cliente.contacto_email || 'N/A')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-textoMuteado uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Phone size={14}/> Teléfono / Celular
                                    </p>
                                    <p className="text-sm text-textoBase">
                                        {modalInfo.tipo === 'representante' ? (modalInfo.cliente.representante_telefono || 'N/A') : (modalInfo.cliente.contacto_telefono || 'N/A')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            )}

        </div>
    );
};

export default ClientesPage;