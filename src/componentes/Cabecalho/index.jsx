import { FaCircleUser } from "react-icons/fa6";
import logo from "../../assets/imagens/siplan_logo_azul.png";
import { useNavigate, Link } from "react-router-dom";
import loginService from "../../service/loginService";
import './estilos.css';

const menuItems = [
    {
        title: "Cadastros",
        links: [
            { label: "Usuários", path: "/cadastros/usuarioscadastrados" },
            { label: "Indicadores", path: "/cadastros/indicadores" },
            { label: "Valores dos Indicadores", path: "/cadastros/valores-indicadores" },
            { label: "Transferência de Valores", path: "/cadastros/transferencia-valores" },
            { label: "Ata de Reuniões", path: "/cadastros/ata-reunioes" },
            { label: "Comitês", path: "/cadastros/comites" },
            { label: "Objetivos", path: "/cadastros/objetivos" },
        ]
    },
    {
        title: "Configurações",
        links: [
            { label: "Importação de Dados", path: "/configuracoes/importacao-dados" },
            { label: "Controle de Acesso", path: "/configuracoes/controle-acesso" },
            { label: "PDF de Indicadores", path: "/configuracoes/pdf-indicadores" },
            { label: "PDF de Pareto", path: "/configuracoes/pdf-pareto" },
            { label: "Resumos do Ciclo", path: "/configuracoes/resumos-ciclo" },
            { label: "Lixeira de Indicadores", path: "/configuracoes/lixeira-indicadores" },
        ]
    },
    {
        title: "Análise",
        links: [
            { label: "Indicadores", path: "/analise/indicadores" },
            { label: "Pareto", path: "/analise/pareto" },
        ]
    },
    {
        title: "Aderência",
        links: [
            { label: "Verificação", path: "/aderencia/verificacao" },
            { label: "Data de Fechamento", path: "/aderencia/data-fechamento" },
            { label: "Calendário de Reuniões", path: "/aderencia/calendario-reunioes" },
        ]
    }
];

export function Cabecalho() {
    const navigate = useNavigate();
    const { logout } = loginService; //desestrutura função logout


    const handleDropdownClick = (e) => e.preventDefault();

    return (
        <nav className="navbar navbar-expand-lg bg-primary py-lg-0 py-3">
            <div className="container">
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarToggler"
                    aria-controls="navbarToggler"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <Link to="/dashboard">
                    <img src={logo} alt="SIPLAN" width="120px" />
                </Link>

                <div className="collapse navbar-collapse" id="navbarToggler">
                    <ul className="navbar-nav me-auto p-lg-3 mb-lg-0">
                        {menuItems.map((menu, index) => (
                            <li className="nav-item dropdown" key={index}>
                                <a className="nav-link dropdown-toggle fw-semibold" href="/" onClick={handleDropdownClick} role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {menu.title}
                                </a>
                                <ul className="dropdown-menu">
                                    {menu.links.map((link, subIndex) => (
                                        <li key={subIndex}>
                                            <Link className="dropdown-item" to={link.path}>
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>

                    <ul className="navbar-nav">
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="/" onClick={handleDropdownClick} role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <FaCircleUser size={30} color="#FFF" />
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <div className="d-flex justify-content-center align-items-center flex-column mx-3 my-2">
                                        <div className="fw-semibold">Usuário:</div>
                                        <div className="mb-2">Alexandre Junior</div>
                                        <button className="btn btn-sm btn-danger fw-semibold w-100" onClick={() => logout(navigate)}>SAIR</button>
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Cabecalho;