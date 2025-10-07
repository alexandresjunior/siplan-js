import React, { useState, useEffect } from 'react';
import { buscarDiretoriasPorAno, buscarUnidadesPorDiretoria } from '../../service/elementoOrganizacionalService';

const Filtros = ({ onUnidadeChange, setCarregandoFiltros }) => {
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


    // Carrega as diretorias quando o ano muda
    useEffect(() => {
        // Reseta todos os filtros filhos e a busca no pai
        setDiretorias([]);
        setUnidades([]);
        setDiretoriaSelecionada('');
        setUnidadeSelecionada('');
        // A linha abaixo foi removida da versão anterior, mas vamos mantê-la
        // para garantir que a busca seja limpa ao trocar o ano.
        onUnidadeChange(null);

        if (anoSelecionado) {
            setCarregandoFiltros(true);
            buscarDiretoriasPorAno(anoSelecionado)
                .then(data => setDiretorias(data))
                .catch(err => console.error(err))
                .finally(() => setCarregandoFiltros(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [anoSelecionado]);


    // Carrega as unidades (gerências) quando a diretoria muda
    useEffect(() => {
        setUnidades([]);
        setUnidadeSelecionada('');
        // A linha que chamava onUnidadeChange(null) foi REMOVIDA daqui,
        // pois agora queremos que a seleção da diretoria inicie uma busca.

        if (diretoriaSelecionada && anoSelecionado) {
            setCarregandoFiltros(true);
            buscarUnidadesPorDiretoria(anoSelecionado, diretoriaSelecionada)
                .then(data => setUnidades(data))
                .catch(err => console.error(err))
                .finally(() => setCarregandoFiltros(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [diretoriaSelecionada]);

    // *** NOVA LÓGICA CENTRALIZADA PARA DISPARAR A BUSCA ***
    // Este useEffect decide qual ID enviar para o componente pai.
    useEffect(() => {
        // Prioridade 1: Se uma unidade específica (gerência) for selecionada, use o ID dela.
        if (unidadeSelecionada) {
            onUnidadeChange(unidadeSelecionada);
        } 
        // Prioridade 2: Senão, se uma diretoria for selecionada, use o ID da diretoria.
        else if (diretoriaSelecionada) {
            onUnidadeChange(diretoriaSelecionada);
        }
        // Se nenhum dos dois estiver selecionado (ex: ao trocar o ano), a busca é limpa.
        else {
            onUnidadeChange(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unidadeSelecionada, diretoriaSelecionada]); // Reage a mudanças em ambos os selects


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
                    <div className="col-md-4">
                        <label htmlFor="diretoria" className="form-label">Diretoria</label>
                        <select id="diretoria" className="form-select" value={diretoriaSelecionada} onChange={e => setDiretoriaSelecionada(e.target.value)} disabled={!anoSelecionado}>
                            <option value="">Selecione...</option>
                            {diretorias.map(dir => <option key={dir.id} value={dir.id}>{dir.sigla}</option>)}
                        </select>
                    </div>
                    <div className="col-md-5">
                        <label htmlFor="unidade" className="form-label">Refinar por Gerência/Coordenação</label>
                        <select id="unidade" className="form-select" value={unidadeSelecionada} onChange={e => setUnidadeSelecionada(e.target.value)} disabled={!diretoriaSelecionada}>
                            {/* Adicionamos uma opção "Todos" para permitir voltar à visão da diretoria */}
                            <option value="">Todos da Diretoria</option>
                            {unidades.map(un => <option key={un.id} value={un.id}>{un.nome}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Filtros;
// import React, { useState, useEffect } from 'react';
// import { buscarDiretoriasPorAno, buscarUnidadesPorDiretoria } from '../../service/elementoOrganizacionalService';

// const Filtros = ({ onUnidadeChange, setCarregandoFiltros }) => {
//     const [anos, setAnos] = useState([]);
//     const [diretorias, setDiretorias] = useState([]);
//     const [unidades, setUnidades] = useState([]);

//     const [anoSelecionado, setAnoSelecionado] = useState('');
//     const [diretoriaSelecionada, setDiretoriaSelecionada] = useState('');
//     const [unidadeSelecionada, setUnidadeSelecionada] = useState('');


//     useEffect(() => {
//         const anoAtual = new Date().getFullYear();
//         const listaAnos = [];
//         for (let ano = anoAtual; ano >= 2022; ano--) {
//             listaAnos.push(ano);
//         }
//         setAnos(listaAnos);
//     }, []);


//     useEffect(() => {
//         setDiretorias([]);
//         setUnidades([]);
//         setDiretoriaSelecionada('');
//         setUnidadeSelecionada('');
//         onUnidadeChange(null);

//         if (anoSelecionado) {
//             setCarregandoFiltros(true);
//             buscarDiretoriasPorAno(anoSelecionado)
//                 .then(data => setDiretorias(data))
//                 .catch(err => console.error(err))
//                 .finally(() => setCarregandoFiltros(false));
//         }
//     }, [anoSelecionado]);


//     useEffect(() => {
//         setUnidades([]);
//         setUnidadeSelecionada('');
//         onUnidadeChange(null);

//         if (diretoriaSelecionada && anoSelecionado) {
//             setCarregandoFiltros(true);
//             buscarUnidadesPorDiretoria(anoSelecionado, diretoriaSelecionada)
//                 .then(data => setUnidades(data))
//                 .catch(err => console.error(err))
//                 .finally(() => setCarregandoFiltros(false));
//         }
//     }, [diretoriaSelecionada]);

//     useEffect(() => {
//         if (unidadeSelecionada) {
//             onUnidadeChange(unidadeSelecionada);
//         }
//     }, [unidadeSelecionada]);

//     return (
//         <div className="card mb-4">
//             <div className="card-body">
//                 <div className="row g-3 align-items-end">
//                     <div className="col-md-3">
//                         <label htmlFor="ano" className="form-label">Ano Organograma</label>
//                         <select id="ano" className="form-select" value={anoSelecionado} onChange={e => setAnoSelecionado(e.target.value)}>
//                             <option value="">Selecione...</option>
//                             {anos.map(ano => <option key={ano} value={ano}>{ano}</option>)}
//                         </select>
//                     </div>
//                     <div className="col-md-4">
//                         <label htmlFor="diretoria" className="form-label">Diretoria</label>
//                         <select id="diretoria" className="form-select" value={diretoriaSelecionada} onChange={e => setDiretoriaSelecionada(e.target.value)} disabled={!anoSelecionado}>
//                             <option value="">Selecione...</option>
//                             {diretorias.map(dir => <option key={dir.id} value={dir.id}>{dir.sigla}</option>)}
//                         </select>
//                     </div>
//                     <div className="col-md-5">
//                         <label htmlFor="unidade" className="form-label">Gerência, Diretoria ou Coordenação</label>
//                         <select id="unidade" className="form-select" value={unidadeSelecionada} onChange={e => setUnidadeSelecionada(e.target.value)} disabled={!diretoriaSelecionada}>
//                             <option value="">Selecione...</option>
//                             {unidades.map(un => <option key={un.id} value={un.id}>{un.nome}</option>)}
//                         </select>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Filtros;