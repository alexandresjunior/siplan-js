import React, { useState, useEffect } from 'react';
import { buscarDiretoriasPorAno, buscarUnidadesPorDiretoria } from '../../service/elementoOrganizacionalService';

const Filtros = ({ onBuscaClick, setCarregandoFiltros }) => {
    const [anos, setAnos] = useState([]);
    const [diretorias, setDiretorias] = useState([]);
    const [unidades, setUnidades] = useState([]);

    const [anoSelecionado, setAnoSelecionado] = useState('');
    const [diretoriaSelecionada, setDiretoriaSelecionada] = useState('');
    const [unidadeSelecionada, setUnidadeSelecionada] = useState('');

    
    useEffect(() => {
        const anoAtual = new Date().getFullYear();
        const listaAnos = [];
        for (let ano = anoAtual; ano >= 2022; ano--) {
            listaAnos.push(ano);
        }
        setAnos(listaAnos);
    }, []);

    
    useEffect(() => {
        if (anoSelecionado) {
            setCarregandoFiltros(true);
            setDiretorias([]);
            setUnidades([]);
            setDiretoriaSelecionada('');
            setUnidadeSelecionada('');
            buscarDiretoriasPorAno(anoSelecionado)
                .then(data => setDiretorias(data))
                .catch(err => console.error(err))
                .finally(() => setCarregandoFiltros(false));
        }
    }, [anoSelecionado, setCarregandoFiltros]);

    
    useEffect(() => {
        if (diretoriaSelecionada && anoSelecionado) {
            setCarregandoFiltros(true);
            setUnidades([]);
            setUnidadeSelecionada('');
            buscarUnidadesPorDiretoria(anoSelecionado, diretoriaSelecionada)
                .then(data => setUnidades(data))
                .catch(err => console.error(err))
                .finally(() => setCarregandoFiltros(false));
        }
    }, [diretoriaSelecionada, anoSelecionado, setCarregandoFiltros]);

    const handleBusca = () => {
        if (unidadeSelecionada) {
            onBuscaClick(unidadeSelecionada);
        } else {
            alert('Por favor, selecione todos os níveis da estrutura.');
        }
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                        <label htmlFor="ano" className="form-label">Ano Organograma</label>
                        <select id="ano" className="form-select" value={anoSelecionado} onChange={e => setAnoSelecionado(e.target.value)}>
                            <option value="">Selecione...</option>
                            {anos.map(ano => <option key={ano} value={ano}>{ano}</option>)}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="diretoria" className="form-label">Diretoria</label>
                        <select id="diretoria" className="form-select" value={diretoriaSelecionada} onChange={e => setDiretoriaSelecionada(e.target.value)} disabled={!anoSelecionado}>
                            <option value="">Selecione...</option>
                            {diretorias.map(dir => <option key={dir.id} value={dir.id}>{dir.sigla}</option>)}
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="unidade" className="form-label">Gerência, Diretoria ou Coordenação</label>
                        <select id="unidade" className="form-select" value={unidadeSelecionada} onChange={e => setUnidadeSelecionada(e.target.value)} disabled={!diretoriaSelecionada}>
                            <option value="">Selecione...</option>
                            {unidades.map(un => <option key={un.id} value={un.id}>{un.nome}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-primary w-100" onClick={handleBusca} disabled={!unidadeSelecionada}>
                            Buscar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Filtros;