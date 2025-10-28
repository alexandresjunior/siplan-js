export const buscarConfiguracoes = async (
  setters,
  paginaAtual,
  tamanhoPagina,
  tipoConfiguracao,
  URL_API
) => {
  setters.setCarregando(true);
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para acessar esta página.");
      return;
    }

    const resposta = await fetch(
      `${URL_API}?tipoConfiguracao=${tipoConfiguracao}&page=${paginaAtual}&size=${tamanhoPagina}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);

    const dados = await resposta.json();

    const dadosMapeados = dados.content.map((item) => ({
      id: item.id,
      nome: item.nomeDiretoria,
      ciclo: item.nomeCiclo,
      ano: item.ano,
      dataFechamento: item.dataFechamento
        ? new Date(item.dataFechamento).toLocaleDateString("pt-BR")
        : "N/A",
      tipoConfiguracao: item.tipoConfiguracao,

      raw: {
        id: item.id,
        ano: item.ano,
        ciclo: item.ciclo,
        diretoria: item.diretoria,
        dataFechamento: item.dataFechamento,
        tipoConfiguracao: item.tipoConfiguracao,
      },
    }));

    setters.setLista(dadosMapeados);
    setters.setTotalPaginas(dados.totalPages);
    setters.setTotalElementos(dados.totalElements);
  } catch (erro) {
    console.error(
      `Erro ao carregar configurações (tipo ${tipoConfiguracao}):`,
      erro
    );
  } finally {
    setters.setCarregando(false);
  }
};

export const criarConfiguracao = async (novaConfig, URL_API_BASE) => {
  const token = localStorage.getItem("token");
  const resposta = await fetch(URL_API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(novaConfig),
  });
  if (!resposta.ok) {
    const textoErro = await resposta.text();
    throw new Error(`Erro ao criar: ${resposta.status} - ${textoErro}`);
  }
  return await resposta.json();
};

export const atualizarConfiguracao = async (configAtualizada, URL_API_BASE) => {
  const token = localStorage.getItem("token");
  const resposta = await fetch(URL_API_BASE, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(configAtualizada),
  });
  if (!resposta.ok) {
    const textoErro = await resposta.text();
    throw new Error(`Erro ao atualizar: ${resposta.status} - ${textoErro}`);
  }
  return await resposta.json();
};

export const excluirConfiguracao = async (id, URL_API_BASE) => {
  const token = localStorage.getItem("token");
  const resposta = await fetch(`${URL_API_BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resposta.ok) throw new Error(`Erro ao excluir: ${resposta.status}`);
};

export const buscarCiclos = async (URL_CICLOS) => {
  const token = localStorage.getItem("token");
  const resposta = await fetch(URL_CICLOS, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resposta.ok) throw new Error("Erro ao buscar ciclos");
  return await resposta.json();
};

export const buscarDiretorias = async (URL_DIRETORIAS) => {
  const token = localStorage.getItem("token");
  const resposta = await fetch(URL_DIRETORIAS, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resposta.ok) throw new Error("Erro ao buscar diretorias");
  return await resposta.json();
};
