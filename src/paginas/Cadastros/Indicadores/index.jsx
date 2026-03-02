import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Cabecalho from "../../../componentes/Cabecalho";
import { Rodape } from "../../../componentes/Rodape";

import './estilos.css'; 
import SidebarColapsavel from '../../../componentes/SidebarColapsavel';
import ElementoOrganizacionalMenu from '../../../componentes/ElementoOrganizacionalMenu';

function Indicadores() {
    const navigate = useNavigate();
    const [ano, setAno] = useState(2025);
    const [diretoria, setDiretoria] = useState(null);
    const [elemento, setElemento] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleElementoSelecionado = (elementoSelecionado) => {
        setElemento(elementoSelecionado);
        setIsSidebarOpen(false);
    };
    
    const handleNovoIndicador = () => {
        if (elemento) {
            navigate('/cadastros/cadastro-indicador', { state: { elemento: elemento } });
        }
    };

    const sidebarContent = (
        <ElementoOrganizacionalMenu
            organogramaSelecionado={ano}
            diretoriaSelecionada={diretoria}
            onAnoOrganogramaSelecionado={setAno}
            onDiretoriaSelecionada={setDiretoria}
            onElementoSelecionado={handleElementoSelecionado}
        />
    );

    return (
        <div className="d-flex flex-column min-vh-100">
            <Cabecalho />
            
            <div className="container flex-grow-1 my-4">
                <SidebarColapsavel
                    isOpen={isSidebarOpen}
                    onToggle={toggleSidebar}
                    botaoLabel="Exibir Estrutura Organizacional"
                    sidebarContent={sidebarContent}
                />
                
                <main className={`content-area ${isSidebarOpen ? 'content-area-pushed' : ''}`}>
                    <div className="div-unidade mb-3">
                        <h4 className="text-primary">{elemento?.descricao || 'Nenhuma unidade selecionada'}</h4>
                    </div>

                    <div className="d-flex justify-content-end mb-3">
                        <button 
                            className="btn btn-success" 
                            onClick={handleNovoIndicador} 
                            disabled={!elemento}
                            title={!elemento ? "Selecione uma unidade para criar um novo indicador" : "Criar Novo Indicador"}
                        >
                            Novo Indicador
                        </button>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-header">
                            <h5>Indicadores da Unidade</h5>
                        </div>
                        <div className="card-body">
                            <p>Tabela de indicadores será exibida aqui.</p>
                            {elemento && 
                                <p className="text-muted">
                                    A tabela deve ser filtrada pela unidade: <strong>{elemento.descricao}</strong>
                                </p>
                            }
                        </div>
                    </div>
                </main>
            </div>
            
            <Rodape />
        </div>
    );
}

export default Indicadores;