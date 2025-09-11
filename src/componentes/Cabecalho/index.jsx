import { FaCircleUser } from "react-icons/fa6";
import logo from "../../assets/imagens/siplan_logo_azul.png";
import './estilos.css';

export function Cabecalho() {
    return (
        <>
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
                    <img src={logo} alt="SIPLAN" width="120px" />
                    <div className="collapse navbar-collapse" id="navbarToggler">
                        <ul className="navbar-nav me-auto p-3 mb-lg-0">
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle fw-semibold" id="dropdownMenuButton" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Cadastros
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <li><button className="dropdown-item">Indicadores</button></li>
                                    <li><button className="dropdown-item">Valores dos Indicadores</button></li>
                                    <li><button className="dropdown-item">Transferência de Valores</button></li>
                                    <li><button className="dropdown-item">Ata de Reuniões</button></li>
                                    <li><button className="dropdown-item">Comitês</button></li>
                                    <li><button className="dropdown-item">Objetivos</button></li>
                                </ul>
                            </li >
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle fw-semibold" id="dropdownMenuButton" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Configurações
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <li><button className="dropdown-item">Importação de Dados</button></li>
                                    <li><button className="dropdown-item">Controle de Acesso</button></li>
                                    <li><button className="dropdown-item">PDF de Indicadores</button></li>
                                    <li><button className="dropdown-item">PDF de Pareto</button></li>
                                    <li><button className="dropdown-item">Resumos do Ciclo</button></li>
                                    <li><button className="dropdown-item">Lixeira de Indicadores</button></li>
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle fw-semibold" id="dropdownMenuButton" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Análise
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <li><button className="dropdown-item">Indicadores</button></li>
                                    <li><button className="dropdown-item">Pareto</button></li>
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle fw-semibold" id="dropdownMenuButton" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Aderência
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <li><button className="dropdown-item">Verificação</button></li>
                                    <li><button className="dropdown-item">Data de Fechamento</button></li>
                                    <li><button className="dropdown-item">Calendário de Reuniões</button></li>
                                </ul>
                            </li>
                        </ul>

                        <ul className="nav nav-pills">
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" id="dropdownMenuButton" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <FaCircleUser size={30} color="#FFF" />
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <div className="d-flex justify-content-center align-items-center flex-column mx-3 my-2">
                                            <div className="d-grid align-items-center fw-semibold">Usuário:</div>
                                            <div className="mb-2">Alexandre Junior</div>
                                            <button className="btn btn-sm btn-danger fw-semibold w-100">SAIR</button>
                                        </div>
                                    </ul>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Cabecalho;