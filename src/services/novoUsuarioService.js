import api from "./api";

export const obterUsuarioPorLogin = async (login) => {
  try {
    const token = localStorage.getItem("token");

    const { data } = await api.get(`/usuariosip/busca/por-login`, {
      params: {
        login: login,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return data;
  } catch (erro) {
    if (erro.response && erro.response.status === 404) {
      throw new Error(`O login de rede '${login}' não está cadastrado.`);
    }
    throw erro;
  }
};
