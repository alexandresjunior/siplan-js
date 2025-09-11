import GaugeComponent from 'react-gauge-component';

const GraficoIndicador = ({ value }) => {
  return (
    <GaugeComponent
      type="semicircle"
      arc={{
        colorArray: ['#5BE12C', '#F5CD19', '#F58B19', '#EA4228'],
        subArcs: [
          { limit: 25 },
          { limit: 50 },
          { limit: 75 },
          { limit: 100 }
        ],
        padding: 0.02,
        width: 0.3
      }}
      labels={{
        valueLabel: {
          formatTextValue: value => value + ' KPI',
          style: {
            fontSize: "40px",
            fill: "#333"
          }
        },
        tickLabels: {
          type: 'outer',
          valueConfig: {
            formatTextValue: value => '' // Oculta os números padrão
          },
          ticks: [
            { value: 12.5, label: 'LOW' },
            { value: 37.5, label: 'MEDIUM' },
            { value: 62.5, label: 'HIGH' },
            { value: 87.5, label: 'CRITICAL' }
          ],
        }
      }}
      value={value}
      minValue={0}
      maxValue={100}
    />
  );
};

export default GraficoIndicador;