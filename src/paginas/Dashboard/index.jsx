import React, { useState } from 'react';
import Cabecalho from "../../componentes/Cabecalho";
import { Rodape } from "../../componentes/Rodape";
import { DADOS_ACUMULADO, DADOS_MENSAL } from "../../mocks/api";
import CartaoIndicador from "./CartaoIndicador";
import MapaEstrategico from "./MapaEstrategico";
import './estilos.css';

export function Dashboard() {
  const [abaAtiva, setAbaAtiva] = useState('mensal');

  return (
    <>
      <Cabecalho />

      <section className="container" id="dashboard">
        <div className="pt-3 pb-5">
          <h1 className="text-primary mb-4">Plano de Metas (7º Ciclo)</h1>

          {/* Abas */}
          <ul className="nav nav-tabs nav-fill mb-4" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link fw-semibold ${
                  abaAtiva === 'mensal'
                    ? 'active bg-primary text-white border-primary'
                    : 'text-primary'
                }`}
                onClick={() => setAbaAtiva('mensal')}
                type="button"
                role="tab"
              >
                Mensal
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link fw-semibold ${
                  abaAtiva === 'acumulado'
                    ? 'active bg-primary text-white border-primary'
                    : 'text-primary'
                }`}
                onClick={() => setAbaAtiva('acumulado')}
                type="button"
                role="tab"
              >
                Acumulado
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link fw-semibold ${
                  abaAtiva === 'mapa'
                    ? 'active bg-primary text-white border-primary'
                    : 'text-primary'
                }`}
                onClick={() => setAbaAtiva('mapa')}
                type="button"
                role="tab"
              >
                Mapa Estratégico
              </button>
            </li>
          </ul>

          {/* Conteúdo das Abas */}
          <div className="tab-content">
            {/* Aba Mensal */}
            {abaAtiva === 'mensal' && (
              <div className="tab-pane fade show active">
                <h2 className="text-primary mb-3">Mensal (Julho/2025)</h2>
                <div className="kpi-grid">
                  {DADOS_MENSAL.map(kpi => (
                    <CartaoIndicador key={kpi.id} data={kpi} />
                  ))}
                </div>
              </div>
            )}

            {/* Aba Acumulado */}
            {abaAtiva === 'acumulado' && (
              <div className="tab-pane fade show active">
                <h2 className="text-primary mb-3">Acumulado (Janeiro-Julho/2025)</h2>
                <div className="kpi-grid">
                  {DADOS_ACUMULADO.map(kpi => (
                    <CartaoIndicador key={kpi.id} data={kpi} />
                  ))}
                </div>
              </div>
            )}

            {/* Aba Mapa Estratégico */}
            {abaAtiva === 'mapa' && (
              <div className="tab-pane fade show active">
                <MapaEstrategico />
              </div>
            )}
          </div>
        </div>
      </section>

      <Rodape />
    </>
  );
}

export default Dashboard;