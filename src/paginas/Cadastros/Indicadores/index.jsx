import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes da Aplicação
import Cabecalho from "../../../componentes/Cabecalho";
import { Rodape } from "../../../componentes/Rodape";

// Estilos específicos da página (se necessário)
import './estilos.css'; 
import SidebarColapsavel from '../../../componentes/SidebarColapsavel';
import ElementoOrganizacionalMenu from '../../../componentes/ElementoOrganizacionalMenu';

function Indicadores() {
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---
    // Estado para os filtros do menu
    const [ano, setAno] = useState(2025);
    const [diretoria, setDiretoria] = useState(null);
    const [elemento, setElemento] = useState(null);
    
    // Novo estado para controlar a visibilidade da sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- HANDLER FUNCTIONS ---
    // Função para abrir/fechar a sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Função que é chamada quando um elemento é selecionado no menu
    const handleElementoSelecionado = (elementoSelecionado) => {
        setElemento(elementoSelecionado); // Atualiza o elemento selecionado no estado
        setIsSidebarOpen(false); // Fecha a sidebar automaticamente após a seleção
    };
    
    const handleNovoIndicador = () => {
        if (elemento) {
            navigate('/cadastros/cadastro-indicador', { state: { elemento: elemento } });
        }
    };

    // --- JSX a ser renderizado DENTRO da sidebar ---
    const sidebarContent = (
        <ElementoOrganizacionalMenu
            organogramaSelecionado={ano}
            diretoriaSelecionada={diretoria}
            onAnoOrganogramaSelecionado={setAno}
            onDiretoriaSelecionada={setDiretoria}
            onElementoSelecionado={handleElementoSelecionado} // Conecta a função de callback
        />
    );

    // --- RENDER ---
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
                
                {/* Conteúdo principal da página */}
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
                            {/* Área reservada para a tabela de indicadores */}
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