import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axios';
import ReCAPTCHA from 'react-google-recaptcha';
import logoEmpresa from '../assets/logo-previcor.png';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    
    // <-- Nuevo estado para controlar la visibilidad
    const [mostrarPassword, setMostrarPassword] = useState(false); 
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        if (!captchaToken) {
            setError('Por favor, resuelve el CAPTCHA para verificar que no eres un robot.');
            return;
        }

        try {
            const respuesta = await clienteAxios.post('/auth/login', { email, password, captchaToken });
            
            localStorage.setItem('token', respuesta.data.token);
            localStorage.setItem('rol', respuesta.data.usuario.rol);
        
            if (respuesta.data.usuario.rol === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/clientes');
            }
            
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al conectar con el servidor');
        }
    };

    return (
        /* min-h-screen asegura que el fondo ocupe toda la pantalla. Flex centra la tarjeta */
        <div className="min-h-screen flex items-center justify-center p-4 bg-fondo">
            
            {/* Contenedor principal de la tarjeta de Login */}
            <div className="w-full max-w-md p-8 bg-tarjeta border border-gray-700 rounded-2xl shadow-2xl">
                
                {/* --- SECCIÓN DEL LOGO --- */}
                <div className="flex justify-center mb-4">
                    <img 
                        src={logoEmpresa} 
                        alt="Logo de Previcor" 
                        className="w-full h-16 object-contain bg-white rounded-lg p-1 shadow-sm" 
                    />
                </div>
                {/* ------------------------------ */}

                <h2 className="text-2xl md:text-3xl font-bold text-center text-textoBase mb-6 tracking-tight">
                    Sistema de Asesoramiento de Seguros - Previcor
                </h2>
                
                {error && (
                    <div className="bg-peligro/20 border border-peligro text-peligro px-4 py-3 rounded-lg mb-6 text-center text-sm font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Campo Email */}
                    <div>
                        <label className="block text-sm font-medium text-textoMuteado mb-1">
                            Email Institucional
                        </label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full px-4 py-3 bg-fondo border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primario text-textoBase transition-colors"
                            placeholder="usuario@seguros.com"
                            required
                        />
                    </div>

                    {/* Campo Contraseña */}
                    <div>
                        <label className="block text-sm font-medium text-textoMuteado mb-1">
                            Contraseña
                        </label>
                        {/* Envolvemos en un relative para poder flotar el botón a la derecha */}
                        <div className="relative">
                            <input 
                                type={mostrarPassword ? "text" : "password"} // <-- Alterna el tipo
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                /* Se añade pr-12 para dar espacio al icono y que el texto no se oculte detrás */
                                className="w-full px-4 py-3 pr-12 bg-fondo border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primario text-textoBase transition-colors"
                                placeholder="••••••••"
                                required
                            />
                            {/* Botón de visibilidad con posicionamiento absoluto */}
                            <button
                                type="button"
                                onClick={() => setMostrarPassword(!mostrarPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors focus:outline-none"
                            >
                                {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* CAPTCHA con tema oscuro integrado */}
                    <div className="flex justify-center pt-2">
                        <ReCAPTCHA
                            sitekey="6Lf5UQ8tAAAAAA6ZBVSQiWm4VhXsD0SoubiN03N2"
                            onChange={(token) => setCaptchaToken(token)}
                            theme="dark"
                        />
                    </div>

                    {/* Botón de envío estilizado */}
                    <button 
                        type="submit" 
                        className="w-full py-3 mt-2 bg-primario hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                    >
                        Entrar al Sistema
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;