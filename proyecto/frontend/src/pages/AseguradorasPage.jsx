import { useEffect, useState } from 'react';
import clienteAxios from '../api/axios';
import { 
    ShieldCheck, Plus, X, Trash2, 
    Building, Hash, MapPin, Phone 
} from 'lucide-react';

const AseguradorasPage = () => {
    const [aseguradoras, setAseguradoras] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [error, setError] = useState(null);
    const rol = localStorage.getItem('rol');

    const [nuevaAseguradora, setNuevaAseguradora] = useState({
        nombre: '',
        nit: '',
        direccion: '',
        telefono: ''
    });

    const obtenerAseguradoras = async () => {
        try {
            const res = await clienteAxios.get('/aseguradoras');
            setAseguradoras(res.data);
        } catch (error) {
            console.error("Error al cargar aseguradoras:", error);
        }
    };

    useEffect(() => {
        obtenerAseguradoras();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await clienteAxios.post('/aseguradoras', nuevaAseguradora);
            setNuevaAseguradora({ nombre: '', nit: '', direccion: '', telefono: '' });
            setMostrarForm(false);
            obtenerAseguradoras();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al guardar la aseguradora');
        }
    };

    const handleEliminar = async (id_aseguradora) => {
        if (!window.confirm('¿Estás seguro de desactivar esta aseguradora de forma permanente?')) return;
        try {
            await clienteAxios.put(`/aseguradoras/eliminar/${id_aseguradora}`);
            setAseguradoras(aseguradoras.filter(a => a.id_aseguradora !== id_aseguradora));
        } catch (err) {
            alert('No se pudo eliminar la aseguradora');
        }
    };

    const inputStyle = "w-full px-4 py-2.5 bg-fondo border border-gray-700 rounded-lg text-textoBase focus:outline-none focus:ring-2 focus:ring-primario focus:border-transparent transition-all";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-textoBase tracking-tight flex items-center gap-3">
                        <ShieldCheck className="text-indigo-400" size={32} />
                        Compañías Aseguradoras
                    </h2>
                    <p className="text-textoMuteado mt-1">Directorio de aseguradoras aliadas y proveedores de pólizas</p>
                </div>

                {rol === 'admin' && (
                    <button 
                        onClick={() => setMostrarForm(!mostrarForm)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium ${
                            mostrarForm 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                        }`}
                    >
                        {mostrarForm ? <X size={20} /> : <Plus size={20} />}
                        {mostrarForm ? 'Cancelar Registro' : 'Nueva Compañía'}
                    </button>
                )}
            </div>

            {/* FORMULARIO DE REGISTRO */}
            {mostrarForm && (
                <div className="bg-tarjeta p-8 rounded-2xl shadow-xl border border-gray-800">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-textoBase">Registro de Aseguradora</h3>
                        <p className="text-textoMuteado text-sm">Ingrese los datos corporativos de contacto.</p>
                    </div>

                    {error && (
                        <div className="bg-peligro/20 border border-peligro text-peligro px-4 py-3 rounded-lg mb-6 text-sm font-semibold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Nombre de la Compañía</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 text-indigo-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Nacional Seguros Vida y Salud" 
                                        value={nuevaAseguradora.nombre} 
                                        onChange={(e) => setNuevaAseguradora({...nuevaAseguradora, nombre: e.target.value})} 
                                        required 
                                        className={`${inputStyle} pl-10`} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">NIT</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Número de Identificación" 
                                        value={nuevaAseguradora.nit} 
                                        onChange={(e) => setNuevaAseguradora({...nuevaAseguradora, nit: e.target.value})} 
                                        className={`${inputStyle} pl-10`} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Teléfono Central</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Ej: 2123456" 
                                        value={nuevaAseguradora.telefono} 
                                        onChange={(e) => setNuevaAseguradora({...nuevaAseguradora, telefono: e.target.value})} 
                                        className={`${inputStyle} pl-10`} 
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Dirección Principal</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Avenida o Calle principal" 
                                        value={nuevaAseguradora.direccion} 
                                        onChange={(e) => setNuevaAseguradora({...nuevaAseguradora, direccion: e.target.value})} 
                                        className={`${inputStyle} pl-10`} 
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="pt-4 border-t border-gray-800 flex justify-end">
                            <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg shadow-lg transition-colors">
                                <ShieldCheck size={20} />
                                Guardar Aseguradora
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TABLA DE ASEGURADORAS */}
            <div className="bg-tarjeta rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 border-b border-gray-700">
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Compañía</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Identificación (NIT)</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Contacto y Ubicación</th>
                                {rol === 'admin' && <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider text-right">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {aseguradoras.map((a) => (
                                <tr key={a.id_aseguradora} className="hover:bg-gray-800/30 transition-colors">
                                    
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-textoBase text-base flex items-center gap-2">
                                            <ShieldCheck size={18} className="text-indigo-400"/>
                                            {a.nombre}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-textoMuteado">
                                        {a.nit || 'No registrado'}
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        {a.telefono && (
                                            <div className="text-textoBase flex items-center gap-2 mb-1">
                                                <Phone size={14} className="text-gray-500"/> 
                                                {a.telefono}
                                            </div>
                                        )}
                                        {a.direccion && (
                                            <div className="text-sm text-textoMuteado flex items-center gap-2">
                                                <MapPin size={14} className="text-gray-500"/> 
                                                <span className="truncate max-w-[250px]" title={a.direccion}>{a.direccion}</span>
                                            </div>
                                        )}
                                        {!a.telefono && !a.direccion && <span className="text-textoMuteado">-</span>}
                                    </td>

                                    {rol === 'admin' && (
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleEliminar(a.id_aseguradora)}
                                                className="inline-flex items-center gap-1 p-2 text-peligro hover:bg-peligro/10 rounded-lg transition-colors"
                                                title="Eliminar Aseguradora"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {aseguradoras.length === 0 && (
                                <tr>
                                    <td colSpan={rol === 'admin' ? 4 : 3} className="px-6 py-8 text-center text-textoMuteado">
                                        No hay compañías aseguradoras registradas.
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

export default AseguradorasPage;