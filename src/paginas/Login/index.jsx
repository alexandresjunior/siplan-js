import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginService from "../../service/loginService";
import logoSiplan from "../../assets/imagens/siplan_logo.png";
import logoCompesa from "../../assets/imagens/compesa_logo.png";
import bgLogin from "../../assets/imagens/bgLogin.png"; 

function Login() {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  const navegar = useNavigate();
  const { login } = loginService;

  const manipularEnvio = () => {
    console.log("Botão ENTRAR clicado. Usuário:", nomeUsuario, "Senha:", senha);
    if (!nomeUsuario || !senha) {
      setMensagemErro("Por favor, preencha usuário e senha.");
      return;
    }
    login(nomeUsuario, senha, navegar, setMensagemErro);
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

        {mensagemErro && <div className="alert alert-danger">{mensagemErro}</div>}

        <div className="mb-3">
          <input
            type="text"
            id="usuario"
            name="usuario"
            className="form-control mb-3"
            placeholder="Usuário"
            value={nomeUsuario}
            onChange={(e) => setNomeUsuario(e.target.value)}
            aria-label="Usuário"
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            id="senha"
            name="senha"
            className="form-control mb-3"
            placeholder="********"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            aria-label="Senha"
          />
        </div>

        <button
          type="button"
          className="btn btn-primary w-100 fw-bold"
          onClick={manipularEnvio}
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