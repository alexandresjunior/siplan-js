import { useState, useEffect } from 'react';
import { organogramaApi } from '../../mocks/organograma'; // Importando a API mock
import './estilos.css';

const TIPO_COMITE = "COMITES"; // Constante para o tipo especial

const ElementoOrganizacionalMenu = ({
    organogramaSelecionado: initialAno,
    diretoriaSelecionada: initialDiretoria,
    apenasEstrategicos = false,
    filtroUsuario = false,
    onAnoOrganogramaSelecionado,
    onElementoSelecionado,
    onDiretoriaSelecionada,
}) => {

    // --- STATE MANAGEMENT (useState) ---
    const [anoOrganogramas] = useState([2022, 2023, 2024, 2025]);
    const [diretorias, setDiretorias] = useState([]);
    const [elementosOrganizacionais, setElementosOrganizacionais] = useState([]);

    const [anoSelecionado, setAnoSelecionado] = useState(initialAno);
    const [diretoriaSelecionada, setDiretoriaSelecionada] = useState(initialDiretoria);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    // --- SIDE EFFECTS (useEffect) ---

    // Hook para implementar o debounce na busca (recria o debounceTime do RxJS)
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // Atraso de 300ms

        return () => {
            clearTimeout(timerId); // Limpa o timeout se o usuário digitar novamente
        };
    }, [searchTerm]);

    // Hook para buscar os elementos quando o termo de busca (após debounce) ou a diretoria mudam
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

    // Hook para buscar as diretorias quando o ano selecionado muda (efeito do ngOnInit e selecionarAnoOrganograma)
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


    // --- EVENT HANDLERS ---

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
            onElementoSelecionado(diretoria); // Emite o evento direto se for estratégico
        } else {
            setElementosOrganizacionais([]); // Limpa a lista para nova busca
        }
    };

    const handleElementoClick = (elemento) => {
        onElementoSelecionado(elemento);
        setDiretoriaSelecionada(elemento); // Atualiza o campo de busca
        setSearchTerm(elemento.descricao);
        setElementosOrganizacionais([]); // Limpa a lista após a seleção
    };

    // --- RENDER (JSX) ---
    return (
        <div className="p-3 border rounded bg-light">
            {/* Seletor de Ano */}
            <div className="mb-3">
                <label htmlFor="ano-organograma" className="form-label">Ano Organograma</label>
                <select id="ano-organograma" className="form-select" value={anoSelecionado?.toString() || ''} onChange={handleAnoChange}>
                    <option value="" disabled>Selecione um ano</option>
                    {anoOrganogramas.map(ano => <option key={ano} value={ano}>{ano}</option>)}
                </select>
            </div>

            {/* Seletor de Diretoria */}
            <div className="mb-3">
                <label htmlFor="diretoria" className="form-label">Diretoria</label>
                <select id="diretoria" className="form-select" value={diretoriaSelecionada?.id || ''} onChange={handleDiretoriaChange} disabled={!anoSelecionado}>
                    <option value="" disabled>Selecione uma diretoria</option>
                    {diretorias.map(dir => <option key={dir.id} value={dir.id}>{dir.sigla}</option>)}
                </select>
            </div>

            {/* Campo de Busca e Lista de Resultados */}
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

            {/* Variação com Autocomplete (simplificado como a lista acima) */}
            {filtroUsuario && (
                <>
                    {/* A implementação visual é a mesma do bloco acima, mas a lógica de exibição é controlada por 'filtroUsuario' */}
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