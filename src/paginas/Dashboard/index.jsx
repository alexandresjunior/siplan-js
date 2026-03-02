import React, { useState, useEffect } from 'react';
import Cabecalho from "../../componentes/Cabecalho";
import { Rodape } from "../../componentes/Rodape";
import CartaoIndicador from "./CartaoIndicador";
import MapaEstrategico from "./MapaEstrategico";
import {
  buscarCartoes,
  separarCartoesPorTipo,
  formatarTituloAba,
  calcularCicloAtual,
  atualizarCartaoNaLista
} from "../../services/dashboard";
import './estilos.css';

export function Dashboard() {
  const [abaAtiva, setAbaAtiva] = useState('mensal');
  const [cartoes, setCartoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true);
        const dados = await buscarCartoes();
        setCartoes(dados);
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados do dashboard");
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const aoAtualizarCartao = (cartaoAtualizado) => {
    setCartoes(prev => atualizarCartaoNaLista(prev, cartaoAtualizado));
  };

  const { mensal: cartoesMensal, acumulado: cartoesAcumulado } = separarCartoesPorTipo(cartoes);
  const cartoesAtivos = abaAtiva === 'mensal' ? cartoesMensal : cartoesAcumulado;

  const tituloAba = abaAtiva === 'mensal'
    ? formatarTituloAba(cartoesMensal, 'mensal')
    : formatarTituloAba(cartoesAcumulado, 'acumulado');

  const cicloAtual = calcularCicloAtual(cartoes);

  return (
    <>
      <Cabecalho />
      <section className="container" id="dashboard">
        <div className="pt-3 pb-5">
          <h1 className="text-primary mb-5">
            Plano de Metas ({cicloAtual})
          </h1>

          {/* Abas */}
          <ul className="nav nav-tabs nav-fill mb-4" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${abaAtiva === 'mensal' ? 'active bg-primary text-white border-primary' : 'text-primary'}`}
                onClick={() => setAbaAtiva('mensal')}
              >Mensal</button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${abaAtiva === 'acumulado' ? 'active bg-primary text-white border-primary' : 'text-primary'}`}
                onClick={() => setAbaAtiva('acumulado')}
              >Acumulado</button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${abaAtiva === 'mapa' ? 'active bg-primary text-white border-primary' : 'text-primary'}`}
                onClick={() => setAbaAtiva('mapa')}
              >Mapa Estratégico</button>
            </li>
          </ul>

          <div className="tab-content">
            {(abaAtiva === 'mensal' || abaAtiva === 'acumulado') && (
              <div className="tab-pane fade show active">
                <h2 className="text-primary mb-3">{tituloAba}</h2>

                {carregando ? (
                  <p className="text-center">Carregando...</p>
                ) : cartoesAtivos.length === 0 ? (
                  <p className="text-center text-muted">
                    Nenhum cartão {abaAtiva === 'mensal' ? 'mensal' : 'acumulado'} cadastrado.
                  </p>
                ) : (
                  <div className="kpi-grid">
                    {cartoesAtivos.map(kpi => (
                      <CartaoIndicador
                        key={kpi.id}
                        data={kpi}
                        onSalvar={aoAtualizarCartao}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

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