import Cabecalho from "../../componentes/Cabecalho";
import { Rodape } from "../../componentes/Rodape";
import { DADOS_ACUMULADO, DADOS_MENSAL } from "../../mocks/api";
import CartaoIndicador from "./CartaoIndicador";
import './estilos.css';
import MapaEstrategico from "./MapaEstrategico";

export function Dashboard() {
    return (
        <>
            <Cabecalho />
            <section className="container" id="dashboard">
                <div className="pt-3 pb-5">
                    <h1 className="text-primary">Plano de Metas (7º Ciclo)</h1>
                    <h2 className="text-primary">Mensal (Julho/2025)</h2>
                    <div className="kpi-grid">
                        {DADOS_MENSAL.map(kpi => (
                            <CartaoIndicador key={kpi.id} data={kpi} />
                        ))}
                    </div>
                </div>
                <div className="pb-5">
                    <h2 className="text-primary">Acumulado (Janeiro-Julho/2025)</h2>
                    <div className="kpi-grid">
                        {DADOS_ACUMULADO.map(kpi => (
                            <CartaoIndicador key={kpi.id} data={kpi} />
                        ))}
                    </div>
                </div>
                <MapaEstrategico />
            </section>
            <Rodape />
        </>
    );
}

export default Dashboard;

