import React, { useState, useEffect } from 'react';
import Cabecalho from "../../../componentes/Cabecalho";
import { Rodape } from "../../../componentes/Rodape";
import Pagination from "../../../componentes/Pagination";
import Modal from "../../../componentes/Modal";
import { FaCheck, FaTimes } from "react-icons/fa";
import { buscarComites, criarComite, atualizarComite, excluirComite } from "../../../service/comiteService";

const URL_API_PAGINADO = 'http://localhost:8098/comite/paginado';
const URL_API_BASE = 'http://localhost:8098/comite';

function Comites() {
    const [comites, definirComites] = useState([]);
    const [paginaAtual, definirPaginaAtual] = useState(0);
    const [tamanhoPagina, definirTamanhoPagina] = useState(10);
    const [totalPaginas, definirTotalPaginas] = useState(0);
    const [totalElementos, definirTotalElementos] = useState(0);
    const [carregando, definirCarregando] = useState(true);
    const [exibirModalNovo, definirExibirModalNovo] = useState(false);
    const [exibirModalEditar, definirExibirModalEditar] = useState(false);
    const [exibirModalExcluir, definirExibirModalExcluir] = useState(false);
    const [comiteSelecionado, definirComiteSelecionado] = useState(null);

    const recarregarComites = () => {
        buscarComites(definirCarregando, definirComites, definirTotalPaginas, definirTotalElementos, paginaAtual, tamanhoPagina, URL_API_PAGINADO);
    };

    useEffect(() => {
        recarregarComites();
    }, [paginaAtual, tamanhoPagina]);

    const abrirModalNovo = () => {
        definirComiteSelecionado({ nome: '', sigla: '', descricao: '', comiteRisco: false });
        definirExibirModalNovo(true);
    };

    const abrirModalEditar = (comite) => {
        definirComiteSelecionado(comite);
        definirExibirModalEditar(true);
    };

    const abrirModalExcluir = (comite) => {
        definirComiteSelecionado(comite);
        definirExibirModalExcluir(true);
    };

    const fecharModais = () => {
        definirExibirModalNovo(false);
        definirExibirModalEditar(false);
        definirExibirModalExcluir(false);
        definirComiteSelecionado(null);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        definirComiteSelecionado(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCriar = async () => {
        try {
            await criarComite(comiteSelecionado, URL_API_BASE);
            fecharModais();
            recarregarComites();
        } catch (error) {
            console.error("Erro ao criar comitê:", error);
            alert(`Falha ao criar o comitê: ${error.message}`);
        }
    };

    // --- FUNÇÃO CORRIGIDA ---
    const handleEditar = async () => {
        try {
            // 1. Cria uma cópia limpa do objeto que será enviado
            const payload = { ...comiteSelecionado };

            // 2. Remove os campos de data formatados que causam o erro
            delete payload.dtCriacao;
            delete payload.dtUltAtualizacao;
            
            // 3. Envia apenas os dados que podem ser atualizados
            await atualizarComite(payload, URL_API_BASE);
            
            fecharModais();
            recarregarComites();
        } catch (error) {
            console.error("Erro ao editar comitê:", error);
            alert(`Falha ao editar o comitê: ${error.message}`);
        }
    };
    // --- FIM DA CORREÇÃO ---

    const handleExcluir = async () => {
        try {
            await excluirComite(comiteSelecionado.id, URL_API_BASE);
            fecharModais();
            if (comites.length === 1 && paginaAtual > 0) {
                definirPaginaAtual(paginaAtual - 1);
            } else {
                recarregarComites();
            }
        } catch (error) {
            console.error("Erro ao excluir comitê:", error);
            alert(`Falha ao excluir o comitê: ${error.message}`);
        }
    };

    const renderizarComites = () => {
        if (carregando) return <tr><td colSpan="6" className="text-center py-3">Carregando...</td></tr>;
        if (comites.length === 0) return <tr><td colSpan="6" className="text-center py-3">Nenhum comitê encontrado.</td></tr>;

        return comites.map(comite => (
            <tr key={comite.id} className="border-bottom">
                <td className="py-2 px-3">{comite.nome}</td>
                <td className="py-2 px-3">{comite.sigla}</td>
                <td className="py-2 px-3">{comite.dtCriacao}</td>
                <td className="py-2 px-3">{comite.dtUltAtualizacao}</td>
                <td className="py-2 px-3 text-center">
                    {comite.comiteRisco ? <FaCheck className="text-success" /> : <FaTimes className="text-danger" />}
                </td>
                <td className="py-2 px-3 text-center">
                    <div className="dropdown">
                        <button type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ fontSize: "1.5em", background: "none", border: "none" }}>
                            ⋮
                        </button>
                        <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#" onClick={() => abrirModalEditar(comite)}>Editar</a></li>
                            <li><button className="dropdown-item text-danger" onClick={() => abrirModalExcluir(comite)}>Excluir</button></li>
                        </ul>
                    </div>
                </td>
            </tr>
        ));
    };

    const renderizarFormulario = () => (
        <div className="card-body">
            <div className="mb-3">
                <label className="form-label">Nome*</label>
                <input type="text" className="form-control" name="nome" value={comiteSelecionado?.nome || ''} onChange={handleFormChange} required />
            </div>
            <div className="mb-3">
                <label className="form-label">Sigla</label>
                <input type="text" className="form-control" name="sigla" value={comiteSelecionado?.sigla || ''} onChange={handleFormChange} />
            </div>
            <div className="mb-3">
                <label className="form-label">Descrição</label>
                <textarea className="form-control" name="descricao" value={comiteSelecionado?.descricao || ''} onChange={handleFormChange}></textarea>
            </div>
            <div className="form-check">
                <input className="form-check-input" type="checkbox" name="comiteRisco" checked={comiteSelecionado?.comiteRisco || false} onChange={handleFormChange} id="comiteRiscoCheck" />
                <label className="form-check-label" htmlFor="comiteRiscoCheck">
                    É um Comitê de Risco?
                </label>
            </div>
        </div>
    );

    return (
        <>
            <Cabecalho />
            <div className="container mt-5 mb-3">
                <div className="row mb-3">
                    <div className="col">
                        <h3 className="mb-0">Comitês Cadastrados</h3>
                    </div>
                    <div className="col-auto">
                        <button onClick={abrirModalNovo} className="btn btn-primary">Novo Comitê</button>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body">
                        <table className="table table-striped">
                            <thead>
                                <tr className="table-light">
                                    <th className="p-3">Nome</th>
                                    <th className="p-3">Sigla</th>
                                    <th className="p-3">Data de Criação</th>
                                    <th className="p-3">Última Atualização</th>
                                    <th className="p-3 text-center">Risco</th>
                                    <th className="p-3 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>{renderizarComites()}</tbody>
                        </table>
                        <Pagination
                            estilos="d-flex justify-content-between align-items-center mt-4"
                            pagina={paginaAtual}
                            definirPagina={definirPaginaAtual}
                            tamanho={tamanhoPagina}
                            definirTamanho={definirTamanhoPagina}
                            totalPaginas={totalPaginas}
                            totalElementos={totalElementos}
                            opcoesPagina={[5, 10, 20]}
                        />
                    </div>
                </div>
            </div>
            <Rodape />
            <Modal
                estaAberto={exibirModalNovo}
                aoFechar={fecharModais}
                titulo="Criar Novo Comitê"
                botoesAcao={[{ label: 'Salvar', className: 'btn btn-primary', onClick: handleCriar }]}
            >
                {renderizarFormulario()}
            </Modal>
            <Modal
                estaAberto={exibirModalEditar}
                aoFechar={fecharModais}
                titulo="Editar Comitê"
                botoesAcao={[{ label: 'Salvar Alterações', className: 'btn btn-primary', onClick: handleEditar }]}
            >
                {renderizarFormulario()}
            </Modal>
            <Modal
                estaAberto={exibirModalExcluir}
                aoFechar={fecharModais}
                titulo="Confirmar Exclusão"
                botoesAcao={[{ label: 'Excluir', className: 'btn btn-danger', onClick: handleExcluir }]}
            >
                <p>Você tem certeza que deseja excluir o comitê: <strong>{comiteSelecionado?.nome}</strong>?</p>
                <p>Esta ação não pode ser desfeita.</p>
            </Modal>
        </>
    );
}

export default Comites;