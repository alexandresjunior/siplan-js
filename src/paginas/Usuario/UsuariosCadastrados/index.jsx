import Cabecalho from "../../../componentes/Cabecalho";
import { Rodape } from "../../../componentes/Rodape";
import React, { useState, useEffect } from 'react';
import Pagination from "../../../componentes/Pagination";
import Modal from "../../../componentes/Modal"; // Import do Modal genérico (coringa)
import { AiOutlineDelete } from 'react-icons/ai'; // Importação do ícone de lixeira

// URL base da API
const API_URL = 'http://localhost:8098/usuariosip/usuarioscadastrados';
const UPDATE_USER_URL = 'http://localhost:8098/usuariosip/atualizarUsuario';
const USER_BY_ID_URL = 'http://localhost:8098/usuariosip/obterporid'; // Endpoint para obter usuário por ID
const INDICADORES_URL = 'http://localhost:8098/usuariosip/indicadores'; // Endpoint para indicadores 
const DELETE_USER_URL = 'http://localhost:8098/usuariosip/obterporid'; // Placeholder para exclusão
function Usuario() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showIndicadoresModal, setShowIndicadoresModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [indicadores, setIndicadores] = useState([]); // Estado para armazenar indicadores dinamicamente

  useEffect(() => {
    const fetchUsers = async () => {
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

    fetchUsers();
  }, [currentPage, pageSize]);

  // Carrega indicadores quando o modal é aberto
  useEffect(() => {
    if (showIndicadoresModal && selectedUserId) {
      fetchIndicadores();
    }
  }, [showIndicadoresModal, selectedUserId]);

  const fetchIndicadores = async () => {
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
      // Filtra indicadores não excluídos manualmente, já que o backend pode não filtrar
      const indicadoresNaoExcluidos = userData.indicadoresLiberados
        ? userData.indicadoresLiberados.filter(ind => !ind.indicadorExcluido)
        : [];
      setIndicadores(indicadoresNaoExcluidos);
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error);
    }
  };

  const openIndicadoresModal = (userId) => {
    setSelectedUserId(userId);
    setShowIndicadoresModal(true);
  };

  const handleAddIndicador = async () => {
    // Exemplo: Adicionar um indicador fictício (substitua por um formulário ou lógica real)
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
      fetchIndicadores(); // Recarrega os indicadores
    } catch (error) {
      console.error('Erro ao adicionar indicador:', error);
      alert('Falha ao adicionar indicador. Tente novamente.');
    }
  };

  const handleExcludeIndicador = async (indicadorId) => {
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
      fetchIndicadores(); // Recarrega os indicadores
    } catch (error) {
      console.error('Erro ao excluir indicador:', error);
      alert('Falha ao excluir indicador. Tente novamente.');
    }
  };

  const renderIndicadores = () => {
    return indicadores.map(indicador => (
      <tr key={indicador.id} className="border-bottom">
        <td className="py-2 px-3">{indicador.nome}</td>
        <td className="py-2 px-3">{indicador.tipo}</td>
        <td className="py-2 px-3 text-center">
          <button
            className="btn btn-link p-0 d-flex justify-content-center align-items-center"
            onClick={() => handleExcludeIndicador(indicador.id)}
            style={{ width: '100%', height: '100%' }}
          >
            <AiOutlineDelete style={{ fontSize: '20px', color: '#5f5f5fff' }} />
          </button>
        </td>
      </tr>
    ));
  };

  const modalActionButtons = [
    {
      label: 'Adicionar Indicador',
      className: 'btn btn-primary',
      onClick: handleAddIndicador
    }
  ];

  const handlePermissionChange = async (userId, permission, value) => {
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

  const handleDelete = async (userId) => {
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

  const renderUsers = () => {
    if (loading) return <tr><td colSpan="4" className="text-center py-3">Carregando...</td></tr>;
    if (users.length === 0) return <tr><td colSpan="4" className="text-center py-3">Nenhum usuário encontrado.</td></tr>;

    return users.map(user => (
      <tr key={user.id} className="border-bottom">
        <td className="py-2 px-3">{user.nome}</td>
        <td className="py-2 px-3">{user.lotacao}</td>
        <td className="py-2 px-3" style={{ verticalAlign: "middle" }}>
          <div className="d-flex flex-column">
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id={`admin_${user.id}`}
                checked={user.administrador}
                onChange={() => handlePermissionChange(user.id, 'administrador', !user.administrador)}
                className="form-check-input"
              />
              <label htmlFor={`admin_${user.id}`} className="form-check-label">Administrador</label>
            </div>
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id={`pareto_${user.id}`}
                checked={user.pareto}
                onChange={() => handlePermissionChange(user.id, 'pareto', !user.pareto)}
                className="form-check-input"
              />
              <label htmlFor={`pareto_${user.id}`} className="form-check-label">Visualizar Pareto</label>
            </div>
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id={`atualizacao_${user.id}`}
                checked={user.atualizacaoAutomatica}
                onChange={() => handlePermissionChange(user.id, 'atualizacaoAutomatica', !user.atualizacaoAutomatica)}
                className="form-check-input"
              />
              <label htmlFor={`atualizacao_${user.id}`} className="form-check-label">Atualização Automática</label>
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                id={`risco_${user.id}`}
                checked={user.administradorRisco}
                onChange={() => handlePermissionChange(user.id, 'administradorRisco', !user.administradorRisco)}
                className="form-check-input"
              />
              <label htmlFor={`risco_${user.id}`} className="form-check-label">Administrador de Riscos</label>
            </div>
          </div>
        </td>
        <td className="py-2 px-3">
          <div className="dropdown">
            <button
              type="button"
              id={`dropdownMenu_${user.id}`}
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ fontSize: "1.5em", color: "black", background: "none", border: "none", padding: "0" }}
              onClick={() => console.log('Dropdown clicado para userId:', user.id)}
            >
              ⋮
            </button>
            <ul className="dropdown-menu" aria-labelledby={`dropdownMenu_${user.id}`}>
              <li><a className="dropdown-item" href="#" onClick={() => openIndicadoresModal(user.id)}>Indicadores Liberados</a></li>
              <li><a className="dropdown-item" href="#">Elementos Organizacionais Liberados</a></li>
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={() => handleDelete(user.id)}
                >
                  Excluir
                </button>
              </li>
            </ul>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <>
      <Cabecalho />
      <div className="container mt-5 mb-3">
        <div className="row mb-3">
          <div className="col">
            <h3 className="mb-0">Usuários Cadastrados</h3>
          </div>
          <div className="col-auto">
            <a href="#" className="btn btn-primary">
              Novo Usuário
            </a>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <table className="table table-striped">
              <thead>
                <tr className="table-light">
                  <th className="p-3">Nome</th>
                  <th className="p-3">Lotação</th>
                  <th className="p-3" style={{ width: "40%" }}>Permissões</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>{renderUsers()}</tbody>
            </table>
            <Pagination
              styles="d-flex justify-content-between align-items-center mt-4"
              page={currentPage}
              setPage={setCurrentPage}
              size={pageSize}
              setSize={setPageSize}
              totalPages={totalPages}
              totalElements={totalElements}
              pageOptions={[10, 20, 40]}
            />
          </div>
        </div>
        <Modal
          isOpen={showIndicadoresModal}
          onClose={() => setShowIndicadoresModal(false)}
          title={`Indicadores Liberados - Usuário ID: ${selectedUserId}`}
          actionButtons={modalActionButtons}
        >
          <div className="card-body">
            <table className="table table-striped">
              <thead>
                <tr className="table-light">
                  <th className="p-3">Nome</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3 text-danger d-flex justify-content-center">Excluir</th>
                </tr>
              </thead>
              <tbody>{renderIndicadores()}</tbody>
            </table>
          </div>
        </Modal>
      </div>
      <Rodape />
    </>
  );
}

export default Usuario;