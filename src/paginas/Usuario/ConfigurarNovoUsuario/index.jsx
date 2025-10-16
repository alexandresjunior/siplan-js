import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cabecalho from '../../../componentes/Cabecalho';
import { Rodape } from '../../../componentes/Rodape';

function ConfigurarNovoUsuario() {
    const location = useLocation();
    const navigate = useNavigate();

    const usuarioOriginal = location.state?.usuarioData;

    const getInitialUser = (original) => {
        if (!original) return null;
        // Retorna os dados brutos do DTO
        return { ...original };
    };

    const [usuario, setUsuario] = useState(getInitialUser(usuarioOriginal));
    const [carregando, setCarregando] = useState(false);
    const [mensagem, setMensagem] = useState('');

    // =======================================================================
    // ESTADOS SEPARADOS PARA AS PERMISSÕES (SEM DEVELOPER)
    // =======================================================================
    const [administrador, setAdministrador] = useState(false);
    const [administradorRisco, setAdministradorRisco] = useState(false);
    const [atualizarLotAutomatica, setAtualizarLotAutomatica] = useState(false);
    const [pareto, setPareto] = useState(false);
    // =======================================================================

    // Objeto de mapeamento para o JSX (lê os estados separados)
    const PERMISSION_VALUES = useMemo(() => ({
        administrador: administrador,
        administradorRisco: administradorRisco,
        atualizarLotAutomatica: atualizarLotAutomatica,
        pareto: pareto,
    }), [administrador, administradorRisco, atualizarLotAutomatica, pareto]);

    const permissoes = useMemo(() => [
        { key: 'administrador', label: 'Administrador (Controle Total)' },
        { key: 'administradorRisco', label: 'Administrador de Riscos' },
        { key: 'atualizarLotAutomatica', label: 'Atualização Automática' },
        { key: 'pareto', label: 'Visualizar Pareto' },
    ], []);

    // 🎯 LISTA DE CHAVES A SEREM EXCLUÍDAS NA RENDERIZAÇÃO DE DETALHES
    const CHAVES_EXCLUIDAS_DETALHES = useMemo(() => [
        'elementosOrganizacionaisLiberados', // Objeto complexo
        'indicadoresLiberados',              // Objeto complexo
        'administrador',                     // Gerenciado separadamente
        'administradorRisco',                // Gerenciado separadamente
        'atualizarLotAutomatica',            // Gerenciado separadamente
        'pareto',                            // Gerenciado separadamente
        'usuarioComum',                      // Propriedade de controle interno
    ], []);

    // Função auxiliar para obter o rótulo formatado
    const getLabel = (key) => {
        switch (key) {
            case 'id': return 'ID';
            case 'cpf': return 'CPF';
            case 'lotacaoAtual': return 'Lotação Atual';
            case 'siglaLotacaoAtual': return 'Sigla Lotação Atual';
            case 'matricula': return 'Matrícula';
            case 'tipoFuncionario': return 'Tipo Funcionário'
            case 'ativo': return 'Status';
            default: return key.replace(/([A-Z])/g, ' $1').trim();
        }
    };

    // Função auxiliar para obter o valor formatado
    const getValue = (key) => {
        const valor = usuario[key];
        if (key === 'ativo') {
            return valor ? 'Ativo' : 'Inativo';
        }
        if (typeof valor === 'boolean') {
            return valor ? 'Sim' : 'Não';
        }
        return valor || 'N/A';
    }

    // Efeito para checar se os dados vieram E SINCRONIZAR OS ESTADOS SEPARADOS
    useEffect(() => {
        if (!usuarioOriginal) {
            setMensagem('Nenhum usuário foi fornecido. Voltando para a busca.');
            const timer = setTimeout(() => {
                navigate('/cadastros/novousuario');
            }, 3000);
            return () => clearTimeout(timer);
        }

        // SINCRONIZAÇÃO INICIAL dos estados separados
        if (usuarioOriginal) {
            setAdministrador(usuarioOriginal.administrador ?? false);
            setAdministradorRisco(usuarioOriginal.administradorRisco ?? false);
            setAtualizarLotAutomatica(usuarioOriginal.atualizarLotAutomatica ?? false);
            setPareto(usuarioOriginal.pareto ?? false);
        }

    }, [usuarioOriginal, navigate]);

    if (!usuario) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="alert alert-danger" role="alert">{mensagem}</div>
            </div>
        );
    }

    // Função de manipulação para as checkboxes. ATUALIZA APENAS OS ESTADOS SEPARADOS.
    const manipularMudarPermissao = (permissao, valor) => {
        switch (permissao) {
            case 'administrador':
                setAdministrador(valor);
                break;
            case 'administradorRisco':
                setAdministradorRisco(valor);
                break;
            case 'atualizarLotAutomatica':
                setAtualizarLotAutomatica(valor);
                break;
            case 'pareto':
                setPareto(valor);
                break;
            default:
                console.warn(`Permissão desconhecida: ${permissao}`);
        }
    };

    const manipularSalvar = async () => {
        setCarregando(true);
        setMensagem('');

        try {
            // ✅ CORREÇÃO DEFINITIVA: Criar o DTO manualmente, incluindo APENAS os campos que existem no UsuarioSiplanDTO.java

            const usuarioDTO = {
                // CAMPOS DO USUARIOSIPLANDTO.JAVA
                id: usuario.id,
                nome: usuario.nome,
                login: usuario.login,
                lotacaoAtual: usuario.lotacaoAtual,

                // PERMISSÕES (DE ESTADOS SEPARADOS)
                administrador,
                administradorRisco,
                atualizarLotAutomatica,
                pareto,

                // Os campos booleanos do Java DTO são "Boolean" (nullable),
                // mas estamos enviando true/false, o que está correto.
            };

            // Remove campo de controle interno se existir (necessário antes, mas agora mais seguro)
            delete usuarioDTO.usuarioComum;

            // --- LOG DE DEBUG ADICIONADO ---
            console.log("DEBUG: DTO Final enviado para o backend (LIMPO):", usuarioDTO);
            // --- FIM LOG DE DEBUG ---

            // ✅ NOVO ENDPOINT
            const token = localStorage.getItem('token');
            const atualizarUsuarioURL = `http://localhost:8098/usuariosip/atualizarUsuarioV2`;
            const resposta = await axios.post(atualizarUsuarioURL, usuarioDTO, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            // ✅ RETORNO DIRETO
            const usuarioAtualizado = resposta.data;
            setMensagem(`Usuário ${usuarioAtualizado.login || usuarioAtualizado.nome} atualizado com sucesso!`);

            // Atualiza o estado local com o objeto retornado (melhor prática)
            setUsuario(usuarioAtualizado);

        } catch (erro) {
            console.error('Erro ao salvar as configurações:', erro);

            const mensagemErro = erro.response?.data?.message
                || erro.response?.statusText
                || erro.message
                || 'Erro desconhecido ao salvar. Verifique o console.';

            setMensagem(`Falha ao salvar as configurações: ${mensagemErro}`);
        } finally {
            setCarregando(false);
        }
    };

    // Função para renderizar todos os dados do objeto de usuário (APLICANDO O FILTRO)
    const renderizarTodosOsDados = () => {
        // Usa a lista de exclusão definida fora
        const chaves = Object.keys(usuario).filter(key => !CHAVES_EXCLUIDAS_DETALHES.includes(key));

        if (chaves.length === 0) {
            return <p className="text-center text-muted">Nenhuma informação simples adicional disponível.</p>;
        }

        return (
            <div className="row">
                {chaves.map(key => (
                    <div className="col-md-6 mb-3" key={key}>
                        <label className="form-label text-muted text-capitalize">
                            {getLabel(key)}
                        </label>
                        <p className="form-control-static text-break">
                            <strong>{getValue(key)}</strong>
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    // Renderização do formulário
    return (
        <>
            <Cabecalho />
            <div className="container mt-5 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-10 col-lg-8">
                        <h3 className="mb-4">Cadastrar Novo Usuário</h3>

                        {mensagem && (
                            <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-danger'} fade show`} role="alert">
                                {mensagem}
                            </div>
                        )}

                        {/* Seção ÚNICA de Dados e Permissões */}
                        <div className="card shadow-lg mb-4">

                            <div className="card-body">

                                {/* Dados (Apenas leitura) */}
                                <h5 className="border-bottom pb-2 mb-3 text-muted">Informações do Funcionário</h5>
                                {renderizarTodosOsDados()}

                                {/* Permissões (Checkboxes Editáveis) */}
                                <h5 className="border-bottom pb-2 mb-3 text-primary">Permissões de Acesso</h5>
                                <div className="row">
                                    {permissoes.map(p => (
                                        <div className="col-md-6 mb-3" key={p.key}>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={p.key}
                                                    checked={PERMISSION_VALUES[p.key]}
                                                    onChange={(e) => manipularMudarPermissao(p.key, e.target.checked)}
                                                />
                                                <label className="form-check-label" htmlFor={p.key}>
                                                    {p.label}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Ações */}
                                <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary me-3"
                                        onClick={() => navigate('/usuarios/novo')}
                                        disabled={carregando}
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={manipularSalvar}
                                        disabled={carregando}
                                    >
                                        {carregando ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            "Salvar"
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

export default ConfigurarNovoUsuario;