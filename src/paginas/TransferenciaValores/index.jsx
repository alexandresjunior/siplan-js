import React, { useState, useEffect } from 'react';
import Cabecalho from '../../componentes/Cabecalho';
import { Rodape } from '../../componentes/Rodape';

const unidadesMock = [
    { id: 'dir-01', nome: 'Diretoria de Planejamento', tipo: 'Diretoria' },
    { id: 'coord-02', nome: 'Coordenação de Orçamento', tipo: 'Coordenação' },
    { id: 'ger-03', nome: 'Gerência de Indicadores', tipo: 'Gerência' },
    { id: 'dir-04', nome: 'Diretoria Executiva', tipo: 'Diretoria' },
];

const indicadoresMock = [
    { id: 'ind-001', codigo: 'IND-001', nome: 'Taxa de Execução Orçamentária', unidadeOrigemId: 'dir-01' },
    { id: 'ind-002', codigo: 'IND-002', nome: 'Índice de Satisfação do Usuário', unidadeOrigemId: 'dir-01' },
    { id: 'ind-003', codigo: 'IND-003', nome: 'Cumprimento de Metas Estratégicas', unidadeOrigemId: 'coord-02' },
    { id: 'ind-004', codigo: 'IND-004', nome: 'Produtividade por Servidor', unidadeOrigemId: 'ger-03' },
];

function TransferenciaValores() {
    const [de, setDe] = useState('');
    const [para, setPara] = useState('');
    const [indicadoresDisponiveis, setIndicadoresDisponiveis] = useState([]);
    const [indicadorSelecionado, setIndicadorSelecionado] = useState('');

    useEffect(() => {
        if (de) {
            const filtrados = indicadoresMock.filter(ind => ind.unidadeOrigemId === de);
            setIndicadoresDisponiveis(filtrados);
            setIndicadorSelecionado('');
        } else {
            setIndicadoresDisponiveis([]);
            setIndicadorSelecionado('');
        }
    }, [de]);

    const handleSalvar = () => {
        if (!de || !para || !indicadorSelecionado) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        if (de === para) {
            alert('A unidade de origem e destino devem ser diferentes.');
            return;
        }

        const indicador = indicadoresMock.find(i => i.id === indicadorSelecionado);
        const origem = unidadesMock.find(u => u.id === de)?.nome;
        const destino = unidadesMock.find(u => u.id === para)?.nome;

        alert(`Indicador "${indicador.nome}" transferido com sucesso de "${origem}" para "${destino}"!`);

        setDe('');
        setPara('');
        setIndicadorSelecionado('');
        setIndicadoresDisponiveis([]);
    };

    return (
        <>
            <Cabecalho />

            <div className="container-fluid py-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-8">

                        <h3 className="mb-4">
                            Transferência de Valores dos Indicadores
                        </h3>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-5">

                                <div className="row g-3 mb-4">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold">De:</label>
                                        <select
                                            className="form-select form-select-md"
                                            value={de}
                                            onChange={(e) => setDe(e.target.value)}
                                        >
                                            <option value="">Diretoria/Coordenação/Gerência de Origem</option>
                                            {unidadesMock.map(unidade => (
                                                <option key={unidade.id} value={unidade.id}>
                                                    {unidade.tipo} - {unidade.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold">Para:</label>
                                        <select
                                            className="form-select form-select-md"
                                            value={para}
                                            onChange={(e) => setPara(e.target.value)}
                                            disabled={!de}
                                        >
                                            <option value="">Diretoria/Coordenação/Gerência de Destino</option>
                                            {unidadesMock
                                                .filter(u => u.id !== de)
                                                .map(unidade => (
                                                    <option key={unidade.id} value={unidade.id}>
                                                        {unidade.tipo} - {unidade.nome}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                  
                                <div className="mb-4 position-relative">
                                    <label className="form-label fw-semibold">Indicador:</label>
                                    <select
                                        className="form-select form-select-md"
                                        value={indicadorSelecionado}
                                        onChange={(e) => setIndicadorSelecionado(e.target.value)}
                                        disabled={!de || indicadoresDisponiveis.length === 0}
                                    >
                                        <option value="">
                                            {de
                                                ? indicadoresDisponiveis.length === 0
                                                    ? 'Nenhum indicador disponível'
                                                    : 'Selecione o indicador a transferir...'
                                                : 'Primeiro selecione a unidade de origem'}
                                        </option>
                                        {indicadoresDisponiveis.map(ind => (
                                            <option key={ind.id} value={ind.id}>
                                                [{ind.codigo}] {ind.nome}
                                            </option>
                                        ))}
                                    </select>
                                   
                                </div>
                                        
                                    <div className="position-absolute end-0 bottom-2 mb-1 me-5">
                                        <button
                                            onClick={handleSalvar}
                                            disabled={!de || !para || !indicadorSelecionado}
                                            className="btn btn-primary btn-md fw-semibold"
                                            style={{
                                                backgroundColor: 'var(--azul-compesa)',
                                                borderColor: 'var(--azul-compesa)',
                                                minWidth: '140px'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (de && para && indicadorSelecionado) {
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