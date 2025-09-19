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
    console.log("Resposta da API:", dados);

    if (dados.sucesso) {
      // Salva o token no localStorage
      localStorage.setItem("token", dados.objeto);

      // Configura o axios para enviar o token em todas as requisições
      axios.defaults.headers.common["Authorization"] = `Bearer ${dados.objeto}`;

      // Redireciona para dashboard
      navegar("/dashboard");
    } else {
      definirErro(dados.mensagem || "Usuário ou senha inválidos.");
    }
  } catch (erro) {
    console.error("Erro ao autenticar:", erro);

    if (erro.response) {
      // Quando o back retorna 401 (ou 400 dependendo da API), é erro de login
      if (erro.response.status === 401 || erro.response.status === 400) {
        definirErro("Usuário ou senha inválidos.");
      } 
      // Caso o back tenha retornado outra mensagem
      else if (erro.response.data && erro.response.data.mensagem) {
        definirErro(erro.response.data.mensagem);
      } 
      // Erro genérico vindo do servidor
      else {
        definirErro("Erro no servidor. Tente novamente mais tarde.");
      }
    } else {
      // Erro de rede/conexão
      definirErro("Erro de conexão com o servidor");
    }
  }
}

function realizarLogout(navegar) {
  // Remove token do localStorage
  localStorage.removeItem("token");

  // Remove o cabeçalho Authorization das configurações do Axios
  delete axios.defaults.headers.common["Authorization"];

  // Redireciona para tela de login
  navegar("/");
}

export default { login: servicoLogin, logout: realizarLogout };