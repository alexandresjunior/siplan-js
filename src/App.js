import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from './paginas/Dashboard';
import Login from './paginas/Login';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cadastros/indicadores" element={<></>} />
        <Route path="/cadastros/valores-indicadores" element={<></>} />
        <Route path="/cadastros/transferencia-valores" element={<></>} />
        <Route path="/cadastros/ata-reunioes" element={<></>} />
        <Route path="/cadastros/comites" element={<></>} />
        <Route path="/cadastros/objetivos" element={<></>} />
        <Route path="/configuracoes/importacao-dados" element={<></>} />
        <Route path="/configuracoes/controle-acesso" element={<></>} />
        <Route path="/configuracoes/pdf-indicadores" element={<></>} />
        <Route path="/configuracoes/pdf-pareto" element={<></>} />
        <Route path="/configuracoes/resumos-ciclo" element={<></>} />
        <Route path="/configuracoes/lixeira-indicadores" element={<></>} />
        <Route path="/analise/indicadores" element={<></>} />
        <Route path="/analise/pareto" element={<></>} />
        <Route path="/aderencia/verificacao" element={<></>} />
        <Route path="/aderencia/data-fechamento" element={<></>} />
        <Route path="/aderencia/calendario-reunioes" element={<></>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
