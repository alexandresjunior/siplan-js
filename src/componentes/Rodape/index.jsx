import logo from '../../assets/imagens/compesa_logo_verde.png';
import './estilos.css';

export function Rodape() {
    return (
        <footer className="d-flex flex-wrap align-items-center bg-secondary py-3">
            <div className="container">
                <div className="d-md-none text-center w-100 mb-2">
                    <div className="text-center mb-3">
                        <img src={logo} alt="COMPESA" width="100px" />
                    </div>

                    <p className="col-md-6">
                        <a href="https://intranet.compesa.com.br/gerencia-de-sistemas-corporativos/" target="_blank" className="link-rodape">
                            Gerência de Sistemas Corporativos
                        </a>
                        <span className="text-primary ms-2">&copy; {new Date().getFullYear()}</span>
                    </p>

                    <a href="https://servicos.compesa.com.br/" target="_blank" className="link-rodape" rel="noreferrer">
                        Companhia Pernambucana de Saneamento
                    </a>
                </div>

                <div className="d-none d-md-flex justify-content-between align-items-center w-100">
                    <p className="col-md-4 mb-0">
                        <a href="https://intranet.compesa.com.br/gerencia-de-sistemas-corporativos/" target="_blank" className="link-rodape">
                            Gerência de Sistemas Corporativos
                        </a>
                        <span className="text-primary ms-2">&copy; {new Date().getFullYear()}</span>
                    </p>

                    <div className="col-md-4 text-center">
                        <img src={logo} alt="COMPESA" width="100px" />
                    </div>

                    <p className="col-md-4 mb-0 text-end">
                        <a href="https://servicos.compesa.com.br/" target="_blank" className="link-rodape" rel="noreferrer">
                            Companhia Pernambucana de Saneamento
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    )
}