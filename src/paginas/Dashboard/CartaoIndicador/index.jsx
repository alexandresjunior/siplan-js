import checkIcon from '../../../assets/imagens/icon-check.svg';
import alertIcon from '../../../assets/imagens/icon-alert.svg';
import closeIcon from '../../../assets/imagens/icon-close.svg';
import starIcon from '../../../assets/imagens/icon-star.svg';
import { FaArrowCircleUp } from 'react-icons/fa';
import GraficoIndicador from '../GraficoIndicador';
import Modal from '../../../componentes/Modal';
import './estilos.css';
import { useState } from 'react';

const getStatusIcon = (value) => {
    if (value < 95) return closeIcon;
    if (value >= 95 && value < 100) return alertIcon;
    if (value > 110) return starIcon;
    return checkIcon;
};

const CartaoIndicador = ({ data: initialData, onSalvar }) => {
    const [data, setData] = useState(initialData);
    const [modalAberto, setModalAberto] = useState(false);
    const [formData, setFormData] = useState({});

    const { titulo, subtitulo, meta, teto, real, kpi, metaUnidade } = data;
    const iconSrc = getStatusIcon(kpi);

    // Abre modal e carrega dados atuais
    const abrirModal = () => {
        setFormData({ ...data });
        setModalAberto(true);
    };

    // Extrai apenas o número, ignorando R$, %, espaços, etc.
    const extrairNumero = (valor) => {
        if (!valor) return 0;
        const limpo = valor.toString().replace(/[^\d,.-]/g, '').replace(',', '.');
        return parseFloat(limpo) || 0;
    };

    // Atualiza campo
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Permite digitar R$, %, espaços, etc. — mas salva apenas o número
        const numValue = value === '' ? '' : extrairNumero(value);

        setFormData((prev) => {
            const novo = { ...prev, [name]: numValue };

            // Cálculo do KPI (só com números)
            if (novo.real !== undefined && (novo.meta !== undefined || novo.teto !== undefined)) {
                const base = novo.teto !== undefined && novo.teto !== 0 ? novo.teto : novo.meta;
                novo.kpi = base ? (novo.real / base) * 100 : 0;
            }
            return novo;
        });
    };

    // Salva e atualiza cartão
    const salvar = () => {
        const dadosAtualizados = {
            ...data,
            ...formData,
            kpi: formData.kpi || 0,
        };
        setData(dadosAtualizados);
        onSalvar?.(dadosAtualizados); // opcional: passa pro Dashboard
        setModalAberto(false);
    };

    const botoesModal = [
        { texto: 'Sair', variante: 'secondary', aoClicar: () => setModalAberto(false) },
        { texto: 'Salvar', variante: 'primary', aoClicar: salvar },
    ];

    return (
        <>
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
                    onClick={abrirModal}
                    className="btn btn-primary btn-sm position-absolute"
                    style={{
                        top: '1.10rem',   // descido para alinhar com o ícone (ajuste fino)
                        right: '0.75rem',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Editar
                </button>

                {/* Corpo do cartão – altura fixa para o gráfico */}
                <div className="card-body" style={{ minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            {/* Modal de Edição – botões no canto superior direito, lado a lado */}
            <Modal
                estaAberto={modalAberto}
                aoFechar={() => setModalAberto(false)}
                titulo={`${titulo}`}
                botoesAcao={[
                    {
                        label: 'Salvar',
                        className: 'btn btn-primary',
                        onClick: salvar
                    },
                    {
                        label: 'Sair',
                        className: 'btn btn-outline-primary btn-sair',
                        onClick: () => setModalAberto(false)
                    }
                ]}
            >
                <div className="row g-3">
                    {/* Campo condicional: Meta ou Teto */}
                    {formData.meta !== undefined && (
                        <div className="col-md-6">
                            <label className="form-label">Meta</label>
                            <input
                                type="text"
                                className="form-control"
                                name="meta"
                                value={formData.meta !== undefined ? formData.meta : ''}
                                onChange={handleChange}

                            />
                        </div>
                    )}
                    {formData.teto !== undefined && (
                        <div className="col-md-6">
                            <label className="form-label">Teto</label>
                            <input
                                type="text"
                                className="form-control"
                                name="teto"
                                value={formData.teto !== undefined ? formData.teto : ''}
                                onChange={handleChange}

                            />
                        </div>
                    )}

                    <div className="col-md-6">
                        <label className="form-label">Real</label>
                        <input
                            type="text"
                            className="form-control"
                            name="real"
                            value={formData.real !== undefined ? formData.real : ''}
                            onChange={handleChange}

                        />
                    </div>

                    <div className="col-12">
                        <label className="form-label">KPI (%)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.kpi ? formData.kpi.toFixed(1) + '%' : '0%'}
                            disabled
                        />
                    </div>
                </div>
            </Modal>
        </>

    );
};

export default CartaoIndicador;