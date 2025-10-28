import React from 'react';
import './estilos.css';

const Modal = ({ estaAberto, aoFechar, titulo, children, botoesAcao = [] }) => {
  if (!estaAberto) return null;

  const temBotaoSair = botoesAcao.some(botao => botao.label === 'Sair');

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{titulo}</h5>
            <div className="d-flex ms-auto">
              {botoesAcao.map((botao, index) => (
                <button
                  key={index}
                  type={botao.type || 'button'}
                  className={botao.className}
                  onClick={botao.onClick}
                  style={{ marginLeft: index > 0 ? '10px' : '0' }}
                >
                  {botao.label}
                </button>
              ))}
              {!temBotaoSair && aoFechar && (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sair"
                  onClick={aoFechar}
                  style={{ marginLeft: '10px' }}
                >
                  Sair
                </button>
              )}
            </div>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;