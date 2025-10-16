import React, { useState, useEffect } from 'react';
import Cabecalho from "../../../componentes/Cabecalho";
import { Rodape } from "../../../componentes/Rodape";
import Pagination from "../../../componentes/Pagination";
import Modal from "../../../componentes/Modal";
import FormularioCalendario from '../../../componentes/FormularioCalendario'; // Importa o novo formulário
import { FaPlus } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { AiOutlineDelete } from 'react-icons/ai';
import { buscarCalendarioPaginado, salvarCalendario, excluirCalendario } from "../../../service/aderenciaService";
import { buscarCiclos } from "../../../service/indicadorService";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ptBR from 'date-fns/locale/pt-BR';
import './style.css'

registerLocale('pt-BR', ptBR);


const combinarDataEHora = (data, horaString) => {
    if (!data || !horaString) return data;
    const [horas, minutos] = horaString.split(':');
    const novaData = new Date(data);
    novaData.setHours(horas);
    novaData.setMinutes(minutos);
    novaData.setSeconds(0);
    return novaData;
};


function CalendarioReunioes() {

    const [calendario, setCalendario] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [tamanhoPagina, setTamanhoPagina] = useState(10);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [totalElementos, setTotalElementos] = useState(0);
    const [carregando, setCarregando] = useState(false);


    const [anos, setAnos] = useState([]);
    const [ciclos, setCiclos] = useState([]);

    
    const [modalAberto, setModalAberto] = useState(null);
    const [registroSelecionado, setRegistroSelecionado] = useState(null);
    const [idParaExcluir, setIdParaExcluir] = useState(null);

    
    useEffect(() => {
        carregarCalendario();
    }, [paginaAtual, tamanhoPagina]);

    
    useEffect(() => {
        const anoAtual = new Date().getFullYear();
        const listaAnos = Array.from({ length: (anoAtual + 1) - 2022 + 1 }, (_, i) => anoAtual + 1 - i);
        setAnos(listaAnos);
        buscarCiclos().then(setCiclos).catch(console.error);
    }, []);

    const carregarCalendario = async () => {
        setCarregando(true);
        try {
            const dados = await buscarCalendarioPaginado(paginaAtual, tamanhoPagina);
            setCalendario(dados.content);
            setTotalPaginas(dados.totalPages);
            setTotalElementos(dados.totalElements);
        } catch (error) {
            console.error(error);
            alert("Falha ao carregar calendário.");
        } finally {
            setCarregando(false);
        }
    };
    
    
    const abrirModalNovo = () => {
        setRegistroSelecionado({
            ciclo: { id: '' },
            ano: new Date().getFullYear(),
            elementoOrganizacional: { id: '' },
            diaReuniao: null, horaPrevista: '',
            diaReuniaoRealizado: null, horaRealizada: '',
        });
        setModalAberto('novo');
    };
    
    const abrirModalEditar = (item) => {
        const formatarHora = (dataISO) => dataISO ? new Date(dataISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
        setRegistroSelecionado({
            ...item,
            horaPrevista: formatarHora(item.diaReuniao),
            horaRealizada: formatarHora(item.diaReuniaoRealizado)
        });
        setModalAberto('editar');
    };

    const abrirModalExcluir = (id) => {
        setIdParaExcluir(id);
    };

    const fecharModais = () => {
        setModalAberto(null);
        setRegistroSelecionado(null);
        setIdParaExcluir(null);
    };

    const handleFormChange = (campo, valor) => {
        setRegistroSelecionado(prev => ({ ...prev, [campo]: valor }));
    };

    const handleSalvar = async () => {
        const payload = { ...registroSelecionado };
        payload.diaReuniao = combinarDataEHora(payload.diaReuniao, payload.horaPrevista);
        payload.diaReuniaoRealizado = combinarDataEHora(payload.diaReuniaoRealizado, payload.horaRealizada);
        delete payload.horaPrevista;
        delete payload.horaRealizada;

        if (modalAberto === 'novo') {
            delete payload.id;
        }

        try {
            await salvarCalendario(payload);
            alert('Salvo com sucesso!');
            fecharModais();
            carregarCalendario();
        } catch (error) {
            console.error(error);
            alert(`Erro ao salvar: ${error.message}`);
        }
    };

    const handleExcluir = async () => {
        if (!idParaExcluir) return;
        try {
            await excluirCalendario(idParaExcluir);
            alert('Excluído com sucesso!');
            fecharModais();
            carregarCalendario();
        } catch (error) {
            console.error(error);
            alert(`Erro ao excluir: ${error.message}`);
        }
    };
    
    const formatarData = (data) => data ? new Date(data).toLocaleDateString('pt-BR') : <span className="campo-vazio">—</span>;
    const formatarHora = (data) => data ? new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : <span className="campo-vazio">—</span>;

    return (
        <>
            <Cabecalho />
            <div className="container mt-5 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>Calendário de Reuniões de Aderência</h3>
                    <button className="btn btn-primary d-flex align-items-center" onClick={abrirModalNovo}>
                        <FaPlus className="me-2" /> Adicionar Calendário
                    </button>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr className="table-light">
                                        <th className="p-3 text-center">Ciclo</th>
                                        <th className="p-3 text-center">Ano</th>
                                        <th className="p-3 text-center">Diretoria</th>
                                        <th className="p-3 text-center">Data Prevista</th>
                                        <th className="p-3 text-center">Hora Prevista</th>
                                        <th className="p-3 text-center">Data Realizada</th>
                                        <th className="p-3 text-center">Hora Realizada</th>
                                        <th className="p-3 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {carregando ? (
                                        <tr><td colSpan="8" className="text-center py-5">Carregando...</td></tr>
                                    ) : calendario.length > 0 ? (
                                        calendario.map(item => (
                                            <tr key={item.id}>
                                                <td className="align-middle text-center">{item.ciclo.nome}</td>
                                                <td className="align-middle text-center">{item.ano}</td>
                                                <td className="align-middle text-center">{item.elementoOrganizacional.sigla}</td>
                                                <td className="align-middle text-center">{formatarData(item.diaReuniao)}</td>
                                                <td className="align-middle text-center">{formatarHora(item.diaReuniao)}</td>
                                                <td className="align-middle text-center">{formatarData(item.diaReuniaoRealizado)}</td>
                                                <td className="align-middle text-center">{formatarHora(item.diaReuniaoRealizado)}</td>
                                                <td className="text-center align-middle">
                                                    <div className="dropdown">
                                                        <button type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ fontSize: "1.5em", background: "none", border: "none" }}>⋮</button>
                                                        <ul className="dropdown-menu">
                                                            <li><a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); abrirModalEditar(item);}}><FiEdit className="me-1" /> Editar</a></li>
                                                            <li><button className="dropdown-item text-danger" onClick={() => abrirModalExcluir(item.id)}><AiOutlineDelete className="me-1" /> Excluir</button></li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="8" className="text-center py-3">Nenhum registro encontrado.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalElementos > 0 && !carregando && (
                            <Pagination
                                estilos="d-flex justify-content-between align-items-center mt-4"
                                pagina={paginaAtual}
                                definirPagina={setPaginaAtual}
                                tamanho={tamanhoPagina}
                                definirTamanho={setTamanhoPagina}
                                totalPaginas={totalPaginas}
                                totalElementos={totalElementos}
                                opcoesPagina={[10, 20, 30]}
                            />
                        )}
                    </div>
                </div>
            </div>
            <Rodape />

            <Modal
                estaAberto={modalAberto === 'novo' || modalAberto === 'editar'}
                aoFechar={fecharModais}
                titulo={modalAberto === 'novo' ? "Adicionar Novo Calendário" : "Editar Calendário"}
                botoesAcao={[{ label: 'Salvar', className: 'btn btn-primary', onClick: handleSalvar }]}
            >
                <FormularioCalendario
                    registro={registroSelecionado}
                    onFormChange={handleFormChange}
                    anos={anos}
                    ciclos={ciclos}
                />
            </Modal>
            
            <Modal
                estaAberto={!!idParaExcluir}
                aoFechar={fecharModais}
                titulo="Confirmar Exclusão"
                botoesAcao={[{ label: 'Excluir', className: 'btn btn-danger', onClick: handleExcluir }]}
            >
                <p>Você tem certeza que deseja excluir este registro do calendário?</p>
            </Modal>
        </>
    );
}

export default CalendarioReunioes;
// import React, { useState, useEffect } from 'react';
// import Cabecalho from "../../../componentes/Cabecalho";
// import { Rodape } from "../../../componentes/Rodape";
// import Pagination from "../../../componentes/Pagination";
// import Modal from "../../../componentes/Modal";
// import FormularioCalendario from '../../../componentes/FormularioCalendario';
// import { FaPlus, FaSave, FaTimes } from 'react-icons/fa';
// import { FiEdit, FiSave } from 'react-icons/fi';
// import { AiOutlineDelete } from 'react-icons/ai';
// import { buscarCalendarioPaginado, salvarCalendario, excluirCalendario } from "../../../service/aderenciaService";
// import { buscarDiretoriasPorAno } from "../../../service/elementoOrganizacionalService";
// import { buscarCiclos } from "../../../service/indicadorService";


// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { registerLocale } from "react-datepicker";
// import ptBR from 'date-fns/locale/pt-BR';

// registerLocale('pt-BR', ptBR);

// const combinarDataEHora = (data, horaString) => {
//     if (!data || !horaString) return data;
//     const [horas, minutos] = horaString.split(':');
//     const novaData = new Date(data);
//     novaData.setHours(horas);
//     novaData.setMinutes(minutos);
//     novaData.setSeconds(0);
//     return novaData;
// };


// function CalendarioReunioes() {
//     const [calendario, setCalendario] = useState([]);
//     const [paginaAtual, setPaginaAtual] = useState(0);
//     const [tamanhoPagina, setTamanhoPagina] = useState(10);
//     const [totalPaginas, setTotalPaginas] = useState(0);
//     const [totalElementos, setTotalElementos] = useState(0);
//     const [carregando, setCarregando] = useState(false);


//     const [anos, setAnos] = useState([]);
//     const [diretorias, setDiretorias] = useState([]);
//     const [ciclos, setCiclos] = useState([]);


//     const [modalAberto, setModalAberto] = useState(null); // pode ser 'novo', 'editar' ou null
//     const [registroSelecionado, setRegistroSelecionado] = useState(null);
//     const [idParaExcluir, setIdParaExcluir] = useState(null);

//     const [modalExcluirAberto, setModalExcluirAberto] = useState(false);


//     useEffect(() => {
//         carregarCalendario();
//     }, [paginaAtual, tamanhoPagina]);


//     useEffect(() => {
//         const anoAtual = new Date().getFullYear();
//         const listaAnos = Array.from({ length: (anoAtual + 1) - 2022 + 1 }, (_, i) => anoAtual + 1 - i);
//         setAnos(listaAnos);
//         buscarCiclos().then(setCiclos).catch(console.error);
//     }, []);


//     useEffect(() => {
//         if (linhaEmEdicao?.ano) {
//             buscarDiretoriasPorAno(linhaEmEdicao.ano).then(setDiretorias).catch(console.error);
//         }
//     }, [linhaEmEdicao?.ano]);

//     const abrirModalNovo = () => {
//         setRegistroSelecionado({
//             ciclo: { id: '' },
//             ano: new Date().getFullYear(),
//             elementoOrganizacional: { id: '' },
//             diaReuniao: null, horaPrevista: '',
//             diaReuniaoRealizado: null, horaRealizada: '',
//         });
//         setModalAberto('novo');
//     };
    
//     const abrirModalEditar = (item) => {
//         const formatarHora = (dataISO) => dataISO ? new Date(dataISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
//         setRegistroSelecionado({
//             ...item,
//             horaPrevista: formatarHora(item.diaReuniao),
//             horaRealizada: formatarHora(item.diaReuniaoRealizado)
//         });
//         setModalAberto('editar');
//     };

//     const abrirModalExcluir = (id) => {
//         setIdParaExcluir(id);
//     };

//     const fecharModais = () => {
//         setModalAberto(null);
//         setRegistroSelecionado(null);
//         setIdParaExcluir(null);
//     };

//     const handleFormChange = (campo, valor) => {
//         setRegistroSelecionado(prev => ({ ...prev, [campo]: valor }));
//     };

//     const carregarCalendario = async () => {
//         setCarregando(true);
//         try {
//             const dados = await buscarCalendarioPaginado(paginaAtual, tamanhoPagina);
//             setCalendario(dados.content);
//             setTotalPaginas(dados.totalPages);
//             setTotalElementos(dados.totalElements);
//         } catch (error) {
//             console.error(error);
//             alert("Falha ao carregar calendário.");
//         } finally {
//             setCarregando(false);
//         }
//     };

//     const handleAdicionar = () => {
        
//         const novaLinha = {
//             id: 'novo', // ID temporário
//             ciclo: { id: '', nome: '' },
//             ano: new Date().getFullYear(),
//             elementoOrganizacional: { id: '', sigla: '' },
//             diaReuniao: null,
//             horaPrevista: '', // Guardaremos como string "HH:MM"
//             diaReuniaoRealizado: null,
//             horaRealizada: '',
//         };
//         setLinhaEmEdicao(novaLinha);
//         setIdLinhaEmEdicao('novo');
//         setCalendario([novaLinha, ...calendario]); // Adiciona no topo da lista visualmente
//     };

//     const handleEditar = (item) => {
//         // Separa data e hora ao entrar no modo de edição
//         const formatarHora = (dataISO) => dataISO ? new Date(dataISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

//         setLinhaEmEdicao({
//             ...item,
//             horaPrevista: formatarHora(item.diaReuniao),
//             horaRealizada: formatarHora(item.diaReuniaoRealizado)
//         });
//         setIdLinhaEmEdicao(item.id);
//     };

//     const handleSalvar = async () => {
//         const payload = { ...registroSelecionado };
//         payload.diaReuniao = combinarDataEHora(payload.diaReuniao, payload.horaPrevista);
//         payload.diaReuniaoRealizado = combinarDataEHora(payload.diaReuniaoRealizado, payload.horaRealizada);
//         delete payload.horaPrevista;
//         delete payload.horaRealizada;

//         try {
//             await salvarCalendario(payload);
//             alert('Salvo com sucesso!');
//             fecharModais();
//             carregarCalendario();
//         } catch (error) {
//             console.error(error);
//             alert(`Erro ao salvar: ${error.message}`);
//         }
//     };


//     const handleExcluir = async () => {
//         if (!idParaExcluir) return;
//         try {
//             await excluirCalendario(idParaExcluir);
//             alert('Excluído com sucesso!');
//             setModalExcluirAberto(false);
//             setIdParaExcluir(null);
//             carregarCalendario();
//         } catch (error) {
//             console.error(error);
//             alert(`Erro ao excluir: ${error.message}`);
//         }
//     };

//     const handleCancelarEdicao = () => {
//         if (idLinhaEmEdicao === 'novo') {
//             setCalendario(calendario.filter(item => item.id !== 'novo'));
//         }
//         setIdLinhaEmEdicao(null);
//         setLinhaEmEdicao(null);
//     };

//     const onEditChange = (campo, valor) => {
//         setLinhaEmEdicao(prev => ({ ...prev, [campo]: valor }));
//     };

//     const formatarData = (data) => data ? new Date(data).toLocaleDateString('pt-BR') : 'N/A';

//     return (
//         <>
//             <Cabecalho />
//             <div className="container mt-5 mb-3">
//                 <div className="d-flex justify-content-between align-items-center mb-4">
//                     <h3>Calendário de Reuniões de Aderência</h3>
//                     <button className="btn btn-primary d-flex align-items-center" onClick={handleAdicionar} disabled={!!idLinhaEmEdicao}>
//                         <FaPlus className="me-2" /> Adicionar Calendário
//                     </button>
//                 </div>

//                 <div className="card">
//                     <div className="card-body">
//                         <div className="table-responsive">
//                             <table className="table table-striped table-hover">
//                                 <thead>
//                                     <tr className="table-light">
//                                         <th>Ciclo</th>
//                                         <th>Ano</th>
//                                         <th>Diretoria</th>
//                                         <th>Data Prevista</th>
//                                         <th>Hora Prevista</th>
//                                         <th>Data Realizada</th>
//                                         <th>Hora Realizada</th>
//                                         <th className="text-center">Ações</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {carregando ? (
//                                         <tr><td colSpan="8" className="text-center py-5">Carregando...</td></tr>
//                                     ) : (
//                                         calendario.map(item => (
//                                             <tr key={item.id}>
//                                                 {idLinhaEmEdicao === item.id ? (
//                                                     <>
//                                                         <td><select className="form-select" value={linhaEmEdicao.ciclo.id} onChange={(e) => onEditChange('ciclo', { id: e.target.value, nome: e.target.options[e.target.selectedIndex].text })}>
//                                                             <option value="">Selecione</option>
//                                                             {ciclos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
//                                                         </select></td>
//                                                         <td><select className="form-select" value={linhaEmEdicao.ano} onChange={(e) => onEditChange('ano', e.target.value)}>
//                                                             <option value="">Selecione</option>
//                                                             {anos.map(a => <option key={a} value={a}>{a}</option>)}
//                                                         </select></td>
//                                                         <td><select className="form-select" value={linhaEmEdicao.elementoOrganizacional.id} onChange={(e) => onEditChange('elementoOrganizacional', { id: e.target.value, sigla: e.target.options[e.target.selectedIndex].text })}>
//                                                             <option value="">Selecione</option>
//                                                             {diretorias.map(d => <option key={d.id} value={d.id}>{d.sigla}</option>)}
//                                                         </select></td>
//                                                         <td><DatePicker selected={linhaEmEdicao.diaReuniao ? new Date(linhaEmEdicao.diaReuniao) : null} onChange={(date) => onEditChange('diaReuniao', date)} className="form-control" dateFormat="dd/MM/yyyy" locale="pt-BR" /></td>
//                                                         <td><input type="time" className="form-control" value={linhaEmEdicao.horaPrevista} onChange={(e) => onEditChange('horaPrevista', e.target.value)} /></td>
//                                                         <td><DatePicker selected={linhaEmEdicao.diaReuniaoRealizado ? new Date(linhaEmEdicao.diaReuniaoRealizado) : null} onChange={(date) => onEditChange('diaReuniaoRealizado', date)} className="form-control" dateFormat="dd/MM/yyyy" locale="pt-BR" /></td>
//                                                         <td><input type="time" className="form-control" value={linhaEmEdicao.horaRealizada} onChange={(e) => onEditChange('horaRealizada', e.target.value)} /></td>
//                                                         <td className="text-center">
//                                                             <div className="dropdown">
//                                                                 <button type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ fontSize: "1.5em", background: "none", border: "none" }}>
//                                                                     ⋮
//                                                                 </button>
//                                                                 <ul className="dropdown-menu">
//                                                                     <li><a className="dropdown-item" href="#" onClick={handleSalvar}><FiSave className="me-1" /> Salvar</a></li>
//                                                                     <li><button className="dropdown-item text-danger" onClick={handleCancelarEdicao}><FaTimes className="me-1" /> Cancelar</button></li>
//                                                                 </ul>
//                                                             </div>
//                                                         </td>
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         <td>{item.ciclo.nome}</td>
//                                                         <td>{item.ano}</td>
//                                                         <td>{item.elementoOrganizacional.sigla}</td>
//                                                         <td>{formatarData(item.diaReuniao)}</td>
//                                                         <td>{item.diaReuniao ? new Date(item.diaReuniao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
//                                                         <td>{formatarData(item.diaReuniaoRealizado)}</td>
//                                                         <td>{item.diaReuniaoRealizado ? new Date(item.diaReuniaoRealizado).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
//                                                         <td className="text-center">
//                                                             <div className="dropdown">
//                                                                 <button type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ fontSize: "1.5em", background: "none", border: "none" }}>
//                                                                     ⋮
//                                                                 </button>
//                                                                 <ul className="dropdown-menu">
//                                                                     <li><a className="dropdown-item" href="#" onClick={() => handleEditar(item)}><FiEdit className="me-1" /> Editar</a></li>
//                                                                     <li><button className="dropdown-item text-danger" onClick={() => { setIdParaExcluir(item.id); setModalExcluirAberto(true); }}><AiOutlineDelete className="me-1" /> Excluir</button></li>
//                                                                 </ul>
//                                                             </div>
//                                                         </td>
//                                                     </>
//                                                 )}
//                                             </tr>
//                                         ))
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                         {totalElementos > 0 && !carregando && (
//                             <Pagination
//                                 estilos="d-flex justify-content-between align-items-center mt-4"
//                                 pagina={paginaAtual}
//                                 definirPagina={setPaginaAtual}
//                                 tamanho={tamanhoPagina}
//                                 definirTamanho={setTamanhoPagina}
//                                 totalPaginas={totalPaginas}
//                                 totalElementos={totalElementos}
//                                 opcoesPagina={[10, 20, 30]}
//                             />
//                         )}
//                     </div>
//                 </div>
//             </div>
//             <Rodape />
//             <Modal
//                 estaAberto={modalExcluirAberto}
//                 aoFechar={() => setModalExcluirAberto(false)}
//                 titulo="Confirmar Exclusão"
//                 botoesAcao={[{ label: 'Excluir', className: 'btn btn-danger', onClick: handleExcluir }]}
//             >
//                 <p>Você tem certeza que deseja excluir este registro do calendário?</p>
//             </Modal>
//         </>
//     );
// }

// export default CalendarioReunioes;