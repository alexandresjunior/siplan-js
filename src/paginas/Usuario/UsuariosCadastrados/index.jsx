import Cabecalho from "../../../componentes/Cabecalho";
import { Rodape } from "../../../componentes/Rodape";

function Usuario() {
    return(
        <>
        <Cabecalho />
      
       <div className="card">
                <div className="card-header border-0">
                    <div className="row align-items-center">
                        <div className="col">
                            <h3 className="mb-0">Usuários Cadastrados</h3>
                        </div>    
                            <div className="col text-right">
                                <a href="/controle-acesso/novo-usuario" className="btn btn-primary">
                                    Novo Usuário
                                </a>
                            </div>
                    </div>
                </div>

                
                </div>
               

        <Rodape />
        </>
    )
}

export default Usuario;