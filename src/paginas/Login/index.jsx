import { useState } from "react";
import logoSiplan from "../../assets/imagens/siplan_logo.png";
import logoCompesa from "../../assets/imagens/compesa_logo.png";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const enviarFormulario = () => {
    console.log({ username, password });
    navigate("/dashboard");
  };

  return (
    <div className="bg-container">
      <div className="container login-container col-12 col-sm-8 col-md-6 col-lg-3">
        <img src={logoSiplan} alt="SIPLAN" width="200px" />

        <p className="text-center texto-credencial">Insira suas credenciais de rede</p>

        <div className="row g-3 align-items-center mb-5">
          <div className="col-12">
            <input
              type="text"
              className="form-control"
              id="username"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="row g-3 align-items-center">
          <div className="col-12">
            <input
              type="password"
              id="senha"
              className="form-control"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button type="button" className="btn btn-primary" onClick={enviarFormulario}>
          ENTRAR
        </button>

        <img src={logoCompesa} alt="COMPESA" width="80px" />
      </div>
    </div>
  );
}
export default Login;
