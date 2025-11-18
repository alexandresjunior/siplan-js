import React, { useState, useEffect } from 'react';
import Cabecalho from "../../componentes/Cabecalho";
import { Rodape } from "../../componentes/Rodape";
import CartaoIndicador from "./CartaoIndicador";
import MapaEstrategico from "./MapaEstrategico";
import api from "../../services/api";
import './estilos.css';

// SUBSTITUA a função formatarPeriodo inteira por esta:
const formatarPeriodo = (listaCartoes, tipo) => {
  if (!listaCartoes || listaCartoes.length === 0) {
    return tipo === 'mensal' ? 'Mensal' : 'Acumulado';
  }

  const periodoFormatado = listaCartoes[0].periodo;

  if (!periodoFormatado) {
    return tipo === 'mensal' ? 'Mensal' : 'Acumulado';
  }

  // Só adiciona o prefixo "Mensal" ou "Acumulado" antes do período que já vem bonito
  return `${tipo === 'mensal' ? 'Mensal' : 'Acumulado'} (${periodoFormatado})`;
};

export function Dashboard() {
  const [abaAtiva, setAbaAtiva] = useState('mensal');
  const [cartoes, setCartoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarCartoes = async () => {
    try {
      setCarregando(true);
      const response = await api.get('/dashboard/listarCartoes');

      const cartoesFormatados = response.data.map(cartao => {
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

  useEffect(() => {
    carregarCartoes();
  }, []);

  const aoAtualizarCartao = (cartaoAtualizado) => {
    setCartoes(prev => prev.map(c =>
      c.id === cartaoAtualizado.id ? cartaoAtualizado : c
    ));
  };

  // Separação por tipoPeriodo
  const cartoesMensal = cartoes.filter(c => c.tipoPeriodo?.toUpperCase() === 'MENSAL');
  const cartoesAcumulado = cartoes.filter(c => c.tipoPeriodo?.toUpperCase() === 'ACUMULADO');

  const cartoesAtivos = abaAtiva === 'mensal' ? cartoesMensal : cartoesAcumulado;

  // Título dinâmico baseado no período real
  const tituloAba = abaAtiva === 'mensal'
    ? formatarPeriodo(cartoesMensal, 'mensal')
    : formatarPeriodo(cartoesAcumulado, 'acumulado');

  // Extrai o número do ciclo com base no mês do cartão Mensal
  const obterCicloAtual = () => {
    const cartaoMensal = cartoes.find(c =>
      c.tipoPeriodo?.toUpperCase() === 'MENSAL' && c.periodo
    );

    if (!cartaoMensal || !cartaoMensal.periodo) {
      return 'Ciclo'; // fallback se não tiver mensal ainda
    }

    const periodo = cartaoMensal.periodo; // ex: "Novembro/2025"
    const mesTexto = periodo.split('/')[0].trim(); // pega só "Novembro"

    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril',
      'Maio', 'Junho', 'Julho', 'Agosto',
      'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const indiceMes = meses.findIndex(m =>
      m.toUpperCase() === mesTexto.toUpperCase()
    );

    if (indiceMes === -1) return 'Ciclo';

    const numeroCiclo = indiceMes + 1;
    return `${numeroCiclo}º Ciclo`;
  };

  return (
    <>
      <Cabecalho />

      <section className="container" id="dashboard">
        <div className="pt-3 pb-5">
          <h1 className="text-primary mb-4">
            Plano de Metas ({obterCicloAtual()})
          </h1>
          {/* Abas */}
          <ul className="nav nav-tabs nav-fill mb-4" role="tablist">
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
            {(abaAtiva === 'mensal' || abaAtiva === 'acumulado') && (
              <div className="tab-pane fade show active">
                <h2 className="text-primary mb-3">
                  {tituloAba}
                </h2>

                {carregando ? (
                  <p className="text-center">Carregando cartões...</p>
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