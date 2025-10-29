import api from "./api";

export const buscarObjetivosPaginados = async (paginaAtual, tamanhoPagina) => {
  try {
    const response = await api.get("/objetivo/lista/paginados", {
      params: {
        page: paginaAtual,
        size: tamanhoPagina,
        sort: "nome,asc",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Erro ao carregar objetivos:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message || "Erro ao carregar objetivos."
    );
  }
};

export const criarObjetivo = async (novoObjetivo) => {
  try {
    const agora = new Date();
    const payload = {
      nome: novoObjetivo.nome,
      descricao: novoObjetivo.descricao,
      dataCriacao: agora.toISOString(),
      ano: agora.getFullYear(),
    };
    const response = await api.post("/objetivo", payload);
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao criar objetivo:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Falha ao criar o objetivo."
    );
  }
};

export const editarObjetivo = async (objetivoAtualizado) => {
  try {
    const response = await api.put("/objetivo", objetivoAtualizado);

    return response.data;
  } catch (error) {
    console.error(
      "Erro ao editar objetivo:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Falha ao atualizar o objetivo."
    );
  }
};

export const excluirObjetivo = async (idObjetivo) => {
  try {
    await api.delete(`/objetivo/${idObjetivo}`);
    return true;
  } catch (error) {
    console.error(
      "Erro ao excluir objetivo:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data
    );
  }
};
