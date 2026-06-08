import { useEffect, useState } from 'react';
import clienteAxios from '../api/axios';
import { 
    FileText, Plus, X, Trash2, 
    Upload, ExternalLink, ShieldAlert 
} from 'lucide-react';

const PolizasPage = () => {
    const [polizas, setPolizas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [aseguradoras, setAseguradoras] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [error, setError] = useState(null);
    const rol = localStorage.getItem('rol');

    const [nuevaPoliza, setNuevaPoliza] = useState({
        id_cliente: '',
        id_aseguradora: '',
        numero_codigo_poliza: '',
        tipo_poliza: '',
        direccion_poliza: '',
        inicio_vigencia: '',
        fin_vigencia: ''
    });

    const cargarTodo = async () => {
        try {
            const [resPol, resCli, resAse] = await Promise.all([
                clienteAxios.get('/polizas'),
                clienteAxios.get('/clientes'),
                clienteAxios.get('/aseguradoras')
            ]);
            setPolizas(resPol.data);
            setClientes(resCli.data);
            setAseguradoras(resAse.data);
        } catch (error) {
            console.error("Error al sincronizar datos:", error);
        }
    };

    useEffect(() => {
        cargarTodo();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await clienteAxios.post('/polizas', nuevaPoliza);
            setNuevaPoliza({
                id_cliente: '', id_aseguradora: '', numero_codigo_poliza: '',
                tipo_poliza: '', direccion_poliza: '', inicio_vigencia: '', fin_vigencia: ''
            });
            setMostrarForm(false);
            cargarTodo();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al registrar póliza');
        }
    };

    const handleSubirPDF = async (e, id_poliza) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Por favor, selecciona únicamente un archivo PDF.');
            return;
        }

        const formData = new FormData();
        formData.append('documento', file); 

        try {
            await clienteAxios.post(`/polizas/${id_poliza}/documento`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('¡Documento PDF vinculado exitosamente a la póliza!');
            cargarTodo(); 
        } catch (error) {
            console.error(error);
            alert('Hubo un error al subir el archivo al servidor.');
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Desea anular esta póliza?')) return;
        try {
            await clienteAxios.put(`/polizas/eliminar/${id}`);
            cargarTodo();
        } catch (err) {
            alert('Error al procesar la solicitud');
        }
    };

    const inputStyle = "w-full px-4 py-2.5 bg-fondo border border-gray-700 rounded-lg text-textoBase focus:outline-none focus:ring-2 focus:ring-primario focus:border-transparent transition-all";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-textoBase tracking-tight flex items-center gap-3">
                        <FileText className="text-blue-400" size={32} />
                        Gestión de Pólizas
                    </h2>
                    <p className="text-textoMuteado mt-1">Administración de contratos de seguro y documentos PDF</p>
                </div>

                <button 
                    onClick={() => setMostrarForm(!mostrarForm)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium ${
                        mostrarForm 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {mostrarForm ? <X size={20} /> : <Plus size={20} />}
                    {mostrarForm ? 'Cancelar Registro' : 'Nueva Póliza'}
                </button>
            </div>

            {mostrarForm && (
                <div className="bg-tarjeta p-8 rounded-2xl shadow-xl border border-gray-800">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-textoBase">Registro de Contrato</h3>
                        <p className="text-textoMuteado text-sm">Vincule una institución con su aseguradora correspondiente.</p>
                    </div>

                    {error && (
                        <div className="bg-peligro/20 border border-peligro text-peligro px-4 py-3 rounded-lg mb-6 text-sm font-semibold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Institución / Cliente</label>
                                <select value={nuevaPoliza.id_cliente} onChange={(e) => setNuevaPoliza({...nuevaPoliza, id_cliente: e.target.value})} required className={inputStyle}>
                                    <option value="" className="bg-gray-800 text-gray-400">-- Seleccionar Institución --</option>
                                    {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente} className="bg-gray-800 text-textoBase">{c.nombre}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Compañía Aseguradora</label>
                                <select value={nuevaPoliza.id_aseguradora} onChange={(e) => setNuevaPoliza({...nuevaPoliza, id_aseguradora: e.target.value})} required className={inputStyle}>
                                    <option value="" className="bg-gray-800 text-gray-400">-- Seleccionar Compañía --</option>
                                    {aseguradoras.map(a => <option key={a.id_aseguradora} value={a.id_aseguradora} className="bg-gray-800 text-textoBase">{a.nombre}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Número o Código de Póliza</label>
                                <input type="text" placeholder="Ej: POL-2026-001" value={nuevaPoliza.numero_codigo_poliza} onChange={(e) => setNuevaPoliza({...nuevaPoliza, numero_codigo_poliza: e.target.value})} required className={inputStyle}/>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Tipo de Póliza</label>
                                <input type="text" placeholder="Ej: Automotores, Incendio" value={nuevaPoliza.tipo_poliza} onChange={(e) => setNuevaPoliza({...nuevaPoliza, tipo_poliza: e.target.value})} required className={inputStyle}/>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Dirección de Riesgo</label>
                                <input type="text" placeholder="Ubicación específica de cobertura" value={nuevaPoliza.direccion_poliza} onChange={(e) => setNuevaPoliza({...nuevaPoliza, direccion_poliza: e.target.value})} className={inputStyle} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Inicio de Vigencia</label>
                                <input type="date" value={nuevaPoliza.inicio_vigencia} onChange={(e) => setNuevaPoliza({...nuevaPoliza, inicio_vigencia: e.target.value})} required className={inputStyle} style={{ colorScheme: 'dark' }}/>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Fin de Vigencia</label>
                                <input type="date" value={nuevaPoliza.fin_vigencia} onChange={(e) => setNuevaPoliza({...nuevaPoliza, fin_vigencia: e.target.value})} required className={inputStyle} style={{ colorScheme: 'dark' }}/>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800 flex justify-end">
                            <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-colors">
                                <FileText size={20} /> Guardar Póliza
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
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Código / Tipo</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Entidades Vinculadas</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Vencimiento</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Documento</th>
                                {rol === 'admin' && <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider text-right">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {polizas.map(p => (
                                <tr key={p.id_poliza} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-textoBase flex items-center gap-2">
                                            <ShieldAlert size={16} className="text-blue-400" />
                                            {p.numero_codigo_poliza}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-textoBase">{p.cliente_nombre}</div>
                                        <div className="text-xs text-textoMuteado mt-0.5">{p.aseguradora_nombre}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-peligro/10 text-peligro border border-peligro/20">
                                            {p.fin_vigencia.substring(0, 10)}
                                        </span>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        {p.ruta_documento_poliza ? (
                                            <a 
                                                href={`http://localhost:3000${p.ruta_documento_poliza}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                                            >
                                                <ExternalLink size={16} /> Ver PDF
                                            </a>
                                        ) : (
                                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-md transition-colors text-sm font-medium">
                                                <Upload size={16} /> Subir PDF
                                                <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleSubirPDF(e, p.id_poliza)} />
                                            </label>
                                        )}
                                    </td>
                                    
                                    {rol === 'admin' && (
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleEliminar(p.id_poliza)}
                                                className="inline-flex items-center gap-1 p-2 text-peligro hover:bg-peligro/10 rounded-lg transition-colors"
                                                title="Anular Póliza"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {polizas.length === 0 && (
                                <tr>
                                    <td colSpan={rol === 'admin' ? 5 : 4} className="px-6 py-8 text-center text-textoMuteado">
                                        No hay pólizas registradas en el sistema.
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

export default PolizasPage;