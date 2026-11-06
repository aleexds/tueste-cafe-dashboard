
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Registramos módulos de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const formatUsd = (amount, maximumFractionDigits = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits
  }).format(amount);

export const ChartsSection = ({ metrics }) => {
  // 1. Datos para la Curva de Caja acumulada (Mes 0 a Mes 12)
  const meses = Array.from({ length: 13 }, (_, i) => `Mes ${i}`);
  const dataCurvaCaja = {
    labels: meses,
    datasets: [
      {
        label: 'Caja Acumulada por Cliente (USD)',
        data: metrics.curvaCaja,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 4
      },
      {
        label: 'Línea Cero (Punto de Equilibrio)',
        data: Array(13).fill(0),
        borderColor: '#9ca3af',
        borderDash: [5, 5],
        pointRadius: 0
      }
    ]
  };

  // 2. Datos para "La Trampa a la Vista" (ROAS Meta vs ROAS Real 1er pedido vs Break-Even)
  const dataTrampa = {
    labels: ['ROAS Meta (Reportado)', 'ROAS Real 1er Pedido', 'ROAS Break-Even'],
    datasets: [
      {
        label: 'Métrica ROAS',
        data: [3.0, metrics.roasRealPrimerPedido, metrics.roasBreakEven],
        backgroundColor: ['#dc2626', '#f59e0b', '#2563eb']
      }
    ]
  };

  // 3. Datos para LTV vs CAC Real
  const dataLtvCac = {
    labels: ['CAC Real (USD)', 'LTV 12m Ponderado (USD)'],
    datasets: [
      {
        label: 'Comparativa Unitaria',
        data: [metrics.cacReal, metrics.ltvPonderado],
        backgroundColor: ['#ef4444', '#10b981']
      }
    ]
  };

  const cardChartStyle = {
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const chartTitleStyle = {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.75rem'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
      {/* Gráfico 1: Curva de Caja */}
      <div style={cardChartStyle}>
        <div style={chartTitleStyle}>Curva de Caja Acumulada de un Cliente (Mes 0 a Mes 12)</div>
        <div style={{ height: '260px' }}>
          <Line
            data={dataCurvaCaja}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.dataset.label}: ${formatUsd(context.parsed.y, 2)}`
                  }
                }
              },
              scales: {
                y: {
                  ticks: {
                    callback: (value) => formatUsd(value)
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Gráfico 2: La Trampa a la Vista */}
      <div style={cardChartStyle}>
        <div style={chartTitleStyle}>La Trampa a la Vista: ROAS Inflado vs Realidad</div>
        <div style={{ height: '260px' }}>
          <Bar
            data={dataTrampa}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.label}: ${context.parsed.y.toFixed(2)}x`
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Gráfico 3: LTV vs CAC */}
      <div style={cardChartStyle}>
        <div style={chartTitleStyle}>Relación LTV vs CAC Real</div>
        <div style={{ height: '260px' }}>
          <Bar
            data={dataLtvCac}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.label}: ${formatUsd(context.parsed.y, 2)}`
                  }
                }
              },
              scales: {
                y: {
                  ticks: {
                    callback: (value) => formatUsd(value)
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};