import Cabecalho from "../../componentes/Cabecalho";
import CartaoIndicador from "../../componentes/CartaoIndicador";
import { Rodape } from "../../componentes/Rodape";
import { DADOS_ACUMULADO, DADOS_MENSAL } from "../../mocks/api";
import './estilos.css';

export function Dashboard() {
    return (
        <>
            <Cabecalho />

            <section className="container mt-3 mb-5">
                <h1 className="text-primary">Plano de Metas (7º Ciclo)</h1>
                <h2 className="text-primary">Mensal (Julho/2025)</h2>
                <div className="kpi-grid">
                    {DADOS_MENSAL.map(kpi => (
                        <CartaoIndicador key={kpi.id} data={kpi} />
                    ))}
                </div>

                <h2 className="text-primary">Acumulado</h2>
                <div className="kpi-grid">
                    {DADOS_ACUMULADO.map(kpi => (
                        <CartaoIndicador key={kpi.id} data={kpi} />
                    ))}
                </div>
            </section>

            <Rodape />
        </>
    );
}

export default Dashboard;

