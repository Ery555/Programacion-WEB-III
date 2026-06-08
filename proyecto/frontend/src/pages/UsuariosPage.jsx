import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axios';
import { 
    Users, UserPlus, X, Trash2, 
    Shield, Mail, BadgeCheck, Fingerprint,
    Eye, EyeOff
} from 'lucide-react';

// Lógica de evaluación de contraseña
const evaluarFuerza = (password) => {
    if (!password) return null;
    const tieneLetras = /[a-zA-Z]/.test(password);
    const tieneNumeros = /\d/.test(password);
    const tieneSimbolos = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length >= 12 && tieneLetras && tieneNumeros && tieneSimbolos) {
        return { nivel: "Fuerte", color: "bg-emerald-500", texto: "text-emerald-400", ancho: "100%" };
    } else if (password.length >= 8 && tieneLetras && tieneNumeros) {
        return { nivel: "Intermedia", color: "bg-yellow-500", texto: "text-yellow-400", ancho: "66%" };
    } else {
        return { nivel: "Débil", color: "bg-red-500", texto: "text-red-400", ancho: "33%" };
    }
};

const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [error, setError] = useState(null);
    const [mensajeFuerza, setMensajeFuerza] = useState('');
    
    const [mostrarPassword, setMostrarPassword] = useState(false); 
    
    const navigate = useNavigate();
    const rolActual = localStorage.getItem('rol');

    const [nuevoUsuario, setNuevoUsuario] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'asesor',
        item: '' 
    });

    const nivelSeguridadActual = evaluarFuerza(nuevoUsuario.password);

    const cargarUsuarios = async () => {
        try {
            const res = await clienteAxios.get('/auth');
            setUsuarios(res.data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            if (error.response?.status === 403) {
                navigate('/dashboard'); 
            }
        }
    };

    useEffect(() => {
        if (rolActual !== 'admin') {
            navigate('/dashboard');
            return;
        }
        cargarUsuarios();
    }, [rolActual, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMensajeFuerza('');

        try {
            const respuesta = await clienteAxios.post('/auth/register', nuevoUsuario);
            setMensajeFuerza(`Éxito: Nivel de contraseña ${respuesta.data.nivelSeguridad}`);
            setNuevoUsuario({ nombre: '', email: '', password: '', rol: 'asesor', item: '' });
            setMostrarPassword(false); // Ocultamos la contraseña al guardar

            setTimeout(() => {
                setMensajeFuerza('');
                setMostrarForm(false);
                cargarUsuarios();
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al registrar usuario');
        }
    };
    
    const handleEliminar = async (id_usuario) => {
        if (!window.confirm('¿Estás seguro de dar de baja a este empleado del sistema?')) return;
        
        try {
            await clienteAxios.put(`/auth/eliminar/${id_usuario}`);
            cargarUsuarios();
        } catch (err) {
            alert(err.response?.data?.mensaje || 'Error al dar de baja al usuario');
        }
    };

    const inputStyle = "w-full px-4 py-2.5 bg-fondo border border-gray-700 rounded-lg text-textoBase focus:outline-none focus:ring-2 focus:ring-primario focus:border-transparent transition-all";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-textoBase tracking-tight flex items-center gap-3">
                        <Users className="text-purple-400" size={32} />
                        Personal y Accesos
                    </h2>
                    <p className="text-textoMuteado mt-1">Gestión de roles y credenciales de asesores del sistema</p>
                </div>

                <button 
                    onClick={() => setMostrarForm(!mostrarForm)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 font-medium ${
                        mostrarForm 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                >
                    {mostrarForm ? <X size={20} /> : <UserPlus size={20} />}
                    {mostrarForm ? 'Cancelar Registro' : 'Registrar Empleado'}
                </button>
            </div>

            {mostrarForm && (
                <div className="bg-tarjeta p-8 rounded-2xl shadow-xl border border-gray-800">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-textoBase">Alta de Nuevo Asesor</h3>
                        <p className="text-textoMuteado text-sm">Configure las credenciales de acceso institucional.</p>
                    </div>

                    {error && (
                        <div className="bg-peligro/20 border border-peligro text-peligro px-4 py-3 rounded-lg mb-6 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
                            <Shield size={16} /> {error}
                        </div>
                    )}
                    {mensajeFuerza && (
                        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 px-4 py-3 rounded-lg mb-6 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
                            <BadgeCheck size={16} /> {mensajeFuerza}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Nombre Completo</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                    <input 
                                        type="text" 
                                        value={nuevoUsuario.nombre} 
                                        onChange={(e) => {
                                            setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value });
                                            if (error) setError(null);
                                        }} 
                                        required 
                                        className={`${inputStyle} pl-10`} 
                                        placeholder="Ej: Ana Pérez" 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-textoMuteado mb-1">Email Institucional</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                    <input 
                                        type="email" 
                                        value={nuevoUsuario.email} 
                                        onChange={(e) => {
                                            setNuevoUsuario({ ...nuevoUsuario, email: e.target.value });
                                            if (error) setError(null);
                                        }} 
                                        required 
                                        className={`${inputStyle} pl-10`} 
                                        placeholder="ana.perez@empresa.com" 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="flex text-sm font-medium text-textoMuteado mb-1 items-center justify-between">
                                    Contraseña Provisional
                                    <span className="text-[10px] text-gray-500 font-normal">Mín. 8 caracteres alfanuméricos</span>
                                </label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                    <input 
                                        type={mostrarPassword ? "text" : "password"}
                                        value={nuevoUsuario.password} 
                                        onChange={(e) => {
                                            setNuevoUsuario({ ...nuevoUsuario, password: e.target.value });
                                            if (error) setError(null);
                                        }} 
                                        required 
                                        minLength="8" 
                                        className={`${inputStyle} pl-10 pr-10`}
                                        placeholder="••••••••" 
                                    />
                                    
                                    {/* Botón de visibilidad del Password */}
                                    <button
                                        type="button"
                                        onClick={() => setMostrarPassword(!mostrarPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors"
                                    >
                                        {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                {nivelSeguridadActual && (
                                    <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[11px] text-textoMuteado font-medium">Nivel de Seguridad:</span>
                                            <span className={`text-xs font-bold ${nivelSeguridadActual.texto}`}>
                                                {nivelSeguridadActual.nivel}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${nivelSeguridadActual.color} transition-all duration-500 ease-out`} 
                                                style={{ width: nivelSeguridadActual.ancho }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-textoMuteado mb-1">Nivel de Acceso (Rol)</label>
                                    <select 
                                        value={nuevoUsuario.rol} 
                                        onChange={(e) => {
                                            setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value });
                                            if (error) setError(null);
                                        }} 
                                        required 
                                        className={inputStyle}
                                    >
                                        <option value="asesor" className="bg-gray-800">Asesor (Operativo)</option>
                                        <option value="admin" className="bg-gray-800">Admin (Gerencia)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-textoMuteado mb-1">Ítem / CI (Opcional)</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                        <input 
                                            type="text" 
                                            value={nuevoUsuario.item} 
                                            onChange={(e) => {
                                                setNuevoUsuario({ ...nuevoUsuario, item: e.target.value });
                                                if (error) setError(null);
                                            }} 
                                            className={`${inputStyle} pl-10`} 
                                            placeholder="Código interno" 
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="pt-4 border-t border-gray-800 flex justify-end">
                            <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transition-colors">
                                <Shield size={20} /> Guardar Credenciales
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-tarjeta rounded-2xl shadow-xl border border-gray-800 overflow-hidden mt-6">
                <div className="p-5 border-b border-gray-800 bg-gray-800/50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-textoBase flex items-center gap-2">
                        <BadgeCheck className="text-purple-400" size={20} /> Directorio de Personal Autorizado
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 border-b border-gray-700">
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Empleado</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider">Permisos</th>
                                <th className="px-6 py-4 text-sm font-semibold text-textoMuteado uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {usuarios.map((u) => {
                                const isAdmin = u.rol === 'admin';
                                return (
                                <tr key={u.id_usuario} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 text-textoMuteado font-mono text-sm">
                                        #{u.id_usuario}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-textoBase flex items-center gap-2">
                                            {u.nombre}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {u.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border 
                                            ${isAdmin 
                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                            }
                                        `}>
                                            {isAdmin ? <Shield size={12} /> : <Users size={12} />}
                                            {u.rol?.toUpperCase() || 'INDEFINIDO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleEliminar(u.id_usuario)} 
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-peligro/10 text-peligro hover:bg-peligro hover:text-white border border-peligro/20 rounded-md transition-colors text-xs font-bold"
                                        >
                                            <Trash2 size={14} /> Baja
                                        </button>
                                    </td>
                                </tr>
                            )})}
                            {usuarios.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-textoMuteado">
                                        No se encontraron usuarios activos.
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

export default UsuariosPage;