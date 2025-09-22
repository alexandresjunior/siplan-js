import Cabecalho from "../../../componentes/Cabecalho";
import { Rodape } from "../../../componentes/Rodape";
import React, { useState, useEffect, useRef } from 'react';
import Pagination from "../../../componentes/Pagination";
import Modal from "../../../componentes/Modal";
import { AiOutlineDelete } from 'react-icons/ai';
import {
  buscarIndicadores,
  buscarUsuarios,
  manipularAdicionarIndicador,
  manipularAlterarPermissao,
  manipularExcluir
} from "../../../service/usuariosCadastradosService";

// URL base da API
const URL_API = 'http://localhost:8098/usuariosip/usuarioscadastrados';
const URL_ATUALIZAR_USUARIO = 'http://localhost:8098/usuariosip/atualizarUsuario';
const URL_USUARIO_POR_ID = 'http://localhost:8098/usuariosip/obterporid';
const URL_EXCLUIR_USUARIO = 'http://localhost:8098/usuariosip/excluir';
// Endpoints atualizados com base nos controllers
const URL_RISCO = 'http://localhost:8098/risco/list-by-ano/${ano}'; 
const URL_OBJETIVO = 'http://localhost:8098/objetivo/list-by-ano/${ano}'; // 

function Usuario() {
  const [usuarios, definirUsuarios] = useState([]);
  const [paginaAtual, definirPaginaAtual] = useState(0);
  const [tamanhoPagina, definirTamanhoPagina] = useState(20);
  const [totalPaginas, definirTotalPaginas] = useState(0);
  const [totalElementos, definirTotalElementos] = useState(0);
  const [carregando, definirCarregando] = useState(true);
  const [exibirModalIndicadores, definirExibirModalIndicadores] = useState(false);
  const [exibirModalAdicionar, definirExibirModalAdicionar] = useState(false);
  const [idUsuarioSelecionado, definirIdUsuarioSelecionado] = useState(null);
  const [indicadores, definirIndicadores] = useState([]);
  const posicaoRolagem = useRef(0);

  // Estados para o formulário de adicionar indicador
  const [tipoIndicador, setTipoIndicador] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [sentido, setSentido] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('');
  const [riscoId, setRiscoId] = useState(''); // Alterado para ID
  const [objetivoId, setObjetivoId] = useState(''); // Alterado para ID
  const [unidadeResponsavel, setUnidadeResponsavel] = useState('');
  const [diretoriaGerencia, setDiretoriaGerencia] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  // Estados para opções carregadas via API
  const [opcoesRisco, setOpcoesRisco] = useState([]);
  const [opcoesObjetivo, setOpcoesObjetivo] = useState([]);

  useEffect(() => {
    buscarUsuarios(definirCarregando, definirUsuarios, definirTotalPaginas, definirTotalElementos, paginaAtual, tamanhoPagina, URL_API);

    // Carregar opções via API (uma vez, no mount)
    const carregarOpcoes = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Nenhum token encontrado.');
        return;
      }

      try {
        const [riscoResp, objetivoResp] = await Promise.all([
          fetch(URL_RISCO, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }),
          fetch(URL_OBJETIVO, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }),
        ]);

        if (!riscoResp.ok) throw new Error(`Erro ao carregar riscos: ${riscoResp.statusText}`);
        if (!objetivoResp.ok) throw new Error(`Erro ao carregar objetivos: ${objetivoResp.statusText}`);

        const [riscoData, objetivoData] = await Promise.all([
          riscoResp.json(),
          objetivoResp.json(),
        ]);

        console.log('Riscos carregados:', riscoData); // Para depuração
        console.log('Objetivos carregados:', objetivoData); // Para depuração

        // Filtrar itens não removidos
        const riscosFiltrados = riscoData.filter(r => !r.removido);
        const objetivosFiltrados = objetivoData.filter(o => !o.removido);

        setOpcoesRisco(riscosFiltrados);
        setOpcoesObjetivo(objetivosFiltrados);
      } catch (erro) {
        console.error('Erro ao carregar opções:', erro.message);
        // Opcional: definir valores padrão caso a API falhe
        setOpcoesRisco([{ id: 1, nome: 'Baixo' }, { id: 2, nome: 'Médio' }, { id: 3, nome: 'Alto' }]);
        setOpcoesObjetivo([{ id: 1, nome: 'Crescimento' }, { id: 2, nome: 'Sustentabilidade' }]);
      }
    };

    carregarOpcoes();
  }, [paginaAtual, tamanhoPagina]);

  useEffect(() => {
    const carregarIndicadores = async () => {
      if (exibirModalIndicadores && idUsuarioSelecionado) {
        posicaoRolagem.current = window.scrollY;
        console.log("Buscando indicadores para ID:", idUsuarioSelecionado);
        await buscarIndicadores(definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID);
        console.log("Indicadores após busca:", indicadores);
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

  const abrirModalAdicionar = () => {
    setTipoIndicador('');
    setNome('');
    setDescricao('');
    setSentido('');
    setUnidadeMedida('');
    setRiscoId('');
    setObjetivoId('');
    setUnidadeResponsavel('');
    setDiretoriaGerencia('');
    setMensagemErro('');
    definirExibirModalAdicionar(true);
  };

  const fecharModalAdicionar = () => {
    definirExibirModalAdicionar(false);
  };

  const handleAdicionarIndicador = async () => {
    if (!tipoIndicador || !nome || !sentido || !unidadeMedida || !riscoId || !objetivoId || !unidadeResponsavel || !diretoriaGerencia) {
      setMensagemErro('Todos os campos obrigatórios devem ser preenchidos.');
      return;
    }

    const novoIndicador = {
      nome,
      tipo: tipoIndicador,
      descricao,
      sentido,
      unidadeMedida,
      risco: { id: parseInt(riscoId) }, // Enviado como objeto com ID
      objetivo: { id: parseInt(objetivoId) }, // Enviado como objeto com ID
      unidadeResponsavel, // String
      diretoriaGerencia, // String
      indicadorExcluido: false,
    };

    console.log('Payload enviado:', novoIndicador); // Para depuração

    await manipularAdicionarIndicador(definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO, novoIndicador);
    fecharModalAdicionar();
    // Resetar os campos do formulário
    setTipoIndicador('');
    setNome('');
    setDescricao('');
    setSentido('');
    setUnidadeMedida('');
    setRiscoId('');
    setObjetivoId('');
    setUnidadeResponsavel('');
    setDiretoriaGerencia('');
    setMensagemErro('');
  };

  const manipularExcluirIndicador = (idIndicador) => {
    if (window.confirm(`Tem certeza que deseja excluir o indicador com ID ${idIndicador}?`)) {
      manipularExcluirIndicador(definirIndicadores, idUsuarioSelecionado, idIndicador, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO);
    }
  };

  const renderizarIndicadores = () => {
    console.log("Renderizando indicadores no momento:", indicadores);
    if (!indicadores || indicadores.length === 0) {
      console.log("Nenhum indicador para renderizar, indicadores:", indicadores);
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

  const botoesAcaoModalIndicadores = [
    {
      label: 'Adicionar Indicador',
      className: 'btn btn-primary',
      onClick: abrirModalAdicionar
    }
  ];

  const botoesAcaoModalAdicionar = [
    {
      label: 'Adicionar',
      className: 'btn btn-primary',
      onClick: handleAdicionarIndicador
    },
    {
      label: 'Sair',
      className: 'btn btn-outline-primary btn-sair',
      onClick: fecharModalAdicionar
    }
  ];

  const renderizarFormularioAdicionar = () => {
    return (
      <div className="card-body">
        {mensagemErro && <div className="alert alert-danger">{mensagemErro}</div>}
        <div className="mb-3">
          <select
            className="form-select"
            value={tipoIndicador}
            onChange={(e) => setTipoIndicador(e.target.value)}
            placeholder="Tipo de Indicador*"
            required
          >
            <option value="">Tipo de indicador*</option>
            <option value="estrategico">Estratégico</option>
            <option value="setorial">Tático</option>
            <option value="premissa">Premissa</option>
            <option value="variavel">Variável</option>
            <option value="operacional">Operacional</option>
          </select>
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome*"
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição"
          />
        </div>
        <div className="row mb-3">
          <div className="col">
            <select
              className="form-select"
              value={sentido}
              onChange={(e) => setSentido(e.target.value)}
              placeholder="Sentido*"
              required
            >
              <option value="">Sentido*</option>
              <option value="crescente">Quanto Maior Melhor</option>
              <option value="decrescente">Quanto Menor Melhor</option>
            </select>
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              value={unidadeMedida}
              onChange={(e) => setUnidadeMedida(e.target.value)}
              placeholder="Unidade de Medida*"
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <select
            className="form-select"
            value={riscoId}
            onChange={(e) => setRiscoId(e.target.value)}
            placeholder="Risco*"
            required
          >
            <option value="">Risco*</option>
            {opcoesRisco.map((opcao) => (
              <option key={opcao.id} value={opcao.id}>
                {opcao.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <select
            className="form-select"
            value={objetivoId}
            onChange={(e) => setObjetivoId(e.target.value)}
            placeholder="Objetivo estratégico*"
            required
          >
            <option value="">Objetivo estratégico*</option>
            {opcoesObjetivo.map((opcao) => (
              <option key={opcao.id} value={opcao.id}>
                {opcao.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            value={unidadeResponsavel}
            onChange={(e) => setUnidadeResponsavel(e.target.value)}
            placeholder="Unidade responsável pelo preenchimento*"
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            value={diretoriaGerencia}
            onChange={(e) => setDiretoriaGerencia(e.target.value)}
            placeholder="Diretoria/Gerência/Coordenação*"
            required
          />
        </div>
      </div>
    );
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
                name={`admin_${usuario.id}`}
                checked={usuario.administrador}
                onChange={() => manipularAlterarPermissao(definirUsuarios, usuario.id, 'administrador', !usuario.administrador, usuarios, URL_ATUALIZAR_USUARIO)}
                className="form-check-input"
              />
              <label htmlFor={`admin_${usuario.id}`} className="form-check-label">Administrador</label>
            </div>
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id={`pareto_${usuario.id}`}
                name={`pareto_${usuario.id}`}
                checked={usuario.pareto}
                onChange={() => manipularAlterarPermissao(definirUsuarios, usuario.id, 'pareto', !usuario.pareto, usuarios, URL_ATUALIZAR_USUARIO)}
                className="form-check-input"
              />
              <label htmlFor={`pareto_${usuario.id}`} className="form-check-label">Visualizar Pareto</label>
            </div>
            <div className="form-check mb-2">
              <input
                type="checkbox"
                id={`atualizacao_${usuario.id}`}
                name={`atualizacao_${usuario.id}`}
                checked={usuario.atualizacaoAutomatica}
                onChange={() => manipularAlterarPermissao(definirUsuarios, usuario.id, 'atualizacaoAutomatica', !usuario.atualizacaoAutomatica, usuarios, URL_ATUALIZAR_USUARIO)}
                className="form-check-input"
              />
              <label htmlFor={`atualizacao_${usuario.id}`} className="form-check-label">Atualização Automática</label>
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                id={`risco_${usuario.id}`}
                name={`risco_${usuario.id}`}
                checked={usuario.administradorRisco}
                onChange={() => manipularAlterarPermissao(definirUsuarios, usuario.id, 'administradorRisco', !usuario.administradorRisco, usuarios, URL_ATUALIZAR_USUARIO)}
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
                  onClick={() => manipularExcluir(definirUsuarios, definirPaginaAtual, definirCarregando, usuario.id, usuarios, tamanhoPagina, paginaAtual, URL_EXCLUIR_USUARIO)}
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
          botoesAcao={botoesAcaoModalIndicadores}
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
        <Modal
          estaAberto={exibirModalAdicionar}
          aoFechar={fecharModalAdicionar}
          titulo={`Adicionar Indicador - Usuário ID: ${idUsuarioSelecionado}`}
          botoesAcao={botoesAcaoModalAdicionar}
        >
          {renderizarFormularioAdicionar()}
        </Modal>
      </div>
      <Rodape />
    </>
  );
}

export default Usuario;