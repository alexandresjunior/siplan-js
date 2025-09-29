const URL_BASE = 'http://localhost:8098/objetivo';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
      alert('Token de autenticação não encontrado. Por favor, faça o login novamente.');
      throw new Error('Token não encontrado');
  }
  return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
  };
};

export const buscarObjetivosPaginados = async (definirCarregando, definirObjetivos, definirTotalPaginas, definirTotalElementos, paginaAtual, tamanhoPagina) => {
    definirCarregando(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        return;
      }
  
      const resposta = await fetch(`${URL_BASE}/lista/paginados?page=${paginaAtual}&size=${tamanhoPagina}&sort=nome,asc`, {
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
  
      
      const objetivosMapeados = dados.content.map(objetivo => ({
        id: objetivo.id,
        nome: objetivo.nome,
        descricao: objetivo.descricao,
        dataCriacao: new Date(objetivo.dataCriacao).toLocaleDateString('pt-BR'),
      }));
  
      definirObjetivos(objetivosMapeados);
      definirTotalPaginas(dados.totalPages);
      definirTotalElementos(dados.totalElements);
  
    } catch (erro) {
      console.error('Erro ao carregar objetivos:', erro);
    } finally {
      definirCarregando(false);
    }
  };
  
  export const criarObjetivo = async (novoObjetivo) => {
    const headers = getAuthHeaders();
    const resposta = await fetch(URL_BASE, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(novoObjetivo)
    });

    if (!resposta.ok) {
        throw new Error('Falha ao criar o objetivo.');
    }
    return await resposta.json();
};

export const editarObjetivo = async (objetivoAtualizado) => {
  
  const payload = { ...objetivoAtualizado };
  
  delete payload.dataCriacao;
  delete payload.ano;

  
  const headers = getAuthHeaders();
  const resposta = await fetch(URL_BASE, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(payload)
  });

  if (!resposta.ok) {
      throw new Error('Falha ao atualizar o objetivo.');
  }
  return await resposta.json();
};


export const excluirObjetivo = async (idObjetivo) => {
  const headers = getAuthHeaders();
  const resposta = await fetch(`${URL_BASE}/${idObjetivo}`, {
      method: 'DELETE',
      headers: headers
  });

  if (!resposta.ok) {
      throw new Error('Falha ao excluir o objetivo.');
  }
  
  return true; 
};