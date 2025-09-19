import Cabecalho from "../../../componentes/Cabecalho";
import { Rodape } from "../../../componentes/Rodape";
import React, { useState, useEffect, useRef } from 'react';
import Pagination from "../../../componentes/Pagination";
import Modal from "../../../componentes/Modal"; // Import do Modal genérico (coringa)
import { AiOutlineDelete } from 'react-icons/ai'; // Importação do ícone de lixeira
import { buscarIndicadores, buscarUsuarios } from "../../../service/usuariosCadastradosService";

// URL base da API (mantidas como constantes no componente por conveniência)
const URL_API = 'http://localhost:8098/usuariosip/usuarioscadastrados';
const URL_ATUALIZAR_USUARIO = 'http://localhost:8098/usuariosip/atualizarUsuario';
const URL_USUARIO_POR_ID = 'http://localhost:8098/usuariosip/obterporid'; // Endpoint para obter usuário por ID
const URL_INDICADORES = 'http://localhost:8098/usuariosip/indicadores'; // Endpoint para indicadores 
const URL_EXCLUIR_USUARIO = 'http://localhost:8098/usuariosip/obterporid'; // Placeholder para exclusão

function Usuario() {
  const [usuarios, definirUsuarios] = useState([]);
  const [paginaAtual, definirPaginaAtual] = useState(0);
  const [tamanhoPagina, definirTamanhoPagina] = useState(20);
  const [totalPaginas, definirTotalPaginas] = useState(0);
  const [totalElementos, definirTotalElementos] = useState(0);
  const [carregando, definirCarregando] = useState(true);
  const [exibirModalIndicadores, definirExibirModalIndicadores] = useState(false);
  const [idUsuarioSelecionado, definirIdUsuarioSelecionado] = useState(null);
  const [indicadores, definirIndicadores] = useState([]); // Estado para armazenar indicadores dinamicamente
  const posicaoRolagem = useRef(0); // Referência para armazenar a posição de rolagem

  useEffect(() => {
    buscarUsuarios(definirCarregando, definirUsuarios, definirTotalPaginas, definirTotalElementos, paginaAtual, tamanhoPagina, URL_API);
  }, [paginaAtual, tamanhoPagina]);

  useEffect(() => {
    const carregarIndicadores = async () => {
      if (exibirModalIndicadores && idUsuarioSelecionado) {
        posicaoRolagem.current = window.scrollY; // Salva a posição de rolagem ao abrir o modal
        console.log("Buscando indicadores para ID:", idUsuarioSelecionado); // Log de depuração
        await buscarIndicadores(definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID);
        console.log("Indicadores após busca:", indicadores); // Verifica o estado após a atualização
      } else if (!exibirModalIndicadores) {
        window.scrollTo(0, posicaoRolagem.current);
      }
    };
    carregarIndicadores();
  }, [exibirModalIndicadores, idUsuarioSelecionado]);

  const abrirModalIndicadores = (idUsuario) => {
    definirIdUsuarioSelecionado(idUsuario);
    definirExibirModalIndicadores(true);
  };

  const manipularAdicionarIndicador = () => {
    manipularAdicionarIndicador(definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO);
  };

  const manipularExcluirIndicador = (idIndicador) => {
    manipularExcluirIndicador(definirIndicadores, idUsuarioSelecionado, idIndicador, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO);
  };

  const renderizarIndicadores = () => {
    console.log("Renderizando indicadores no momento:", indicadores); // Log antes da renderização
    if (!indicadores || indicadores.length === 0) {
      return (
        <tr>
          <td colSpan="3" className="text-center py-3">Nenhum indicador liberado.</td>
        </tr>
      );
    }
    return indicadores.map(indicador => (
      <tr key={indicador.id} className="border-bottom">
        <td className="py-2 px-3">{indicador.nome || 'Sem nome'}</td>
        <td className="py-2 px-3">{indicador.tipo || 'Sem tipo'}</td>
        <td className="py-2 px-3 text-center">
          <button
            className="btn btn-link p-0 d-flex justify-content-center align-items-center"
            onClick={() => manipularExcluirIndicador(indicador.id)}
            style={{ width: '100%', height: '100%' }}
          >
            <AiOutlineDelete style={{ fontSize: '20px', color: '#5f5f5fff' }} />
          </button>
        </td>
      </tr>
    ));
  };

  const botoesAcaoModal = [
    {
      label: 'Adicionar Indicador',
      className: 'btn btn-primary',
      onClick: manipularAdicionarIndicador
    }
  ];

  const manipularAlterarPermissao = (idUsuario, permissao, valor) => {
    manipularAlterarPermissao(definirUsuarios, idUsuario, permissao, valor, usuarios, URL_ATUALIZAR_USUARIO);
  };

  const manipularExcluir = (idUsuario) => {
    manipularExcluir(definirUsuarios, definirPaginaAtual, definirCarregando, idUsuario, usuarios, tamanhoPagina, paginaAtual, URL_EXCLUIR_USUARIO);
  };

  const renderizarUsuarios = () => {
    if (carregando) return <tr><td colSpan="4" className="text-center py-3">Carregando...</td></tr>;
    if (usuarios.length === 0) return <tr><td colSpan="4" className="text-center py-3">Nenhum usuário encontrado.</td></tr>;

    return usuarios.map(usuario => (
      <tr key={usuario.id} className="border-bottom">
        <td className="py-2 px-3">{usuario.nome}</td>
        <td className="py-2 px-3">{usuario.lotacao}</td>
        <td className="py-2 px-3" style={{ verticalAlign: "middle" }}>
          <div className="d-flex flex-column">
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id={`admin_${usuario.id}`}
                name={`admin_${usuario.id}`} // Adicionado name
                checked={usuario.administrador}
                onChange={() => manipularAlterarPermissao(usuario.id, 'administrador', !usuario.administrador)}
                className="form-check-input"
              />
              <label htmlFor={`admin_${usuario.id}`} className="form-check-label">Administrador</label>
            </div>
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id={`pareto_${usuario.id}`}
                name={`pareto_${usuario.id}`} // Adicionado name
                checked={usuario.pareto}
                onChange={() => manipularAlterarPermissao(usuario.id, 'pareto', !usuario.pareto)}
                className="form-check-input"
              />
              <label htmlFor={`pareto_${usuario.id}`} className="form-check-label">Visualizar Pareto</label>
            </div>
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id={`atualizacao_${usuario.id}`}
                name={`atualizacao_${usuario.id}`} // Adicionado name
                checked={usuario.atualizacaoAutomatica}
                onChange={() => manipularAlterarPermissao(usuario.id, 'atualizacaoAutomatica', !usuario.atualizacaoAutomatica)}
                className="form-check-input"
              />
              <label htmlFor={`atualizacao_${usuario.id}`} className="form-check-label">Atualização Automática</label>
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                id={`risco_${usuario.id}`}
                name={`risco_${usuario.id}`} // Adicionado name
                checked={usuario.administradorRisco}
                onChange={() => manipularAlterarPermissao(usuario.id, 'administradorRisco', !usuario.administradorRisco)}
                className="form-check-input"
              />
              <label htmlFor={`risco_${usuario.id}`} className="form-check-label">Administrador de Riscos</label>
            </div>
          </div>
        </td>
        <td className="py-2 px-3">
          <div className="dropdown">
            <button
              type="button"
              id={`menuDropdown_${usuario.id}`}
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ fontSize: "1.5em", color: "black", background: "none", border: "none", padding: "0" }}
              onClick={() => console.log('Dropdown clicado para userId:', usuario.id)}
            >
              ⋮
            </button>
            <ul className="dropdown-menu" aria-labelledby={`menuDropdown_${usuario.id}`}>
              <li><a className="dropdown-item" href="#" onClick={() => abrirModalIndicadores(usuario.id)}>Indicadores Liberados</a></li>
              <li><a className="dropdown-item" href="#">Elementos Organizacionais Liberados</a></li>
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={() => manipularExcluir(usuario.id)}
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
              <tbody>{renderizarUsuarios()}</tbody>
            </table>
            <Pagination
              estilos="d-flex justify-content-between align-items-center mt-4"
              pagina={paginaAtual}
              definirPagina={definirPaginaAtual}
              tamanho={tamanhoPagina}
              definirTamanho={definirTamanhoPagina}
              totalPaginas={totalPaginas}
              totalElementos={totalElementos}
              opcoesPagina={[10, 20, 40]}
            />
          </div>
        </div>
        <Modal
          estaAberto={exibirModalIndicadores}
          aoFechar={() => definirExibirModalIndicadores(false)}
          titulo={`Indicadores Liberados - Usuário ID: ${idUsuarioSelecionado}`}
          botoesAcao={botoesAcaoModal}
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
              <tbody>{renderizarIndicadores()}</tbody>
            </table>
          </div>
        </Modal>
      </div>
      <Rodape />
    </>
  );
}

export default Usuario;