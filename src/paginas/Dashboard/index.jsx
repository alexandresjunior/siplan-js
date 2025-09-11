import Cabecalho from "../../componentes/Cabecalho";
import GraficoIndicador from "../../componentes/GraficoIndicador";
import { Rodape } from "../../componentes/Rodape";
import './estilos.css';

export function Dashboard() {
    const kpiRiscoOperacional = 45;
    const kpiSatisfacaoCliente = 82;
    const kpiPerformanceServidor = 15;

    return (
        <>
            <Cabecalho />

            <section id='mapa-estrategico' className="container">
                <div className="dashboard-container">
                    <h1>Dashboard de KPIs</h1>
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <h2>Risco Operacional</h2>
                            <GraficoIndicador value={kpiRiscoOperacional} />
                        </div>
                        <div className="kpi-card">
                            <h2>Satisfação do Cliente</h2>
                            <GraficoIndicador value={kpiSatisfacaoCliente} />
                        </div>
                        <div className="kpi-card">
                            <h2>Performance do Servidor</h2>
                            <GraficoIndicador value={kpiPerformanceServidor} />
                        </div>
                    </div>
                </div>
            </section>

            <Rodape />
        </>
    );
}

export default Dashboard;

