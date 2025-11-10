import checkIcon from '../../../assets/imagens/icon-check.svg';
import alertIcon from '../../../assets/imagens/icon-alert.svg';
import closeIcon from '../../../assets/imagens/icon-close.svg';
import starIcon from '../../../assets/imagens/icon-star.svg';
import { FaArrowCircleUp } from 'react-icons/fa';
import GraficoIndicador from '../GraficoIndicador';
import './estilos.css';

const getStatusIcon = (value) => {
    if (value < 95) return closeIcon;
    if (value >= 95 && value < 100) return alertIcon;
    if (value > 110) return starIcon;
    return checkIcon;
};

const CartaoIndicador = ({ data, onEditar }) => {
    const { titulo, subtitulo, meta, teto, real, kpi, metaUnidade } = data;
    const iconSrc = getStatusIcon(kpi);

    return (
        <div className="kpi-card position-relative">
            {/* Header com título + ícone ao lado */}
            <div className="card-header pb-5">
                <div className="mb-3">
                    {/* Linha principal: seta + título + ícone (tudo junto, à esquerda) */}
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <FaArrowCircleUp size={20} className="arrow-primary flex-shrink-0" />

                        {/* Título + ícone (em um bloco que cresce, mas não empurra) */}
                        <div className="d-flex align-items-center gap-2 flex-grow-1 min-width-0">
                            <h3 className="h5 text-primary mb-0 text-truncate">
                                {titulo}
                            </h3>
                            <img
                                src={iconSrc}
                                alt="Status do KPI"
                                className="kpi-status-icon flex-shrink-0"
                                style={{ width: '24px', height: '24px' }}
                            />
                        </div>
                    </div>

                    {subtitulo && <small className="text-muted d-block mt-2">{subtitulo}</small>}
                </div>
            </div>

            {/* Botão Editar – alinhado verticalmente com o ícone de status */}
            <button
                onClick={onEditar}
                className="btn btn-primary btn-sm position-absolute"
                style={{
                    top: '1.10rem',   // descido para alinhar com o ícone (ajuste fino)
                    right: '0.75rem',
                    whiteSpace: 'nowrap'
                }}
            >
                Editar
            </button>

            <div className="card-body">
                <GraficoIndicador value={kpi} />
            </div>

            <div className="card-footer">
                <div className="kpi-value">
                    <span className="label">{teto ? 'TETO' : 'META'}</span>
                    <span className="value">{teto || meta}</span>
                </div>
                <div className="kpi-value">
                    <span className="label">REAL</span>
                    <span className="value">{real}</span>
                </div>
            </div>

            {metaUnidade && <p className="kpi-unidade">{metaUnidade}</p>}
        </div>
    );
};

export default CartaoIndicador;