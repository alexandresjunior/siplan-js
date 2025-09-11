import { List } from 'react-bootstrap-icons';
import './estilos.css';

const SidebarColapsavel = ({ 
    isOpen, 
    onToggle, 
    botaoLabel, 
    sidebarContent 
}) => {
    return (
        <>
            {/* O botão de toggle pode ficar em um cabeçalho ou no topo da página */}
            <button className="btn btn-primary btn-toggle-sidebar" onClick={onToggle}>
                <List size={20} className="me-2" />
                {botaoLabel}
            </button>
            
            {/* Overlay que escurece o conteúdo principal quando o sidebar está aberto */}
            {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}

            {/* O container da sidebar que desliza da esquerda para a direita */}
            <div className={`sidebar-wrapper ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h5 className="mb-0">Filtros</h5>
                    <button className="btn-close" onClick={onToggle}></button>
                </div>
                <div className="sidebar-content">
                    {sidebarContent}
                </div>
            </div>
        </>
    );
};

export default SidebarColapsavel;