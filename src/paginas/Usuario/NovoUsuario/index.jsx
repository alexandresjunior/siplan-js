import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obterUsuarioPorLogin } from '../../../service/novoUsuarioService';
import Cabecalho from '../../../componentes/Cabecalho';
import { Rodape } from '../../../componentes/Rodape';

function NovoUsuario() {
    const [loginRede, setLoginRede] = useState('');
    const [carregando, setCarregando] = useState(false);
    // Removemos 'usuarioEncontrado'
    const [mensagem, setMensagem] = useState('');
    const navigate = useNavigate();

    const manipularBuscarUsuario = async () => {
        setMensagem('');
        
        if (loginRede.trim() === '') {
            setMensagem('Por favor, insira o login de rede.');
            return;
        }
        
        setCarregando(true);

        try {
            const dados = await obterUsuarioPorLogin(loginRede);
            
            // ✅ AÇÃO PRINCIPAL: Navega para a próxima página, passando os dados do usuário no objeto state
            navigate(`/cadastros/configurar-usuario`, { 
                state: { usuarioData: dados } 
            });

        } catch (erro) {
            // Se o Axios retornar 404 (Usuário não encontrado), a mensagem de erro será tratada aqui.
            const msgErro = erro.response && erro.response.status === 404
                ? `Usuário com login "${loginRede}" não encontrado no Siplan. Inicie o cadastro.`
                : 'Falha ao buscar usuário. Verifique sua conexão ou permissões.';
            
            setMensagem(msgErro);
            
        } finally {
            setCarregando(false);
        }
    };

    // Removemos a função renderizarResultado, pois a exibição será feita na próxima página.

    return (
        <>
            <Cabecalho />
            <div className="container mt-5 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <h3 className="mb-4">Buscar Usuário para Cadastro/Edição</h3>
                        
                        {/* Área de Mensagens de Feedback */}
                        {mensagem && (
                            // Se a busca falhou, geralmente é alert-danger, a menos que você queira 
                            // um feedback específico de sucesso (que agora é a navegação).
                            <div className={`alert alert-danger fade show`} role="alert">
                                {mensagem}
                            </div>
                        )}
                        
                        <div className="card shadow-sm">
                            <div className="card-body p-4">
                                
                                <div className="mb-4">
                                    <label htmlFor="loginRedeInput" className="form-label">
                                        Login de Rede*
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-md"
                                        id="loginRedeInput"
                                        value={loginRede}
                                        onChange={(e) => setLoginRede(e.target.value)}
                                        required
                                        disabled={carregando}
                                    />
                                </div>
                                <div className="d-flex justify-content-end mt-4">
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary me-2"
                                        onClick={() => navigate('/cadastros/usuarioscadastrados')} 
                                        disabled={carregando}
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={manipularBuscarUsuario}
                                        disabled={carregando}
                                    >
                                        {carregando ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            "Buscar Usuário"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Rodape />
        </>
    );
}

export default NovoUsuario;