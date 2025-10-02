import Cabecalho from "../../../componentes/Cabecalho";
import { Rodape } from "../../../componentes/Rodape";
import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
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

const URL_API = 'http://localhost:8098/usuariosip/usuarioscadastrados';
const URL_ATUALIZAR_USUARIO = 'http://localhost:8098/usuariosip/atualizarUsuario';
const URL_USUARIO_POR_ID = 'http://localhost:8098/usuariosip/obterporid';
const URL_EXCLUIR_USUARIO = 'http://localhost:8098/usuariosip/excluir';

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
  const [mensagemErro, setMensagemErro] = useState('');
  const [anoOrganograma, setAnoOrganograma] = useState('');
  const [diretoria, setDiretoria] = useState('');
  const [gerencia, setGerencia] = useState('');
  const anoAtual = new Date().getFullYear();
  const [opcoesDiretoria, setOpcoesDiretoria] = useState([]);
  const [opcoesIndicadores, setOpcoesIndicadores] = useState([]);
  const [permissoes, setPermissoes] = useState({});
  const [exibirModalPermissoes, setExibirModalPermissoes] = useState(false);
  const [opcoesGerencia, setOpcoesGerencia] = useState([]);
  const [indicadoresSelecionados, setIndicadoresSelecionados] = useState([]);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [exibirModalElementos, definirExibirModalElementos] = useState(false);
  const [elementosOrganizacionais, definirElementosOrganizacionais] = useState([]);

  useEffect(() => {
    buscarUsuarios(definirCarregando, definirUsuarios, definirTotalPaginas, definirTotalElementos, paginaAtual, tamanhoPagina, URL_API);

    const carregarOpcoesDiretoria = async () => {
      const token = localStorage.getItem('token');
      if (!token || !anoOrganograma) {
        console.warn('Token ou anoOrganograma não encontrado.');
        return;
      }

      try {
        const { data: diretoriaText } = await axios.get(`http://localhost:8098/elementoOrganizacional/apenasDiretorias/${anoOrganograma}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        const diretoriaData = diretoriaText;
        const diretoriasFiltradas = Array.isArray(diretoriaData) ? diretoriaData.map(d => ({ id: d.id, nome: d.nome || d.descricao || 'Sem nome' })) : [];
        setOpcoesDiretoria(diretoriasFiltradas.length > 0 ? diretoriasFiltradas : [{ id: '', nome: 'Nenhuma diretoria disponível' }]);
        setDiretoria('');
        setOpcoesGerencia([]);
        setOpcoesIndicadores([]);
        setIndicadoresSelecionados([]);
      } catch (erro) {
        console.error('Erro ao carregar diretorias:', erro.message);
        setOpcoesDiretoria([{ id: '', nome: 'Erro ao carregar diretorias' }]);
      }
    };

    if (anoOrganograma) {
      carregarOpcoesDiretoria();
    }
  }, [paginaAtual, tamanhoPagina, anoOrganograma]);

  useEffect(() => {
    const carregarIndicadoresLiberados = async () => {
      if (exibirModalIndicadores && idUsuarioSelecionado) {
        try {
          await buscarIndicadores(definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID);
        } catch (erro) {
          console.error('Erro ao carregar indicadores liberados:', erro);
        }
      }
    };
    carregarIndicadoresLiberados();
  }, [exibirModalIndicadores, idUsuarioSelecionado]);

  useEffect(() => {
    if (diretoria) {
      carregarOpcoesIndicadores();
      carregarOpcoesGerencia();
    } else {
      setOpcoesIndicadores([{ id: '', nome: 'Selecione uma diretoria primeiro' }]);
    }
  }, [diretoria]);

  useEffect(() => {
    if (gerencia) {
      carregarOpcoesIndicadores();
      renderizarIndicadores();
    }
  }, [gerencia]);

  const carregarOpcoesGerencia = async () => {
    if (!diretoria || !anoOrganograma) {
      setOpcoesGerencia([{ id: '', nome: 'Selecione ano e diretoria primeiro' }]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const diretoriaSelecionada = opcoesDiretoria.find(d => d.id === diretoria);
      const textoProcura = diretoriaSelecionada ? encodeURIComponent(diretoriaSelecionada.nome) : 'null';
      const url = `http://localhost:8098/elementoOrganizacional/nome/ano/${textoProcura}/${anoOrganograma}/${diretoria}`;

      const { data: texto } = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      const data = texto;
      const gerencias = Array.isArray(data) ? data.map(g => ({ id: g.id, nome: g.nome || g.descricao || 'Sem nome' })) : [];
      setOpcoesGerencia(gerencias.length > 0 ? gerencias : [{ id: '', nome: 'Nenhuma gerência disponível' }]);
      setGerencia('');
      setOpcoesIndicadores([]);
      setIndicadoresSelecionados([]);
    } catch (erro) {
      console.error('Erro ao carregar gerências:', erro.message);
      setOpcoesGerencia([{ id: '', nome: 'Erro ao carregar gerências' }]);
    }
  };

  const carregarOpcoesIndicadores = async () => {
    if (!anoOrganograma || !diretoria) {
      setOpcoesIndicadores([{ id: 'none', nome: 'Selecione ano e diretoria primeiro' }]);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const elementoId = gerencia ? parseInt(gerencia) : parseInt(diretoria);

      if (isNaN(elementoId)) {
        throw new Error('ID do elemento organizacional não é um número válido');
      }

      const url = `http://localhost:8098/indicador/valores/${elementoId}`;

      const { data } = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      const indicadores = Array.isArray(data) ? data.map(i => ({
        id: i.id.toString(),
        nome: i.nomeIndicador || i.nome || i.descricao || 'Sem nome',
        tipo: i.tipoIndicador?.nome || i.tipoIndicador || 'Sem tipo'
      })) : [];

      const novosIndicadores = indicadores.length > 0
        ? indicadores
        : [{ id: 'none', nome: 'Nenhum indicador disponível' }];

      setOpcoesIndicadores(novosIndicadores);
      setIndicadoresSelecionados([]);
    } catch (erro) {
      console.error('Erro ao carregar indicadores:', erro.message);
      setOpcoesIndicadores([{ id: 'error', nome: `Erro ao carregar indicadores: ${erro.message}` }]);
    }
  };

  const abrirModalIndicadores = (idUsuario) => {
    definirIdUsuarioSelecionado(idUsuario);
    definirExibirModalIndicadores(true);
  };

  const abrirModalAdicionar = () => {
    setAnoOrganograma('');
    setDiretoria('');
    setGerencia('');
    setMensagemErro('');
    setOpcoesGerencia([]);
    setOpcoesIndicadores([]);
    setIndicadoresSelecionados([]);
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
    if (!anoOrganograma || !diretoria || !gerencia || indicadoresSelecionados.length === 0) {
      setMensagemErro('Todos os campos obrigatórios devem ser preenchidos e pelo menos um indicador deve ser selecionado.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      for (const indicadorId of indicadoresSelecionados) {
        const payload = {
          anoOrganograma: parseInt(anoOrganograma),
          diretoriaId: parseInt(diretoria),
          gerencia: gerencia,
          usuarioId: idUsuarioSelecionado,
          indicadorId: parseInt(indicadorId)
        };
        await manipularAdicionarIndicador(definirIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO, payload);
      }
      fecharModalAdicionar();
      setAnoOrganograma('');
      setDiretoria('');
      setGerencia('');
      setOpcoesGerencia([]);
      setOpcoesIndicadores([]);
      setIndicadoresSelecionados([]);
      setMensagemErro('');
    } catch (erro) {
      console.error('Erro ao adicionar indicadores:', erro);
      setMensagemErro('Falha ao adicionar indicadores. Tente novamente.');
    }
  };

  const manipularExcluirIndicador = (idIndicador) => {
    if (window.confirm(`Tem certeza que deseja excluir o indicador com ID ${idIndicador}?`)) {
      manipularExcluirIndicador(definirIndicadores, idUsuarioSelecionado, idIndicador, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO);
    }
  };

  const handleSalvarPermissoes = async () => {
    if (idUsuarioSelecionado && permissoes) {
      await manipularAlterarPermissao(setPermissoes, idUsuarioSelecionado, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO, permissoes);
      setExibirModalPermissoes(false);
    }
  };

  const atualizarPermissao = (permissao, valor) => {
    if (usuarioEditando) {
      setUsuarioEditando({ ...usuarioEditando, [permissao]: valor });
    }
  };

  const abrirModalElementos = (idUsuario) => {
    definirIdUsuarioSelecionado(idUsuario);
    definirExibirModalElementos(true);
    // INSIRA AQUI O ENDPOINT PARA BUSCAR OS ELEMENTOS ORGANIZACIONAIS
    // Exemplo: carregarElementosOrganizacionais(idUsuario);
  };

  const fecharModalElementos = () => {
    definirExibirModalElementos(false);
  };

  const abrirModalAdicionarElemento = () => {
  };

  const renderizarElementosOrganizacionais = () => {
    if (!elementosOrganizacionais || elementosOrganizacionais.length === 0) {
      return <tr><td colSpan="3" className="text-center py-3">Não há Elementos Organizacionais liberados para este usuário.</td></tr>;
    }
    return elementosOrganizacionais.map((elemento, index) => (
      <tr key={index} className="border-bottom">
        <td className="py-2 px-3">{elemento.unidade || 'Sem unidade'}</td>
        <td className="py-2 px-3">{elemento.nome || 'Sem nome'}</td>
        <td className="py-2 px-3">{elemento.anoOrganograma || 'Sem ano'}</td>
      </tr>
    ));
  };

  const renderizarIndicadores = () => {
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
    { label: 'Salvar', className: 'btn btn-primary', onClick: handleAdicionarIndicador },
    { label: 'Sair', className: 'btn btn-outline-primary btn-sair', onClick: fecharModalAdicionar }
  ];

  const botoesAcaoModalEditar = [
    {
      label: 'Salvar',
      className: 'btn btn-primary',
      onClick: () => {
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
          <select className="form-select" value={anoOrganograma} onChange={(e) => setAnoOrganograma(e.target.value)} required>
            <option value="" disabled>Ano Organograma*</option>
            {Array.from({ length: anoAtual - 2021 }, (_, i) => 2022 + i).map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <select className="form-select" value={diretoria} onChange={(e) => setDiretoria(e.target.value)} required>
            <option value="" disabled>Diretoria*</option>
            {opcoesDiretoria.map((opcao) => (
              <option key={opcao.id} value={opcao.id}>{opcao.nome}</option>
            ))}
          </select>
        </div>
        <div className="mb-3" style={{ display: diretoria ? 'block' : 'none' }}>
          <select className="form-select" value={gerencia} onChange={(e) => setGerencia(e.target.value)} required disabled={!diretoria}>
            <option value="" disabled>Diretoria, Gerência ou Coordenação*</option>
            {opcoesGerencia.map((opcao) => (
              <option key={opcao.id} value={opcao.id}>{opcao.nome}</option>
            ))}
          </select>
        </div>
        <div className="mb-3" style={{ display: diretoria ? 'block' : 'none' }}>
          <label className="form-label">Indicadores:</label>
          <table className="table table-striped">
            <thead>
              <tr className="table-light">
                <th className="p-3"></th>
                <th className="p-3">Nome</th>
                <th className="p-3">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {opcoesIndicadores.map((indicador) => (
                <tr key={indicador.id} className="border-bottom">
                  <td className="py-2 px-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`indicador-${indicador.id}`}
                      value={indicador.id}
                      checked={indicadoresSelecionados.includes(indicador.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setIndicadoresSelecionados([...indicadoresSelecionados, indicador.id]);
                        } else {
                          setIndicadoresSelecionados(indicadoresSelecionados.filter(id => id !== indicador.id));
                        }
                      }}
                    />
                  </td>
                  <td className="py-2 px-3">{indicador.nome}</td>
                  <td className="py-2 px-3">{indicador.tipo}</td>
                </tr>
              ))}
              {opcoesIndicadores.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-3">Nenhum indicador disponível.</td>
                </tr>
              )}
            </tbody>
          </table>
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
              <li><a className="dropdown-item" href="#" onClick={() => abrirModalElementos(usuario.id)}>Elementos Organizacionais Liberados</a></li>
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
        <Modal
          estaAberto={exibirModalElementos}
          aoFechar={fecharModalElementos}
          titulo={`Elementos Organizacionais Liberados`}
          botoesAcao={[
            { label: 'Adicionar Elemento Organizacional', className: 'btn btn-primary', onClick: abrirModalAdicionarElemento },
            { label: 'Sair', className: 'btn btn-outline-primary btn-sair', onClick: fecharModalElementos }
          ]}

        >
          <div className="card-body">
            <table className="table table-striped">
              <thead>
                <tr className="table-light">
                  <th className="p-3">Unidade</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Ano Organograma</th>
                </tr>
              </thead>
              <tbody>{renderizarElementosOrganizacionais()}</tbody>
            </table>
          </div>
        </Modal>
      </div>
      <Rodape />
    </>
  );
}

export default Usuario;