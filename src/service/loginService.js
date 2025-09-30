import axios from "axios";


async function servicoLogin(nomeUsuario, senha, navegar, definirErro) {
  try {
    const resposta = await axios.post(
      "http://localhost:8098/authenticate/auth",
      {
        login: nomeUsuario,
        senha: senha,
      }
    );

    const dados = resposta.data;

    if (dados.sucesso) {
      localStorage.setItem("token", dados.objeto);

      axios.defaults.headers.common["Authorization"] = `Bearer ${dados.objeto}`;

      navegar("/dashboard");
    } else {
      definirErro(dados.mensagem || "Usuário ou senha inválidos.");
    }
  } catch (erro) {
    console.error("Erro ao autenticar:", erro);

    if (erro.response) {
      if (erro.response.status === 401 || erro.response.status === 400) {
        definirErro("Usuário ou senha inválidos.");
      } 
      else if (erro.response.data && erro.response.data.mensagem) {
        definirErro(erro.response.data.mensagem);
      } 
      else {
        definirErro("Erro no servidor. Tente novamente mais tarde.");
      }
    } else {
      definirErro("Erro de conexão com o servidor");
    }
  }
}

function realizarLogout(navegar) {
  localStorage.removeItem("token");

  delete axios.defaults.headers.common["Authorization"];

  navegar("/");
}

export default { login: servicoLogin, logout: realizarLogout };