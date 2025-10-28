import api from "./api";
const URL_BASE = "http://localhost:8098/indicador";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert(
      "Token de autenticação não encontrado. Por favor, faça o login novamente."
    );
    throw new Error("Token não encontrado");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const buscarIndicadoresExcluidosPaginados = async (
  idElementoOrganizacional,
  pagina,
  tamanho
) => {
  try {
    const response = await api.get(
      `/indicador/lixeira/paginados/${idElementoOrganizacional}`,
      {
        params: {
          page: pagina,
          size: tamanho,
          sort: "nomeIndicador,asc",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao buscar indicadores excluídos:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || `Erro ao buscar indicadores excluídos.`
    );
  }
};

export const restaurarIndicador = async (idIndicador) => {
  try {
    await api.post("/indicador/restaurar", idIndicador);
  } catch (error) {
    console.error(
      "Erro ao restaurar indicador:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Falha ao restaurar o indicador."
    );
  }
};

export const excluirIndicadorPermanentemente = async (idIndicador) => {
  try {
    await api.delete(`/indicador/excluirIndicador/${idIndicador}`);
  } catch (error) {
    console.error(
      "Erro ao excluir indicador:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Falha ao excluir o indicador permanentemente."
    );
  }
};

export const buscarCiclos = async () => {
  try {
    const response = await api.get("/indicador/ciclos");
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao buscar ciclos:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Falha ao buscar ciclos.");
  }
};
