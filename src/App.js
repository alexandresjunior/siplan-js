import './App.css';
import Login from './app/Login';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from './paginas/Dashboard';

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
