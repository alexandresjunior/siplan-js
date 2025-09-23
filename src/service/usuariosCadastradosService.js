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

export const manipularAdicionarIndicador = async (definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO, novoIndicador) => {
  try {
    const token = localStorage.getItem('token');

    // Determinar o endpoint com base no tipo de indicador
    let endpoint = '';
    let indicadorPayload = {
      nomeIndicador: novoIndicador.nome,
      tipoIndicador: novoIndicador.tipo,
      sentidoIndicador: novoIndicador.sentido,
      unidadeMedida: novoIndicador.unidadeMedida,
      descricao: novoIndicador.descricao || null,
      dataCriacao: new Date().toISOString(),
      indicadorExcluido: false,
    };

    switch (novoIndicador.tipo) {
      case 'manual':
        endpoint = 'http://localhost:8098/indicador/manual';
        break;
      case 'automatico':
        endpoint = 'http://localhost:8098/indicador/automatico';
        break;
      case 'variavel':
        endpoint = 'http://localhost:8098/indicador/variavel';
        break;
      case 'premissa':
        endpoint = 'http://localhost:8098/indicador/premissa';
        break;
      default:
        throw new Error('Tipo de indicador inválido');
    }

    // Adicionar campos relacionais (simplificados)
    indicadorPayload.risco = { nome: novoIndicador.risco };
    indicadorPayload.objetivo = { nome: novoIndicador.objetivoEstrategico };
    indicadorPayload.elementoOrganizacionalResp = { nome: novoIndicador.unidadeResponsavel };

    // Enviar o novo indicador ao backend
    const respostaIndicador = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(indicadorPayload)
    });

    if (!respostaIndicador.ok) {
      const textoErro = await respostaIndicador.text();
      throw new Error(`Erro ao criar indicador: ${respostaIndicador.status} - ${textoErro}`);
    }

    const dadosIndicador = await respostaIndicador.json();
    const novoIdIndicador = dadosIndicador.id; // O backend retorna o ID gerado

    // Atualizar o usuário para incluir o novo indicador
    const respostaUsuario = await fetch(`${URL_USUARIO_POR_ID}/${idUsuarioSelecionado}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!respostaUsuario.ok) throw new Error('Erro ao buscar usuário');
    const dadosUsuario = await respostaUsuario.json();

    const indicadoresAtualizados = [...(dadosUsuario.indicadoresLiberados || []), {
      id: novoIdIndicador,
      nomeIndicador: novoIndicador.nome,
      tipoIndicador: novoIndicador.tipo,
      indicadorExcluido: false
    }];

    const usuarioAtualizado = { ...dadosUsuario, indicadoresLiberados: indicadoresAtualizados };

    const respostaAtualizacao = await fetch(URL_ATUALIZAR_USUARIO, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarioAtualizado)
    });
    if (!respostaAtualizacao.ok) {
      const textoErro = await respostaAtualizacao.text();
      throw new Error(`Erro ao atualizar usuário: ${respostaAtualizacao.status} - ${textoErro}`);
    }

    // Recarregar os indicadores após sucesso
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

export const manipularAlterarPermissao = async (definirUsuarios, idUsuario, usuarioAtualizado, usuarios, URL_ATUALIZAR_USUARIO) => {
  console.log('Iniciando manipularAlterarPermissao para id:', idUsuario, 'com dados:', usuarioAtualizado);
  try {
    const token = localStorage.getItem('token');
    console.log('Token extraído do localStorage:', token ? token.substring(0, 10) + '...' : 'NULL/EMPTY');
    if (!token) {
      console.error('Nenhum token encontrado no localStorage - redirecionando para login');
      throw new Error('Token de autenticação ausente - faça login novamente');
    }
    console.log('Enviando requisição para:', URL_ATUALIZAR_USUARIO, 'com header Authorization: Bearer', token.substring(0, 10) + '...');

    const body = JSON.stringify([usuarioAtualizado]);
    console.log('Body da requisição:', body);

    const response = await fetch(URL_ATUALIZAR_USUARIO, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Garantindo que não há espaços extras
        'Content-Type': 'application/json'
      },
      body: body
    });

    console.log('Resposta recebida - status:', response.status, 'statusText:', response.statusText);
    if (!response.ok) {
      const text = await response.text();
      console.error('Erro na resposta (corpo completo):', text);
      throw new Error(`Erro ao atualizar: ${response.status} - ${text}`);
    }

    const data = await response.json();
    console.log('Dados atualizados recebidos:', data);
    const usuarioMapeadoAtualizado = {
      id: data[0].id,
      nome: data[0].nome,
      lotacao: data[0].lotacaoAtual || 'Não especificada',
      administrador: data[0].administrador,
      pareto: data[0].pareto,
      atualizacaoAutomatica: data[0].atualizarLotAutomatica,
      administradorRisco: data[0].administradorRisco
    };
    definirUsuarios(usuarios.map(usuario => usuario.id === idUsuario ? usuarioMapeadoAtualizado : usuario));
    console.log('Usuários atualizados no estado:', usuarios);
  } catch (error) {
    console.error('Erro ao atualizar permissão (detalhado):', error.message, error.stack);
    alert('Falha ao atualizar a permissão. Verifique o console para detalhes. Pode ser necessário fazer login novamente.');
    definirUsuarios(usuarios.map(usuario =>
      usuario.id === idUsuario ? { ...usuario, ...usuarioAtualizado } : usuario
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