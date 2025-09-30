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
    const resposta = await fetch(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!resposta.ok) {
      const textoErro = await resposta.text();
      throw new Error(`Erro HTTP: ${resposta.status} - ${textoErro}`);
    }
    const dadosUsuario = await resposta.json();
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

export const manipularAdicionarIndicador = async (definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO, novoIndicador) => {
  try {
    const token = localStorage.getItem('token');

    const respostaUsuario = await fetch(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!respostaUsuario.ok) throw new Error('Erro ao buscar usuário');
    const dadosUsuario = await respostaUsuario.json();

    const indicadoresAtualizados = [...(dadosUsuario.indicadoresLiberados || []), {
      id: novoIndicador.indicadorId,
      indicadorExcluido: false
    }];

    const usuarioAtualizado = {
      ...dadosUsuario,
      indicadoresLiberados: indicadoresAtualizados,
      lotacaoAtual: dadosUsuario.lotacaoAtual ? dadosUsuario.lotacaoAtual.id.toString() : null 
    };
    const payload = [usuarioAtualizado]; 
    

    const respostaAtualizacao = await fetch(URL_ATUALIZAR_USUARIO, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!respostaAtualizacao.ok) {
      const textoErro = await respostaAtualizacao.text();
      console.error('Erro na resposta do backend:', textoErro);
      throw new Error(`Erro ao atualizar usuário: ${respostaAtualizacao.status} - ${textoErro}`);
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

    const resposta = await fetch(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!resposta.ok) {
      const textoErro = await resposta.text();
      throw new Error(`Erro ao carregar permissões: ${resposta.status} - ${textoErro}`);
    }

    const dadosUsuario = await resposta.json();

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

    const respostaUsuario = await fetch(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!respostaUsuario.ok) throw new Error('Erro ao buscar usuário');
    const dadosUsuario = await respostaUsuario.json();

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
    
    
    const respostaAtualizacao = await fetch(`${URL_ATUALIZAR_USUARIO}/${idUsuarioSelecionado}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify(usuarioAtualizado)
    });
    if (!respostaAtualizacao.ok) {
      const textoErro = await respostaAtualizacao.text(); 
      console.error('Erro na resposta do backend:', textoErro);
      throw new Error(`Erro ao atualizar: ${respostaAtualizacao.status} - ${textoErro}`);
    }

    const data = await respostaAtualizacao.text(); 
    const jsonData = data ? JSON.parse(data) : {};
    await buscarPermissoes(definirPermissoes, idUsuarioSelecionado, URL_USUARIO_POR_ID);
  } catch (erro) {
    console.error('Erro ao alterar permissão:', erro);
    alert('Falha ao alterar permissão. Tente novamente.');
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
      }    } catch (erro) {
      console.error('Erro ao excluir usuário:', erro);
      alert('Falha ao excluir o usuário. Tente novamente.');
    }
  }
};