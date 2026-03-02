import { useState, useEffect } from 'react';
import { organogramaApi } from '../../mocks/organograma';
import './estilos.css';

const TIPO_COMITE = "COMITES";

const ElementoOrganizacionalMenu = ({
    organogramaSelecionado: initialAno,
    diretoriaSelecionada: initialDiretoria,
    apenasEstrategicos = false,
    filtroUsuario = false,
    onAnoOrganogramaSelecionado,
    onElementoSelecionado,
    onDiretoriaSelecionada,
}) => {

    
    const [anoOrganogramas] = useState([2022, 2023, 2024, 2025]);
    const [diretorias, setDiretorias] = useState([]);
    const [elementosOrganizacionais, setElementosOrganizacionais] = useState([]);

    const [anoSelecionado, setAnoSelecionado] = useState(initialAno);
    const [diretoriaSelecionada, setDiretoriaSelecionada] = useState(initialDiretoria);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    
    useEffect(() => {
        if (!apenasEstrategicos && debouncedSearchTerm !== '' && diretoriaSelecionada) {
            const buscarElementos = async () => {
                const resultados = await organogramaApi.filtrarElementos(
                    debouncedSearchTerm,
                    anoSelecionado,
                    diretoriaSelecionada.id
                );
                setElementosOrganizacionais(resultados);
            };
            buscarElementos();
        } else {
            setElementosOrganizacionais([]);
        }
    }, [debouncedSearchTerm, diretoriaSelecionada, anoSelecionado, apenasEstrategicos]);

    
    useEffect(() => {
        const buscarDiretorias = async () => {
            if (anoSelecionado) {
                const result = await organogramaApi.obterDiretorias(anoSelecionado);
                const comiteOption = { id: 89999, sigla: "COMITES", descricao: "COMITES", tipo: TIPO_COMITE };
                setDiretorias([...result, comiteOption]);
            }
        };
        buscarDiretorias();
    }, [anoSelecionado]);


    const handleAnoChange = (e) => {
        const ano = Number(e.target.value);
        setAnoSelecionado(ano);
        setDiretoriaSelecionada(null);
        setDiretorias([]);
        setSearchTerm('');
        setElementosOrganizacionais([]);
        onAnoOrganogramaSelecionado(ano);
    };

    const handleDiretoriaChange = async (e) => {
        const diretoriaId = Number(e.target.value);
        const diretoria = diretorias.find(d => d.id === diretoriaId);
        setDiretoriaSelecionada(diretoria);
        onDiretoriaSelecionada(diretoria);
        setSearchTerm('');

        if (diretoria.tipo === TIPO_COMITE) {
            const comites = await organogramaApi.obterComites();
            setElementosOrganizacionais(comites);
        } else if (apenasEstrategicos) {
            onElementoSelecionado(diretoria);
        } else {
            setElementosOrganizacionais([]);
        }
    };

    const handleElementoClick = (elemento) => {
        onElementoSelecionado(elemento);
        setDiretoriaSelecionada(elemento);
        setSearchTerm(elemento.descricao);
        setElementosOrganizacionais([]);
    };

    
    return (
        <div className="p-3 border rounded bg-light">
    
            <div className="mb-3">
                <label htmlFor="ano-organograma" className="form-label">Ano Organograma</label>
                <select id="ano-organograma" className="form-select" value={anoSelecionado?.toString() || ''} onChange={handleAnoChange}>
                    <option value="" disabled>Selecione um ano</option>
                    {anoOrganogramas.map(ano => <option key={ano} value={ano}>{ano}</option>)}
                </select>
            </div>

    
            <div className="mb-3">
                <label htmlFor="diretoria" className="form-label">Diretoria</label>
                <select id="diretoria" className="form-select" value={diretoriaSelecionada?.id || ''} onChange={handleDiretoriaChange} disabled={!anoSelecionado}>
                    <option value="" disabled>Selecione uma diretoria</option>
                    {diretorias.map(dir => <option key={dir.id} value={dir.id}>{dir.sigla}</option>)}
                </select>
            </div>

    
            {!apenasEstrategicos && !filtroUsuario && (
                <>
                    <div className="mb-3">
                        <label htmlFor="search-input" className="form-label">Gerência, diretoria ou coordenação</label>
                        <input
                            id="search-input"
                            type="text"
                            className="form-control"
                            placeholder="Digite para buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={!diretoriaSelecionada}
                        />
                    </div>
                    {elementosOrganizacionais.length > 0 && (
                        <ul className="list-group">
                            {elementosOrganizacionais.map(el => (
                                <li key={el.id} className="list-group-item selecionado" onClick={() => handleElementoClick(el)}>
                                    <span>{el.descricao}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}

    
            {filtroUsuario && (
                <>
    
                    <div className="mb-3">
                        <label htmlFor="search-input-user" className="form-label">Gerência, diretoria ou coordenação</label>
                        <input
                            id="search-input-user"
                            type="text"
                            className="form-control"
                            placeholder="Digite para buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={!diretoriaSelecionada}
                        />
                    </div>
                    {elementosOrganizacionais.length > 0 && (
                        <ul className="list-group">
                            {elementosOrganizacionais.map(el => (
                                <li key={el.id} className="list-group-item selecionado" onClick={() => handleElementoClick(el)}>
                                    <span>{el.descricao}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};

export default ElementoOrganizacionalMenu;