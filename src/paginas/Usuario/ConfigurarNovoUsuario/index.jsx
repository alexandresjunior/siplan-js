import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cabecalho from '../../../componentes/Cabecalho';
import { Rodape } from '../../../componentes/Rodape';

function ConfigurarNovoUsuario() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Extrai os dados do usuário do estado (state)
    const usuarioOriginal = location.state?.usuarioData;

    // A lógica de isEdicao foi removida conforme sua solicitação.
    // const isEdicao = !!usuarioOriginal?.id; 

    // Inicializa o estado com as permissões da entidade, garantindo que sejam booleanas.
    const getInitialUser = (original) => {
        if (!original) return null;
        
        // Combina os dados básicos (FuncionarioDTO) com as permissões do Siplan
        return {
            ...original,
            administrador: original.administrador ?? false,
            administradorRisco: original.administradorRisco ?? false,
            atualizarLotAutomatica: original.atualizarLotAutomatica ?? false,
            developer: original.developer ?? false, 
            pareto: original.pareto ?? false, 
        };
    };

    const [usuario, setUsuario] = useState(getInitialUser(usuarioOriginal));
    const [carregando, setCarregando] = useState(false);
    const [mensagem, setMensagem] = useState('');

    // Define a lista UNIFICADA de permissões para renderização e edição
    const permissoes = [
        { key: 'administrador', label: 'Administrador (Controle Total)' },
        { key: 'administradorRisco', label: 'Administrador de Riscos' },
        { key: 'atualizarLotAutomatica', label: 'Atualização Automática' },
        { key: 'pareto', label: 'Visualizar Pareto' },
        { key: 'developer', label: 'Developer (Acesso Avançado)' },
    ];
    
    // Define a ordem de exibição e os rótulos dos campos do FuncionarioDTO
    const DTO_KEYS_ORDER = [
        'nome', 'login', 'matricula', 'cpf',
        'lotacaoAtual', 'cargo', 'tipoFuncionario', 'especialidade',
        'email', 'telefone', 'celular', 'sexo', 'status' // 'ativo' substituído por 'status' para exibição
    ];

    const CUSTOM_LABELS = {
        nome: 'Nome Completo',
        matricula: 'Matrícula',
        lotacaoAtual: 'Lotação Atual',
        tipoFuncionario: 'Tipo de Funcionário',
        especialidade: 'Especialidade',
        status: 'Status', // Novo label para o campo 'status'
        cpf: 'CPF',
        login: 'Login',
        // Outros campos como 'email', 'telefone', 'celular', 'sexo' serão tratados pela capitalização
    };
    // Fim da Definição de Campos
    

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

 const manipularSalvar = async () => {
        setCarregando(true);
        setMensagem('');
        
        console.log("-> 1. Início da função manipularSalvar. Verificando dados...");
        
        if (!usuario) {
            console.error("ERRO CRÍTICO: Objeto 'usuario' é nulo na hora de salvar.");
            setMensagem('Erro: Dados do usuário estão ausentes no momento da submissão.');
            setCarregando(false);
            return;
        }

        try {
            console.log("-> 1.1. Estado 'usuario' no início do try:", usuario); 

            const token = localStorage.getItem('token');
            const url = 'http://localhost:8098/usuariosip/atualizarUsuario'; 

            console.log("-> 2. Token de Autorização:", token ? 'PRESENTE' : 'AUSENTE! A API pode falhar se for necessário.');
            console.log("URL de Destino:", url);

            // 🎯 CRIAÇÃO DO PAYLOAD MINIMALISTA
            // A lista define EXPLICITAMENTE quais campos do FuncionarioDTO + Permissões do Siplan serão enviados.
            const camposEssenciais = [
                'id', 'nome', 'login', 'matricula', 'cpf', 'email', 'celular', 'telefone',
                'sexo', 'cargo', 'tipoFuncionario', 'especialidade', 
                'lotacaoAtual', // O valor de 'lotacaoAtual' será TRATADO
                'administrador', 'administradorRisco', 'atualizarLotAutomatica', 'pareto', 'developer'
            ];

            // Filtra o objeto 'usuario' (do state) e TRATA A LOTAÇÃO
            const payload = {};

            camposEssenciais.forEach(key => {
                // Filtra: Apenas campos presentes na lista e que existem no objeto 'usuario'
                if (!usuario.hasOwnProperty(key) || usuario[key] === undefined) {
                    return; 
                }
                
                let value = usuario[key];

                if (key === 'lotacaoAtual') {
                    let lotacaoIdOrCode = null;

                    // 1. Tenta pegar o ID/Código se for um objeto (formato mais completo)
                    if (typeof value === 'object' && value !== null) {
                        lotacaoIdOrCode = value.id || value.codigo || null; 
                    } 
                    // 2. Tenta pegar o ID/Código se existir uma propriedade separada (lotacaoId), comum em DTOs.
                    else if (usuario.lotacaoId) {
                        lotacaoIdOrCode = usuario.lotacaoId;
                    }

                    // Se encontramos um ID/Código, formatamos no objeto mínimo que o backend espera.
                    if (lotacaoIdOrCode) {
                        // Formato esperado pelo Jackson para resolver uma entidade por ID.
                        value = { id: lotacaoIdOrCode }; 
                    } else if (typeof value === 'string' && value.trim() !== '') {
                        // Se o valor é uma STRING (o nome da lotação) e não encontramos o ID.
                        // ENTÃO, IGNORE ESTE CAMPO para não quebrar a requisição.
                        console.warn(`Lotação '${value}' é uma string (o nome) e será ignorada no payload. O backend espera o ID ou um objeto com ID.`);
                        return; // Não adiciona ao payload
                    } else {
                        // Se for null, passamos o valor nulo (pode ser aceitável para o backend).
                        value = null; 
                    }
                }

                payload[key] = value;
            });
            
            console.log("-> 3. Payload final enviado para o backend:", payload); 
            
            // A REQUISIÇÃO AXIOS OCORRE AQUI
            const resposta = await axios.post(url, payload, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            console.log("-> 4. Requisição de API bem-sucedida.");

            const usuarioAtualizado = resposta.data;
            console.log('Resposta do Backend:', usuarioAtualizado);

            const acao = 'salvo'; 
            setMensagem(`Usuário ${usuarioAtualizado.login || usuarioAtualizado.nome} ${acao} com sucesso!`);

        } catch (erro) {
            console.error('-> ❌ Erro ao salvar as configurações. Detalhe:', erro);
            
            const mensagemErro = erro.response?.data?.message 
                                || erro.message 
                                || 'Erro desconhecido ao salvar. Verifique o console do backend (e o log Detalhe: no frontend) para mais informações.';

            setMensagem(`Falha ao salvar as configurações: ${mensagemErro}`);
        } finally {
            console.log("-> 5. Finalizando manipulação. Carregando = false.");
            setCarregando(false);
        }
    };

    /**
     * Função otimizada para renderizar os campos do FuncionarioDTO em ordem e com labels em português.
     */
    const renderizarTodosOsDados = () => {
        // Filtra as chaves do FuncionarioDTO que existem e têm valor no objeto 'usuario'
        const chavesParaExibir = DTO_KEYS_ORDER.filter(key => {
            if (key === 'status') {
                // Mapeia a exibição de 'status' para a propriedade de dados 'ativo'
                return usuario.ativo !== undefined && usuario.ativo !== null;
            }
            // Para as outras chaves, verifica o valor original
            return usuario[key] !== undefined && usuario[key] !== null;
        });

        if (chavesParaExibir.length === 0) {
            return <p className="text-center text-muted">Nenhuma informação simples do funcionário disponível.</p>;
        }
        
        return (
            <div className="row">
                {chavesParaExibir.map(key => {
                    let valor;
                    
                    if (key === 'status') {
                        // Converte o booleano 'ativo' para string 'Ativo'/'Inativo'
                        valor = usuario.ativo ? 'Ativo' : 'Inativo';
                    } else {
                        valor = usuario[key];
                    }

                    // Obtém o rótulo personalizado ou cria um a partir da chave
                    let label = CUSTOM_LABELS[key] || key.replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, l => l.toUpperCase());
                    
                    // Tratamento para valores vazios/nulos
                    const valorExibicao = (valor !== null && valor !== undefined && valor !== '') ? valor : 'N/A';

                    return (
                        <div className="col-md-6 mb-3" key={key}>
                            <label className="form-label text-muted">{label}</label>
                            <p className="form-control-static text-break">
                                <strong>{valorExibicao}</strong>
                            </p>
                        </div>
                    );
                })}
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

export default ConfigurarNovoUsuario;
