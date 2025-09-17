import Cabecalho from "../../../componentes/Cabecalho";
import { Rodape } from "../../../componentes/Rodape";
import React, { useState, useEffect } from 'react';
import Pagination from "../../../componentes/Pagination";

// URL base da API 
const API_URL = 'http://localhost:8098/usuariosip/usuarioscadastrados'; 

function Usuario() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Função para carregar usuários da API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}?page=${currentPage}&size=${pageSize}&sort=nome,asc`);
        const data = await response.json();
        // Ajuste para mapear os dados da API para o formato esperado
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
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, pageSize]); // Recarrega quando a página ou tamanho mudam

  // Função para renderizar os usuários
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
            >
              ⋮
            </button>
            <ul className="dropdown-menu" aria-labelledby={`dropdownMenu_${user.id}`}>
              <li><a className="dropdown-item" href="#">Indicadores Liberados</a></li>
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

  // Função para atualizar permissões
  const handlePermissionChange = (userId, permission, value) => {
    // Aqui seria necessário chamar o backend para atualizar (ex.: POST /usuariosip/atualizarUsuario)
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, [permission]: value } : user
    );
    setUsers(updatedUsers);
    // TODO: Implementar chamada API para salvar a mudança
    console.log(`Atualizando ${permission} para ${value} no usuário ${userId}`);
  };

  // Função para excluir usuário
  const handleDelete = (userId) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário com ID ${userId}?`)) {
      // Aqui seria necessário chamar o backend para deletar (ex.: DELETE /usuariosip/obterporid/{id})
      setUsers(users.filter(user => user.id !== userId));
      if (currentPage > 0 && users.length % pageSize === 1) {
        setCurrentPage(currentPage - 1);
      }
      // TODO: Implementar chamada API para deletar
      console.log(`Excluindo usuário com ID ${userId}`);
    }
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
      </div>
      <Rodape />
    </>
  );
}

export default Usuario;