import React from 'react';
import "../Modal/estilos.css";

const Modal = ({ isOpen, onClose, title, children, actionButtons = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <div className="d-flex ms-auto"> {/* Ajuste 1: Alinha botões à direita */}
              {actionButtons.map((button, index) => (
                <button
                  key={index}
                  type={button.type || 'button'}
                  className={button.className}
                  onClick={button.onClick}
                  style={button.label === 'Sair' ? { marginLeft: '10px', transition: 'background-color 0.3s ease' } : { marginLeft: '10px' }} // Ajuste 2: Estilo para Sair com transição
                >
                  {button.label}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={onClose}
                style={{ marginLeft: '10px', transition: 'background-color 0.3s ease' }} // Ajuste 3: Estilo para Sair com transição
              >
                Sair
              </button>
            </div>
            
          </div>
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;