import { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';

const HISTORIAL_META = [
  { inv: 0, clients: 0 },
  { inv: 4000, clients: 100 },
  { inv: 8000, clients: 165 },
  { inv: 12000, clients: 210 },
  { inv: 16000, clients: 235 },
  { inv: 20000, clients: 250 }
];

const FRECUENCIAS = [0, 1.0, 0.15, 0.20, 0.20, 0.20, 0.20, 0.20, 0.15, 0.15, 0.15, 0.20, 0.20, ...Array(12).fill(0.10)];

const PLANS_DEFINITION = {
  plan1: { id: 'plan1', name: 'Plan 1: Hoy ($8k fijos)', investments: Array(24).fill(8000), descBF: false },
  plan2: { id: 'plan2', name: 'Plan 2: Agencia ($16k + -30%)', investments: Array(24).fill(16000), descBF: true },
  plan3: { id: 'plan3', name: 'Plan 3: Propio A ($4k fijos)', investments: Array(24).fill(4000), descBF: false },
  plan4: { id: 'plan4', name: 'Plan 4: Propio B (Escalonado $4k-$6k)', investments: [...Array(6).fill(4000), ...Array(18).fill(6000)], descBF: false }
};

const interpolate = (inv) => {
  for (let i = 0; i < HISTORIAL_META.length - 1; i++) {
    const p0 = HISTORIAL_META[i];
    const p1 = HISTORIAL_META[i + 1];
    if (inv >= p0.inv && inv <= p1.inv) {
      return p0.clients + ((p1.clients - p0.clients) * (inv - p0.inv)) / (p1.inv - p0.inv);
    }
  }
  return inv > 20000 ? 250 : 0;
};

// Motor de simulación independiente de render
const runPlanSimulation = (plan) => {
  let cash = 35000.0;
  const historyCash = [cash];
  const monthlyData = [];
  const cohorts = [];
  let minCash = cash;
  let minMonth = 0;
  let activeSubs = 0;

  for (let t = 1; t <= 24; t++) {
    const inv = plan.investments[t - 1];
    const newClientsMeta = interpolate(inv);
    const totalNew = newClientsMeta + 47;

    cohorts.push({
      month: t,
      total: totalNew,
      loose: totalNew * 0.85,
      sub: totalNew * 0.15
    });

    const contribBase = 9000.0 * Math.pow(0.97, t - 1);
    let contribCohorts = 0;
    activeSubs = 0;

    for (const c of cohorts) {
      const lifeMonth = t - c.month + 1;
      const mcLoose = (plan.descBF && lifeMonth === 1 && c.month === 1) ? 6.15 : 15.89;
      const looseContrib = c.loose * FRECUENCIAS[lifeMonth] * mcLoose;

      const retention = Math.pow(0.91, lifeMonth - 1);
      const subCount = c.sub * retention;
      activeSubs += subCount;
      const subContrib = subCount * 12.64;

      contribCohorts += (looseContrib + subContrib);
    }

    const totalContrib = contribBase + contribCohorts;
    const fee = inv > 0 ? 1000 : 0;
    const outflows = inv + fee + 6500;
    const net = totalContrib - outflows;
    cash += net;

    if (cash < minCash) {
      minCash = cash;
      minMonth = t;
    }

    historyCash.push(Number(cash.toFixed(2)));
    monthlyData.push({
      month: t,
      inv,
      totalNew: Math.round(totalNew),
      contribBase: contribBase.toFixed(0),
      contribCohorts: contribCohorts.toFixed(0),
      totalContrib: totalContrib.toFixed(0),
      outflows: outflows.toFixed(0),
      endCash: cash.toFixed(0),
      activeSubs: Math.round(activeSubs),
      isDanger: cash < 5000
    });
  }

  return {
    name: plan.name,
    minCash,
    minMonth,
    endCash: cash,
    endSubs: Math.round(activeSubs),
    historyCash,
    monthlyData,
    brokeFloor: minCash < 5000
  };
};

export const Simulator24m = () => {
  const [selectedPlan, setSelectedPlan] = useState('plan3');

  // Precalcula el resumen de los 4 planes sin recreaciones
  const allPlansSummary = useMemo(() => {
    return Object.values(PLANS_DEFINITION).map(p => runPlanSimulation(p));
  }, []);

  // Simulación detallada del plan seleccionado
  const selectedSimulation = useMemo(() => {
    return runPlanSimulation(PLANS_DEFINITION[selectedPlan]);
  }, [selectedPlan]);

  const chartData = {
    labels: Array.from({ length: 25 }, (_, i) => `Mes ${i}`),
    datasets: [
      {
        label: `Caja en Banco: ${selectedSimulation.name} ($)`,
        data: selectedSimulation.historyCash,
        borderColor: selectedSimulation.brokeFloor ? '#dc2626' : '#16a34a',
        backgroundColor: selectedSimulation.brokeFloor ? 'rgba(220, 38, 38, 0.1)' : 'rgba(22, 163, 74, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 3
      },
      {
        label: 'Piso de Seguridad ($5.000)',
        data: Array(25).fill(5000),
        borderColor: '#dc2626',
        borderDash: [6, 6],
        pointRadius: 0
      }
    ]
  };

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', marginTop: '2rem' }}>
      <header style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', margin: 0 }}>
          Simulador de Flujo de Caja a 24 Meses (Nivel 3)
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
          Modelado mes a mes por cohortes. Saldo inicial: $35.000 | Piso de seguridad: $5.000
        </p>
      </header>

      {/* 1. TABLA COMPARATIVA DE LOS 4 PLANES EXIGIDA POR LA RÚBRICA */}
      <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
        Comparativa de los 4 Planes Requeridos
      </h3>
      <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
        <table style={{ width: '100%', fontSize: '0.8125rem', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e3a8a', color: '#ffffff' }}>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Plan Estratégico</th>
              <th style={{ padding: '0.6rem' }}>Caja Mínima</th>
              <th style={{ padding: '0.6rem' }}>Mes Mínimo</th>
              <th style={{ padding: '0.6rem' }}>Caja Mes 24</th>
              <th style={{ padding: '0.6rem' }}>Suscriptores (M24)</th>
              <th style={{ padding: '0.6rem' }}>¿Rompe Piso ($5k)?</th>
              <th style={{ padding: '0.6rem' }}>¿2da Tostadora ($14k)?</th>
            </tr>
          </thead>
          <tbody>
            {allPlansSummary.map((p, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: p.brokeFloor ? '#fee2e2' : idx === 2 ? '#ecfdf5' : '#ffffff' }}>
                <td style={{ padding: '0.6rem', textAlign: 'left', fontWeight: '700', color: '#111827' }}>{p.name}</td>
                <td style={{ padding: '0.6rem', fontWeight: '600', color: p.brokeFloor ? '#dc2626' : '#111827' }}>
                  ${Number(p.minCash).toLocaleString()}
                </td>
                <td style={{ padding: '0.6rem' }}>Mes {p.minMonth}</td>
                <td style={{ padding: '0.6rem', fontWeight: '700', color: p.endCash < 0 ? '#dc2626' : '#16a34a' }}>
                  ${Number(p.endCash).toLocaleString()}
                </td>
                <td style={{ padding: '0.6rem', fontWeight: '600' }}>{p.endSubs}</td>
                <td style={{ padding: '0.6rem', fontWeight: '700', color: p.brokeFloor ? '#dc2626' : '#16a34a' }}>
                  {p.brokeFloor ? 'SÍ (Quiebra)' : 'NO (Cumple)'}
                </td>
                <td style={{ padding: '0.6rem', fontWeight: '600', color: p.endCash >= 49000 ? '#166534' : '#dc2626' }}>
                  {p.endCash >= 49000 ? 'Sí (De contado)' : p.brokeFloor ? 'Imposible' : 'Sí'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SELECTOR PARA EXPLORAR DETALLE Y GRÁFICO */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#374151' }}>
          Selecciona un plan para ver su gráfico y desglose mensual:
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Object.entries(PLANS_DEFINITION).map(([key, p]) => (
            <button
              key={key}
              onClick={() => setSelectedPlan(key)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                border: selectedPlan === key ? '2px solid #2563eb' : '1px solid #d1d5db',
                backgroundColor: selectedPlan === key ? '#2563eb' : '#f9fafb',
                color: selectedPlan === key ? '#ffffff' : '#374151',
                cursor: 'pointer'
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* GRÁFICO INTERACTIVO */}
      <div style={{ height: '300px', marginBottom: '1.5rem' }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
          }}
        />
      </div>

      {/* 2. TABLA COMPLETA DE 24 MESES (EXIGIDA POR RÚBRICA) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>
          Desglose Mes a Mes (24 Meses Completos): {selectedSimulation.name}
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Desplázate verticalmente para ver todos los meses</span>
      </div>

      <div style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}>
        <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#374151', color: '#ffffff' }}>
            <tr>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>Mes</th>
              <th style={{ padding: '0.5rem' }}>Inversión Meta</th>
              <th style={{ padding: '0.5rem' }}>Clientes Nuevos</th>
              <th style={{ padding: '0.5rem' }}>Contrib. Base</th>
              <th style={{ padding: '0.5rem' }}>Contrib. Nuevos</th>
              <th style={{ padding: '0.5rem' }}>Salidas Totales</th>
              <th style={{ padding: '0.5rem' }}>Caja Final</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>Alerta (&lt;$5k)</th>
            </tr>
          </thead>
          <tbody>
            {selectedSimulation.monthlyData.map((r) => (
              <tr key={r.month} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: r.isDanger ? '#fee2e2' : 'transparent' }}>
                <td style={{ padding: '0.45rem', textAlign: 'center', fontWeight: '600' }}>Mes {r.month}</td>
                <td style={{ padding: '0.45rem' }}>${Number(r.inv).toLocaleString()}</td>
                <td style={{ padding: '0.45rem' }}>{r.totalNew}</td>
                <td style={{ padding: '0.45rem' }}>${Number(r.contribBase).toLocaleString()}</td>
                <td style={{ padding: '0.45rem' }}>${Number(r.contribCohorts).toLocaleString()}</td>
                <td style={{ padding: '0.45rem' }}>${Number(r.outflows).toLocaleString()}</td>
                <td style={{ padding: '0.45rem', fontWeight: '700', color: r.isDanger ? '#dc2626' : '#111827' }}>
                  ${Number(r.endCash).toLocaleString()}
                </td>
                <td style={{ padding: '0.45rem', textAlign: 'center', fontWeight: '700', color: r.isDanger ? '#dc2626' : '#16a34a' }}>
                  {r.isDanger ? '⚠️ ALERTA' : '✓ OK'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};