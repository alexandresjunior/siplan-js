import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginService from "../../service/loginService";
import logoSiplan from "../../assets/imagens/siplan_logo.png";
import logoCompesa from "../../assets/imagens/compesa_logo.png";
import bgLogin from "../../assets/imagens/bgLogin.png"; 

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  const handleSubmit = () => {
    loginService(username, password, navigate, setErro);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        backgroundImage: `url(${bgLogin})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div
        className="card shadow p-4 text-center"
        style={{
          maxWidth: "350px",
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.85)", 
        }}
      >
        <div className="text-center mb-3">
          <img src={logoSiplan} alt="SIPLAN" width="200px" />
        </div>

        <p className="text-muted-small">Insira suas credenciais de rede</p>

        {erro && <div className="alert alert-danger">{erro}</div>}

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          className="btn btn-primary w-100 fw-bold"
          onClick={handleSubmit}
        >
          ENTRAR
        </button>

        <div className="text-center mt-3">
          <img src={logoCompesa} alt="Compesa" width="80" />
        </div>
      </div>
    </div>
  );
}

export default Login;
