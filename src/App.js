import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from './paginas/Login';
import ProtectedRoute from './componentes/ProtecaoDeRota/index';
import './App.css';
import { AuthProvider } from './contextos/AuthContext';

const Dashboard = lazy(() => import('./paginas/Dashboard'));
const Usuario = lazy(() => import('./paginas/Usuario/UsuariosCadastrados'));
const NovoUsuario = lazy(() => import('./paginas/Usuario/NovoUsuario'));
const ConfigurarNovoUsuario = lazy(() => import('./paginas/Usuario/ConfigurarNovoUsuario'));
const Indicadores = lazy(() => import('./paginas/Cadastros/Indicadores'));
const Objetivos = lazy(() => import('./paginas/Cadastros/Objetivos'));
const Comites = lazy(() => import('./paginas/Cadastros/Comites'));
const TransferenciaValores = lazy(() => import('./paginas/TransferenciaValores'));
const LixeiraIndicadores = lazy(() => import('./paginas/Configuracoes/LixeiraIndicadores'));
const DataFechamento = lazy(() => import('./paginas/Aderencia/DataFechamento'));
const CalendarioReunioes = lazy(() => import('./paginas/Aderencia/CalendarioReunioes'));

// Fallback de carregamento enquanto o ficheiro do componente é descarregado.
const Carregando = () => <div className="loading-spinner">A carregar...</div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Carregando />}>
          <Routes>
            {/* Rota Pública */}
            <Route path="/" element={<Login />} />

            {/* O componente ProtectedRoute atua como um invólucro 
            para todas estas rotas a fim de melhorar a performance. */}
            <Route element={<ProtectedRoute />}>
              
              <Route path="/dashboard" element={<Dashboard />} />
              
              <Route path="/usuarios/novo" element={<NovoUsuario />} />

              {/* Sub-agrupamento para o domínio de Cadastros */}
              <Route path="/cadastros">
                <Route path="usuarioscadastrados" element={<Usuario />} />
                <Route path="indicadores" element={<Indicadores />} />
                <Route path="transferencia-valores" element={<TransferenciaValores />} />
                <Route path="comites" element={<Comites />} />
                <Route path="objetivos" element={<Objetivos />} />
                <Route path="configurar-usuario" element={<ConfigurarNovoUsuario />} />
              </Route>

              {/* Sub-agrupamento para o domínio de Configurações */}
              <Route path="/configuracoes">
                <Route path="lixeira-indicadores" element={<LixeiraIndicadores />} />
              </Route>

              {/* Sub-agrupamento para o domínio de Aderência */}
              <Route path="/aderencia">
                <Route path="data-fechamento" element={<DataFechamento />} />
                <Route path="calendario-reunioes" element={<CalendarioReunioes />} />
              </Route>

            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;