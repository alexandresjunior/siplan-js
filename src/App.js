import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from './paginas/Dashboard';
import Login from './paginas/Login';
import './App.css';
import Indicadores from "./paginas/Cadastros/Indicadores";
import Usuario from './paginas/Usuario/UsuariosCadastrados';
import ProtectedRoute from './componentes/ProtecaoDeRota/index';
import NovoUsuario from "./paginas/Usuario/NovoUsuario";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública (sem autenticação) */}
        <Route path="/" element={<Login />} />

        {/* Rotas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cadastros/usuarioscadastrados"
          element={
            <ProtectedRoute>
              <Usuario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cadastros/indicadores"
          element={
            <ProtectedRoute>
              <Indicadores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cadastros/valores-indicadores"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cadastros/transferencia-valores"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cadastros/ata-reunioes"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cadastros/comites"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cadastros/objetivos"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes/importacao-dados"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes/controle-acesso"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes/pdf-indicadores"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes/pdf-pareto"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes/resumos-ciclo"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes/lixeira-indicadores"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analise/indicadores"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analise/pareto"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/aderencia/verificacao"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/aderencia/data-fechamento"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/aderencia/calendario-reunioes"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        
      <Route 
        path="/usuarios/novo" 
        element={<NovoUsuario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;