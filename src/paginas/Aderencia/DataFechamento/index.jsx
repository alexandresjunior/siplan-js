import React, { useState, useEffect } from 'react';
import Cabecalho from "../../../componentes/Cabecalho";
import { Rodape } from "../../../componentes/Rodape";
import Pagination from "../../../componentes/Pagination";
import Modal from "../../../componentes/Modal";
import { FiEdit } from 'react-icons/fi';
import { AiOutlineDelete } from 'react-icons/ai';
import { 
    buscarConfiguracoes, criarConfiguracao, atualizarConfiguracao, excluirConfiguracao,
    buscarCiclos, buscarDiretorias
} from "../../../services/dataFechamentoService";
import axios from 'axios';

const URL_API_PAGINADO = 'http://localhost:8098/aderenciaconfiguracao/buscaPaginadaTipoConfiguracao';
const URL_API_BASE = 'http://localhost:8098/aderenciaconfiguracao';
const URL_CICLOS = 'http://localhost:8098/indicador/ciclos'; 
const URL_DIRETORIAS = 'http://localhost:8098/elementoOrganizacional/apenasDiretorias/2025'; 

function DataFechamento() {
    const [listaDiretorias, setListaDiretorias] = useState([]);
    const [paginaAtualDiretorias, setPaginaAtualDiretorias] = useState(0);
    const [tamanhoPaginaDiretorias, setTamanhoPaginaDiretorias] = useState(10);
    const [totalPaginasDiretorias, setTotalPaginasDiretorias] = useState(0);
    const [totalElementosDiretorias, setTotalElementosDiretorias] = useState(0);
    const [carregandoDiretorias, setCarregandoDiretorias] = useState(true);

    const [listaCoordenacoes, setListaCoordenacoes] = useState([]);
    const [paginaAtualCoordenacoes, setPaginaAtualCoordenacoes] = useState(0);
    const [tamanhoPaginaCoordenacoes, setTamanhoPaginaCoordenacoes] = useState(10);
    const [totalPaginasCoordenacoes, setTotalPaginasCoordenacoes] = useState(0);
    const [totalElementosCoordenacoes, setTotalElementosCoordenacoes] = useState(0);
    const [carregandoCoordenacoes, setCarregandoCoordenacoes] = useState(true);

    const [exibirModalNovo, setExibirModalNovo] = useState(false);
    const [exibirModalEditar, setExibirModalEditar] = useState(false);
    const [exibirModalExcluir, setExibirModalExcluir] = useState(false);
    const [configSelecionada, setConfigSelecionada] = useState(null);
    const [opcoesCiclos, setOpcoesCiclos] = useState([]);
    const [opcoesDiretorias, setOpcoesDiretorias] = useState([]);

    const recarregarDados = () => {
        const settersDiretorias = { setLista: setListaDiretorias, setTotalPaginas: setTotalPaginasDiretorias, setTotalElementos: setTotalElementosDiretorias, setCarregando: setCarregandoDiretorias };
        const settersCoordenacoes = { setLista: setListaCoordenacoes, setTotalPaginas: setTotalPaginasCoordenacoes, setTotalElementos: setTotalElementosCoordenacoes, setCarregando: setCarregandoCoordenacoes };
        
        buscarConfiguracoes(settersDiretorias, paginaAtualDiretorias, tamanhoPaginaDiretorias, 2, URL_API_PAGINADO);
        buscarConfiguracoes(settersCoordenacoes, paginaAtualCoordenacoes, tamanhoPaginaCoordenacoes, 1, URL_API_PAGINADO);
    };

    useEffect(() => {
        recarregarDados();
    }, [paginaAtualDiretorias, tamanhoPaginaDiretorias, paginaAtualCoordenacoes, tamanhoPaginaCoordenacoes]);

    useEffect(() => {
        const carregarOpcoes = async () => {
            try {
                const [ciclosData, diretoriasData] = await Promise.all([
                    buscarCiclos(URL_CICLOS),
                    buscarDiretorias(URL_DIRETORIAS)
                ]);
                setOpcoesCiclos(ciclosData);
                setOpcoesDiretorias(diretoriasData);
            } catch (error) {
                console.error("Erro ao carregar opções para o modal:", error);
            }
        };
        carregarOpcoes();
    }, []);

    const fecharModais = () => {
        setExibirModalNovo(false);
        setExibirModalEditar(false);
        setExibirModalExcluir(false);
        setConfigSelecionada(null);
    };

    const abrirModalNovo = (tipoConfiguracao) => {
        setConfigSelecionada({
            ano: new Date().getFullYear(),
            ciclo: null,
            diretoria: null,
            dataFechamento: '',
            tipoConfiguracao
        });
        setExibirModalNovo(true);
    };

    const abrirModalEditar = async (id) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                alert("Usuário não autenticado. Por favor, faça o login novamente.");
                return;
            }

            const { data } = await axios.get(`${URL_API_BASE}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const configParaForm = {
                ...data,
                dataFechamento: data.dataFechamento
                    ? new Date(data.dataFechamento).toISOString().split('T')[0]
                    : ''
            };
            setConfigSelecionada(configParaForm);
            setExibirModalEditar(true);
        } catch (error) {
            console.error(`Erro ao buscar configuração com id ${id}:`, error);
            alert('Falha ao carregar os dados para edição. Verifique o console.');
        }
    };

    const abrirModalExcluir = (config) => {
        setConfigSelecionada(config);
        setExibirModalExcluir(true);
    };
    
    const handleFormChange = (e) => {
        const { name, value } = e.target;

        if (name === "ciclo") {
            setConfigSelecionada(prev => ({ ...prev, ciclo: parseInt(value) }));
        } else if (name === "diretoria") {
            setConfigSelecionada(prev => ({ ...prev, diretoria: { id: parseInt(value) } }));
        } else {
            setConfigSelecionada(prev => ({ ...prev, [name]: value }));
        }
    };

    const prepararConfig = (config) => ({
        ...config,
        dataFechamento: config.dataFechamento
            ? new Date(config.dataFechamento + "T03:00:00.000Z").toISOString()
            : null
    });

    const handleCriar = async () => {
        try {
            await criarConfiguracao(prepararConfig(configSelecionada), URL_API_BASE);
            fecharModais();
            recarregarDados();
        } catch (error) {
            console.error("Erro ao criar configuração:", error);
            alert(`Falha ao criar configuração: ${error.message}`);
        }
    };

    const handleEditar = async () => {
        try {
            await atualizarConfiguracao(prepararConfig(configSelecionada), URL_API_BASE);
            fecharModais();
            recarregarDados();
        } catch (error) {
            console.error("Erro ao editar configuração:", error);
            alert(`Falha ao editar configuração: ${error.message}`);
        }
    };

    const handleExcluir = async () => {
        try {
            await excluirConfiguracao(configSelecionada.id, URL_API_BASE);
            fecharModais();
            if (listaDiretorias.length === 1 && paginaAtualDiretorias > 0) {
                setPaginaAtualDiretorias(paginaAtualDiretorias - 1);
            } else if (listaCoordenacoes.length === 1 && paginaAtualCoordenacoes > 0) {
                setPaginaAtualCoordenacoes(paginaAtualCoordenacoes - 1);
            } else {
                recarregarDados();
            }
        } catch (error) {
            console.error("Erro ao excluir configuração:", error);
            alert(`Falha ao excluir configuração: ${error.message}`);
        }
    };

    const renderizarLinhas = (lista, carregando) => {
        if (carregando)
            return <tr><td colSpan="5" className="text-center py-4">Carregando...</td></tr>;
        if (lista.length === 0)
            return <tr><td colSpan="5" className="text-center py-4">Nenhum registro encontrado.</td></tr>;

        return lista.map(item => (
            <tr key={item.id}>
                <td>{item.nome}</td>
                <td className="text-center">{item.ciclo}</td>
                <td className="text-center">{item.ano}</td>
                <td className="text-center">
                    {item.dataFechamento || '—'}
                </td>
                <td className="text-center">
                    <div className="dropdown">
                        <button
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{ fontSize: "1.5em", background: "none", border: "none" }}
                        >
                            ⋮
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <a
                                    className="dropdown-item d-flex align-items-center"
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); abrirModalEditar(item.id); }}
                                >
                                    <FiEdit className="me-2" /> Editar
                                </a>
                            </li>
                            <li>
                                <button
                                    className="dropdown-item text-danger d-flex align-items-center"
                                    onClick={() => abrirModalExcluir(item)}
                                >
                                    <AiOutlineDelete className="me-2" /> Excluir
                                </button>
                            </li>
                        </ul>
                    </div>
                </td>
            </tr>
        ));
    };

    const renderizarFormulario = () => (
        <div>
            <div className="mb-3">
                <label className="form-label">Ano</label>
                <input
                    type="number"
                    name="ano"
                    className="form-control"
                    value={configSelecionada?.ano || ''}
                    onChange={handleFormChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Ciclo</label>
                <select
                    name="ciclo"
                    className="form-select"
                    value={configSelecionada?.ciclo || ''}
                    onChange={handleFormChange}
                >
                    <option value="">Selecione um Ciclo</option>
                    {opcoesCiclos.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Diretoria / Gerência / Coordenação</label>
                <select
                    name="diretoria"
                    className="form-select"
                    value={configSelecionada?.diretoria?.id || ''}
                    onChange={handleFormChange}
                >
                    <option value="">Selecione uma Unidade</option>
                    {opcoesDiretorias.map(d => (
                        <option key={d.id} value={d.id}>{d.nome}</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Data de Fechamento</label>
                <input
                    type="date"
                    name="dataFechamento"
                    className="form-control"
                    value={configSelecionada?.dataFechamento || ''}
                    onChange={handleFormChange}
                />
            </div>
        </div>
    );

    return (
        <>
            <Cabecalho />
            <div className="container mt-5 mb-3">
                <div className="card mb-5">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">Diretorias e Gerências</h4>
                        <button onClick={() => abrirModalNovo(2)} className="btn btn-primary">
                            Nova Data de Fechamento
                        </button>
                    </div>
                    <div className="card-body">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th style={{ width: '40%' }}>Nome</th>
                                    <th className="text-center" style={{ width: '15%' }}>Ciclo</th>
                                    <th className="text-center" style={{ width: '15%' }}>Ano</th>
                                    <th className="text-center" style={{ width: '15%' }}>Data de Fechamento</th>
                                    <th className="text-center" style={{ width: '15%' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderizarLinhas(listaDiretorias, carregandoDiretorias)}
                            </tbody>
                        </table>
                        <Pagination
                            estilos="d-flex justify-content-between align-items-center mt-4"
                            pagina={paginaAtualDiretorias}
                            definirPagina={setPaginaAtualDiretorias}
                            totalPaginas={totalPaginasDiretorias}
                            totalElementos={totalElementosDiretorias}
                            tamanho={tamanhoPaginaDiretorias}
                            definirTamanho={setTamanhoPaginaDiretorias}
                        />
                    </div>
                </div>
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">Coordenações</h4>
                        <button onClick={() => abrirModalNovo(1)} className="btn btn-primary">
                            Nova Data de Fechamento
                        </button>
                    </div>
                    <div className="card-body">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th style={{ width: '40%' }}>Nome</th>
                                    <th className="text-center" style={{ width: '15%' }}>Ciclo</th>
                                    <th className="text-center" style={{ width: '15%' }}>Ano</th>
                                    <th className="text-center" style={{ width: '15%' }}>Data de Fechamento</th>
                                    <th className="text-center" style={{ width: '15%' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderizarLinhas(listaCoordenacoes, carregandoCoordenacoes)}
                            </tbody>
                        </table>
                        <Pagination
                            estilos="d-flex justify-content-between align-items-center mt-4"
                            pagina={paginaAtualCoordenacoes}
                            definirPagina={setPaginaAtualCoordenacoes}
                            totalPaginas={totalPaginasCoordenacoes}
                            totalElementos={totalElementosCoordenacoes}
                            tamanho={tamanhoPaginaCoordenacoes}
                            definirTamanho={setTamanhoPaginaCoordenacoes}
                        />
                    </div>
                </div>
            </div>
            <Modal
                estaAberto={exibirModalNovo}
                aoFechar={fecharModais}
                titulo="Nova Configuração de Fechamento"
                botoesAcao={[{ label: 'Salvar', className: 'btn btn-primary', onClick: handleCriar }]}
            >
                {renderizarFormulario()}
            </Modal>
            <Modal
                estaAberto={exibirModalEditar}
                aoFechar={fecharModais}
                titulo="Editar Configuração de Fechamento"
                botoesAcao={[{ label: 'Salvar Alterações', className: 'btn btn-primary', onClick: handleEditar }]}
            >
                {renderizarFormulario()}
            </Modal>
            <Modal
                estaAberto={exibirModalExcluir}
                aoFechar={fecharModais}
                titulo="Confirmar Exclusão"
                botoesAcao={[{ label: 'Excluir', className: 'btn btn-danger', onClick: handleExcluir }]}
            >
                <p>Você tem certeza que deseja excluir o registro para <strong>{configSelecionada?.nome}</strong>?</p>
            </Modal>
            <Rodape />
        </>
    );
}

export default DataFechamento;