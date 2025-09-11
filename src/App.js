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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
