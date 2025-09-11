import { FaCircleUser } from "react-icons/fa6";
import logo from "../../assets/imagens/siplan_logo_azul.png";
import './estilos.css';

export function Cabecalho() {
    return (
        <>
            <nav className="navbar navbar-expand-lg bg-azul-compesa py-1">
                <div className="container">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggler"
                        aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <img src={logo} alt="SIPLAN" width="120px" />
                    <div className="collapse navbar-collapse" id="navbarToggler">
                        <ul className="navbar-nav me-auto mb-2 p-3 mb-lg-0">
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle fw-semibold" id="dropdownMenuButton" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Arquivo
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <li><button className="dropdown-item">Novo Arquivo</button></li>
                                    <li><button className="dropdown-item">Abrir JSON</button></li>
                                </ul>
                            </li >
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle fw-semibold" id="dropdownMenuButton" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Ferramentas
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <li><button className="dropdown-item">Novo Arquivo</button></li>
                                    <li><button className="dropdown-item">Abrir JSON</button></li>
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