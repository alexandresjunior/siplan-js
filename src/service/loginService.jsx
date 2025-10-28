import axios from "axios";

async function loginService(username, password, navigate, setErro) {
  try {
    const response = await axios.post(
      "http://localhost:8098/authenticate/auth",
      {
        login: username,
        senha: password,
      }
    );

    const data = response.data;
    console.log("Resposta da API:", data);

    if (data.sucesso) {
      // Salva o token no localStorages
      localStorage.setItem("token", data.objeto);

      // Configura o axios para enviar o token em todas as requisições
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.objeto}`;

      // Redireciona para dashboard
      navigate("/dashboard");
    } else {
      setErro(data.mensagem || "Usuário ou senha inválidos.");
    }
  } catch (error) {
    console.error("Erro ao autenticar:", error);

    if (error.response) {
      // Quando o back retorna 401 (ou 400 dependendo da API), é erro de login
      if (error.response.status === 401 || error.response.status === 400) {
        setErro("Usuário ou senha inválidos.");
      } 
      // Caso o back tenha retornado outra mensagem
      else if (error.response.data && error.response.data.mensagem) {
        setErro(error.response.data.mensagem);
      } 
      // Erro genérico vindo do servidor
      else {
        setErro("Erro no servidor. Tente novamente mais tarde.");
      }
    } else {
      // Erro de rede/conexão
      setErro("Erro de conexão com o servidor");
    }
  }
}

function fazerLogout(navigate) {
  //remove token do localStorage:
  localStorage.removeItem("token");

  //remove o cabeçalho Authorization das configurações do Axios:
  delete axios.defaults.headers.common["Authorization"];

  //redireciona pra tela de login:
  navigate("/");
}

export default {login: loginService, logout: fazerLogout};
