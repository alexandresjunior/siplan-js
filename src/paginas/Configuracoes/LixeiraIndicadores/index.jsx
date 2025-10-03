import React, { useState, useEffect } from 'react';
import { Rodape } from '../../../componentes/Rodape';
import Cabecalho from "../../../componentes/Cabecalho";
import Pagination from "../../../componentes/Pagination";
import Modal from "../../../componentes/Modal";
import { FaUndo, FaTrash } from 'react-icons/fa';
import { buscarIndicadoresExcluidosPaginados, restaurarIndicador, excluirIndicadorPermanentemente } from "../../../service/indicadorService";
import Filtros from "../../../componentes/Filtros";

function LixeiraIndicadores() {

    const [indicadores, setIndicadores] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [tamanhoPagina, setTamanhoPagina] = useState(10);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [totalElementos, setTotalElementos] = useState(0);
    const [carregando, setCarregando] = useState(false);
    const [unidadeSelecionadaId, setUnidadeSelecionadaId] = useState(null);
    const [indicadorSelecionado, setIndicadorSelecionado] = useState(null);
    const [exibirModalRestaurar, setExibirModalRestaurar] = useState(false);
    const [exibirModalExcluir, setExibirModalExcluir] = useState(false);


    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [carregandoFiltros, setCarregandoFiltros] = useState(false);


    useEffect(() => {
        if (unidadeSelecionadaId) {
            carregarIndicadores();
        }
        
    }, [unidadeSelecionadaId, paginaAtual, tamanhoPagina]);

    
    const handleBusca = (idUnidade) => {
        setIndicadores([]);
        setUnidadeSelecionadaId(idUnidade);
        setPaginaAtual(0);
    };

    const carregarIndicadores = async () => {
        setCarregando(true);
        try {
            const dados = await buscarIndicadoresExcluidosPaginados(unidadeSelecionadaId, paginaAtual, tamanhoPagina);
            setIndicadores(dados.content);
            setTotalPaginas(dados.totalPages);
            setTotalElementos(dados.totalElements);
        } catch (erro) {
            console.error("Erro ao carregar indicadores da lixeira:", erro);
            alert('Falha ao carregar indicadores. Verifique o console.');
        } finally {
            setCarregando(false);
        }
    };

    const abrirModalRestaurar = (indicador) => {
        setIndicadorSelecionado(indicador);
        setExibirModalRestaurar(true);
    };

    const abrirModalExcluir = (indicador) => {
        setIndicadorSelecionado(indicador);
        setExibirModalExcluir(true);
    };

    const fecharModais = () => {
        setIndicadorSelecionado(null);
        setExibirModalRestaurar(false);
        setExibirModalExcluir(false);
    };

    const handleRestaurar = async () => {
        if (!indicadorSelecionado) return;
        try {
            await restaurarIndicador(indicadorSelecionado.id);
            fecharModais();

            if (indicadores.length === 1 && paginaAtual > 0) {
                setPaginaAtual(paginaAtual - 1);
            } else {
                carregarIndicadores();
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao restaurar indicador.');
        }
    };

    const handleExcluir = async () => {
        if (!indicadorSelecionado) return;
        try {
            await excluirIndicadorPermanentemente(indicadorSelecionado.id);
            fecharModais();

            if (indicadores.length === 1 && paginaAtual > 0) {
                setPaginaAtual(paginaAtual - 1);
            } else {
                carregarIndicadores();
            }

        } catch (error) {
            console.error(error);
            alert('Erro ao remover indicador.');
        }
    };

    return (
        <>
            <Cabecalho />
            <div className="container mt-5 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>Lixeira de Indicadores</h3>
                    {!mostrarFiltros && (
                        <button className="btn btn-secondary" onClick={() => setMostrarFiltros(true)}>
                            Exibir Estrutura Organizacional
                        </button>
                    )}
                </div>

                {mostrarFiltros && (
                    <Filtros onBuscaClick={handleBusca} setCarregandoFiltros={setCarregandoFiltros} />
                )}

                {carregandoFiltros && <div className="text-center my-3">Carregando filtros...</div>}

                <div className="card">
                    <div className="card-body">

                        <table className="table table-striped table-hover">
                            <thead>
                                <tr className="table-light">
                                    <th className="p-3">Nome do Indicador</th>
                                    <th className="p-3">Unidade Operacional</th>
                                    <th className="p-3">Tipo</th>
                                    <th className="p-3 text-center" style={{ width: "20%" }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {carregando ? (
                                    <tr><td colSpan="4" className="text-center py-3">Carregando...</td></tr>
                                ) : indicadores.length > 0 ? (
                                    indicadores.map(indicador => (
                                        <tr key={indicador.id}>
                                            <td className="align-middle p-3">{indicador.nomeIndicador}</td>
                                            <td className="align-middle p-3">{indicador.unidadesOperacionais?.join(', ')}</td>
                                            <td className="align-middle p-3">{indicador.tipoIndicador}</td>
                                            <td className="px-3 text-center">
                                                <div className="dropdown">
                                                    <button type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ fontSize: "1.5em", background: "none", border: "none" }}>
                                                        ⋮
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li><a className="dropdown-item" href="#" onClick={() => abrirModalRestaurar(indicador)}><FaUndo className="me-1" /> Restaurar</a></li>
                                                        <li><button className="dropdown-item text-danger" onClick={() => abrirModalExcluir(indicador)}><FaTrash className="me-1" /> Excluir</button></li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="text-center py-3">
                                        {unidadeSelecionadaId ? 'Nenhum indicador na lixeira para esta unidade.' : 'Selecione uma estrutura organizacional para começar.'}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>

                        {totalElementos > 0 && !carregando && (
                            <Pagination
                                estilos="d-flex justify-content-between align-items-center mt-4"
                                pagina={paginaAtual}
                                definirPagina={setPaginaAtual}
                                tamanho={tamanhoPagina}
                                definirTamanho={setTamanhoPagina}
                                totalPaginas={totalPaginas}
                                totalElementos={totalElementos}
                                opcoesPagina={[10, 20, 40]}
                            />
                        )}

                    </div>
                </div>
            </div>
            <Rodape />

            <Modal
                estaAberto={exibirModalRestaurar}
                aoFechar={fecharModais}
                titulo="Confirmar Restauração"
                botoesAcao={[{ label: 'Restaurar', className: 'btn btn-primary', onClick: handleRestaurar }]}
            >
                <p>Você tem certeza que deseja restaurar o indicador: <strong>{indicadorSelecionado?.nomeIndicador}</strong>?</p>
            </Modal>

            <Modal
                estaAberto={exibirModalExcluir}
                aoFechar={fecharModais}
                titulo="Confirmar Exclusão Permanente"
                botoesAcao={[{ label: 'Excluir Permanentemente', className: 'btn btn-danger', onClick: handleExcluir }]}
            >
                <p>Você tem certeza que deseja remover permanentemente o indicador: <strong>{indicadorSelecionado?.nomeIndicador}</strong>?</p>
                <p className="fw-bold text-danger">Esta ação não pode ser desfeita.</p>
            </Modal>
        </>
    );
}

export default LixeiraIndicadores;