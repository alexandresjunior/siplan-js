import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from './paginas/Dashboard';
import Login from './paginas/Login';
import Indicadores from "./paginas/Cadastros/Indicadores";
import Usuario from './paginas/Usuario/UsuariosCadastrados';
import ProtectedRoute from './componentes/ProtecaoDeRota/index';
import NovoUsuario from "./paginas/Usuario/NovoUsuario";
import ConfigurarNovoUsuario from "./paginas/Usuario/ConfigurarNovoUsuario";
import Objetivos from "./paginas/Cadastros/Objetivos";
import LixeiraIndicadores from "./paginas/Configuracoes/LixeiraIndicadores";
import CalendarioReunioes from "./paginas/Aderencia/CalendarioReunioes";
import Comites from "./paginas/Cadastros/Comites";
import DataFechamento from "./paginas/Aderencia/DataFechamento";
import './App.css';
import TransferenciaValores from "./paginas/TransferenciaValores";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

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
              <TransferenciaValores/>
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
              <Comites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cadastros/objetivos"
          element={
            <ProtectedRoute>
              <Objetivos />
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
              <LixeiraIndicadores />
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
              <DataFechamento />
            </ProtectedRoute>
          }
        />

        <Route
          path="/aderencia/calendario-reunioes"
          element={
            <ProtectedRoute>
              <CalendarioReunioes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios/novo"
          element={<NovoUsuario />} />

        <Route
          path="/cadastros/configurar-usuario"
          element={<ConfigurarNovoUsuario />}
        />


      </Routes>
    </BrowserRouter>


  );
}

export default App;