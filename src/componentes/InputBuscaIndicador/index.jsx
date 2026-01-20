import React, { useState, useEffect } from 'react';
import { buscarIndicadorPorNomeLike } from '../../services/indicador'; // Ajuste o caminho se necessário

const InputBuscaIndicador = ({ tagsSelecionadas, setTagsSelecionadas, filtroUnidade }) => {
    const [termo, setTermo] = useState('');
    const [sugestoes, setSugestoes] = useState([]);
    const [mostraSugestoes, setMostraSugestoes] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (termo.length > 2) {
                if (!filtroUnidade) {
                    console.warn("Selecione uma unidade para filtrar indicadores.");
                    setSugestoes([]);
                    return;
                }
                buscarIndicadorPorNomeLike(termo, filtroUnidade)
                    .then(data => {
                        // O backend retorna uma lista de objetos Indicador, que possuem 'nomeIndicador'
                        setSugestoes(data || []);
                        setMostraSugestoes(true);
                    })
                    .catch(console.error);
            } else {
                setSugestoes([]);
                setMostraSugestoes(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [termo, filtroUnidade]);

    const adicionarTag = (item) => {
        if (!tagsSelecionadas.some(tag => tag.id === item.id)) {
            setTagsSelecionadas([...tagsSelecionadas, item]);
        }
        setTermo('');
        setSugestoes([]);
        setMostraSugestoes(false);
    };

    const removerTag = (id) => {
        setTagsSelecionadas(tagsSelecionadas.filter(tag => tag.id !== id));
    };

    return (
        <div className="mb-3">
            <label className="form-label fw-bold">Filtrar por Indicadores (Nome)</label>
            <div className="border p-2 rounded d-flex flex-wrap gap-2 align-items-center bg-white">
                {tagsSelecionadas.map(tag => (
                    <span key={tag.id} className="badge bg-secondary d-flex align-items-center">
                        {tag.nomeIndicador}
                        <button
                            type="button"
                            className="btn-close btn-close-white ms-2"
                            style={{ fontSize: '0.5em' }}
                            onClick={() => removerTag(tag.id)}
                        ></button>
                    </span>
                ))}

                <div className="position-relative flex-grow-1">
                    <input
                        type="text"
                        className="form-control border-0 shadow-none"
                        placeholder="Digite para buscar..."
                        value={termo}
                        onChange={e => setTermo(e.target.value)}
                    />

                    {mostraSugestoes && sugestoes.length > 0 && (
                        <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                            {sugestoes.map((item, index) => (
                                <li
                                    key={index}
                                    className="list-group-item list-group-item-action"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => adicionarTag(item)}
                                >
                                    {/* Ajustado para nomeIndicador */}
                                    {item.nomeIndicador}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InputBuscaIndicador;