import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../auth';
import { MetricCards } from '../components/MetricCards';
import { ControlSliders } from '../components/ControlSliders';
import { ChartsSection } from '../components/ChartsSection';
import { Simulator24m } from '../components/Simulator24m';

// Historial real de inversión vs clientes nuevos (Sección 5 del caso)
const HISTORIAL_META = [
  { inv: 0, clients: 0 },
  { inv: 4000, clients: 100 },
  { inv: 8000, clients: 165 },
  { inv: 12000, clients: 210 },
  { inv: 16000, clients: 235 },
  { inv: 20000, clients: 250 }
];

const FRECUENCIAS_SUELTOS = [0, 1.0, 0.15, 0.20, 0.20, 0.20, 0.20, 0.20, 0.15, 0.15, 0.15, 0.20, 0.20];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useState({
    inversionMeta: 8000,
    precioBolsa: 17.0,
    costoCafeBolsa: 5.44,
    costoEnvio: 4.50,
    descuentoPrimerPedido: 0.0,
    pctSuscripcion: 0.15,
    churnMensual: 0.09,
    pedidosSuelto12m: 3.0,
    feeAgencia: 1000
  });

  const handleSetScenario = (scenario) => {
    if (scenario === 'hoy') {
      setParams({
        inversionMeta: 8000,
        precioBolsa: 17.0,
        costoCafeBolsa: 5.44,
        costoEnvio: 4.50,
        descuentoPrimerPedido: 0.0,
        pctSuscripcion: 0.15,
        churnMensual: 0.09,
        pedidosSuelto12m: 3.0,
        feeAgencia: 1000
      });
    } else if (scenario === 'agencia') {
      setParams({
        inversionMeta: 16000,
        precioBolsa: 17.0,
        costoCafeBolsa: 5.44,
        costoEnvio: 4.50,
        descuentoPrimerPedido: 0.30,
        pctSuscripcion: 0.15,
        churnMensual: 0.09,
        pedidosSuelto12m: 3.0,
        feeAgencia: 1000
      });
    } else if (scenario === 'propuesta') {
      setParams({
        inversionMeta: 4000,
        precioBolsa: 17.0,
        costoCafeBolsa: 5.44,
        costoEnvio: 4.50,
        descuentoPrimerPedido: 0.0,
        pctSuscripcion: 0.15,
        churnMensual: 0.09,
        pedidosSuelto12m: 3.0,
        feeAgencia: 1000
      });
    } else if (scenario === 'reset') {
      handleSetScenario('hoy');
    }
  };

  const metrics = useMemo(() => {
    const {
      inversionMeta,
      precioBolsa,
      costoCafeBolsa,
      costoEnvio,
      descuentoPrimerPedido,
      pctSuscripcion,
      churnMensual,
      pedidosSuelto12m,
      feeAgencia
    } = params;

    // 1. Clientes nuevos con interpolación lineal y CAC Marginal por tramo
    let clientesMeta = 0;
    let cacMarginal = 0;

    for (let i = 0; i < HISTORIAL_META.length - 1; i++) {
      const p0 = HISTORIAL_META[i];
      const p1 = HISTORIAL_META[i + 1];
      if (inversionMeta >= p0.inv && inversionMeta <= p1.inv) {
        clientesMeta = p0.clients + ((p1.clients - p0.clients) * (inversionMeta - p0.inv)) / (p1.inv - p0.inv);
        cacMarginal = (p1.inv - p0.inv) / (p1.clients - p0.clients);
        break;
      }
    }
    if (inversionMeta > 20000) {
      clientesMeta = 250;
      cacMarginal = 300;
    }

    // 2. Costo Total y CAC Real
    const costoAdquisicion = inversionMeta + (inversionMeta > 0 ? feeAgencia : 0);
    const cacReal = clientesMeta > 0 ? costoAdquisicion / clientesMeta : 0;

    // 3. Márgenes unitarios por pedido de 2 bolsas
    const precioBase2B = precioBolsa * 2;
    const costoCafe2B = costoCafeBolsa * 2;
    const empaque = 1.20;

    // Pedido suelto inicial (con o sin descuento de primer pedido)
    const precioSueltoM1 = precioBase2B * (1 - descuentoPrimerPedido);
    const pasarelaSueltoM1 = precioSueltoM1 * 0.045;
    const mcSueltoM1 = precioSueltoM1 - (costoCafe2B + costoEnvio + pasarelaSueltoM1 + empaque);

    // Pedido suelto recurrente normal
    const pasarelaSueltoNormal = precioBase2B * 0.045;
    const mcSueltoNormal = precioBase2B - (costoCafe2B + costoEnvio + pasarelaSueltoNormal + empaque);

    // Pedido recurrente de suscripción (10% descuento continuo)
    const precioSub = precioBase2B * 0.90;
    const pasarelaSub = precioSub * 0.045;
    const mcSub = precioSub - (costoCafe2B + costoEnvio + pasarelaSub + empaque);

    // Métricas del primer pedido
    const mcDolar = mcSueltoM1;
    const mcPct = (mcDolar / precioSueltoM1) * 100;
    const roasBreakEven = mcPct > 0 ? 1 / (mcPct / 100) : 0;

    // 4. LTV a 12 meses ponderado
    const pedidosRecurrentes = Math.max(0, pedidosSuelto12m - 1);
    const ltvSuelto = mcSueltoM1 + mcSueltoNormal * pedidosRecurrentes;

    let sumaMesesSub = 0;
    for (let m = 0; m < 12; m++) {
      sumaMesesSub += Math.pow(1 - churnMensual, m);
    }
    const ltvSub = mcSub * sumaMesesSub;

    const pctSueltos = 1 - pctSuscripcion;
    const ltvPonderado = pctSueltos * ltvSuelto + pctSuscripcion * ltvSub;
    const ltvCacRatio = cacReal > 0 ? ltvPonderado / cacReal : 0;

    // 5. Curva de caja acumulada (Mes 0 a Mes 12)
    const curvaCaja = [];
    let acum = -cacReal;
    curvaCaja.push(Number(acum.toFixed(2)));

    let paybackMeses = 'No recupera en 12m';

    for (let m = 1; m <= 12; m++) {
      const flujoSuelto = m === 1 ? mcSueltoM1 : (FRECUENCIAS_SUELTOS[m] || 0.15) * mcSueltoNormal;
      const retencionSub = Math.pow(1 - churnMensual, m - 1);
      const flujoSub = retencionSub * mcSub;

      const flujoMes = pctSueltos * flujoSuelto + pctSuscripcion * flujoSub;
      acum += flujoMes;
      curvaCaja.push(Number(acum.toFixed(2)));

      if (acum >= 0 && paybackMeses === 'No recupera en 12m') {
        paybackMeses = `Mes ${m}`;
      }
    }

    // 6. ROAS Real de adquisición primer pedido
    const ventasPrimerPedido = clientesMeta * (pctSueltos * precioSueltoM1 + pctSuscripcion * precioSub);
    const roasRealPrimerPedido = inversionMeta > 0 ? ventasPrimerPedido / inversionMeta : 0;

    return {
      mcDolar,
      mcPct,
      roasBreakEven,
      cacReal,
      cacMarginal,
      feeAgencia,
      ltvPonderado,
      ltvCacRatio,
      paybackMeses,
      curvaCaja,
      roasRealPrimerPedido
    };
  }, [params]);

  return (
    <div style={{ backgroundColor: '#fcf9f5', minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Barra de navegación temática de cafetería */}
      <nav style={{
        backgroundColor: '#231714',
        borderBottom: '2px solid #c27847',
        padding: '1rem 2rem',
        color: '#fdfbf7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#c27847',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: '800',
            color: '#ffffff'
          }}>
            ☕
          </div>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '0.05em', color: '#fcf9f5' }}>
              TUESTE
            </span>
            <span style={{ fontSize: '0.75rem', marginLeft: '0.6rem', color: '#d7c2b5', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Café de Especialidad · 340g
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            fontSize: '0.8rem',
            backgroundColor: 'rgba(255,255,255,0.08)',
            padding: '0.4rem 0.9rem',
            borderRadius: '9999px',
            border: '1px solid rgba(194, 120, 71, 0.4)',
            color: '#e8ded2'
          }}>
            Direct-to-Consumer (DTC) Model
          </div>
          <button
            onClick={() => {
              signOut();
              navigate('/login', { replace: true });
            }}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(194, 120, 71, 0.4)',
              borderRadius: '9999px',
              color: '#e8ded2',
              cursor: 'pointer',
              font: 'inherit',
              fontSize: '0.75rem',
              padding: '0.4rem 0.8rem'
            }}
            type="button"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Área de trabajo */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <header style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#231714', margin: '0 0 0.4rem 0' }}>
            Tablero de Decisiones y Unit Economics
          </h1>
          <p style={{ color: '#7d6e68', margin: 0, fontSize: '0.95rem' }}>
            Simulación financiera en tiempo real para optimización de pauta publicitaria y flujo de caja.
          </p>
        </header>

        {/* 1. Controles deslizantes */}
        <ControlSliders params={params} setParams={setParams} onSetScenario={handleSetScenario} />

        {/* 2. Tarjetas con métricas unitarias */}
        <MetricCards metrics={metrics} />

        {/* 3. Gráficos analíticos */}
        <ChartsSection metrics={metrics} />

        {/* 4. Simulador a 24 Meses (Nivel 3) */}
        <Simulator24m />
      </main>
    </div>
  );
};