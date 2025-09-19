
export const fetchUsers = async (setLoading, setUsers, setTotalPages, setTotalElements, currentPage, pageSize, API_URL) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Nenhum token encontrado. Redirecione para login.');
      alert('Você precisa estar logado para acessar esta página.');
      return;
    }
    const response = await fetch(`${API_URL}?page=${currentPage}&size=${pageSize}&sort=nome,asc`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    console.log('Resposta da API:', data);
    const mappedUsers = data.content.map(user => ({
      id: user.id,
      nome: user.nome,
      lotacao: user.lotacaoAtual || 'Não especificada',
      administrador: user.administrador,
      pareto: user.pareto,
      atualizacaoAutomatica: user.atualizarLotAutomatica,
      administradorRisco: user.administradorRisco
    }));
    setUsers(mappedUsers);
    setTotalPages(data.totalPages);
    setTotalElements(data.totalElements);
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    if (error.message.includes('403')) {
      alert('Acesso negado (403). Verifique o token ou permissões.');
    }
  } finally {
    setLoading(false);
  }
};

export const fetchIndicadores = async (setIndicadores, selectedUserId, USER_BY_ID_URL) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${USER_BY_ID_URL}/${selectedUserId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Erro ao carregar indicadores: ${response.status}`);
    }
    const userData = await response.json();
    console.log('Resposta bruta da API:', userData);
    let indicadoresLiberados = userData.indicadoresLiberados || [];
    const indicadoresMapeados = indicadoresLiberados.map(ind => ({
      id: ind.id,
      nome: ind.nomeIndicador || 'Sem nome',
      tipo: ind.tipoIndicador?.nome || ind.tipoIndicador || 'Sem tipo',
      indicadorExcluido: ind.indicadorExcluido || false
    }));
    const indicadoresNaoExcluidos = indicadoresMapeados.filter(ind => !ind.indicadorExcluido);
    console.log('Indicadores mapeados e filtrados:', indicadoresNaoExcluidos);
    setIndicadores(indicadoresNaoExcluidos);
  } catch (error) {
    console.error('Erro ao carregar indicadores:', error);
  }
};

export const handleAddIndicador = async (setIndicadores, selectedUserId, USER_BY_ID_URL, UPDATE_USER_URL) => {
  const novoIndicador = {
    id: Date.now(), // ID temporário, substitua por ID real do backend
    nome: `Novo Indicador ${new Date().getTime()}`,
    tipo: "Quantitativo",
    indicadorExcluido: false
  };
  try {
    const token = localStorage.getItem('token');
    const userResponse = await fetch(`${USER_BY_ID_URL}/${selectedUserId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!userResponse.ok) throw new Error('Erro ao buscar usuário');
    const userData = await userResponse.json();
    const updatedIndicadores = [...(userData.indicadoresLiberados || []), novoIndicador];
    const updatedUser = { ...userData, indicadoresLiberados: updatedIndicadores };

    const updateResponse = await fetch(UPDATE_USER_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    });
    if (!updateResponse.ok) throw new Error('Erro ao atualizar usuário');
    fetchIndicadores(setIndicadores, selectedUserId, USER_BY_ID_URL); // Recarrega os indicadores
  } catch (error) {
    console.error('Erro ao adicionar indicador:', error);
    alert('Falha ao adicionar indicador. Tente novamente.');
  }
};

export const handleExcludeIndicador = async (setIndicadores, selectedUserId, indicadorId, USER_BY_ID_URL, UPDATE_USER_URL) => {
  try {
    const token = localStorage.getItem('token');
    const userResponse = await fetch(`${USER_BY_ID_URL}/${selectedUserId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!userResponse.ok) throw new Error('Erro ao buscar usuário');
    const userData = await userResponse.json();
    const updatedIndicadores = (userData.indicadoresLiberados || []).filter(ind => ind.id !== indicadorId);
    const updatedUser = { ...userData, indicadoresLiberados: updatedIndicadores };

    const updateResponse = await fetch(UPDATE_USER_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    });
    if (!updateResponse.ok) throw new Error('Erro ao atualizar usuário');
    fetchIndicadores(setIndicadores, selectedUserId, USER_BY_ID_URL); // Recarrega os indicadores
  } catch (error) {
    console.error('Erro ao excluir indicador:', error);
    alert('Falha ao excluir indicador. Tente novamente.');
  }
};

export const handlePermissionChange = async (setUsers, userId, permission, value, users, UPDATE_USER_URL) => {
  const updatedUser = users.find(user => user.id === userId);
  if (!updatedUser) return;

  const userToUpdate = {
    id: updatedUser.id,
    nome: updatedUser.nome,
    login: updatedUser.login || '',
    lotacaoAtual: updatedUser.lotacao,
    administrador: permission === 'administrador' ? value : updatedUser.administrador,
    pareto: permission === 'pareto' ? value : updatedUser.pareto,
    atualizarLotAutomatica: permission === 'atualizacaoAutomatica' ? value : updatedUser.atualizacaoAutomatica,
    administradorRisco: permission === 'administradorRisco' ? value : updatedUser.administradorRisco
  };

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(UPDATE_USER_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(userToUpdate)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao atualizar: ${response.status} - ${errorText}`);
    }

    const updatedData = await response.json();
    const mappedUpdatedUser = {
      id: updatedData.id,
      nome: updatedData.nome,
      lotacao: updatedData.lotacaoAtual || 'Não especificada',
      administrador: updatedData.administrador,
      pareto: updatedData.pareto,
      atualizacaoAutomatica: updatedData.atualizarLotAutomatica,
      administradorRisco: updatedData.administradorRisco
    };
    setUsers(users.map(user => user.id === userId ? mappedUpdatedUser : user));
    console.log(`Permissão ${permission} atualizada para ${value} no usuário ${userId}`);
  } catch (error) {
    console.error('Erro ao atualizar permissão:', error);
    alert('Falha ao atualizar a permissão. Tente novamente.');
    setUsers(users.map(user =>
      user.id === userId ? { ...user, [permission]: !value } : user
    ));
  }
};

export const handleDelete = async (setUsers, setCurrentPage, setLoading, userId, users, pageSize, currentPage, DELETE_USER_URL) => {
  if (window.confirm(`Tem certeza que deseja excluir o usuário com ID ${userId}?`)) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${DELETE_USER_URL}/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao excluir: ${response.status} - ${errorText}`);
      }

      setUsers(users.filter(user => user.id !== userId));
      if (currentPage > 0 && users.length % pageSize === 1) {
        setCurrentPage(currentPage - 1);
      }
      console.log(`Usuário com ID ${userId} excluído com sucesso`);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Falha ao excluir o usuário. Tente novamente.');
    }
  }
};