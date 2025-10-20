import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obterUsuarioPorLogin } from '../../../service/novoUsuarioService';
import axios from 'axios';
import Cabecalho from '../../../componentes/Cabecalho';
import { Rodape } from '../../../componentes/Rodape';

function NovoUsuario() {
    const [loginRede, setLoginRede] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const navigate = useNavigate();

    const verificarUsuarioCadastrado = async (login) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8098/usuariosip/usuarioscadastrados', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { page: 0, size: 1000 }
            });

            const usuariosCadastrados = response.data.content || [];
            return usuariosCadastrados.some(usuario => usuario.login === login);
        } catch {
            return false;
        }
    };

    const manipularBuscarUsuario = async () => {
        setMensagem('');

        if (loginRede.trim() === '') {
            setMensagem('Por favor, insira o login de rede.');
            return;
        }

        setCarregando(true);

        try {
            const jaCadastrado = await verificarUsuarioCadastrado(loginRede);
            if (jaCadastrado) {
                setMensagem('Usuário já cadastrado no Siplan!');
                setCarregando(false);
                return;
            }

            const dados = await obterUsuarioPorLogin(loginRede);

            navigate(`/cadastros/configurar-usuario`, {
                state: { usuarioData: dados }
            });

        } catch (erro) {
            const msgErro = erro.response && erro.response.status === 404
                ? `Usuário com login "${loginRede}" não encontrado no Siplan.`
                : 'Falha ao buscar usuário. Verifique sua conexão ou permissões.';

            setMensagem(msgErro);

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

                        {mensagem && (
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