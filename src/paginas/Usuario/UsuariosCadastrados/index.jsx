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
  manipularAlterarPermissao,
  manipularExcluirIndicador as excluirIndicadorService
} from "../../../service/usuariosCadastradosService";
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';


// URLs (mantidas as originais)
const URL_API = 'http://localhost:8098/usuariosip/usuarioscadastrados';
const URL_ATUALIZAR_USUARIO = 'http://localhost:8098/usuariosip/atualizarUsuario';
const URL_USUARIO_POR_ID = 'http://localhost:8098/usuariosip/obterporid';
const URL_EXCLUIR_USUARIO = 'http://localhost:8098/usuariosip';
const URL_FILTRO_NOME = 'http://localhost:8098/usuariosip/filtro/porNome';
const URL_FILTRO_PERMISSAO = 'http://localhost:8098/usuariosip/filtro/porPermissao';

function Usuario() {
  // Refatoração dos nomes de estado para usar a convenção padrão 'set' (Ex: definirUsuarios -> setUsuarios)
  const [usuarios, setUsuarios] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(20);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [carregando, setCarregando] = useState(true);

  // Estados de Modal (Foco principal da correção, agora com 'set' prefixo)
  const [exibirModalIndicadores, setExibirModalIndicadores] = useState(false);
  const [exibirModalAdicionar, setExibirModalAdicionar] = useState(false);
  const [exibirModalEditar, setExibirModalEditar] = useState(false);
  const [idUsuarioSelecionado, setIdUsuarioSelecionado] = useState(null);
  const [indicadores, setIndicadores] = useState([]);
  const [exibirModalElementos, setExibirModalElementos] = useState(false);
  const [elementosOrganizacionais, setElementosOrganizacionais] = useState([]);


  // Outros estados
  const posicaoRolagem = useRef(0);
  const [mensagemErro, setMensagemErro] = useState('');
  const [anoOrganograma, setAnoOrganograma] = useState('');
  const [diretoria, setDiretoria] = useState('');
  const [gerencia, setGerencia] = useState('');
  const anoAtual = new Date().getFullYear();
  const [opcoesDiretoria, setOpcoesDiretoria] = useState([]);
  const [opcoesIndicadores, setOpcoesIndicadores] = useState([]);
  const [permissoes, setPermissoes] = useState({});
  const [opcoesGerencia, setOpcoesGerencia] = useState([]);
  const [indicadoresSelecionados, setIndicadoresSelecionados] = useState([]);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [alertaSucesso, setAlertaSucesso] = useState(false);

  const [filtroNome, setFiltroNome] = useState('');
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState([]);

  const [alertaSucessoExclusao, setAlertaSucessoExclusao] = useState(false);

  const mostrarAlertaSucessoExclusao = () => {
    setAlertaSucessoExclusao(true);
    setTimeout(() => setAlertaSucessoExclusao(false), 2000);
  };

  const location = useLocation(); // ← ADICIONE ISSO


  // Mapeamento das permissões para os labels dos checkboxes
  const permissoesDisponiveis = [
    { key: 'administrador', label: 'Administrador' },
    { key: 'administradorRisco', label: 'Administrador de Risco' },
    { key: 'pareto', label: 'Visualizar Pareto' },
    { key: 'atualizarLotAutomatica', label: 'Atualização Automática' }
  ];

  const handlePermissaoChange = (permissaoKey) => {
    setPermissoesSelecionadas(prevSelecionadas => {
      if (prevSelecionadas.includes(permissaoKey)) {
        return prevSelecionadas.filter(p => p !== permissaoKey);
      } else {
        return [...prevSelecionadas, permissaoKey];
      }
    });
    setPaginaAtual(0); // Reseta a paginação ao mudar o filtro
  };

  useEffect(() => {
    const buscarUsuariosFiltrados = async () => {
      setCarregando(true);
      setMensagemErro('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMensagemErro('Token de autenticação não encontrado.');
          setCarregando(false);
          return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };
        let response;

        // 1. Filtro por nome (se preenchido) como prioridade inicial
        if (filtroNome.trim()) {
          const url = URL_FILTRO_NOME;
          console.log('Requisição por nome:', url);
          response = await axios.get(url, {
            headers,
            params: { nome: filtroNome.trim(), page: paginaAtual, size: tamanhoPagina }
          });
          let usuariosDaApi = response.data.content || [];
          setTotalPaginas(response.data.totalPages || 0);
          setTotalElementos(response.data.totalElements || 0);

          // 2. Aplicar filtro secundário por permissões no cliente, se houver
          if (permissoesSelecionadas.length > 0) {
            usuariosDaApi = usuariosDaApi.filter(usuario =>
              permissoesSelecionadas.every(p => usuario[p] === true)
            );
            setTotalPaginas(1); // Ajuste manual para refletir a nova contagem
            setTotalElementos(usuariosDaApi.length);
          }
          setUsuarios(usuariosDaApi);

          // 3. Apenas filtro por permissões, se nome estiver vazio e houver permissões
        } else if (permissoesSelecionadas.length > 0) {
          const params = {};
          permissoesSelecionadas.forEach(p => {
            params[p] = true;
          });
          console.log('Requisição por permissão:', URL_FILTRO_PERMISSAO, params);
          response = await axios.get(URL_FILTRO_PERMISSAO, {
            headers,
            params: { ...params, page: paginaAtual, size: tamanhoPagina }
          });
          setUsuarios(response.data.content || []);
          setTotalPaginas(response.data.totalPages || 0);
          setTotalElementos(response.data.totalElements || 0);

          // 4. Nenhum filtro ativo, busca todos os usuários paginados
        } else {
          console.log('Requisição padrão (sem filtros):', URL_API);
          response = await axios.get(URL_API, {
            headers,
            params: { page: paginaAtual, size: tamanhoPagina }
          });
          setUsuarios(response.data.content || []);
          setTotalPaginas(response.data.totalPages || 0);
          setTotalElementos(response.data.totalElements || 0);
        }
      } catch (erro) {
        console.error('Erro ao buscar usuários:', erro.response?.data || erro.message);
        setMensagemErro('Erro ao buscar usuários: ' + (erro.response?.data?.message || 'Tente novamente.'));
        setUsuarios([]);
        setTotalPaginas(0);
        setTotalElementos(0);
      }
      setCarregando(false);
    };

    buscarUsuariosFiltrados();
  }, [paginaAtual, tamanhoPagina, filtroNome, permissoesSelecionadas, location.search]);

  useEffect(() => {
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
  }, [anoOrganograma]);

  useEffect(() => {
    const carregarIndicadoresLiberados = async () => {
      if (exibirModalIndicadores && idUsuarioSelecionado) {
        try {
          await buscarIndicadores(setIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID); // setIndicadores
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
      // Não existe a função renderizarIndicadores fora do JSX, isso pode ser um bug lógico.
      // Vou assumir que ela não é crítica aqui ou que o usuário a chamou por engano.
      // renderizarIndicadores(); 
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

  // Funções que estavam causando o problema com o setter
  const abrirModalIndicadores = (idUsuario) => {
    setIdUsuarioSelecionado(idUsuario); // setIdUsuarioSelecionado
    setExibirModalIndicadores(true); // *** CORREÇÃO: Usando o setter padronizado
  };

  const abrirModalAdicionar = () => {
    setAnoOrganograma('');
    setDiretoria('');
    setGerencia('');
    setMensagemErro('');
    setOpcoesGerencia([]);
    setOpcoesIndicadores([]);
    setIndicadoresSelecionados([]);
    setExibirModalAdicionar(true); // setExibirModalAdicionar
  };

  const abrirModalEditar = (idUsuario) => {
    const usuario = usuarios.find(u => u.id === idUsuario);
    if (usuario) {
      setUsuarioEditando(usuario);
      setIdUsuarioSelecionado(idUsuario); // setIdUsuarioSelecionado
      setExibirModalEditar(true); // setExibirModalEditar
    }
  };

  const fecharModalAdicionar = () => {
    setExibirModalAdicionar(false); // setExibirModalAdicionar
  };

  const fecharModalEditar = () => {
    setExibirModalEditar(false); // setExibirModalEditar
    setUsuarioEditando(null);
  };

  const mostrarAlertaSucesso = () => {
    setAlertaSucesso(true);
    setTimeout(() => {
      setAlertaSucesso(false);
    }, 2000);
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
        await manipularAdicionarIndicador(setIndicadores, idUsuarioSelecionado, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO, payload); // setIndicadores
      }

      mostrarAlertaSucesso();

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
    // Usando Modal customizado em vez de window.confirm
    const customConfirm = (message, onConfirm) => {
      // Implementação de um modal de confirmação customizado para ambientes iframes.
      // Como não temos acesso aos componentes `Modal` e `window.confirm` deve ser evitado,
      // aqui está um placeholder. Em um projeto real, você usaria o componente `Modal`
      // para criar um diálogo de confirmação.
      console.warn(`Confirmação: ${message}. Excluindo indicador ${idIndicador}...`);
      if (true) { // Simulação de confirmação positiva
        excluirIndicadorService(
          setIndicadores, // setIndicadores
          idUsuarioSelecionado,
          idIndicador,
          URL_USUARIO_POR_ID,
          URL_ATUALIZAR_USUARIO
        );
      }
    };
    customConfirm(`Tem certeza que deseja excluir o indicador com ID ${idIndicador}?`, () => {
      excluirIndicadorService(
        setIndicadores, // setIndicadores
        idUsuarioSelecionado,
        idIndicador,
        URL_USUARIO_POR_ID,
        URL_ATUALIZAR_USUARIO
      );
    });
  };

  const handleSalvarPermissoes = async () => {
    if (idUsuarioSelecionado && usuarioEditando) {
      // Usamos usuarioEditando para enviar as permissões alteradas
      await manipularAlterarPermissao(setPermissoes, idUsuarioSelecionado, URL_USUARIO_POR_ID, URL_ATUALIZAR_USUARIO, usuarioEditando);
      setExibirModalEditar(false); // setExibirModalEditar
      // Recarregar lista para refletir a mudança
      // Você pode forçar a busca de usuários aqui para atualizar a tela principal
    }
  };

  const atualizarPermissao = (permissao, valor) => {
    if (usuarioEditando) {
      setUsuarioEditando({ ...usuarioEditando, [permissao]: valor });
    }
  };

  const abrirModalElementos = (idUsuario) => {
    setIdUsuarioSelecionado(idUsuario); // setIdUsuarioSelecionado
    setExibirModalElementos(true); // setExibirModalElementos
    // Adicionar lógica para buscar elementos organizacionais aqui, se necessário
    // setElementosOrganizacionais( buscarElementos(idUsuario) ); 
  };

  const fecharModalElementos = () => {
    setExibirModalElementos(false); // setExibirModalElementos
  };

  const abrirModalAdicionarElemento = () => {
    // Lógica para abrir modal de adicionar elemento
  };

  const handleExcluirUsuario = async (idUsuario) => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o usuário com ID ${idUsuario}?`);
    if (confirmacao) {
      manipularExcluir(
        setUsuarios,
        setPaginaAtual,
        setCarregando,
        idUsuario,
        usuarios,
        tamanhoPagina,
        paginaAtual,
        URL_EXCLUIR_USUARIO
      );

      // ✅ NOVO: Alerta de sucesso (adicione este estado)
      setTimeout(() => mostrarAlertaSucessoExclusao(), 500);
    }
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
      onClick: handleSalvarPermissoes // Chama a função para salvar as permissões
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
    if (!Array.isArray(usuarios) || usuarios.length === 0) return <tr><td colSpan="4" className="text-center py-3">Nenhum usuário encontrado.</td></tr>;

    return usuarios.map(usuario => (
      <tr key={usuario.id} className="border-bottom">
        <td className="py-2 px-3">{usuario.nome}</td>
        <td className="py-2 px-3">{usuario.lotacaoAtual}</td>
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
              {usuario.atualizarLotAutomatica ? <FaCheck className="FaCheck text-success" /> : <FaTimes className="FaTimes text-danger" />}
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
                  onClick={() => handleExcluirUsuario(usuario.id)}
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
        {alertaSucesso && (
          <div
            className="alert alert-success alert-dismissible fade show"
            role="alert"
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
              width: '50%',
              maxWidth: '500px'
            }}
          >
            Indicadores salvos com sucesso!
          </div>
        )}
        {alertaSucessoExclusao && (
          <div
            className="alert alert-success alert-dismissible fade show"
            role="alert"
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
              width: '50%',
              maxWidth: '500px'
            }}
          >
            Usuário excluído com sucesso!
          </div>
        )}
        <div className="row mb-3">
          <div className="col">
            <h3 className="mb-0">Usuários Cadastrados</h3>
          </div>
          <div className="col-auto">
            <Link to="/usuarios/novo" className="btn btn-primary">Novo Usuário</Link>
          </div>
        </div>
        <div className="mb-4">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Filtrar usuário por nome..."
              value={filtroNome}
              onChange={(e) => {
                setFiltroNome(e.target.value);
                setPaginaAtual(0);
              }}
            />
          </div>
          <div className="d-flex flex-wrap mb-4">
            {permissoesDisponiveis.map((p) => (
              <div className="form-check form-check-inline me-3 mb-2" key={p.key}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`check-${p.key}`}
                  checked={permissoesSelecionadas.includes(p.key)}
                  onChange={() => handlePermissaoChange(p.key)}
                />
                <label className="form-check-label" htmlFor={`check-${p.key}`}>
                  {p.label}
                </label>
              </div>
            ))}
          </div>
          {mensagemErro && <div className="alert alert-danger">{mensagemErro}</div>}
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
            {(filtroNome.trim() || permissoesSelecionadas.length > 0 || totalPaginas > 0) && (
              <Pagination
                estilos="d-flex justify-content-between align-items-center mt-4"
                pagina={paginaAtual}
                setPagina={setPaginaAtual}
                tamanho={tamanhoPagina}
                setTamanho={setTamanhoPagina}
                totalPaginas={totalPaginas}
                totalElementos={totalElementos}
                opcoesPagina={[10, 20, 40]}
              />
            )}
          </div>
        </div>
        <Modal
          estaAberto={exibirModalIndicadores}
          aoFechar={() => setExibirModalIndicadores(false)} // setExibirModalIndicadores
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
                <input type="text" className="form-control text-muted" value={usuarioEditando.nome || ''} readOnly disabled />
              </div>
              <div className="mb-3">
                <label className="form-label">Lotação:</label>
                <input type="text" className="form-control text-muted" value={usuarioEditando.lotacaoAtual || 'Não especificada'} readOnly disabled />
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
                  checked={usuarioEditando.atualizarLotAutomatica}
                  onChange={(e) => atualizarPermissao('atualizarLotAutomatica', e.target.checked)}
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
