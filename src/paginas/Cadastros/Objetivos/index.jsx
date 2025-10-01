import React, { useState, useEffect } from 'react';
import Cabecalho from "../../../componentes/Cabecalho";
import { Rodape } from "../../../componentes/Rodape";
import Pagination from "../../../componentes/Pagination";
import Modal from "../../../componentes/Modal";
import { buscarObjetivosPaginados, criarObjetivo, editarObjetivo, excluirObjetivo } from "../../../service/objetivoService";

import { FiEdit } from 'react-icons/fi';
import { AiOutlineDelete } from 'react-icons/ai';

function Objetivos() {

    const [objetivos, definirObjetivos] = useState([]);
    const [paginaAtual, definirPaginaAtual] = useState(0);
    const [tamanhoPagina, definirTamanhoPagina] = useState(10);
    const [totalPaginas, definirTotalPaginas] = useState(0);
    const [totalElementos, definirTotalElementos] = useState(0);
    const [carregando, definirCarregando] = useState(true);


    const [exibirModalNovo, definirExibirModalNovo] = useState(false);
    const [exibirModalEditar, definirExibirModalEditar] = useState(false);
    const [exibirModalExcluir, definirExibirModalExcluir] = useState(false);


    const [objetivoSelecionado, definirObjetivoSelecionado] = useState(null);


    const recarregarObjetivos = () => {
        buscarObjetivosPaginados(
            definirCarregando,
            definirObjetivos,
            definirTotalPaginas,
            definirTotalElementos,
            paginaAtual,
            tamanhoPagina
        );
    };

    useEffect(() => {
        recarregarObjetivos();
    }, [paginaAtual, tamanhoPagina]);


    const abrirModalNovo = () => {
        definirObjetivoSelecionado({ nome: '', descricao: '' });
        definirExibirModalNovo(true);
    };

    const abrirModalEditar = (objetivo) => {
        definirObjetivoSelecionado(objetivo);
        definirExibirModalEditar(true);
    };

    const abrirModalExcluir = (objetivo) => {
        definirObjetivoSelecionado(objetivo);
        definirExibirModalExcluir(true);
    };

    const fecharModais = () => {
        definirExibirModalNovo(false);
        definirExibirModalEditar(false);
        definirExibirModalExcluir(false);
        definirObjetivoSelecionado(null);
    };


    const handleCriar = async () => {
        try {
            await criarObjetivo(objetivoSelecionado);
            fecharModais();
            recarregarObjetivos();
            // alert('Objetivo criado com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao criar objetivo.');
        }
    };

    const handleEditar = async () => {
        try {
            await editarObjetivo(objetivoSelecionado);
            fecharModais();
            recarregarObjetivos();
            // alert('Objetivo atualizado com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar objetivo.');
        }
    };

    const handleExcluir = async () => {
        try {
            await excluirObjetivo(objetivoSelecionado.id);
            fecharModais();
            recarregarObjetivos();
            // alert('Objetivo removido com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao remover objetivo.');
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        definirObjetivoSelecionado(prevState => ({
            ...prevState,
            [name]: value
        }));
    };


    const renderizarObjetivos = () => {
        if (carregando) return <tr><td colSpan="4" className="text-center py-3">Carregando...</td></tr>;
        if (objetivos.length === 0) return <tr><td colSpan="4" className="text-center py-3">Nenhum objetivo encontrado.</td></tr>;

        return objetivos.map(objetivo => (
            <tr key={objetivo.id} className="border-bottom">
                <td className="py-2 px-3">{objetivo.nome}</td>
                <td className="py-2 px-3">{objetivo.dataCriacao}</td>
                <td className="px-3 text-center">
                    <div className="dropdown">
                        <button type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ fontSize: "1.5em", background: "none", border: "none" }}>
                            ⋮
                        </button>
                        <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#" onClick={() => abrirModalEditar(objetivo)}>Editar</a></li>
                            <li><button className="dropdown-item text-danger" onClick={() => abrirModalExcluir(objetivo)}>Excluir</button></li>
                        </ul>
                    </div>
                </td>
            </tr>
        ));
    };

    const renderizarFormulario = () => (
        <div className="card-body">
            <div className="mb-3">
                <label className="form-label">Nome:</label>
                <input type="text" className="form-control" name="nome" value={objetivoSelecionado?.nome || ''} onChange={handleFormChange} required />
            </div>
            <div className="mb-3">
                <label className="form-label">Descrição:</label>
                <textarea className="form-control" name="descricao" value={objetivoSelecionado?.descricao || ''} onChange={handleFormChange}></textarea>
            </div>
        </div>
    );

    return (
        <>
            <Cabecalho />
            <div className="container mt-5 mb-3">
                <div className="row mb-3">
                    <div className="col">
                        <h3 className="mb-0">Objetivos Estratégicos</h3>
                    </div>
                    <div className="col-auto">
                        <button onClick={abrirModalNovo} className="btn btn-primary">Novo Objetivo</button>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body">
                        <table className="table table-striped">
                            <thead>
                                <tr className="table-light">
                                    <th className="p-3">Nome</th>
                                    <th className="p-3" style={{ width: "15%" }}>Data de Criação</th>
                                    <th className="p-3 text-center" style={{ width: "10%" }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>{renderizarObjetivos()}</tbody>
                        </table>
                        <Pagination
                            estilos="d-flex justify-content-between align-items-center mt-4"
                            pagina={paginaAtual}
                            definirPagina={definirPaginaAtual}
                            tamanho={tamanhoPagina}
                            definirTamanho={definirTamanhoPagina}
                            totalPaginas={totalPaginas}
                            totalElementos={totalElementos}
                            opcoesPagina={[10, 20, 40]}
                        />
                    </div>
                </div>
            </div>
            <Rodape />


            <Modal
                estaAberto={exibirModalNovo}
                aoFechar={fecharModais}
                titulo="Criar Novo Objetivo"
                botoesAcao={[{ label: 'Salvar', className: 'btn btn-primary', onClick: handleCriar }]}
            >
                {renderizarFormulario()}
            </Modal>

            <Modal
                estaAberto={exibirModalEditar}
                aoFechar={fecharModais}
                titulo="Editar Objetivo"
                botoesAcao={[{ label: 'Salvar Alterações', className: 'btn btn-primary', onClick: handleEditar }]}
            >
                {renderizarFormulario()}
            </Modal>

            <Modal
                estaAberto={exibirModalExcluir}
                aoFechar={fecharModais}
                titulo="Confirmar Remoção"
                botoesAcao={[{ label: 'Remover', className: 'btn btn-danger', onClick: handleExcluir }]}
            >
                <p>Você tem certeza que deseja remover o objetivo: <strong>{objetivoSelecionado?.nome}</strong>?</p>
                <p>Esta ação não pode ser desfeita.</p>
            </Modal>
        </>
    );
}

export default Objetivos;