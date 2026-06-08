/** @type {import('tailwindcss').Config} */
export default {
  // Le decimos a Tailwind que escanee todos tus componentes JSX
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Activamos el modo oscuro por clase para un control total
  darkMode: 'class', 
  theme: {
    extend: {
      // Paleta de colores personalizada para la empresa
      colors: {
        fondo: '#0f172a',       // Un azul pizarra casi negro, excelente para la vista
        tarjeta: '#1e293b',     // Un gris un poco más claro para elevar las cartas del dashboard
        primario: '#3b82f6',    // Azul corporativo brillante para botones de acción
        secundario: '#10b981',  // Verde esmeralda para el dinero e indemnizaciones
        peligro: '#ef4444',     // Rojo para las pólizas vencidas o alertas
        textoBase: '#f8fafc',   // Blanco humo para que las letras no cansen la vista
        textoMuteado: '#94a3b8' // Gris claro para subtítulos y fechas
      }
    },
  },
  plugins: [],
}