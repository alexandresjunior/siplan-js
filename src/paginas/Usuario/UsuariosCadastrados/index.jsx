import Cabecalho from "../../../componentes/Cabecalho";
import { Rodape } from "../../../componentes/Rodape";
import React, { useState, useEffect, useRef } from 'react';
import Pagination from "../../../componentes/Pagination";
import Modal from "../../../componentes/Modal"; // Import do Modal genérico (coringa)
import { AiOutlineDelete } from 'react-icons/ai'; // Importação do ícone de lixeira
import { fetchIndicadores, fetchUsers } from "../../../service/usuariosCadastradosService";

// URL base da API (mantidas como constantes no componente por conveniência)
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
  const scrollPosition = useRef(0); // Referência para armazenar a posição de rolagem

  useEffect(() => {
    fetchUsers(setLoading, setUsers, setTotalPages, setTotalElements, currentPage, pageSize, API_URL);
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (showIndicadoresModal && selectedUserId) {
      scrollPosition.current = window.scrollY; // Salva a posição de rolagem ao abrir o modal
      fetchIndicadores(setIndicadores, selectedUserId, USER_BY_ID_URL);
    } else if (!showIndicadoresModal) {
      window.scrollTo(0, scrollPosition.current);
    }
  }, [showIndicadoresModal, selectedUserId]);

  const openIndicadoresModal = (userId) => {
    setSelectedUserId(userId);
    setShowIndicadoresModal(true);
  };

  const handleAddIndicador = () => {
    handleAddIndicador(setIndicadores, selectedUserId, USER_BY_ID_URL, UPDATE_USER_URL);
  };

  const handleExcludeIndicador = (indicadorId) => {
    handleExcludeIndicador(setIndicadores, selectedUserId, indicadorId, USER_BY_ID_URL, UPDATE_USER_URL);
  };

  const renderIndicadores = () => {
    if (indicadores.length === 0) {
      return (
        <tr>
          <td colSpan="3" className="text-center py-3">Nenhum indicador liberado.</td>
        </tr>
      );
    }
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

  const handlePermissionChange = (userId, permission, value) => {
    handlePermissionChange(setUsers, userId, permission, value, users, UPDATE_USER_URL);
  };

  const handleDelete = (userId) => {
    handleDelete(setUsers, setCurrentPage, setLoading, userId, users, pageSize, currentPage, DELETE_USER_URL);
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