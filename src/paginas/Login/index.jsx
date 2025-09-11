import { useState } from "react";
import logoSiplan from "../../assets/imagens/siplan_logo.png";
import logoCompesa from "../../assets/imagens/compesa_logo.png";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  const enviarFormulario = async () => {

    try {
      const response = await fetch("http://localhost:8098/authenticate/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: username,
          senha: password,
        }),
      });

      const data = await response.json();
      console.log("Resposta da API:", data);

      if (data.sucesso) {
        localStorage.setItem("token", data.objeto);

        navigate("/dashboard");
      } else {
        setErro(data.mensagem || "Falha na autenticação");
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor");
    }
  };

  return (
    <div className="bg-container">
      <div className="container login-container col-12 col-sm-8 col-md-6 col-lg-3">
        <img src={logoSiplan} alt="SIPLAN" width="200px" />

        <p className="text-center texto-credencial">Insira suas credenciais de rede</p>

        {erro && <div className="alert alert-danger">{erro}</div>}

        <div className="row g-3 align-items-center mb-5">
          <div className="col-12">
            <input
              type="text"
              className="form-control"
              id="usuario"
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

        <button type="button" class="btn btn-primary" onClick={enviarFormulario}>
          ENTRAR
        </button>


        <img src={logoCompesa} alt="Compesa" width="80" />

      </div>

    </div>
  );
}

export default Login;
