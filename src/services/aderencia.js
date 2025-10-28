import api from "./api";

export const buscarCalendarioPaginado = async (pagina, tamanho) => {
  try {
    const resposta = await api.get("/aderencia/diretoriasPaginada", {
      params: {
        page: pagina,
        linesPerPage: tamanho,
      },
    });

    return resposta.data;
  } catch (error) {
    console.error(
      "Erro ao buscar calendário:",
      error.resposta?.data || error.message
    );
    throw new Error(
      error.resposta?.data?.message ||
        "Falha ao buscar o calendário de reuniões."
    );
  }
};

export const salvarCalendario = async (dadosCalendario) => {
  try {
    const resposta = await api.post("/aderencia", dadosCalendario);
    return resposta.data;
  } catch (error) {
    console.error(
      "Erro ao salvar calendário:",
      error.resposta?.data || error.message
    );
    throw new Error(
      error.resposta?.data?.message ||
        "Falha ao salvar o registro do calendário."
    );
  }
};

export const excluirCalendario = async (id) => {
  try {
    const resposta = await api.delete(`/aderencia/${id}`);
    return resposta.data;
  } catch (error) {
    console.error(
      "Erro ao excluir calendário:",
      error.resposta?.data || error.message
    );
    throw new Error(
      error.resposta?.data?.message ||
        "Falha ao excluir o registro do calendário."
    );
  }
};
