import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ClientesPage from './pages/ClientesPage';
import ContratosPage from './pages/ContratosPage';
import AseguradorasPage from './pages/AseguradorasPage';
import PolizasPage from './pages/PolizasPage';
import SiniestrosPage from './pages/SiniestrosPage';
import LoginPage from './pages/LoginPage';
import UsuariosPage from './pages/UsuariosPage';
import LogsPage from './pages/LogsPage'; 

const RutaPrivada = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/dashboard" element={
          <RutaPrivada><Layout><Dashboard /></Layout></RutaPrivada>
        } />
        <Route path="/clientes" element={
          <RutaPrivada><Layout><ClientesPage /></Layout></RutaPrivada>
        } />
        <Route path="/contratos" element={
          <RutaPrivada><Layout><ContratosPage /></Layout></RutaPrivada>
        } />
        <Route path="/aseguradoras" element={
          <RutaPrivada><Layout><AseguradorasPage /></Layout></RutaPrivada>
        } />
        <Route path="/polizas" element={
          <RutaPrivada><Layout><PolizasPage /></Layout></RutaPrivada>
        } />
        <Route path="/siniestros" element={
          <RutaPrivada><Layout><SiniestrosPage /></Layout></RutaPrivada>
        } />
        <Route path="/usuarios" element={
          <RutaPrivada><Layout><UsuariosPage /></Layout></RutaPrivada>
        } />
        
        <Route path="/logs" element={
          <RutaPrivada><Layout><LogsPage /></Layout></RutaPrivada>
        } />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;