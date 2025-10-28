import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import { buscarDiretoriasPorAno } from '../../services/elementoOrganizacionalService';

const FormularioCalendario = ({ registro, onFormChange, anos, ciclos }) => {
    const [diretorias, setDiretorias] = useState([]);

    useEffect(() => {
        if (registro?.ano) {
            buscarDiretoriasPorAno(registro.ano)
                .then(setDiretorias)
                .catch(console.error);
        }
    }, [registro?.ano]);

    return (
        <div className="row g-3">
            <div className="col-md-6">
                <label htmlFor="ciclo" className="form-label">Ciclo</label>
                <select id="ciclo" className="form-select" value={registro?.ciclo?.id || ''} onChange={(e) => onFormChange('ciclo', { id: e.target.value, nome: e.target.options[e.target.selectedIndex].text })}>
                    <option value="">Selecione um ciclo...</option>
                    {ciclos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
            </div>
            <div className="col-md-6">
                <label htmlFor="ano" className="form-label">Ano</label>
                <select id="ano" className="form-select" value={registro?.ano || ''} onChange={(e) => onFormChange('ano', e.target.value)}>
                    <option value="">Selecione um ano...</option>
                    {anos.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>
            <div className="col-12">
                <label htmlFor="diretoria" className="form-label">Diretoria</label>
                <select id="diretoria" className="form-select" value={registro?.elementoOrganizacional?.id || ''} onChange={(e) => onFormChange('elementoOrganizacional', { id: e.target.value, sigla: e.target.options[e.target.selectedIndex].text })} disabled={!registro?.ano}>
                    <option value="">Selecione uma diretoria...</option>
                    {diretorias.map(d => <option key={d.id} value={d.id}>{d.sigla} - {d.nome}</option>)}
                </select>
            </div>

            <div className="col-md-3">
                <label htmlFor="dataPrevista" className="form-label">Data Prevista</label>
                <DatePicker 
                    id="dataPrevista" 
                    selected={registro?.diaReuniao ? new Date(registro.diaReuniao) : null} 
                    onChange={(date) => onFormChange('diaReuniao', date)} 
                    className="form-control" 
                    dateFormat="dd/MM/yyyy" 
                    locale="pt-BR" 
                />
            </div>
            <div className="col-md-3">
                <label htmlFor="horaPrevista" className="form-label">Hora Prevista</label>
                <input id="horaPrevista" type="time" className="form-control" value={registro?.horaPrevista || ''} onChange={(e) => onFormChange('horaPrevista', e.target.value)} />
            </div>
            <div className="col-md-3">
                <label htmlFor="dataRealizada" className="form-label">Data Realizada</label>
                <DatePicker 
                    id="dataRealizada" 
                    selected={registro?.diaReuniaoRealizado ? new Date(registro.diaReuniaoRealizado) : null} 
                    onChange={(date) => onFormChange('diaReuniaoRealizado', date)} 
                    className="form-control" 
                    dateFormat="dd/MM/yyyy" 
                    locale="pt-BR" 
                />
            </div>
            <div className="col-md-3">
                <label htmlFor="horaRealizada" className="form-label">Hora Realizada</label>
                <input id="horaRealizada" type="time" className="form-control" value={registro?.horaRealizada || ''} onChange={(e) => onFormChange('horaRealizada', e.target.value)} />
            </div>
        </div>
    );
};

export default FormularioCalendario;