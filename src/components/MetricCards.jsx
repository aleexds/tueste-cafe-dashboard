
export const MetricCards = ({ metrics }) => {
  // Semáforo para LTV:CAC según el reglamento: rojo < 1, amarillo 1 a 3, verde >= 3
  const getTrafficColor = (ratio) => {
    if (ratio < 1.0) return { bg: '#fee2e2', text: '#991b1b', label: 'Destruye Caja (< 1.0x)' };
    if (ratio < 3.0) return { bg: '#fef3c7', text: '#92400e', label: 'Vulnerable (1.0x - 3.0x)' };
    return { bg: '#dcfce7', text: '#166534', label: 'Saludable (≥ 3.0x)' };
  };

  const traffic = getTrafficColor(metrics.ltvCacRatio);

  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const labelStyle = { fontSize: '0.8125rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.25rem' };
  const valueStyle = { fontSize: '1.4rem', fontWeight: '700', color: '#111827' };
  const subStyle = { fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
      {/* 1. Margen de Contribución */}
      <div style={cardStyle}>
        <span style={labelStyle}>Margen Contribución (Pedido)</span>
        <div style={valueStyle}>${metrics.mcDolar.toFixed(2)}</div>
        <span style={subStyle}>{metrics.mcPct.toFixed(1)}% sobre precio de venta</span>
      </div>

      {/* 2. ROAS Break-Even */}
      <div style={cardStyle}>
        <span style={labelStyle}>ROAS Break-Even</span>
        <div style={valueStyle}>{metrics.roasBreakEven.toFixed(2)}x</div>
        <span style={subStyle}>Mínimo para no perder en el pedido</span>
      </div>

      {/* 3. CAC Real */}
      <div style={cardStyle}>
        <span style={labelStyle}>CAC Real (Adquisición)</span>
        <div style={valueStyle}>${metrics.cacReal.toFixed(2)}</div>
        <span style={subStyle}>Incluye ${metrics.feeAgencia} fee agencia</span>
      </div>

      {/* 4. CAC Marginal (Exigido en Nivel 2) */}
      <div style={cardStyle}>
        <span style={labelStyle}>CAC Marginal Tramo</span>
        <div style={{ ...valueStyle, color: metrics.cacMarginal > 100 ? '#dc2626' : '#111827' }}>
          ${metrics.cacMarginal.toFixed(2)}
        </div>
        <span style={subStyle}>Costo por cada cliente extra</span>
      </div>

      {/* 5. ROAS Real 1er Pedido */}
      <div style={cardStyle}>
        <span style={labelStyle}>ROAS Real Primer Pedido</span>
        <div style={{ ...valueStyle, color: metrics.roasRealPrimerPedido < 1.0 ? '#dc2626' : '#166534' }}>
          {metrics.roasRealPrimerPedido.toFixed(2)}x
        </div>
        <span style={subStyle}>Meta reporta 3.0x inflado</span>
      </div>

      {/* 6. LTV a 12 Meses */}
      <div style={cardStyle}>
        <span style={labelStyle}>LTV a 12 Meses</span>
        <div style={valueStyle}>${metrics.ltvPonderado.toFixed(2)}</div>
        <span style={subStyle}>Ponderado (85% sueltos / 15% sub)</span>
      </div>

      {/* 7. Semáforo LTV:CAC */}
      <div style={{ ...cardStyle, borderLeft: `6px solid ${traffic.text}` }}>
        <span style={labelStyle}>Ratio LTV : CAC Real</span>
        <div style={{ ...valueStyle, color: traffic.text }}>{metrics.ltvCacRatio.toFixed(2)}x</div>
        <div style={{ marginTop: '0.35rem', display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', backgroundColor: traffic.bg, color: traffic.text, fontSize: '0.75rem', fontWeight: '600' }}>
          {traffic.label}
        </div>
      </div>

      {/* 8. Payback */}
      <div style={cardStyle}>
        <span style={labelStyle}>Payback Estimado</span>
        <div style={{ ...valueStyle, color: metrics.paybackMeses === 'No recupera en 12m' ? '#dc2626' : '#166534' }}>
          {metrics.paybackMeses}
        </div>
        <span style={subStyle}>Mes en que la caja cruza el cero</span>
      </div>
    </div>
  );
};