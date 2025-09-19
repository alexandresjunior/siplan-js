// usuariosCadastradosService.js (ajustado)
export const buscarUsuarios = async (definirCarregando, definirUsuarios, definirTotalPaginas, definirTotalElementos, paginaAtual, tamanhoPagina, URL_API) => {
  definirCarregando(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Nenhum token encontrado. Redirecione para login.');
      alert('Você precisa estar logado para acessar esta página.');
      return;
    }
    const resposta = await fetch(`${URL_API}?page=${paginaAtual}&size=${tamanhoPagina}&sort=nome,asc`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!resposta.ok) {
      const textoErro = await resposta.text();
      throw new Error(`Erro HTTP: ${resposta.status} - ${textoErro}`);
    }
    const dados = await resposta.json();
    console.log('Resposta da API:', dados);
    const usuariosMapeados = dados.content.map(usuario => ({
      id: usuario.id,
      nome: usuario.nome,
      lotacao: usuario.lotacaoAtual || 'Não especificada',
      administrador: usuario.administrador,
      pareto: usuario.pareto,
      atualizacaoAutomatica: usuario.atualizarLotAutomatica,
      administradorRisco: usuario.administradorRisco
    }));
    definirUsuarios(usuariosMapeados);
    definirTotalPaginas(dados.totalPages);
    definirTotalElementos(dados.totalElements);
  } catch (erro) {
    console.error('Erro ao carregar usuários:', erro);
    if (erro.message.includes('403')) {
      alert('Acesso negado (403). Verifique o token ou permissões.');
    }
  } finally {
    definirCarregando(false);
  }
};

export const buscarIndicadores = async (definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID) => {
  try {
    const token = localStorage.getItem('token');
    const resposta = await fetch(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!resposta.ok) {
      throw new Error(`Erro ao carregar indicadores: ${resposta.status}`);
    }
    const dadosUsuario = await resposta.json();
    console.log('Resposta bruta da API:', dadosUsuario);
    let indicadoresLiberados = dadosUsuario.indicadoresLiberados || [];
    const indicadoresMapeados = indicadoresLiberados.map(ind => ({
      id: ind.id,
      nome: ind.nomeIndicador || 'Sem nome',
      tipo: ind.tipoIndicador?.nome || ind.tipoIndicador || 'Sem tipo',
      indicadorExcluido: ind.indicadorExcluido || false
    }));
    const indicadoresNaoExcluidos = indicadoresMapeados.filter(ind => !ind.indicadorExcluido);
    console.log('Indicadores mapeados e filtrados:', indicadoresNaoExcluidos);
    definirIndicadores(indicadoresNaoExcluidos);
  } catch (erro) {
    console.error('Erro ao carregar indicadores:', erro);
  }
};

export const manipularAdicionarIndicador = async (definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO) => {
  const novoIndicador = {
    id: Date.now(), // ID temporário, substitua por ID real do backend
    nome: `Novo Indicador ${new Date().getTime()}`,
    tipo: "Quantitativo",
    indicadorExcluido: false
  };
  try {
    const token = localStorage.getItem('token');
    const respostaUsuario = await fetch(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!respostaUsuario.ok) throw new Error('Erro ao buscar usuário');
    const dadosUsuario = await respostaUsuario.json();
    const indicadoresAtualizados = [...(dadosUsuario.indicadoresLiberados || []), novoIndicador];
    const usuarioAtualizado = { ...dadosUsuario, indicadoresLiberados: indicadoresAtualizados };

    const respostaAtualizacao = await fetch(URL_ATUALIZAR_USUARIO, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarioAtualizado)
    });
    if (!respostaAtualizacao.ok) throw new Error('Erro ao atualizar usuário');
    buscarIndicadores(definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID); // Recarrega os indicadores
  } catch (erro) {
    console.error('Erro ao adicionar indicador:', erro);
    alert('Falha ao adicionar indicador. Tente novamente.');
  }
};

export const manipularExcluirIndicador = async (definirIndicadores, idUsuarioSelecionado, idIndicador, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO) => {
  try {
    const token = localStorage.getItem('token');
    const respostaUsuario = await fetch(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!respostaUsuario.ok) throw new Error('Erro ao buscar usuário');
    const dadosUsuario = await respostaUsuario.json();
    const indicadoresAtualizados = (dadosUsuario.indicadoresLiberados || []).filter(ind => ind.id !== idIndicador);
    const usuarioAtualizado = { ...dadosUsuario, indicadoresLiberados: indicadoresAtualizados };

    const respostaAtualizacao = await fetch(URL_ATUALIZAR_USUARIO, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarioAtualizado)
    });
    if (!respostaAtualizacao.ok) throw new Error('Erro ao atualizar usuário');
    buscarIndicadores(definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID); // Recarrega os indicadores
  } catch (erro) {
    console.error('Erro ao excluir indicador:', erro);
    alert('Falha ao excluir indicador. Tente novamente.');
  }
};

export const manipularAlterarPermissao = async (definirUsuarios, idUsuario, permissao, valor, usuarios, URL_ATUALIZAR_USUARIO) => {
  const usuarioAtualizado = usuarios.find(usuario => usuario.id === idUsuario);
  if (!usuarioAtualizado) return;

  const usuarioParaAtualizar = {
    id: usuarioAtualizado.id,
    nome: usuarioAtualizado.nome,
    login: usuarioAtualizado.login || '',
    lotacaoAtual: usuarioAtualizado.lotacao,
    administrador: permissao === 'administrador' ? valor : usuarioAtualizado.administrador,
    pareto: permissao === 'pareto' ? valor : usuarioAtualizado.pareto,
    atualizarLotAutomatica: permissao === 'atualizacaoAutomatica' ? valor : usuarioAtualizado.atualizacaoAutomatica,
    administradorRisco: permissao === 'administradorRisco' ? valor : usuarioAtualizado.administradorRisco
  };

  try {
    const token = localStorage.getItem('token');
    const resposta = await fetch(URL_ATUALIZAR_USUARIO, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarioParaAtualizar)
    });

    if (!resposta.ok) {
      const textoErro = await resposta.text();
      throw new Error(`Erro ao atualizar: ${resposta.status} - ${textoErro}`);
    }

    const dadosAtualizados = await resposta.json();
    const usuarioMapeadoAtualizado = {
      id: dadosAtualizados.id,
      nome: dadosAtualizados.nome,
      lotacao: dadosAtualizados.lotacaoAtual || 'Não especificada',
      administrador: dadosAtualizados.administrador,
      pareto: dadosAtualizados.pareto,
      atualizacaoAutomatica: dadosAtualizados.atualizarLotAutomatica,
      administradorRisco: dadosAtualizados.administradorRisco
    };
    definirUsuarios(usuarios.map(usuario => usuario.id === idUsuario ? usuarioMapeadoAtualizado : usuario));
    console.log(`Permissão ${permissao} atualizada para ${valor} no usuário ${idUsuario}`);
  } catch (erro) {
    console.error('Erro ao atualizar permissão:', erro);
    alert('Falha ao atualizar a permissão. Tente novamente.');
    definirUsuarios(usuarios.map(usuario =>
      usuario.id === idUsuario ? { ...usuario, [permissao]: !valor } : usuario
    ));
  }
};

export const manipularExcluir = async (definirUsuarios, definirPaginaAtual, definirCarregando, idUsuario, usuarios, tamanhoPagina, paginaAtual, URL_EXCLUIR_USUARIO) => {
  if (window.confirm(`Tem certeza que deseja excluir o usuário com ID ${idUsuario}?`)) {
    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch(`${URL_EXCLUIR_USUARIO}/${idUsuario}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (!resposta.ok) {
        const textoErro = await resposta.text();
        throw new Error(`Erro ao excluir: ${resposta.status} - ${textoErro}`);
      }

      definirUsuarios(usuarios.filter(usuario => usuario.id !== idUsuario));
      if (paginaAtual > 0 && usuarios.length % tamanhoPagina === 1) {
        definirPaginaAtual(paginaAtual - 1);
      }
      console.log(`Usuário com ID ${idUsuario} excluído com sucesso`);
    } catch (erro) {
      console.error('Erro ao excluir usuário:', erro);
      alert('Falha ao excluir o usuário. Tente novamente.');
    }
  }
};