import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cabecalho from '../../../componentes/Cabecalho';
import { Rodape } from '../../../componentes/Rodape';


function ConfigurarUsuario() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Extrai os dados do usuário do estado (state)
    const usuarioOriginal = location.state?.usuarioData;

    // Inicializa o estado com todas as permissões listadas da entidade e as novas, garantindo que sejam booleanas.
    const getInitialUser = (original) => {
        if (!original) return null;
        return {
            ...original,
            // Permissões da entidade UsuarioSiplan (USUSIP_)
            administrador: original.administrador ?? false,
            administradorRisco: original.administradorRisco ?? false,
            atualizarLotAutomatica: original.atualizarLotAutomatica ?? false,
            developer: original.developer ?? false, 
            
            // Usando 'pareto' como chave para consistência com o que está sendo renderizado como 'Sim'
            pareto: original.pareto ?? false, 
        };
    };

    const [usuario, setUsuario] = useState(getInitialUser(usuarioOriginal));
    const [carregando, setCarregando] = useState(false);
    const [mensagem, setMensagem] = useState('');

    // Define a lista UNIFICADA de permissões para renderização e edição
    // Usamos as chaves exatas da entidade ou do estado
    const permissoes = [
        { key: 'administrador', label: 'Administrador (Controle Total)' },
        { key: 'administradorRisco', label: 'Administrador de Riscos' },
        { key: 'atualizarLotAutomatica', label: 'Atualização Automática' },
        { key: 'pareto', label: 'Visualizar Pareto' }, // Chave corrigida
        { key: 'developer', label: 'Developer (Acesso Avançado)' },
    ];

    // Efeito para checar se os dados vieram. Se não, volta para a busca.
    useEffect(() => {
        if (!usuarioOriginal) {
            setMensagem('Nenhum usuário foi fornecido. Voltando para a busca.');
            const timer = setTimeout(() => {
                navigate('/cadastros/novousuario');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [usuarioOriginal, navigate]);
    
    if (!usuario) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="alert alert-danger" role="alert">{mensagem}</div>
            </div>
        );
    }
    
    // Função de manipulação para as checkboxes
    const manipularMudarPermissao = (permissao, valor) => {
        setUsuario(prevUsuario => ({
            ...prevUsuario,
            [permissao]: valor
        }));
    };

    // Lógica de submissão (Salvar/Atualizar no Backend)
    const manipularSalvar = async () => {
        setCarregando(true);
        setMensagem('');
        
        try {
            // 🚨 Insira a sua chamada de API para atualizar o usuário aqui
            // Exemplo: await atualizarUsuario(usuario); 

            console.log('Usuário a ser salvo:', usuario);
            setMensagem(`Usuário ${usuario.login} salvo/atualizado com sucesso!`);

        } catch (erro) {
            setMensagem('Falha ao salvar as configurações do usuário.');
        } finally {
            setCarregando(false);
        }
    };

    // Função para renderizar todos os dados do objeto de usuário (excluindo objetos e sets)
    const renderizarTodosOsDados = () => {
        // Exclui campos que são objetos complexos ou arrays/sets (que precisam de renderização específica)
        // E também os booleans de permissão que estão sendo editados na seção de Permissões
        const chavesExcluidas = [
            'id',
            'krisLiberados',
            'elementosOrganizacionaisLiberados', 
            'indicadoresLiberados',
            'administrador', 
            'administradorRisco', 
            'atualizarLotAutomatica', 
            'developer',
            'visualizarPareto', 
            'pareto',
            'planosDeAcaoLiberados',
            'grupos',
            'usuarioComum'
        ];
        
        const chaves = Object.keys(usuario).filter(key => !chavesExcluidas.includes(key));

        if (chaves.length === 0) {
            return <p className="text-center text-muted">Nenhuma informação simples adicional disponível.</p>;
        }

        return (
            <div className="row">
                {chaves.map(key => (
                    <div className="col-md-6 mb-3" key={key}>
                        <label className="form-label text-muted text-capitalize">
                           {key === 'cpf' 
                                ? 'CPF' 
                                : key === 'lotacaoAtual' 
                                    ? 'Lotação Atual' 
                                    : key.replace(/([A-Z])/g, ' $1').trim()
                            } 
                        </label>
                        <p className="form-control-static text-break">
                            <strong>
                               {key === 'lotacaoAtual' && usuario[key] && usuario[key].nome
                                    ? usuario[key].nome 
                                    : key === 'lotacaoAtual' && !usuario[key]
                                    ? 'N/A' // Se for lotacaoAtual mas o objeto estiver null/undefined
                                    : typeof usuario[key] === 'boolean'
                                        ? (usuario[key] ? 'Sim' : 'Não')
                                        : usuario[key] || 'N/A'
                                }
                            </strong>
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
                                <h5 className="border-bottom pb-2 mb-3 mt-3 text-primary">Permissões de Acesso</h5>
                                <div className="row">
                                    {permissoes.map(p => (
                                        <div className="col-md-6 mb-3" key={p.key}>
                                            <div className="form-check">
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    id={p.key} 
                                                    // O estado do checkbox é definido pelo valor atual da permissão no objeto usuario
                                                    checked={!!usuario[p.key]} 
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
                                        className="btn btn-outline-secondary me-2"
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

export default ConfigurarUsuario;
