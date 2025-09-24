import Cabecalho from "../../../componentes/Cabecalho";
import { Rodape } from "../../../componentes/Rodape";
import React, { useState, useEffect, useRef } from 'react';
import Pagination from "../../../componentes/Pagination";
import Modal from "../../../componentes/Modal";
import { AiOutlineDelete } from 'react-icons/ai';
import { FaCheck, FaTimes } from "react-icons/fa";
import {
  buscarIndicadores,
  buscarUsuarios,
  manipularAdicionarIndicador,
  manipularExcluir,
  manipularAlterarPermissao
} from "../../../service/usuariosCadastradosService";

// URL base da API
const URL_API = 'http://localhost:8098/usuariosip/usuarioscadastrados';
const URL_ATUALIZAR_USUARIO = 'http://localhost:8098/usuariosip/atualizarUsuarios'; // Alterado para o endpoint de lista
const URL_USUARIO_POR_ID = 'http://localhost:8098/usuariosip/obterporid';
const URL_EXCLUIR_USUARIO = 'http://localhost:8098/usuariosip/excluir';
// Endpoints ajustados para query parameter
const URL_RISCO = 'http://localhost:8098/risco/list-by-ano';
const URL_OBJETIVO = 'http://localhost:8098/objetivo/list-by-ano';

function Usuario() {
  const [usuarios, definirUsuarios] = useState([]);
  const [paginaAtual, definirPaginaAtual] = useState(0);
  const [tamanhoPagina, definirTamanhoPagina] = useState(20);
  const [totalPaginas, definirTotalPaginas] = useState(0);
  const [totalElementos, definirTotalElementos] = useState(0);
  const [carregando, definirCarregando] = useState(true);
  const [exibirModalIndicadores, definirExibirModalIndicadores] = useState(false);
  const [exibirModalAdicionar, definirExibirModalAdicionar] = useState(false);
  const [exibirModalEditar, definirExibirModalEditar] = useState(false);
  const [idUsuarioSelecionado, definirIdUsuarioSelecionado] = useState(null);
  const [indicadores, definirIndicadores] = useState([]);
  const posicaoRolagem = useRef(0);

  // Estados para o formulário de adicionar indicador
  const [tipoIndicador, setTipoIndicador] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [sentido, setSentido] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('');
  const [riscoId, setRiscoId] = useState('');
  const [objetivoId, setObjetivoId] = useState('');
  const [unidadeResponsavel, setUnidadeResponsavel] = useState('');
  const [diretoriaGerencia, setDiretoriaGerencia] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState(''); // Sem valor padrão, usaremos placeholder
  const anoAtual = new Date().getFullYear(); // Ano atual dinâmico
  const [mensagemErro, setMensagemErro] = useState('');

  // Estados para opções carregadas via API
  const [opcoesRisco, setOpcoesRisco] = useState([]);
  const [opcoesObjetivo, setOpcoesObjetivo] = useState([]);

  // Estados para o modal de edição de permissões
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  useEffect(() => {
    buscarUsuarios(definirCarregando, definirUsuarios, definirTotalPaginas, definirTotalElementos, paginaAtual, tamanhoPagina, URL_API);

    const carregarOpcoes = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Nenhum token encontrado.');
        return;
      }

      // Só carrega se um ano estiver selecionado
      if (!anoSelecionado) {
        setOpcoesRisco([{ id: 1, nome: 'Selecione um ano primeiro' }]);
        setOpcoesObjetivo([{ id: 1, nome: 'Selecione um ano primeiro' }]);
        return;
      }

      try {
        console.log('Iniciando requisições para riscos e objetivos, ano:', anoSelecionado);
        const [riscoResp, objetivoResp] = await Promise.all([
          fetch(`${URL_RISCO}/${anoSelecionado}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
          fetch(`${URL_OBJETIVO}/${anoSelecionado}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
        ]);

        const riscoText = await riscoResp.text();
        const objetivoText = await objetivoResp.text();
        console.log('Resposta bruta de riscos:', riscoText);
        console.log('Resposta bruta de objetivos:', objetivoText);

        if (!riscoResp.ok) throw new Error(`Erro ao carregar riscos: ${riscoResp.status} - ${riscoText}`);
        if (!objetivoResp.ok) throw new Error(`Erro ao carregar objetivos: ${objetivoResp.status} - ${objetivoText}`);

        const [riscoData, objetivoData] = await Promise.all([JSON.parse(riscoText), JSON.parse(objetivoText)]);
        const riscosFiltrados = Array.isArray(riscoData) ? riscoData.filter(r => !r.removido).map(r => ({ id: r.id, nome: r.nome })) : [];
        const objetivosFiltrados = Array.isArray(objetivoData) ? objetivoData.filter(o => !o.removido).map(o => ({ id: o.id, nome: o.nome })) : [];

        setOpcoesRisco(riscosFiltrados.length > 0 ? riscosFiltrados : [{ id: 1, nome: 'Nenhum risco disponível' }]);
        setOpcoesObjetivo(objetivosFiltrados.length > 0 ? objetivosFiltrados : [{ id: 1, nome: 'Nenhum objetivo disponível' }]);
      } catch (erro) {
        console.error('Erro ao carregar opções:', erro.message);
        setOpcoesRisco([{ id: 1, nome: 'Erro ao carregar riscos' }]);
        setOpcoesObjetivo([{ id: 1, nome: 'Erro ao carregar objetivos' }]);
      }
    };

    carregarOpcoes();
  }, [paginaAtual, tamanhoPagina, anoSelecionado]);

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
    setAnoSelecionado(''); // Reset para placeholder
    definirExibirModalAdicionar(true);
  };

  const abrirModalEditar = (idUsuario) => {
    const usuario = usuarios.find(u => u.id === idUsuario);
    if (usuario) {
      setUsuarioEditando(usuario);
      definirIdUsuarioSelecionado(idUsuario);
      definirExibirModalEditar(true);
    }
  };

  const fecharModalAdicionar = () => {
    definirExibirModalAdicionar(false);
  };

  const fecharModalEditar = () => {
    definirExibirModalEditar(false);
    setUsuarioEditando(null);
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
      risco: { id: parseInt(riscoId) },
      objetivo: { id: parseInt(objetivoId) },
      unidadeResponsavel,
      diretoriaGerencia,
      indicadorExcluido: false,
    };

    console.log('Payload enviado:', novoIndicador);
    await manipularAdicionarIndicador(definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO, novoIndicador);
    fecharModalAdicionar();
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

  const handleSalvarPermissoes = async () => {
    console.log('Iniciando handleSalvarPermissoes', usuarioEditando);
    if (usuarioEditando) {
      const usuarioCompleto = {
        id: usuarioEditando.id,
        nome: usuarioEditando.nome,
        lotacao: usuarioEditando.lotacao,
        administrador: usuarioEditando.administrador,
        pareto: usuarioEditando.pareto,
        atualizacaoAutomatica: usuarioEditando.atualizacaoAutomatica,
        administradorRisco: usuarioEditando.administradorRisco
      };
      console.log('Enviando para manipularAlterarPermissao:', usuarioCompleto);
      await manipularAlterarPermissao(
        definirUsuarios,
        usuarioEditando.id,
        usuarioCompleto,
        usuarios,
        URL_ATUALIZAR_USUARIO
      );
      console.log('Após manipularAlterarPermissao, chamando buscarUsuarios');
      await buscarUsuarios(definirCarregando, definirUsuarios, definirTotalPaginas, definirTotalElementos, paginaAtual, tamanhoPagina, URL_API);
      fecharModalEditar();
    }
  };

  const atualizarPermissao = (permissao, valor) => {
    if (usuarioEditando) {
      setUsuarioEditando({ ...usuarioEditando, [permissao]: valor });
    }
  };

  const renderizarIndicadores = () => {
    console.log("Renderizando indicadores:", indicadores);
    if (!indicadores || indicadores.length === 0) {
      return <tr><td colSpan="3" className="text-center py-3">Nenhum indicador liberado.</td></tr>;
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
    { label: 'Adicionar Indicador', className: 'btn btn-primary', onClick: abrirModalAdicionar }
  ];

  const botoesAcaoModalAdicionar = [
    { label: 'Adicionar', className: 'btn btn-primary', onClick: handleAdicionarIndicador },
    { label: 'Sair', className: 'btn btn-outline-primary btn-sair', onClick: fecharModalAdicionar }
  ];

  const botoesAcaoModalEditar = [
    {
      label: 'Salvar',
      className: 'btn btn-primary',
      onClick: () => {
        console.log('Botão Salvar clicado - iniciando handleSalvarPermissoes');
        handleSalvarPermissoes();
      }
    },
    {
      label: 'Sair',
      className: 'btn btn-outline-primary btn-sair',
      onClick: fecharModalEditar
    }
  ];

  const renderizarFormularioAdicionar = () => {
    return (
      <div className="card-body">
        {mensagemErro && <div className="alert alert-danger">{mensagemErro}</div>}
        <div className="mb-3">
          <label className="form-label">Ano:</label>
          <select className="form-select" value={anoSelecionado} onChange={(e) => setAnoSelecionado(e.target.value)} required>
            <option value="" disabled>Ano*</option>
            {Array.from({ length: anoAtual - 2021 }, (_, i) => 2022 + i).map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <select className="form-select" value={tipoIndicador} onChange={(e) => setTipoIndicador(e.target.value)} required>
            <option value="" disabled>Tipo de indicador*</option>
            <option value="estrategico">Estratégico</option>
            <option value="setorial">Tático</option>
            <option value="premissa">Premissa</option>
            <option value="variavel">Variável</option>
            <option value="operacional">Operacional</option>
          </select>
        </div>
        <div className="mb-3">
          <input type="text" className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome*" required />
        </div>
        <div className="mb-3">
          <input type="text" className="form-control" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição" />
        </div>
        <div className="row mb-3">
          <div className="col">
            <select className="form-select" value={sentido} onChange={(e) => setSentido(e.target.value)} required>
              <option value="" disabled>Sentido*</option>
              <option value="crescente">Quanto Maior Melhor</option>
              <option value="decrescente">Quanto Menor Melhor</option>
            </select>
          </div>
          <div className="col">
            <input type="text" className="form-control" value={unidadeMedida} onChange={(e) => setUnidadeMedida(e.target.value)} placeholder="Unidade de Medida*" required />
          </div>
        </div>
        <div className="mb-3">
          <select className="form-select" value={riscoId} onChange={(e) => setRiscoId(e.target.value)} required>
            <option value="">Risco*</option>
            {opcoesRisco.map((opcao) => <option key={opcao.id} value={opcao.id}>{opcao.nome}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <select className="form-select" value={objetivoId} onChange={(e) => setObjetivoId(e.target.value)} required>
            <option value="" disabled>Objetivo estratégico*</option>
            {opcoesObjetivo.map((opcao) => <option key={opcao.id} value={opcao.id}>{opcao.nome}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <input type="text" className="form-control" value={unidadeResponsavel} onChange={(e) => setUnidadeResponsavel(e.target.value)} placeholder="Unidade responsável pelo preenchimento*" required />
        </div>
        <div className="mb-3">
          <input type="text" className="form-control" value={diretoriaGerencia} onChange={(e) => setDiretoriaGerencia(e.target.value)} placeholder="Diretoria/Gerência/Coordenação*" required />
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
              {usuario.administrador ? <FaCheck className="FaCheck text-success" /> : <FaTimes className="FaTimes text-danger" />}
              <span> Administrador </span>
            </div>
            <div className="form-check mb-2">
              {usuario.pareto ? <FaCheck className="FaCheck text-success" /> : <FaTimes className="FaTimes text-danger" />}
              <span> Visualizar Pareto </span>
            </div>
            <div className="form-check mb-2">
              {usuario.atualizacaoAutomatica ? <FaCheck className="FaCheck text-success" /> : <FaTimes className="FaTimes text-danger" />}
              <span> Atualização Automática </span>
            </div>
            <div className="form-check">
              {usuario.administradorRisco ? <FaCheck className="FaCheck text-success" /> : <FaTimes className="FaTimes text-danger" />}
              <span> Administrador de Riscos </span>
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
              <li><a className="dropdown-item" href="#" onClick={() => abrirModalEditar(usuario.id)}>Editar Permissões</a></li>
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
            <a href="#" className="btn btn-primary">Novo Usuário</a>
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
          titulo={`Indicadores Liberados`}
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
          titulo={`Adicionar Indicador`}
          botoesAcao={botoesAcaoModalAdicionar}
        >
          {renderizarFormularioAdicionar()}
        </Modal>
        <Modal
          estaAberto={exibirModalEditar}
          aoFechar={fecharModalEditar}
          titulo={`Editar Permissões`}
          botoesAcao={botoesAcaoModalEditar}
        >
          {usuarioEditando && (
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Nome:</label>
                <input type="text" className="form-control" value={usuarioEditando.nome || ''} readOnly />
              </div>
              <div className="mb-3">
                <label className="form-label">Lotação:</label>
                <input type="text" className="form-control" value={usuarioEditando.lotacao || 'Não especificada'} readOnly />
              </div>
              <h5>Permissões de Acesso</h5>
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={usuarioEditando.administrador}
                  onChange={(e) => atualizarPermissao('administrador', e.target.checked)}
                />
                <label className="form-check-label">Administrador</label>
              </div>
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={usuarioEditando.pareto}
                  onChange={(e) => atualizarPermissao('pareto', e.target.checked)}
                />
                <label className="form-check-label">Visualizar Pareto</label>
              </div>
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={usuarioEditando.atualizacaoAutomatica}
                  onChange={(e) => atualizarPermissao('atualizacaoAutomatica', e.target.checked)}
                />
                <label className="form-check-label">Atualização Automática</label>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={usuarioEditando.administradorRisco}
                  onChange={(e) => atualizarPermissao('administradorRisco', e.target.checked)}
                />
                <label className="form-check-label">Administrador de Riscos</label>
              </div>
            </div>
          )}
        </Modal>
      </div>
      <Rodape />
    </>
  );
}

export default Usuario;