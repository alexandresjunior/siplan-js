export const buscarComites = async (
  definirCarregando,
  definirComites,
  definirTotalPaginas,
  definirTotalElementos,
  paginaAtual,
  tamanhoPagina,
  URL_API
) => {
  definirCarregando(true);
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para acessar esta página.");
      return;
    }

    const resposta = await fetch(
      `${URL_API}?page=${paginaAtual}&size=${tamanhoPagina}&sort=nome,asc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!resposta.ok) {
      const textoErro = await resposta.text();
      throw new Error(`Erro HTTP: ${resposta.status} - ${textoErro}`);
    }

    const dados = await resposta.json();

    const comitesMapeados = dados.content.map((comite) => ({
      id: comite.id,
      nome: comite.nome,
      sigla: comite.sigla || "N/A",
      descricao: comite.descricao || "Sem descrição",
      comiteRisco: comite.comiteRisco,
      dtCriacao: comite.dtCriacao
        ? new Date(comite.dtCriacao).toLocaleDateString("pt-BR")
        : "N/A",
      dtUltAtualizacao: comite.dtUltAtualizacao
        ? new Date(comite.dtUltAtualizacao).toLocaleDateString("pt-BR")
        : "N/A",
    }));

    definirComites(comitesMapeados);
    definirTotalPaginas(dados.totalPages);
    definirTotalElementos(dados.totalElements);
  } catch (erro) {
    console.error("Erro ao carregar comitês:", erro);
    alert("Ocorreu um erro ao carregar os comitês. Verifique o console.");
  } finally {
    definirCarregando(false);
  }
};

export const criarComite = async (novoComite, URL_API_BASE) => {
  const token = localStorage.getItem("token");
  const resposta = await fetch(URL_API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(novoComite),
  });

  if (!resposta.ok) {
    const textoErro = await resposta.text();
    throw new Error(`Erro ao criar comitê: ${resposta.status} - ${textoErro}`);
  }

  return await resposta.json();
};

export const atualizarComite = async (comiteAtualizado, URL_API_BASE) => {
  const token = localStorage.getItem("token");
  const resposta = await fetch(URL_API_BASE, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(comiteAtualizado),
  });

  if (!resposta.ok) {
    const textoErro = await resposta.text();
    throw new Error(
      `Erro ao atualizar comitê: ${resposta.status} - ${textoErro}`
    );
  }

  return await resposta.json();
};

export const excluirComite = async (idComite, URL_API_BASE) => {
  const token = localStorage.getItem("token");
  const resposta = await fetch(`${URL_API_BASE}/${idComite}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!resposta.ok) {
    const textoErro = await resposta.text();
    throw new Error(
      `Erro ao excluir comitê: ${resposta.status} - ${textoErro}`
    );
  }
};
