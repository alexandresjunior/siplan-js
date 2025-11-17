import React, { useState, useEffect } from 'react';
import Cabecalho from "../../componentes/Cabecalho";
import { Rodape } from "../../componentes/Rodape";
import CartaoIndicador from "./CartaoIndicador";
import MapaEstrategico from "./MapaEstrategico";
import api from "../../services/api"; // <-- IMPORTANTE
import './estilos.css';

export function Dashboard() {
  const [abaAtiva, setAbaAtiva] = useState('mensal');

  // Estado único para os cartões (carregado do backend)
  const [cartoes, setCartoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Carrega os cartões do backend (só uma vez ou quando precisar)
  const carregarCartoes = async () => {
    try {
      setCarregando(true);
      const response = await api.get('/dashboard/listarCartoes');

      // TRANSFORMA valorIndicador → meta ou teto (pra manter compatibilidade com seu modal)
      const cartoesFormatados = response.data.map(cartao => {
        // Decida se é teto ou meta (você pode ter um campo tipoIndicador no banco)
        // Por enquanto, vamos assumir que se tipoIndicador for "TETO" → teto, senão → meta
        const ehTeto = cartao.tipoIndicador === 'TETO';

        return {
          ...cartao,
          teto: ehTeto ? cartao.valorIndicador : undefined,
          meta: !ehTeto ? cartao.valorIndicador : undefined,
        };
      });

      setCartoes(cartoesFormatados);
    } catch (err) {
      console.error("Erro ao carregar cartões", err);
      alert("Erro ao carregar dados do servidor");
    } finally {
      setCarregando(false);
    }
  };

  // Carrega ao montar o componente
  useEffect(() => {
    carregarCartoes();
  }, []);

  // Função que o CartaoIndicador chama quando salva
  const aoAtualizarCartao = (cartaoAtualizado) => {
    setCartoes(prev => prev.map(c =>
      c.id === cartaoAtualizado.id ? cartaoAtualizado : c
    ));
  };

  // Dados da aba atual (usa o mesmo array para mensal e acumulado por enquanto)
  const cartoesAtivos = cartoes;

  return (
    <>
      <Cabecalho />

      <section className="container" id="dashboard">
        <div className="pt-3 pb-5">
          <h1 className="text-primary mb-4">Plano de Metas (7º Ciclo)</h1>

          {/* Abas */}
          <ul className="nav nav-tabs nav-fill mb-4" role="tablist">
            {/* ... suas abas iguais ... */}
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link fw-semibold ${abaAtiva === 'mensal' ? 'active bg-primary text-white border-primary' : 'text-primary'}`}
                onClick={() => setAbaAtiva('mensal')}
              >
                Mensal
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link fw-semibold ${abaAtiva === 'acumulado' ? 'active bg-primary text-white border-primary' : 'text-primary'}`}
                onClick={() => setAbaAtiva('acumulado')}
              >
                Acumulado
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link fw-semibold ${abaAtiva === 'mapa' ? 'active bg-primary text-white border-primary' : 'text-primary'}`}
                onClick={() => setAbaAtiva('mapa')}
              >
                Mapa Estratégico
              </button>
            </li>
          </ul>

          <div className="tab-content">
            {/* Aba Mensal e Acumulado (mesma fonte de dados) */}
            {(abaAtiva === 'mensal' || abaAtiva === 'acumulado') && (
              <div className="tab-pane fade show active">
                <h2 className="text-primary mb-3">
                  {abaAtiva === 'mensal' ? 'Mensal (Julho/2025)' : 'Acumulado (Janeiro-Julho/2025)'}
                </h2>

                {carregando ? (
                  <p>Carregando cartões...</p>
                ) : (
                  <div className="kpi-grid">
                    {cartoesAtivos.map(kpi => (
                      <CartaoIndicador
                        key={kpi.id}
                        data={kpi}
                        onSalvar={aoAtualizarCartao}  // <-- recebe atualização
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aba Mapa */}
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