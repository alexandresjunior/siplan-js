import GraficoIndicador from '../GraficoIndicador';
import checkIcon from '../../assets/imagens/icon-check.svg';
import alertIcon from '../../assets/imagens/icon-alert.svg';
import closeIcon from '../../assets/imagens/icon-close.svg';
import starIcon from '../../assets/imagens/icon-star.svg';
import './estilos.css';
import { FaArrowCircleUp } from 'react-icons/fa';

const getStatusIcon = (value) => {
    if (value < 95) {
        return closeIcon;
    } else if (value >= 95 && value < 100) {
        return alertIcon;
    } else if (value > 110) {
        return starIcon;
    }
    return checkIcon;
};

const CartaoIndicador = ({ data }) => {
    const { titulo, subtitulo, meta, teto, real, kpi, metaUnidade } = data;
    const iconSrc = getStatusIcon(kpi);

    return (
        <div className="kpi-card">
            <div className="card-header">
                <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                        <FaArrowCircleUp size={20} className="arrow-primary me-2" />
                        {/* <FaArrowCircleDown size={20} className="arrow-primary me-2" /> */}
                        <h3 className="h5 text-primary mb-0">{titulo}</h3>
                    </div>
                    {subtitulo && <small className="text-muted">{subtitulo}</small>}
                </div>
                <img src={iconSrc} alt="Status do KPI" className="kpi-status-icon" />
            </div>
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