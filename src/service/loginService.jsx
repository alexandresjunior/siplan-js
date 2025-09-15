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
      localStorage.setItem("token", data.objeto);
      navigate("/dashboard");
    } else {
      setErro(data.mensagem || "Falha na autenticação");
    }
  } catch (error) {
    console.error("Erro ao autenticar:", error);

    if (error.response && error.response.data && error.response.data.mensagem) {
      setErro(error.response.data.mensagem);
    } else {
      setErro("Erro de conexão com o servidor");
    }
  }
}

export default loginService;
