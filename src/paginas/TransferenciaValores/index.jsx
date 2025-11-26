// ... imports permanecem iguais
import React, { useState, useEffect, useRef } from 'react';
import Cabecalho from '../../componentes/Cabecalho';
import { Rodape } from '../../componentes/Rodape';
import api from '../../services/api';

function TransferenciaValores() {
    const [deId, setDeId] = useState('');
    const [paraId, setParaId] = useState('');
    const [deTexto, setDeTexto] = useState('');
    const [paraTexto, setParaTexto] = useState('');
    const [indicadoresDisponiveis, setIndicadoresDisponiveis] = useState([]);
    const [indicadorSelecionado, setIndicadorSelecionado] = useState('');

    const [sugestoesDe, setSugestoesDe] = useState([]);
    const [sugestoesPara, setSugestoesPara] = useState([]);
    const [mostrarSugestoesDe, setMostrarSugestoesDe] = useState(false);
    const [mostrarSugestoesPara, setMostrarSugestoesPara] = useState(false);
    const [loadingDe, setLoadingDe] = useState(false);
    const [loadingPara, setLoadingPara] = useState(false);
    const [loadingIndicadores, setLoadingIndicadores] = useState(false);

    const deRef = useRef(null);
    const paraRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            buscarUnidades(deTexto, 'de');
        }, 500);
        return () => clearTimeout(timer);
    }, [deTexto]);

    useEffect(() => {
        const timer = setTimeout(() => {
            buscarUnidades(paraTexto, 'para');
        }, 500);
        return () => clearTimeout(timer);
    }, [paraTexto]);

    const buscarUnidades = async (texto, tipo) => {
        if (!texto || texto.trim().length < 2) {
            tipo === 'de' ? setSugestoesDe([]) : setSugestoesPara([]);
            tipo === 'de' ? setMostrarSugestoesDe(false) : setMostrarSugestoesPara(false);
            return;
        }

        const setLoading = tipo === 'de' ? setLoadingDe : setLoadingPara;
        const setSugestoes = tipo === 'de' ? setSugestoesDe : setSugestoesPara;
        const setMostrar = tipo === 'de' ? setMostrarSugestoesDe : setMostrarSugestoesPara;

        try {
            setLoading(true);
            const response = await api.get(`/elementoOrganizacional/nome/${encodeURIComponent(texto.trim())}`);
            const resultados = Array.from(response.data || []);
            setSugestoes(resultados);
            setMostrar(true);
        } catch (error) {
            console.error('Erro na busca:', error);
            setSugestoes([]);
            setMostrar(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (deRef.current && !deRef.current.contains(e.target)) setMostrarSugestoesDe(false);
            if (paraRef.current && !paraRef.current.contains(e.target)) setMostrarSugestoesPara(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    useEffect(() => {
        const carregarIndicadoresTransferiveis = async () => {
            if (!deId) {
                setIndicadoresDisponiveis([]);
                setIndicadorSelecionado('');
                return;
            }

            try {
                setLoadingIndicadores(true);
                const response = await api.get(`/indicador/valores/${deId}`);

                const indicadores = response.data || [];

                setIndicadoresDisponiveis(indicadores);
                setIndicadorSelecionado('');
            } catch (error) {
                console.error('Erro ao carregar indicadores transferíveis:', error);
                alert('Não foi possível carregar os indicadores desta unidade.');
                setIndicadoresDisponiveis([]);
            } finally {
                setLoadingIndicadores(false);
            }
        };

        carregarIndicadoresTransferiveis();
    }, [deId]);

    const selecionarUnidade = (unidade, tipo) => {
        const texto = unidade.descricao || `${unidade.sigla} - ${unidade.nome}`;
        if (tipo === 'de') {
            setDeId(unidade.id);
            setDeTexto(texto);
            setMostrarSugestoesDe(false);
            setParaId(''); setParaTexto('');
        } else {
            setParaId(unidade.id);
            setParaTexto(texto);
            setMostrarSugestoesPara(false);
        }
    };

    const handleSalvar = async () => {
        if (!deId || !paraId || !indicadorSelecionado) {
            return alert('Preencha todos os campos obrigatórios.');
        }
        if (deId === paraId) {
            return alert('Origem e destino devem ser diferentes.');
        }

        try {
            // PAYLOAD CORRETO → LISTA COM OBJETO NO FORMATO DO DTO Transferencia
            const payload = [
                {
                    indicadorDe: { id: indicadorSelecionado },
                    indicadorPara: { id: indicadorSelecionado }, // mesmo indicador!
                    elementoOrganizacionalDe: { id: deId },
                    elementoOrganizacionalPara: { id: paraId }
                }
            ];

            await api.post('/indicador/transferir', payload);

            alert('Valores copiados com sucesso para a unidade de destino!');

            // Reset dos campos
            setDeId('');
            setDeTexto('');
            setParaId('');
            setParaTexto('');
            setIndicadorSelecionado('');
            setIndicadoresDisponiveis([]);

        } catch (error) {
            console.error('Erro ao copiar valores:', error);
            alert('Erro ao copiar os valores. Verifique os dados e tente novamente.');
        }
    };
    return (
        <>
            <Cabecalho />
            <div className="container-fluid py-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-8">

                        <h3 className="mb-4">Transferência de Valores dos Indicadores</h3>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-5">

                                <div className="row g-3 mb-4">
                                    <div className="col-12 col-md-6" ref={deRef}>
                                        <label className="form-label fw-semibold">De:</label>
                                        <div className="position-relative">
                                            <input
                                                type="text"
                                                className="form-control form-control-md"
                                                value={deTexto}
                                                onChange={(e) => setDeTexto(e.target.value)}
                                                onFocus={() => sugestoesDe.length > 0 && setMostrarSugestoesDe(true)}
                                                placeholder="Digite para buscar origem..."
                                                autoComplete="off"
                                            />
                                            {mostrarSugestoesDe && (
                                                <div className="position-absolute top-100 start-0 end-0 bg-white border rounded-bottom shadow-sm mt-1" style={{ zIndex: 1000, maxHeight: '220px', overflowY: 'auto' }}>
                                                    {loadingDe ? (
                                                        <div className="p-3 text-center text-muted small">Buscando...</div>
                                                    ) : sugestoesDe.length === 0 ? (
                                                        <div className="p-3 text-center text-muted small">Nenhum resultado</div>
                                                    ) : (
                                                        sugestoesDe.map(u => (
                                                            <div
                                                                key={u.id}
                                                                className="px-3 py-2 hover-bg-light border-bottom"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => selecionarUnidade(u, 'de')}
                                                            >
                                                                <strong>{u.sigla}</strong> - {u.nome}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-6" ref={paraRef}>
                                        <label className="form-label fw-semibold">Para:</label>
                                        <div className="position-relative">
                                            <input
                                                type="text"
                                                className="form-control form-control-md"
                                                value={paraTexto}
                                                onChange={(e) => setParaTexto(e.target.value)}
                                                onFocus={() => sugestoesPara.length > 0 && setMostrarSugestoesPara(true)}
                                                placeholder="Digite para buscar destino..."
                                                disabled={!deId}
                                                autoComplete="off"
                                            />
                                            {mostrarSugestoesPara && (
                                                <div className="position-absolute top-100 start-0 end-0 bg-white border rounded-bottom shadow-sm mt-1" style={{ zIndex: 1000, maxHeight: '220px', overflowY: 'auto' }}>
                                                    {loadingPara ? (
                                                        <div className="p-3 text-center text-muted small">Buscando...</div>
                                                    ) : sugestoesPara.length === 0 ? (
                                                        <div className="p-3 text-center text-muted small">Nenhum resultado</div>
                                                    ) : (
                                                        sugestoesPara
                                                            .filter(u => u.id !== deId)
                                                            .map(u => (
                                                                <div
                                                                    key={u.id}
                                                                    className="px-3 py-2 hover-bg-light border-bottom"
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => selecionarUnidade(u, 'para')}
                                                                >
                                                                    <strong>{u.sigla}</strong> - {u.nome}
                                                                </div>
                                                            ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="position-relative mb-4">
                                    <label className="form-label fw-semibold">Indicador:</label>
                                    <select
                                        className="form-select form-select-md pe-5"
                                        value={indicadorSelecionado}
                                        onChange={(e) => setIndicadorSelecionado(e.target.value)}
                                        disabled={!deId || loadingIndicadores || indicadoresDisponiveis.length === 0}
                                    >
                                        <option value="">
                                            {loadingIndicadores
                                                ? 'Carregando indicadores...'
                                                : indicadoresDisponiveis.length === 0
                                                    ? 'Nenhum indicador disponível para transferência'
                                                    : 'Selecione o indicador'}
                                        </option>
                                        {indicadoresDisponiveis.map(ind => (
                                            <option key={ind.id} value={ind.id}>
                                                {ind.nomeIndicador}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="position-absolute end-0 bottom-0 mb-3 me-5">
                                    <button
                                        onClick={handleSalvar}
                                        disabled={!deId || !paraId || !indicadorSelecionado}
                                        className="btn btn-primary btn-md fw-semibold"
                                        style={{
                                            backgroundColor: 'var(--azul-compesa)',
                                            borderColor: 'var(--azul-compesa)',
                                            minWidth: '150px'

                                        }}
                                        onMouseEnter={(e) => {
                                            if (deId && paraId && indicadorSelecionado) {
                                                e.target.style.backgroundColor = 'var(--verde-compesa)';
                                                e.target.style.borderColor = 'var(--verde-compesa)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = 'var(--azul-compesa)';
                                            e.target.style.borderColor = 'var(--azul-compesa)';
                                        }}
                                    >
                                        Salvar Transferência
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Rodape />
        </>
    );
}

export default TransferenciaValores;