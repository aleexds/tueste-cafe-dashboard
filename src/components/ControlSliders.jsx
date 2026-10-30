
export const ControlSliders = ({ params, setParams, onSetScenario }) => {
  const handleChange = (key, value) => {
    setParams(prev => ({
      ...prev,
      [key]: parseFloat(value)
    }));
  };

  const containerStyle = {
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem'
  };

  const buttonStyle = (bg, color) => ({
    padding: '0.5rem 0.9rem',
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: bg,
    color: color,
    marginRight: '0.5rem',
    marginBottom: '0.5rem'
  });

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  };

  const labelContainer = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.25rem'
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', margin: 0 }}>
          Controles del Modelo (Rúbrica Nivel 2)
        </h3>
        <div>
          <button onClick={() => onSetScenario('hoy')} style={buttonStyle('#2563eb', '#ffffff')}>
            Hoy ($8k)
          </button>
          <button onClick={() => onSetScenario('agencia')} style={buttonStyle('#dc2626', '#ffffff')}>
            Agencia ($16k -30%)
          </button>
          <button onClick={() => onSetScenario('propuesta')} style={buttonStyle('#16a34a', '#ffffff')}>
            Propuesta Óptima ($4k)
          </button>
          <button onClick={() => onSetScenario('reset')} style={buttonStyle('#f3f4f6', '#374151')}>
            Restablecer a Datos del Caso
          </button>
        </div>
      </div>

      <div style={rowStyle}>
        {/* 1. Inversión en Meta */}
        <div>
          <div style={labelContainer}>
            <span>Inversión en Meta ($)</span>
            <strong>${params.inversionMeta.toLocaleString()}</strong>
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
            <span>Precio bolsa 340g ($)</span>
            <strong>${params.precioBolsa.toFixed(2)}</strong>
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
            <span>Costo café por bolsa ($)</span>
            <strong>${params.costoCafeBolsa.toFixed(2)}</strong>
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
            <span>Costo de Envío ($)</span>
            <strong>${params.costoEnvio.toFixed(2)}</strong>
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
            <strong>{(params.descuentoPrimerPedido * 100).toFixed(0)}%</strong>
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
            <strong>{(params.pctSuscripcion * 100).toFixed(0)}%</strong>
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
            <strong>{(params.churnMensual * 100).toFixed(1)}%</strong>
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
            <span>Pedidos en 12m (Suelto)</span>
            <strong>{params.pedidosSuelto12m.toFixed(1)} pedidos</strong>
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
            <span>Fee Agencia ($)</span>
            <strong>${params.feeAgencia.toLocaleString()}</strong>
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