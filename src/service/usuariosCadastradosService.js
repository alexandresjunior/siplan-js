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
    if (erro.message.includes('403')) {
      alert('Acesso negado (403). Verifique o token ou permissões.');
    }
  }
};

export const manipularAdicionarIndicador = async (definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO, novoIndicador) => {
  try {
    const token = localStorage.getItem('token');

    // Buscar dados do usuário para atualizar
    const respostaUsuario = await fetch(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!respostaUsuario.ok) throw new Error('Erro ao buscar usuário');
    const dadosUsuario = await respostaUsuario.json();
    console.log('Dados do usuário antes da atualização:', dadosUsuario);

    // Adicionar o indicador ao conjunto de indicadores liberados
    const indicadoresAtualizados = [...(dadosUsuario.indicadoresLiberados || []), {
      id: novoIndicador.indicadorId,
      indicadorExcluido: false
    }];

    // Criar usuarioAtualizado, convertendo lotacaoAtual para string (usando o id)
    const usuarioAtualizado = {
      ...dadosUsuario,
      indicadoresLiberados: indicadoresAtualizados,
      lotacaoAtual: dadosUsuario.lotacaoAtual ? dadosUsuario.lotacaoAtual.id.toString() : null // Converte para string do ID
    };
    const payload = [usuarioAtualizado]; // Array explícita
    console.log('Payload bruto antes do stringify:', payload);
    console.log('Payload enviado para atualização:', JSON.stringify(payload, null, 2));

    // Enviar atualização com método POST
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

    console.log('Resposta da atualização:', await respostaAtualizacao.json());
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
    buscarIndicadores(definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID); // Recarrega os indicadores
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
    console.log('Dados do usuário com permissões:', dadosUsuario);

    // Extrair permissões relevantes
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

    // Buscar dados do usuário para atualizar
    const respostaUsuario = await fetch(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!respostaUsuario.ok) throw new Error('Erro ao buscar usuário');
    const dadosUsuario = await respostaUsuario.json();
    console.log('Dados do usuário antes da atualização:', dadosUsuario);

    // Preparar o payload com as permissões atualizadas
    const usuarioAtualizado = {
      ...dadosUsuario,
      administrador: permissoes.administrador,
      administradorRisco: permissoes.administradorRisco,
      pareto: permissoes.pareto,
      atualizarLotAutomatica: permissoes.atualizarLotAutomatica,
      lotacaoAtual: dadosUsuario.lotacaoAtual ? dadosUsuario.lotacaoAtual.id.toString() : null
    };
    console.log('Payload bruto antes do stringify:', usuarioAtualizado);
    console.log('Payload enviado para atualização:', JSON.stringify(usuarioAtualizado, null, 2));

    // Enviar atualização para o endpoint correto
    const respostaAtualizacao = await fetch(`${URL_ATUALIZAR_USUARIO}/${idUsuarioSelecionado}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarioAtualizado)
    });
    if (!respostaAtualizacao.ok) {
      const textoErro = await respostaAtualizacao.text(); // Usar text() para respostas não-JSON
      console.error('Erro na resposta do backend:', textoErro);
      throw new Error(`Erro ao atualizar: ${respostaAtualizacao.status} - ${textoErro}`);
    }

    const data = await respostaAtualizacao.text(); // Usar text() primeiro para depuração
    console.log('Resposta da atualização (raw):', data);
    const jsonData = data ? JSON.parse(data) : {};
    console.log('Resposta da atualização (parsed):', jsonData);
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
      }
      console.log(`Usuário com ID ${idUsuario} excluído com sucesso`);
    } catch (erro) {
      console.error('Erro ao excluir usuário:', erro);
      alert('Falha ao excluir o usuário. Tente novamente.');
    }
  }
};