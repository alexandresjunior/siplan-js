import GaugeComponent from 'react-gauge-component';
import './estilos.css';

const GraficoIndicador = ({ value }) => {
  return (
    <div className="gauge-wrapper">
      <GaugeComponent
        type="semicircle"
        arc={{
          colorArray: ['rgba(236, 0, 0, 1)', 'rgba(255, 170, 0, 1)', 'rgba(40, 201, 55, 1)', 'rgba(1, 148, 255, 1)'],
          subArcs: [{ limit: 95 }, { limit: 100 }, { limit: 110 }, { limit: 140 }],
          padding: 0.02,
          width: 0.25
        }}
        labels={{
          valueLabel: {
            formatTextValue: value => `KPI ${Math.round(value)}%`,
            style: { fontSize: "35px", fill: "#333", fontWeight: "bold" },
          },
          tickLabels: {
            type: 'outer',
            ticks: [
              { value: 85, label: 'RUIM' },
              { value: 97.5, label: 'REGULAR' },
              { value: 105, label: 'BOM' },
              { value: 125, label: 'ÓTIMO' }
            ],
          }
        }}
        value={value}
        minValue={70}
        maxValue={140}
      />
    </div>
  );
};

export default GraficoIndicador;