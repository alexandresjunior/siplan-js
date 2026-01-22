import api from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Token de autenticação não encontrado. Por favor, faça o login novamente.");
    throw new Error("Token não encontrado");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};


export const buscarTiposIndicador = async () => {
  try {
    const response = await api.get(`/indicador/tiposIndicador`);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao buscar tipos de indicador.");
  }
};

export const buscarSentidosIndicador = async () => {
  try {
    const response = await api.get(`/indicador/sentidosIndicador`);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao buscar sentidos de indicador.");
  }
};

export const buscarCiclos = async () => {
  try {
    const response = await api.get("/indicador/ciclos");
    return response.data;
  } catch (error) {
    throw new Error("Falha ao buscar ciclos.");
  }
};

export const buscarRiscosPorAno = async (ano) => {
  try {
    const response = await api.get(`/risco/list-by-ano/${ano}`);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao buscar riscos.");
  }
};

export const buscarObjetivosPorAno = async (ano) => {
  try {
    const response = await api.get(`/objetivo/list-by-ano/${ano}`);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao buscar objetivos estratégicos.");
  }
};


export const buscarIndicadorPorNomeLike = async (termo, idUnidade) => {
  try {
    let url = `/indicador/nome/like/${termo}`;
    
    if (idUnidade) {
        url = `/indicador/nome/like/${termo}/${idUnidade}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};


export const buscarIndicadoresPaginados = async (idUnidade, ano, pagina = 0, tamanho = 10, listaIdsFiltro = []) => {
  try {
    const params = {
        page: pagina,
        size: tamanho,
        sort: "nomeIndicador,asc"
    };

    if (listaIdsFiltro && listaIdsFiltro.length > 0) {
        params.idsIndicadores = listaIdsFiltro.join(','); 
    }

    
    const response = await api.get(`/indicador/paginados/${idUnidade}`, { params });
    return response.data;

  } catch (error) {
    console.error("Erro ao buscar indicadores:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Erro ao carregar indicadores.");
  }
};

export const buscarIndicadoresExcluidosPaginados = async (idElementoOrganizacional, pagina, tamanho) => {
  try {
    const response = await api.get(`/indicador/lixeira/paginados/${idElementoOrganizacional}`, {
      params: {
        page: pagina,
        size: tamanho,
        sort: "nomeIndicador,asc",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar lixeira:", error);
    throw new Error(error.response?.data?.message || "Erro ao buscar indicadores excluídos.");
  }
};


export const salvarIndicador = async (indicador) => {
  console.log('print de salvar indicador')
  try {

    const url = '/indicador/manual'; 
    
    const response = await api.post(url, indicador);
    console.log('caiu aqui')
    return response.data;

  } catch (error) {
    console.error("Erro ao salvar:", error);
    throw new Error(error.response?.data?.message || "Erro ao salvar indicador.");
  }
};

export const excluirIndicadorLogico = async (idIndicador) => {
  try {
    await api.post(`/indicador/excluirLogicoIndicador`, idIndicador, { headers: getAuthHeaders() });
  } catch (error) {
    console.error("Erro exclusão lógica:", error);
    throw new Error("Erro ao enviar para lixeira.");
  }
};

export const restaurarIndicador = async (idIndicador) => {
  try {
    await api.post("/indicador/restaurar", idIndicador, { headers: getAuthHeaders() });
  } catch (error) {
    console.error("Erro ao restaurar:", error);
    throw new Error("Falha ao restaurar o indicador.");
  }
};

export const excluirIndicadorPermanentemente = async (idIndicador) => {
  try {
    await api.delete(`/indicador/excluirIndicador/${idIndicador}`, { headers: getAuthHeaders() });
  } catch (error) {
    console.error("Erro ao excluir permanentemente:", error);
    throw new Error("Falha ao excluir o indicador permanentemente.");
  }
};


export const buscarVariaveisDoIndicador = async (idIndicador) => {
  try {
    const response = await api.get(`/indicador/variaveis/${idIndicador}`, {
      headers: getAuthHeaders()
    });
    return response.data
  } catch (error) {
    console.error("Erro ao buscar variáveis de indicador: ", error);
    return []
  }
}