import checkIcon from '../../../assets/imagens/icon-check.svg';
import alertIcon from '../../../assets/imagens/icon-alert.svg';
import closeIcon from '../../../assets/imagens/icon-close.svg';
import starIcon from '../../../assets/imagens/icon-star.svg';
import GraficoIndicador from '../GraficoIndicador';
import Modal from '../../../componentes/Modal';
import api from '../../../services/api';
import { FaArrowCircleUp } from 'react-icons/fa';
import { useState } from 'react';
import './estilos.css';

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
    const [carregando, setCarregando] = useState(false);

    const { id } = data;
    const iconSrc = getStatusIcon(data.kpi);

    const abrirModal = () => {
        setFormData({ ...data });
        setModalAberto(true);
    };

    const extrairNumero = (valor) => {
        if (!valor) return 0;
        const limpo = valor.toString().replace(/[^\d,.-]/g, '').replace(',', '.');
        return parseFloat(limpo) || 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        const numValue = value === '' ? '' : extrairNumero(value);

        setFormData((prev) => {
            const novo = { ...prev, [name]: numValue };

            if (novo.real !== undefined && (novo.meta !== undefined || novo.teto !== undefined)) {
                const base = novo.teto !== undefined && novo.teto !== 0 ? novo.teto : novo.meta;
                novo.kpi = base ? (novo.real / base) * 100 : 0;
            }
            return novo;
        });
    };

    const salvar = async () => {
        if (!id) {
            alert("Cartão sem ID — não pode salvar");
            return;
        }

        setCarregando(true);

        try {
            const payload = {
                valorIndicador: formData.teto !== undefined ? formData.teto : formData.meta,
                real: formData.real
            };

            const response = await api.put(`/dashboard/atualizarCartao/${id}`, payload);
            const dadosDoBackend = response.data;

            const dadosAtualizados = {
                ...data,
                ...dadosDoBackend,
                ...(data.teto !== undefined && { teto: dadosDoBackend.valorIndicador }),
                ...(data.meta !== undefined && { meta: dadosDoBackend.valorIndicador }),
                real: dadosDoBackend.real,
                kpi: dadosDoBackend.kpi
            };

            setData(dadosAtualizados);
            onSalvar?.(dadosAtualizados);
            setModalAberto(false);

        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar no servidor");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <>
            <div className="kpi-card position-relative">
                <div className="card-header pb-5">
                    <div className="mb-3">
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <FaArrowCircleUp size={20} className="arrow-primary flex-shrink-0" />

                            <div className="d-flex align-items-center gap-2 flex-grow-1 min-width-0">
                                <h3 className="h5 mb-0 text-truncate">
                                    {data.nome}
                                </h3>
                                <img
                                    src={iconSrc}
                                    alt="Status do KPI"
                                    className="kpi-status-icon flex-shrink-0"
                                    style={{ width: '24px', height: '24px' }}
                                />
                            </div>
                        </div>

                        {data.descricao && <small className="text-muted d-block mt-2">{data.descricao}</small>}
                    </div>
                </div>

                <button
                    onClick={abrirModal}
                    className="btn btn-primary btn-sm position-absolute"
                    style={{
                        top: '1.0rem',
                        right: '0.75rem',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Editar
                </button>

                <div className="card-body" style={{ minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GraficoIndicador value={data.kpi} />
                </div>

                <div className="card-footer">
                    <div className="kpi-value">
                        <span className="label">{data.teto ? 'TETO' : 'META'}</span>
                        <span className="value">{data.teto || data.meta}</span>
                    </div>
                    <div className="kpi-value">
                        <span className="label">REAL</span>
                        <span className="value">{data.real}</span>
                    </div>
                </div>

                {data.metaUnidade && <p className="kpi-unidade">{data.metaUnidade}</p>}
            </div>

            <Modal
                estaAberto={modalAberto}
                aoFechar={() => setModalAberto(false)}
                titulo={`${data.nome}`}
                botoesAcao={[
                    {
                        label: carregando ? 'Salvando...' : 'Salvar',
                        className: 'btn btn-primary',
                        onClick: salvar,
                        disabled: carregando
                    },
                    {
                        label: 'Sair',
                        className: 'btn btn-outline-primary btn-sair',
                        onClick: () => setModalAberto(false)
                    }
                ]}
            >
                <div className="row g-3">
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