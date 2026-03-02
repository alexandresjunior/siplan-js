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
            
            <button className="btn btn-primary btn-toggle-sidebar" onClick={onToggle}>
                <List size={20} className="me-2" />
                {botaoLabel}
            </button>
            
            
            {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}

            
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