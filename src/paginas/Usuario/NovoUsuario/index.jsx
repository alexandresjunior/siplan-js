import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarUsuarioPorLogin } from '../../../service/novoUsuarioService';
import Cabecalho from '../../../componentes/Cabecalho';
import { Rodape } from '../../../componentes/Rodape';

// Supondo que você define a URL aqui ou a importa de algum arquivo de constantes
const URL_BUSCAR_POR_LOGIN = 'http://localhost:8098/usuariosip/buscar-por-login';

function NovoUsuario() {
    const [loginRede, setLoginRede] = useState('');
    const [carregando, setCarregando] = useState(false); // Novo estado para loading
    const navigate = useNavigate();

    const manipularBuscarUsuario = async () => {
        if (loginRede.trim() === '') {
            alert('Por favor, insira o login de rede.');
            return;
        }
        
        setCarregando(true);

        try {
            // 💡 Chama o service para fazer a requisição HTTP
            const dadosUsuario = await buscarUsuarioPorLogin(loginRede, URL_BUSCAR_POR_LOGIN);
            
            // Sucesso: Lidar com os dados (ex: salvar no estado, redirecionar para tela de confirmação)
            alert(`Usuário encontrado: ${dadosUsuario.nome || dadosUsuario.login}`);
            console.log('Dados do usuário:', dadosUsuario);

            // 🚨 PRÓXIMO PASSO: Você pode redirecionar para a próxima tela de cadastro, 
            // passando os dados ou o login.

        } catch (erro) {
            // Lidar com falha: Usuário não encontrado, erro de servidor, etc.
            const mensagem = erro.response && erro.response.data 
                ? erro.response.data 
                : 'Falha ao buscar usuário. Verifique o login e tente novamente.';
            
            alert(mensagem);
            
        } finally {
            setCarregando(false);
        }
    };
    return (
        <>
            <Cabecalho />
            <div className="container mt-5 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <h3 className="mb-4">Cadastrar Novo Usuário</h3>
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
                                    />
                                </div>
                                <div className="d-flex justify-content-end mt-4">
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary me-2"
                                        onClick={() => navigate('/cadastros/usuarioscadastrados')} 
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={manipularBuscarUsuario}
                                    >
                                        Buscar
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