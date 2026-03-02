import React, { useState, useEffect, useCallback } from 'react';
import { Rodape } from '../../../componentes/Rodape';
import Cabecalho from '../../../componentes/Cabecalho';
import Pagination from '../../../componentes/Pagination';
import Modal from '../../../componentes/Modal';
import Filtros from '../../../componentes/Filtros';
import InputBuscaIndicador from '../../../componentes/InputBuscaIndicador';

import { FaEdit, FaTrash, FaPlus, FaLock, FaLockOpen, FaSearch, FaSave, FaCalculator } from 'react-icons/fa';

import {
    buscarIndicadoresPaginados,
    salvarIndicador,
    excluirIndicadorLogico,
    buscarTiposIndicador,
    buscarSentidosIndicador,
    buscarRiscosPorAno,
    buscarObjetivosPorAno,
    buscarVariaveisDoIndicador 
} from '../../../services/indicador';

import {
    buscarElementosPorNome,
    buscarElementosPorDiretoriaEAno,
    buscarDiretoriasPorAno
} from '../../../services/elementoOrganizacional';

function CadastroIndicadores() {

    const [listaIndicadores, setListaIndicadores] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [tamanhoPagina, setTamanhoPagina] = useState(10);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [totalElementos, setTotalElementos] = useState(0);
    const [filtroUnidade, setFiltroUnidade] = useState(null);
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
    const [indicadoresTags, setIndicadoresTags] = useState([]);
    const [carregandoFiltros, setCarregandoFiltros] = useState(false);
    const [modalFormAberto, setModalFormAberto] = useState(false);
    const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
    const [modalVinculoAberto, setModalVinculoAberto] = useState(false);
    const [modalFormulaAberto, setModalFormulaAberto] = useState(false);
    const [itemEmEdicao, setItemEmEdicao] = useState({
        nomeIndicador: '', descricao: '', tipoIndicador: null, sentidoIndicador: null, unidadeMedida: '',
        risco: null, objetivo: null, indicadorVinculado: '', elementoOrganizacionalResp: null, elementosOrganizacionaisRelacionados: []
    });
    const [listaTipos, setListaTipos] = useState([]);
    const [listaSentidos, setListaSentidos] = useState([]);
    const [listaRiscos, setListaRiscos] = useState([]);
    const [listaObjetivos, setListaObjetivos] = useState([]);
    const [listaVariaveisFormula, setListaVariaveisFormula] = useState([]);
    const [formulaEmEdicao, setFormulaEmEdicao] = useState('');
    const [termoUnidadeResp, setTermoUnidadeResp] = useState('');
    const [sugestoesUnidadeResp, setSugestoesUnidadeResp] = useState([]);
    const [mostraSugestoesResp, setMostraSugestoesResp] = useState(false);
    const [vinculoAno, setVinculoAno] = useState(''); 
    const [vinculoDiretoria, setVinculoDiretoria] = useState(''); 
    const [listaDiretoriasModal, setListaDiretoriasModal] = useState([]);
    const [listaUnidadesModal, setListaUnidadesModal] = useState([]);
    const [unidadesSelecionadasModal, setUnidadesSelecionadasModal] = useState([]);
    const [listaAnosModal, setListaAnosModal] = useState([]); 

    useEffect(() => {
        Promise.all([buscarTiposIndicador(), buscarSentidosIndicador()]).then(([tipos, sentidos]) => {
            setListaTipos(tipos); setListaSentidos(sentidos);
        }).catch(err => console.error(err));
        const anoAtual = new Date().getFullYear();
        const anos = [];
        for (let i = anoAtual; i >= 2022; i--) anos.push(i);
        setListaAnosModal(anos);
    }, []);

    const carregarIndicadores = useCallback(async () => {
        if (!filtroUnidade || !anoSelecionado) { setListaIndicadores([]); return; }
        setCarregando(true);
        try {
            const idsTags = indicadoresTags.map(tag => tag.id);
            const dados = await buscarIndicadoresPaginados(filtroUnidade, anoSelecionado, paginaAtual, tamanhoPagina, idsTags);
            if (dados && dados.content) {
                setListaIndicadores(dados.content); setTotalPaginas(dados.totalPages); setTotalElementos(dados.totalElements);
            } else { setListaIndicadores([]); setTotalElementos(0); }
        } catch (erro) { console.error(erro); setListaIndicadores([]); } finally { setCarregando(false); }
    }, [filtroUnidade, anoSelecionado, paginaAtual, tamanhoPagina, indicadoresTags]);

    useEffect(() => { carregarIndicadores(); }, [carregarIndicadores]);
    useEffect(() => { setPaginaAtual(0); }, [filtroUnidade, anoSelecionado, indicadoresTags, tamanhoPagina]);

    const carregarDadosFormulario = async () => {
        try { const anoBase = 2024; const [riscos, objetivos] = await Promise.all([buscarRiscosPorAno(anoBase), buscarObjetivosPorAno(anoBase)]); setListaRiscos(riscos); setListaObjetivos(objetivos); } catch (error) { console.error(error); }
    };

    useEffect(() => { const timer = setTimeout(() => { if (termoUnidadeResp.length > 2) { buscarElementosPorNome(termoUnidadeResp).then(data => { setSugestoesUnidadeResp(data || []); setMostraSugestoesResp(true); }); } else { setMostraSugestoesResp(false); } }, 500); return () => clearTimeout(timer); }, [termoUnidadeResp]);
    const selecionarUnidadeResponsavel = (unidade) => { setItemEmEdicao({ ...itemEmEdicao, elementoOrganizacionalResp: unidade }); setTermoUnidadeResp(''); setMostraSugestoesResp(false); };
    useEffect(() => { if (modalVinculoAberto) { setVinculoAno(''); setVinculoDiretoria(''); setListaDiretoriasModal([]); setListaUnidadesModal([]); setUnidadesSelecionadasModal([...(itemEmEdicao.elementosOrganizacionaisRelacionados || [])]); } }, [modalVinculoAberto]);
    useEffect(() => { if (vinculoAno) { setListaDiretoriasModal([]); setVinculoDiretoria(''); setListaUnidadesModal([]); buscarDiretoriasPorAno(vinculoAno).then(data => setListaDiretoriasModal(data || [])).catch(err => console.error(err)); } else { setListaDiretoriasModal([]); } }, [vinculoAno]);
    useEffect(() => { if (vinculoDiretoria && vinculoAno) { buscarElementosPorDiretoriaEAno(vinculoAno, vinculoDiretoria).then(setListaUnidadesModal).catch(err => console.error(err)); } else { setListaUnidadesModal([]); } }, [vinculoDiretoria, vinculoAno]);
    const toggleUnidadeModal = (unidade) => { const jaSelecionado = unidadesSelecionadasModal.some(u => u.id === unidade.id); if (jaSelecionado) { setUnidadesSelecionadasModal(unidadesSelecionadasModal.filter(u => u.id !== unidade.id)); } else { setUnidadesSelecionadasModal([...unidadesSelecionadasModal, unidade]); } };
    const toggleTodosModal = (e) => { if (e.target.checked) { const novos = listaUnidadesModal.filter(u => !unidadesSelecionadasModal.some(sel => sel.id === u.id)); setUnidadesSelecionadasModal([...unidadesSelecionadasModal, ...novos]); } else { const idsParaRemover = listaUnidadesModal.map(u => u.id); setUnidadesSelecionadasModal(unidadesSelecionadasModal.filter(u => !idsParaRemover.includes(u.id))); } };
    const salvarSelecaoModal = () => { setItemEmEdicao({ ...itemEmEdicao, elementosOrganizacionaisRelacionados: unidadesSelecionadasModal }); setModalVinculoAberto(false); };

    const handleNovoIndicador = () => { setItemEmEdicao({ nomeIndicador: '', descricao: '', tipoIndicador: null, sentidoIndicador: null, unidadeMedida: '', risco: null, objetivo: null, indicadorVinculado: '', elementoOrganizacionalResp: null, elementosOrganizacionaisRelacionados: [] }); setTermoUnidadeResp(''); setUnidadesSelecionadasModal([]); carregarDadosFormulario(); setModalFormAberto(true); };
    const handleEditar = (indicador) => { const itemEdit = { ...indicador }; if (indicador.formula) itemEdit.indicadorVinculado = indicador.formula; setItemEmEdicao(itemEdit); if (indicador.elementoOrganizacionalResp) { setTermoUnidadeResp(indicador.elementoOrganizacionalResp.sigla + ' - ' + indicador.elementoOrganizacionalResp.nome); } else { setTermoUnidadeResp(''); } setUnidadesSelecionadasModal(indicador.elementosOrganizacionaisRelacionados || []); carregarDadosFormulario(); setModalFormAberto(true); };
    const handleSalvar = async () => { if (!itemEmEdicao.nomeIndicador || !itemEmEdicao.tipoIndicador) { alert("Preencha os campos obrigatórios (*)"); return; } try { const payload = prepararPayload(itemEmEdicao); await salvarIndicador(payload); setModalFormAberto(false); setPaginaAtual(0); carregarIndicadores(); alert('Indicador salvo com sucesso!'); } catch (error) { console.error("Erro no salvar:", error); const msg = error.response?.data?.message || "Erro de conexão"; alert(`Erro ao salvar: ${msg}`); } };

    const handleToggleAderencia = (id) => { const novaLista = listaIndicadores.map(ind => { if (ind.id === id) return { ...ind, indicadorAderencia: !ind.indicadorAderencia }; return ind; }); setListaIndicadores(novaLista); };
    const handleSalvarAderencia = async (indicadorRow) => { try { const payload = prepararPayload(indicadorRow); await salvarIndicador(payload); alert('Aderência atualizada!'); carregarIndicadores(); } catch (error) { alert("Erro ao salvar aderência."); carregarIndicadores(); } };

    // --- NOVO: Função para Alternar Bloqueio (Cadeado) ---
    const handleToggleBloqueio = async (indicadorRow) => {
        try {
            // Clona e inverte o valor atual (se null/undefined vira true, se false vira true, se true vira false)
            const novoValor = !indicadorRow.bloquearAlteracaoDeValores;
            
            // Prepara o objeto completo para salvar (usando a mesma lógica de limpeza)
            const payload = prepararPayload({ 
                ...indicadorRow, 
                bloquearAlteracaoDeValores: novoValor 
            });

            await salvarIndicador(payload);
            
            // Atualiza visualmente na lista sem precisar recarregar tudo do servidor (opcional, mas mais rápido)
            const novaLista = listaIndicadores.map(ind => 
                ind.id === indicadorRow.id ? { ...ind, bloquearAlteracaoDeValores: novoValor } : ind
            );
            
            setListaIndicadores(novaLista);
        } catch (error) {
            console.error("Erro ao alterar bloqueio:", error);
            alert("Erro ao alterar status de bloqueio.");
        }
    };

    // --- Helpers Lógicos de Tipo ---
    const isTipoVariavel = (tipo) => { const nome = tipo?.nome || tipo || ''; return String(nome).toLowerCase().includes('variável') || String(nome).toLowerCase().includes('variavel'); };
    const isTipoTatico = (tipo) => { const nome = tipo?.nome || tipo || ''; const n = String(nome).toLowerCase(); return n.includes('tático') || n.includes('tatico'); };
    const isTipoEstrategico = (tipo) => { const nome = tipo?.nome || tipo || ''; const n = String(nome).toLowerCase(); return n.includes('estratégico') || n.includes('estrategico'); };
    const isTipoOperacional = (tipo) => { const nome = tipo?.nome || tipo || ''; const n = String(nome).toLowerCase(); return n.includes('operacional'); };
    const getTiposDisponiveis = () => { if (!itemEmEdicao.id) return listaTipos; const atualEhVariavel = isTipoVariavel(itemEmEdicao.tipoIndicador); return listaTipos.filter(tipo => { const opcaoEhVariavel = isTipoVariavel(tipo); if (atualEhVariavel) return opcaoEhVariavel; return !opcaoEhVariavel; }); };
    const deveMostrarCampoVinculado = () => isTipoVariavel(itemEmEdicao.tipoIndicador);
    const deveMostrarBotaoFormula = () => { const tipo = itemEmEdicao.tipoIndicador; return isTipoTatico(tipo) || isTipoEstrategico(tipo) || isTipoOperacional(tipo); };

    // Payload Builder
    const prepararPayload = (item) => {
        const payload = { ...item };
        const ehVariavel = isTipoVariavel(item.tipoIndicador);
        const ehTatico = isTipoTatico(item.tipoIndicador);
        const ehEstrategico = isTipoEstrategico(item.tipoIndicador);
        const ehOperacional = isTipoOperacional(item.tipoIndicador);
        if ((ehVariavel || ehTatico || ehEstrategico || ehOperacional) && payload.indicadorVinculado) { payload.formula = payload.indicadorVinculado; } else { payload.formula = ""; }
        delete payload.indicadorVinculado; delete payload.unidadeFormatada; delete payload.tipoFormatado; delete payload.unidadeResponsavel;
        payload.indicadorManual = true; payload.indicadorExcluido = false; payload.indicadorAderencia = !!payload.indicadorAderencia;
        // Preserva o valor de bloqueio que veio no item
        payload.bloquearAlteracaoDeValores = !!payload.bloquearAlteracaoDeValores; 
        payload.responsavelIndicador = payload.responsavelIndicador || null;
        const findItemInList = (valor, lista) => { if (!valor) return null; if (typeof valor === 'object' && valor.id) return valor; const valorStr = String(valor).toUpperCase(); return lista.find(item => String(item.nome || item).toUpperCase() === valorStr); };
        const tipoEncontrado = findItemInList(payload.tipoIndicador, listaTipos); if (tipoEncontrado && tipoEncontrado.id) payload.tipoIndicador = { id: tipoEncontrado.id, nome: tipoEncontrado.nome };
        const sentidoEncontrado = findItemInList(payload.sentidoIndicador, listaSentidos); if (sentidoEncontrado && sentidoEncontrado.id) payload.sentidoIndicador = { id: sentidoEncontrado.id, nome: sentidoEncontrado.nome };
        payload.risco = payload.risco ? { id: payload.risco.id } : null; payload.objetivo = payload.objetivo ? { id: payload.objetivo.id } : null; payload.elementoOrganizacionalResp = payload.elementoOrganizacionalResp ? { id: payload.elementoOrganizacionalResp.id } : null;
        payload.elementosOrganizacionaisRelacionados = payload.elementosOrganizacionaisRelacionados ? payload.elementosOrganizacionaisRelacionados.map(e => ({ id: e.id })) : [];
        if (!payload.id) delete payload.id;
        return payload;
    };

    const handleExcluir = async () => { if (!itemEmEdicao) return; try { await excluirIndicadorLogico(itemEmEdicao.id); setModalExclusaoAberto(false); setItemEmEdicao({ nomeIndicador: '', descricao: '', tipoIndicador: null, sentidoIndicador: null, unidadeMedida: '', risco: null, objetivo: null, indicadorVinculado: '', elementoOrganizacionalResp: null, elementosOrganizacionaisRelacionados: [] }); carregarIndicadores(); } catch (error) { alert('Erro ao excluir.'); } };
    const textoUnidadeResponsavel = itemEmEdicao?.elementoOrganizacionalResp ? `${itemEmEdicao.elementoOrganizacionalResp.sigla} - ${itemEmEdicao.elementoOrganizacionalResp.nome}` : '';
    const textoElementosRelacionados = itemEmEdicao?.elementosOrganizacionaisRelacionados && itemEmEdicao.elementosOrganizacionaisRelacionados.length > 0 ? itemEmEdicao.elementosOrganizacionaisRelacionados.map(e => e.sigla).join(', ') : '';
    const handleAbrirFormula = async () => { if (!itemEmEdicao.id) { alert("Para montar a fórmula, primeiro salve o indicador para criar o vínculo com as variáveis."); return; } setFormulaEmEdicao(itemEmEdicao.indicadorVinculado || ''); try { const variaveis = await buscarVariaveisDoIndicador(itemEmEdicao.id); setListaVariaveisFormula(variaveis); setModalFormulaAberto(true); } catch (error) { alert("Erro ao buscar variáveis."); } };
    const salvarFormula = () => { setItemEmEdicao({ ...itemEmEdicao, indicadorVinculado: formulaEmEdicao }); setModalFormulaAberto(false); };
    const adicionarNaFormula = (v) => setFormulaEmEdicao(p => p + v);
    const adicionarVariavelNaFormula = (v) => setFormulaEmEdicao(p => p + `[${v}]`);
    const limparFormula = () => setFormulaEmEdicao('');

    return (
        <div className='d-flex flex-column min-vh-100'>
            <Cabecalho />
            <main className='flex-grow-1'>
                <div className="container mt-5 mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0">Indicadores Cadastrados</h3>
                        <button className="btn btn-primary" onClick={handleNovoIndicador}>Novo Indicador</button>
                    </div>
                    <div className="mb-4">
                        <Filtros onUnidadeChange={setFiltroUnidade} onAnoChange={setAnoSelecionado} setCarregandoFiltros={setCarregandoFiltros} />
                        <div className="card border-0 shadow-sm mt-3"><div className="card-body"><InputBuscaIndicador tagsSelecionadas={indicadoresTags} setTagsSelecionadas={setIndicadoresTags} filtroUnidade={filtroUnidade} /></div></div>
                    </div>
                    {carregandoFiltros && <div className="text-center my-3 spinner-border text-primary"></div>}
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-striped table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="p-3">Nome do Indicador</th>
                                            <th className="p-3">Unidade Operacional</th>
                                            <th className="p-3">Tipo</th>
                                            <th className="p-3 text-center">Aderência</th>
                                            <th className="p-3 text-center">Data Criação</th>
                                            <th className="p-3 text-center" style={{ width: "15%" }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {carregando ? (<tr><td colSpan="6" className="text-center py-4">Carregando...</td></tr>) : listaIndicadores.length > 0 ? (
                                            listaIndicadores.map(ind => (
                                                <tr key={ind.id}>
                                                    <td className="p-3 fw-semibold">{ind.nomeIndicador}</td>
                                                    <td className="p-3">{ind.elementosOrganizacionaisRelacionados && ind.elementosOrganizacionaisRelacionados.length > 0 ? ind.elementosOrganizacionaisRelacionados.map(eo => eo.sigla).join(', ') : '---'}</td>
                                                    <td className="p-3"><span className="badge bg-light text-dark border">{ind.tipoIndicador?.nome || ind.tipoIndicador || 'N/A'}</span></td>
                                                    <td className="p-3 text-center">
                                                        <div className="d-flex justify-content-center align-items-center gap-2">
                                                            <input type="checkbox" className="form-check-input" checked={ind.indicadorAderencia || false} onChange={() => handleToggleAderencia(ind.id)} />
                                                            <button className="btn btn-sm border-0 text-success" onClick={() => handleSalvarAderencia(ind)}><FaSave size={16} /></button>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">{ind.dataCriacao ? new Date(ind.dataCriacao).toLocaleDateString() : '-'}</td>
                                                    <td className="p-3 text-center">
                                                        
                                                        {/* --- BOTÃO DE CADEADO ATUALIZADO --- */}
                                                        <button 
                                                            className="btn btn-sm btn-link me-1" 
                                                            onClick={() => handleToggleBloqueio(ind)}
                                                            title={ind.bloquearAlteracaoDeValores ? "Desbloquear Alteração" : "Bloquear Alteração"}
                                                        >
                                                            {ind.bloquearAlteracaoDeValores ? (
                                                                <FaLock className="text-secondary" /> // Fechado
                                                            ) : (
                                                                <FaLockOpen className="text-success" /> // Aberto
                                                            )}
                                                        </button>
                                                        {/* ----------------------------------- */}

                                                        <button className="btn btn-sm btn-link text-primary me-1" onClick={() => handleEditar(ind)}><FaEdit size={18} /></button>
                                                        <button className="btn btn-sm btn-link text-danger" onClick={() => { setItemEmEdicao(ind); setModalExclusaoAberto(true); }}><FaTrash size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (<tr><td colSpan="6" className="text-center py-4 text-muted">{filtroUnidade ? 'Nenhum indicador encontrado.' : 'Selecione uma estrutura organizacional.'}</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                            {totalElementos > 0 && !carregando && (<div className="p-3"><Pagination estilos="d-flex justify-content-between align-items-center" pagina={paginaAtual} definirPagina={setPaginaAtual} tamanho={tamanhoPagina} definirTamanho={setTamanhoPagina} totalPaginas={totalPaginas} totalElementos={totalElementos} opcoesPagina={[10, 20, 40]} /></div>)}
                        </div>
                    </div>
                </div>
            </main>
            <Rodape />

            <Modal
                estaAberto={modalFormAberto}
                aoFechar={() => setModalFormAberto(false)}
                titulo={itemEmEdicao?.id ? "Editar Indicador" : "Novo Indicador"}
                botoesAcao={[]}
            >
                <form className="row g-3">
                    <div className="col-md-12">
                        <label className="form-label">Tipo de indicador *</label>
                        <select
                            className="form-select"
                            value={itemEmEdicao?.tipoIndicador?.nome || itemEmEdicao?.tipoIndicador || ''}
                            onChange={e => {
                                const val = e.target.value;
                                const selectedObj = listaTipos.find(t => (t.nome || t) === val);
                                setItemEmEdicao({ ...itemEmEdicao, tipoIndicador: selectedObj || val });
                            }}
                        >
                            <option value="">Selecione...</option>
                            {getTiposDisponiveis().map((t, i) => (
                                <option key={i} value={t.nome || t}>
                                    {t.nome || t}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-12">
                        <label className="form-label">Nome *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={itemEmEdicao?.nomeIndicador || ''}
                            onChange={e => setItemEmEdicao({ ...itemEmEdicao, nomeIndicador: e.target.value })}
                        />
                    </div>

                    <div className="col-md-12">
                        <label className="form-label">Descrição</label>
                        <textarea
                            className="form-control"
                            rows="2"
                            value={itemEmEdicao?.descricao || ''}
                            onChange={e => setItemEmEdicao({ ...itemEmEdicao, descricao: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Sentido *</label>
                        <select
                            className="form-select"
                            value={itemEmEdicao?.sentidoIndicador?.nome || itemEmEdicao?.sentidoIndicador || ''}
                            onChange={e => {
                                const val = e.target.value;
                                const selectedObj = listaSentidos.find(s => (s.nome || s) === val);
                                setItemEmEdicao({ ...itemEmEdicao, sentidoIndicador: selectedObj || val });
                            }}
                        >
                            <option value="">Selecione...</option>
                            {listaSentidos.map((s, i) => (
                                <option key={i} value={s.nome || s}>
                                    {s.nome || s}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Unidade de medida *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={itemEmEdicao?.unidadeMedida || ''}
                            onChange={e => setItemEmEdicao({ ...itemEmEdicao, unidadeMedida: e.target.value })}
                        />
                    </div>

                    <div className="col-md-12">
                        <label className="form-label">Risco * <small className="text-muted">(Base 2024)</small></label>
                        <select
                            className="form-select"
                            value={itemEmEdicao?.risco?.id || ''}
                            onChange={e => {
                                const r = listaRiscos.find(r => r.id === Number(e.target.value));
                                setItemEmEdicao({ ...itemEmEdicao, risco: r || null });
                            }}
                        >
                            <option value="">Selecione...</option>
                            {listaRiscos.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-12">
                        <label className="form-label">Objetivo Estratégico * <small className="text-muted">(Base 2024)</small></label>
                        <select
                            className="form-select"
                            value={itemEmEdicao?.objetivo?.id || ''}
                            onChange={e => {
                                const o = listaObjetivos.find(o => o.id === Number(e.target.value));
                                setItemEmEdicao({ ...itemEmEdicao, objetivo: o || null });
                            }}
                        >
                            <option value="">Selecione...</option>
                            {listaObjetivos.map(o => (
                                <option key={o.id} value={o.id}>
                                    {o.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-12 position-relative">
                        <label className="form-label">Unidade responsável pelo preenchimento</label>
                        {itemEmEdicao.elementoOrganizacionalResp ? (
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    disabled
                                    value={`${itemEmEdicao.elementoOrganizacionalResp.sigla} - ${itemEmEdicao.elementoOrganizacionalResp.nome}`}
                                />
                                <button
                                    className="btn btn-outline-danger"
                                    type="button"
                                    onClick={() => {
                                        setItemEmEdicao({ ...itemEmEdicao, elementoOrganizacionalResp: null });
                                        setTermoUnidadeResp('');
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Digite para pesquisar..."
                                    value={termoUnidadeResp}
                                    onChange={e => setTermoUnidadeResp(e.target.value)}
                                />
                                {mostraSugestoesResp && sugestoesUnidadeResp.length > 0 && (
                                    <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}>
                                        {sugestoesUnidadeResp.map((u, i) => (
                                            <li
                                                key={i}
                                                className="list-group-item list-group-item-action cursor-pointer"
                                                onClick={() => selecionarUnidadeResponsavel(u)}
                                            >
                                                {u.sigla} - {u.nome}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </div>

                    {deveMostrarCampoVinculado() ? (
                        <div className="col-md-12">
                            <label className="form-label">Indicador Vinculado</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Digite o indicador vinculado"
                                value={itemEmEdicao?.indicadorVinculado || ''}
                                onChange={e => setItemEmEdicao({ ...itemEmEdicao, indicadorVinculado: e.target.value })}
                            />
                        </div>
                    ) : (
                        <div className="col-md-12">
                            <label className="form-label">Diretoria / Gerência / Coordenação</label>
                            <div className="input-group" onClick={() => setModalVinculoAberto(true)} style={{ cursor: 'pointer' }}>
                                <input
                                    type="text"
                                    className="form-control bg-white"
                                    readOnly
                                    placeholder="Clique para selecionar..."
                                    value={textoElementosRelacionados}
                                    style={{ cursor: 'pointer' }}
                                />
                                <span className="input-group-text"><FaSearch /></span>
                            </div>
                        </div>
                    )}

                    <div className="col-12 mt-4 d-flex gap-2">
                        {deveMostrarBotaoFormula() && (
                            <button
                                type="button"
                                className="btn btn-warning fw-bold text-dark d-flex align-items-center"
                                onClick={handleAbrirFormula}
                            >
                                <FaCalculator className="me-2" /> Montar Fórmula
                            </button>
                        )}
                        <button type="button" className="btn btn-primary" onClick={handleSalvar}>Salvar</button>
                        <button type="button" className="btn btn-light border" onClick={() => setModalFormAberto(false)}>Voltar</button>
                    </div>
                </form>
            </Modal>

            {modalVinculoAberto && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Selecionar Estrutura Organizacional</h5>
                                <button type="button" className="btn-close" onClick={() => setModalVinculoAberto(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Ano Organograma</label>
                                        <select className="form-select" value={vinculoAno} onChange={e => setVinculoAno(e.target.value)}>
                                            <option value="">Selecione...</option>
                                            {listaAnosModal.map(ano => (
                                                <option key={ano} value={ano}>{ano}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Diretoria</label>
                                        <select
                                            className="form-select"
                                            value={vinculoDiretoria}
                                            onChange={e => setVinculoDiretoria(e.target.value)}
                                            disabled={!vinculoAno}
                                        >
                                            <option value="">Selecione...</option>
                                            {listaDiretoriasModal.map(dir => (
                                                <option key={dir.id} value={dir.id}>{dir.sigla}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="table-responsive border rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th style={{ width: '40px' }}>
                                                    <input type="checkbox" className="form-check-input" onChange={toggleTodosModal} />
                                                </th>
                                                <th>Sigla</th>
                                                <th>Nome</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {listaUnidadesModal.length > 0 ? listaUnidadesModal.map(u => (
                                                <tr key={u.id}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={unidadesSelecionadasModal.some(sel => sel.id === u.id)}
                                                            onChange={() => toggleUnidadeModal(u)}
                                                        />
                                                    </td>
                                                    <td>{u.sigla}</td>
                                                    <td>{u.nome}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center text-muted">
                                                        {vinculoDiretoria ? 'Nenhuma unidade encontrada.' : 'Selecione o Ano e a Diretoria para visualizar as opções.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-2 text-end text-muted small">{unidadesSelecionadasModal.length} itens selecionados</div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-warning fw-bold" onClick={salvarSelecaoModal}>Adicionar</button>
                                <button type="button" className="btn btn-light border" onClick={() => setModalVinculoAberto(false)}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalFormulaAberto && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-warning text-dark">
                                <h5 className="modal-title fw-bold"><FaCalculator className="me-2" /> Montar Fórmula</h5>
                                <button type="button" className="btn-close" onClick={() => setModalFormulaAberto(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Fórmula:</label>
                                    <textarea
                                        className="form-control font-monospace fs-5"
                                        rows="3"
                                        value={formulaEmEdicao}
                                        onChange={(e) => setFormulaEmEdicao(e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="row">
                                    <div className="col-md-5 border-end">
                                        <h6 className="fw-bold mb-3">Operadores</h6>
                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            {['+', '-', '*', '/', '(', ')'].map(op => (
                                                <button
                                                    key={op}
                                                    type="button"
                                                    className="btn btn-outline-dark fw-bold"
                                                    style={{ width: '50px' }}
                                                    onClick={() => adicionarNaFormula(op)}
                                                >
                                                    {op}
                                                </button>
                                            ))}
                                            <button type="button" className="btn btn-danger" onClick={limparFormula} title="Limpar Tudo">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-7">
                                        <h6 className="fw-bold mb-3">Variáveis Disponíveis do Indicador</h6>
                                        <div className="list-group border rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {listaVariaveisFormula.length > 0 ? (
                                                listaVariaveisFormula.map(v => (
                                                    <button
                                                        key={v.id}
                                                        type="button"
                                                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                                        onClick={() => adicionarVariavelNaFormula(v.nomeIndicador)}
                                                    >
                                                        <span>{v.nomeIndicador}</span>
                                                        <span className="badge bg-secondary rounded-pill">+</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 text-muted">Nenhuma variável associada a este indicador.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary fw-bold" onClick={salvarFormula}>
                                    <FaSave className="me-2" /> Salvar Fórmula
                                </button>
                                <button type="button" className="btn btn-light border" onClick={() => setModalFormulaAberto(false)}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Modal
                estaAberto={modalExclusaoAberto}
                aoFechar={() => setModalExclusaoAberto(false)}
                titulo="Confirmar Exclusão"
                botoesAcao={[{ label: 'Excluir', onClick: handleExcluir, className: 'btn btn-danger' }]}
            >
                <p>Tem certeza que deseja mover o indicador <strong>{itemEmEdicao?.nomeIndicador}</strong> para a lixeira?</p>
            </Modal>
        </div>
    );
}

export default CadastroIndicadores;