import api from './api';

export const buscarUsuarios = async (definirCarregando, definirUsuarios, definirTotalPaginas, definirTotalElementos, paginaAtual, tamanhoPagina, URL_API) => {
  definirCarregando(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Nenhum token encontrado. Redirecione para login.');
      alert('Você precisa estar logado para acessar esta página.');
      return;
    }
    const { data: dados } = await api.get(`${URL_API}?page=${paginaAtual}&size=${tamanhoPagina}&sort=nome,asc`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
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
    if (!token) {
      console.warn('Nenhum token encontrado. Redirecione para login.');
      alert('Você precisa estar logado para acessar esta página.');
      return;
    }
    const { data: dadosUsuario } = await api.get(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    let indicadoresLiberados = dadosUsuario.indicadoresLiberados || [];
    const indicadoresMapeados = indicadoresLiberados.map(ind => ({
      id: ind.id,
      nome: ind.nomeIndicador || 'Sem nome',
      tipo: ind.tipoIndicador?.nome || ind.tipoIndicador || 'Sem tipo',
      indicadorExcluido: ind.indicadorExcluido || false
    }));
    const indicadoresNaoExcluidos = indicadoresMapeados.filter(ind => !ind.indicadorExcluido);
    definirIndicadores(indicadoresNaoExcluidos);
  } catch (erro) {
    console.error('Erro ao carregar indicadores:', erro);
    if (erro.message.includes('403')) {
      alert('Acesso negado (403). Verifique o token ou permissões.');
    }
  }
};

export const manipularAdicionarIndicador = async (definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO, novoIndicador, callbackSucesso) => {
  try {
    const token = localStorage.getItem('token');

    const { data: dadosUsuario } = await api.get(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    const indicadoresAtualizados = [...(dadosUsuario.indicadoresLiberados || []), {
      id: novoIndicador.indicadorId,
      indicadorExcluido: false
    }];

    const usuarioAtualizado = {
      ...dadosUsuario,
      indicadoresLiberados: indicadoresAtualizados,
      lotacaoAtual: dadosUsuario.lotacaoAtual
        ? { id: dadosUsuario.lotacaoAtual.id.toString() } 
        : null
    };

    const payload = usuarioAtualizado;


    const { data: respostaAtualizacao } = await api.post(URL_ATUALIZAR_USUARIO, { ...payload }, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

     if (callbackSucesso) {
        callbackSucesso();
    }

    await buscarIndicadores(definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID);
  } catch (erro) {
    console.error('Erro ao adicionar indicador:', erro);
    alert('Falha ao adicionar indicador. Tente novamente.');
  }
};

export const manipularExcluirIndicador = async (definirIndicadores, idUsuarioSelecionado, idIndicador, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO) => {
  try {
    const token = localStorage.getItem('token');
    const { data: dadosUsuario } = await api.get(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    const indicadoresAtualizados = (dadosUsuario.indicadoresLiberados || []).filter(ind => ind.id !== idIndicador);
    const usuarioAtualizado = { ...dadosUsuario, indicadoresLiberados: indicadoresAtualizados };

    const { data: respostaAtualizacao } = await api.post(URL_ATUALIZAR_USUARIO, usuarioAtualizado, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    buscarIndicadores(definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID);
  } catch (erro) {
    console.error('Erro ao excluir indicador:', erro);
    alert('Falha ao excluir indicador. Tente novamente.');
  }
};

export const buscarPermissoes = async (definirPermissoes, idUsuarioSelecionado, URL_USUARIO_POR_ID) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Nenhum token encontrado. Redirecione para login.');
      alert('Você precisa estar logado para acessar esta página.');
      return;
    }

    const { data: dadosUsuario } = await api.get(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    const permissoes = {
      administrador: dadosUsuario.administrador || false,
      administradorRisco: dadosUsuario.administradorRisco || false,
      pareto: dadosUsuario.pareto || false,
      atualizarLotAutomatica: dadosUsuario.atualizarLotAutomatica || false
    };
    definirPermissoes(permissoes);
  } catch (erro) {
    console.error('Erro ao carregar permissões:', erro);
  }
};

export const manipularAlterarPermissao = async (definirPermissoes, idUsuarioSelecionado, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO, permissoes) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Nenhum token encontrado. Redirecione para login.');
      alert('Você precisa estar logado para acessar esta página.');
      return;
    }

    const { data: dadosUsuario } = await api.get(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    const usuarioAtualizado = {
      id: dadosUsuario.id,
      nome: dadosUsuario.nome,
      login: dadosUsuario.login,
      lotacaoAtual: dadosUsuario.lotacaoAtual ? dadosUsuario.lotacaoAtual.id.toString() : null,
      administrador: permissoes.administrador,
      administradorRisco: permissoes.administradorRisco,
      pareto: permissoes.pareto,
      atualizarLotAutomatica: permissoes.atualizarLotAutomatica,
    };


    const { data: jsonData } = await api.put(`${URL_ATUALIZAR_USUARIO}/${idUsuarioSelecionado}`, usuarioAtualizado, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    await buscarPermissoes(definirPermissoes, idUsuarioSelecionado, URL_USUARIO_POR_ID);
  } catch (erro) {
    console.error('Erro ao alterar permissão:', erro);
    alert('Falha ao alterar permissão. Tente novamente.');
  }
};

export const manipularExcluir = async (definirUsuarios, definirPaginaAtual, definirCarregando, idUsuario, usuarios, tamanhoPagina, paginaAtual, URL_EXCLUIR_USUARIO) => {
    try {
      const token = localStorage.getItem('token');
      
      const resposta = await api.delete(`${URL_EXCLUIR_USUARIO}/${idUsuario}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      definirUsuarios(usuarios.filter(usuario => usuario.id !== idUsuario));
      if (paginaAtual > 0 && usuarios.length % tamanhoPagina === 1) {
        definirPaginaAtual(paginaAtual - 1);
      }
    } catch (erro) {
      console.error('Erro ao excluir usuário:', erro);
      alert('Falha ao excluir o usuário. Tente novamente.');
    }
  
};