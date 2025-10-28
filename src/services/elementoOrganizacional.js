import api from "./api";

export const buscarDiretoriasPorAno = async (ano) => {
  try {
    const response = await api.get(
      `/elementoOrganizacional/apenasDiretorias/${ano}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao buscar diretorias:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Falha ao buscar diretorias."
    );
  }
};

export const buscarUnidadesPorDiretoria = async (ano, idDiretoria) => {
  try {
    const response = await api.get(
      `/elementoOrganizacional/nome/ano/null/${ano}/${idDiretoria}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao buscar unidades:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Falha ao buscar unidades."
    );
  }
};
