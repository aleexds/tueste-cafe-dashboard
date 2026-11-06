

export const ControlSliders = ({ params, setParams, onSetScenario }) => {
  const handleChange = (key, value) => {
    setParams(prev => ({
      ...prev,
      [key]: parseFloat(value)
    }));
  };

  const containerStyle = {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '1rem',
    border: '1px solid #e8ded2',
    boxShadow: '0 4px 15px rgba(84, 61, 55, 0.05)',
    marginBottom: '1.75rem'
  };

  const buttonStyle = (bg, color, border = 'none') => ({
    padding: '0.55rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: '700',
    border: border,
    cursor: 'pointer',
    backgroundColor: bg,
    color: color,
    marginRight: '0.5rem',
    marginBottom: '0.5rem',
    transition: 'all 0.2s ease'
  });

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.25rem',
    marginTop: '1.25rem'
  };

  const labelContainer = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#543d37',
    marginBottom: '0.35rem'
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#231714', margin: 0 }}>
            Controles del Modelo Financiero
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#7d6e68' }}>
            Ajuste de variables unitarias y simulación de escenarios
          </span>
        </div>
        <div>
          <button onClick={() => onSetScenario('hoy')} style={buttonStyle('#543d37', '#ffffff')}>
            Hoy ($8k USD)
          </button>
          <button onClick={() => onSetScenario('agencia')} style={buttonStyle('#991b1b', '#ffffff')}>
            Agencia ($16k USD -30%)
          </button>
          <button onClick={() => onSetScenario('propuesta')} style={buttonStyle('#c27847', '#ffffff')}>
            Propuesta Óptima ($4k USD)
          </button>
          <button onClick={() => onSetScenario('reset')} style={buttonStyle('#f5ece1', '#543d37', '1px solid #e8ded2')}>
            Restablecer Caso
          </button>
        </div>
      </div>

      <div style={rowStyle}>
        {/* 1. Inversión en Meta */}
        <div>
          <div style={labelContainer}>
            <span>Inversión en Meta (USD)</span>
            <strong style={{ color: '#c27847' }}>${params.inversionMeta.toLocaleString('en-US')}</strong>
          </div>
          <input
            type="range"
            min="0"
            max="20000"
            step="500"
            value={params.inversionMeta}
            onChange={(e) => handleChange('inversionMeta', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* 2. Precio de la bolsa */}
        <div>
          <div style={labelContainer}>
            <span>Precio bolsa 340g (USD)</span>
            <strong style={{ color: '#231714' }}>${params.precioBolsa.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min="12"
            max="25"
            step="0.5"
            value={params.precioBolsa}
            onChange={(e) => handleChange('precioBolsa', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* 3. Costo del café por bolsa */}
        <div>
          <div style={labelContainer}>
            <span>Costo café por bolsa (USD)</span>
            <strong style={{ color: '#231714' }}>${params.costoCafeBolsa.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min="3"
            max="9"
            step="0.1"
            value={params.costoCafeBolsa}
            onChange={(e) => handleChange('costoCafeBolsa', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* 4. Costo de Envío */}
        <div>
          <div style={labelContainer}>
            <span>Costo de Envío (USD)</span>
            <strong style={{ color: '#231714' }}>${params.costoEnvio.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={params.costoEnvio}
            onChange={(e) => handleChange('costoEnvio', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* 5. Descuento 1er pedido */}
        <div>
          <div style={labelContainer}>
            <span>Descuento 1er Pedido</span>
            <strong style={{ color: params.descuentoPrimerPedido > 0 ? '#991b1b' : '#231714' }}>
              {(params.descuentoPrimerPedido * 100).toFixed(0)}%
            </strong>
          </div>
          <input
            type="range"
            min="0"
            max="0.50"
            step="0.05"
            value={params.descuentoPrimerPedido}
            onChange={(e) => handleChange('descuentoPrimerPedido', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* 6. % Suscriptores */}
        <div>
          <div style={labelContainer}>
            <span>% Mix Suscriptores</span>
            <strong style={{ color: '#231714' }}>{(params.pctSuscripcion * 100).toFixed(0)}%</strong>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.50"
            step="0.05"
            value={params.pctSuscripcion}
            onChange={(e) => handleChange('pctSuscripcion', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* 7. Churn mensual */}
        <div>
          <div style={labelContainer}>
            <span>Cancelación mensual (Churn)</span>
            <strong style={{ color: '#231714' }}>{(params.churnMensual * 100).toFixed(1)}%</strong>
          </div>
          <input
            type="range"
            min="0.03"
            max="0.20"
            step="0.01"
            value={params.churnMensual}
            onChange={(e) => handleChange('churnMensual', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* 8. Pedidos en 12m cliente suelto */}
        <div>
          <div style={labelContainer}>
            <span>Pedidos 12m (Suelto)</span>
            <strong style={{ color: '#231714' }}>{params.pedidosSuelto12m.toFixed(1)} pedidos</strong>
          </div>
          <input
            type="range"
            min="1.0"
            max="6.0"
            step="0.5"
            value={params.pedidosSuelto12m}
            onChange={(e) => handleChange('pedidosSuelto12m', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* 9. Fee Agencia */}
        <div>
          <div style={labelContainer}>
            <span>Fee Agencia (USD)</span>
            <strong style={{ color: '#231714' }}>${params.feeAgencia.toLocaleString('en-US')}</strong>
          </div>
          <input
            type="range"
            min="0"
            max="3000"
            step="200"
            value={params.feeAgencia}
            onChange={(e) => handleChange('feeAgencia', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};