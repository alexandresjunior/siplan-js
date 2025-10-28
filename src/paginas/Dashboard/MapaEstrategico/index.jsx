import { Bullseye, Eye, People, Gear, GraphUp } from 'react-bootstrap-icons';
import './estilos.css';

const SecaoEstrategica = ({ icone, titulo, cor, itens }) => (
    <div className="row align-items-center my-5">
        <div className="col-lg-2 text-center">
            <div className={`secao-icone-wrapper ${cor}`}>
                {icone}
            </div>
        </div>
        <div className="col-lg-10">
            <h3 className={`secao-titulo ${cor}`}>{titulo}</h3>
            <div className="row g-3">
                {itens.map((texto, index) => (
                    <div key={index} className="col-md-6">
                        <div className="card h-100 card-item shadow-sm">
                            <div className="card-body">
                                <p className="card-text mb-0">{texto}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const secoes = {
    resultados: {
        icone: <GraphUp size={50} />,
        titulo: "RESULTADOS",
        cor: "bg-success",
        itens: [
            "Universalizar o acesso à água e ao esgotamento sanitário, de acordo com as premissas do Marco Regulatório",
            "Proporcionar a continuidade do abastecimento de água e do esgotamento sanitário por meio de um serviço de excelência",
            "Garantir a sustentabilidade econômico-financeira"
        ]
    },
    processos: {
        icone: <Gear size={50} />,
        titulo: "PROCESSOS INTERNOS",
        cor: "bg-warning",
        itens: [
            "Fortalecer as práticas ambientais, sociais e de governança",
            "Potencializar a gestão do negócio com foco em resultados, transparência e sustentabilidade",
            "Aprimorar os processos corporativos",
            "Aprimorar o planejamento orçamentário e executivo com foco no alcance das metas do Marco Regulatório"
        ]
    },
    pessoas: {
        icone: <People size={50} />,
        titulo: "PESSOAS E RECURSOS",
        cor: "bg-info",
        itens: [
            "Aperfeiçoar a gestão de pessoas e elevar o nível de desempenho individual e das equipes",
            "Promover capacitação continuada e desenvolvimento do capital intelectual",
            "Fortalecer o clima organizacional e a meritocracia",
            "Prover infraestrutura e desenvolvimento tecnológico com valorização da inovação"
        ]
    }
};

const valores = [
    "COMPROMETIMENTO COM RESULTADOS", "FOCO NO CLIENTE", "INOVAÇÃO", "RESPONSABILIDADE SOCIOAMBIENTAL",
    "ÉTICA E TRANSPARÊNCIA", "VALORIZAÇÃO DAS PESSOAS", "EFICIÊNCIA E RENTABILIDADE"
];

const MapaEstrategico = () => {
    return (
        <div className="mb-5">
            <div className="container">
                <div className="text-center mb-5">
                    <h1 className="display-5 fw-bold text-primary">Mapa Estratégico Organizacional</h1>
                    <p className="lead text-muted">COMPESA - COMPANHIA PERNAMBUCANA DE SANEAMENTO | 2023 - 2027</p>
                </div>

                <div className="row justify-content-center align-items-center g-4 mb-5">
                    <div className="col-lg-5">
                        <div className="card text-white card-missao h-100 shadow">
                            <div className="card-body p-4 d-flex align-items-center">
                                <Bullseye size={60} className="me-4 flex-shrink-0" />
                                <div>
                                    <h2 className="h4">Missão</h2>
                                    <p className="mb-0">Prestar, de forma sustentável, serviços de abastecimento de água e esgotamento sanitário, com a promoção do bem-estar e da qualidade de vida dos clientes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-5">
                        <div className="card text-white card-visao h-100 shadow">
                            <div className="card-body p-4 d-flex align-items-center">
                                <Eye size={60} className="me-4 flex-shrink-0" />
                                <div>
                                    <h2 className="h4">Visão de futuro</h2>
                                    <p className="mb-0">Ser referência regional na prestação dos serviços de abastecimento de água e esgotamento sanitário, orientada pelos pilares da inovação e sustentabilidade.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SecaoEstrategica {...secoes.resultados} />
                <SecaoEstrategica {...secoes.processos} />
                <SecaoEstrategica {...secoes.pessoas} />

                <div className="text-center mt-5">
                    <div className="d-flex flex-wrap justify-content-center gap-2">
                        {valores.map(valor => (
                            <span key={valor} className="badge badge-valor text-white fw-bold p-2">{valor}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MapaEstrategico;