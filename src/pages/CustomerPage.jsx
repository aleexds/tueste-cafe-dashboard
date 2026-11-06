import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleDollarSign,
  Coffee,
  CreditCard,
  Gift,
  LocateFixed,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  MapPinned,
  LoaderCircle,
  Mail,
  UserRound,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from '../auth';
import { createInvitationEmailLink, getReferralStatus, REFERRAL_LEVELS } from '../referrals';
import './CustomerPage.css';

const menuItems = [
  {
    id: 'flat-white',
    name: 'Flat white de la casa',
    category: 'ESPRESSO · LECHE SEDOSA',
    description: 'Doble espresso y leche cremosa, perfectamente balanceados.',
    price: 5.5,
    image:
      'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Flat white con arte latte'
  },
  {
    id: 'v60',
    name: 'V60 de temporada',
    category: 'MÉTODOS · ORIGEN INVITADO',
    description: 'Café de Colombia con notas de chocolate y naranja.',
    price: 6.5,
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Café de especialidad preparado en filtro'
  },
  {
    id: 'cold-brew',
    name: 'Cold brew de la casa',
    category: 'FRÍO · 16 HORAS DE EXTRACCIÓN',
    description: 'Suave, refrescante y servido sobre hielo.',
    price: 5.75,
    image:
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Café frío servido con hielo'
  },
  {
    id: 'cinnamon-roll',
    name: 'Roll de canela',
    category: 'PANADERÍA · HORNEADO HOY',
    description: 'Masa suave, canela aromática y glaseado ligero.',
    price: 4.5,
    image:
      'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Pan dulce recién horneado'
  }
];

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});
const formatPrice = (price) => usdFormatter.format(price);
const LOYALTY_REWARD_RATE = 0.03;

const US_STATE_CODES = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR',
  California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE',
  Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL',
  Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA',
  Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI',
  Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT',
  Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC',
  'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR',
  Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT',
  Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV',
  Wisconsin: 'WI', Wyoming: 'WY', 'District of Columbia': 'DC'
};

const getFeatureAddress = (feature) => {
  const properties = feature.properties;
  const state = properties.statecode
    || US_STATE_CODES[properties.state]
    || properties.state
    || '';
  const streetName = properties.street || properties.name || '';
  const street = [properties.housenumber, streetName].filter(Boolean).join(' ');

  return {
    street,
    neighborhood:
      properties.neighbourhood
      || properties.suburb
      || properties.district
      || properties.city
      || '',
    city:
      properties.city
      || properties.town
      || properties.village
      || properties.municipality
      || '',
    state: state.length === 2 ? state.toUpperCase() : '',
    postalCode: properties.postcode || ''
  };
};

const getFeatureLabel = (feature) => {
  const properties = feature.properties;
  return [
    [properties.housenumber, properties.street || properties.name].filter(Boolean).join(' '),
    properties.city || properties.town || properties.village,
    properties.state
  ].filter(Boolean).join(', ');
};

export const CustomerPage = () => {
  const currentUser = getCurrentUser();
  const loyaltyStorageKey = `tueste-loyalty-balance-usd-${currentUser?.username || 'customer'}`;
  const hasOrderedStorageKey = `tueste-has-ordered-${currentUser?.username || 'customer'}`;
  const [cart, setCart] = useState({});
  const [hasOrdered, setHasOrdered] = useState(
    () => localStorage.getItem(hasOrderedStorageKey) === 'true'
  );
  const [showReferralProgress, setShowReferralProgress] = useState(false);
  const [referralStatus, setReferralStatus] = useState(
    () => getReferralStatus(currentUser?.username || '')
  );
  const [loyaltyBalance, setLoyaltyBalance] = useState(() => {
    const storedBalance = Number(localStorage.getItem(loyaltyStorageKey));
    return Number.isFinite(storedBalance) ? Math.max(0, storedBalance) : 0;
  });
  const [useLoyaltyBalance, setUseLoyaltyBalance] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    instructions: ''
  });
  const [savedAddress, setSavedAddress] = useState(null);
  const [orderConfirmation, setOrderConfirmation] = useState('');
  const [addressMessage, setAddressMessage] = useState('');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const navigate = useNavigate();

  const firstName = currentUser?.username
    ? currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1)
    : 'Cliente';
  const invitationPageLink = createInvitationEmailLink(currentUser?.username || '');
  const invitationEmailSubject = 'Invita a tus amigos a Tueste y gana hasta $15';
  const invitationEmailBody = [
    `¡Gracias por tu pedido, ${firstName}!`,
    '',
    'Tu invitado recibe $3 de bienvenida al registrarse. Sube de nivel al invitar a 3, 6 y 10 personas para ganar $8, $12 y $15 en tu tarjeta de socio. Al completar los tres niveles, tu progreso comienza de nuevo.',
    '',
    'Abre este enlace para copiar y compartir tu invitación:',
    invitationPageLink,
    '',
    'Programa de demostración: las recompensas se guardan en este navegador.'
  ].join('\n');
  const invitationEmailLink = `mailto:${encodeURIComponent(currentUser?.email || '')}?subject=${encodeURIComponent(invitationEmailSubject)}&body=${encodeURIComponent(invitationEmailBody)}`;

  const cartItems = useMemo(
    () => menuItems.filter((item) => cart[item.id]).map((item) => ({
      ...item,
      quantity: cart[item.id]
    })),
    [cart]
  );
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 4.95 : 0;
  const total = subtotal + deliveryFee;
  const rewardEarned = Math.round(total * LOYALTY_REWARD_RATE * 100) / 100;
  const loyaltyApplied = useLoyaltyBalance
    ? Math.min(loyaltyBalance, total)
    : 0;
  const amountDue = Math.round((total - loyaltyApplied) * 100) / 100;

  useEffect(() => {
    if (!locationPickerOpen || locationQuery.trim().length < 3) return undefined;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearchingLocation(true);
      setLocationError('');

      try {
        const params = new URLSearchParams({
          q: locationQuery.trim(),
          limit: '5',
          lang: 'en',
          bbox: '-125,24,-66,50',
          lat: '47.614',
          lon: '-122.319'
        });
        const response = await fetch(`https://photon.komoot.io/api/?${params}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('No se pudo buscar la dirección. Intenta de nuevo.');
        }

        const data = await response.json();
        setLocationResults(data.features || []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLocationResults([]);
          setLocationError(error.message || 'No se pudo buscar la dirección. Intenta de nuevo.');
        }
      } finally {
        if (!controller.signal.aborted) setIsSearchingLocation(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [locationPickerOpen, locationQuery]);

  const applyLocation = (feature) => {
    const [longitude, latitude] = feature.geometry.coordinates;
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    setAddress((currentAddress) => ({
      ...currentAddress,
      ...getFeatureAddress(feature)
    }));
    setSelectedLocation({ label: getFeatureLabel(feature), mapUrl });
    setSavedAddress(null);
    setAddressMessage('');
    setLocationError('');
    setLocationQuery('');
    setLocationResults([]);
    setLocationPickerOpen(false);
  };

  const handleAddressChange = (field, value) => {
    setAddress((currentAddress) => ({ ...currentAddress, [field]: value }));
    if (['street', 'neighborhood', 'city', 'state'].includes(field)) {
      setSelectedLocation(null);
    }
    setSavedAddress(null);
    setAddressMessage('');
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Este navegador no permite acceder a la ubicación GPS.');
      return;
    }

    setIsLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = new URLSearchParams({
            lat: String(coords.latitude),
            lon: String(coords.longitude),
            lang: 'en'
          });
          const response = await fetch(`https://photon.komoot.io/reverse?${params}`);

          if (!response.ok) {
            throw new Error('No se pudo obtener la dirección para esta ubicación.');
          }

          const data = await response.json();
          const feature = data.features?.[0];
          if (!feature) {
            throw new Error('No encontramos una dirección para esta ubicación.');
          }

          applyLocation(feature);
        } catch (error) {
          setLocationError(error.message || 'No se pudo obtener la dirección para esta ubicación.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        const messages = {
          1: 'Permite el acceso a tu ubicación en el navegador e inténtalo de nuevo.',
          2: 'No pudimos determinar tu ubicación. Inténtalo otra vez.',
          3: 'La solicitud de ubicación tardó demasiado. Inténtalo de nuevo.'
        };
        setLocationError(messages[error.code] || 'No se pudo acceder a tu ubicación.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const updateQuantity = (productId, amount) => {
    setCart((currentCart) => {
      const nextQuantity = (currentCart[productId] || 0) + amount;
      if (nextQuantity <= 0) {
        const remainingCart = { ...currentCart };
        delete remainingCart[productId];
        return remainingCart;
      }

      return { ...currentCart, [productId]: nextQuantity };
    });
    setOrderConfirmation('');
  };

  const handleAddressSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextAddress = {
      ...Object.fromEntries(formData.entries()),
      mapUrl: selectedLocation?.mapUrl || ''
    };
    setSavedAddress(nextAddress);
    setAddressMessage('Dirección de entrega guardada para este pedido.');
  };

  const handleOrder = () => {
    if (!savedAddress || !cartCount) return;

    const nextBalance = Math.round(
      (loyaltyBalance - loyaltyApplied + rewardEarned) * 100
    ) / 100;
    localStorage.setItem(loyaltyStorageKey, String(nextBalance));
    localStorage.setItem(hasOrderedStorageKey, 'true');
    setHasOrdered(true);
    setLoyaltyBalance(nextBalance);
    setUseLoyaltyBalance(false);

    const orderNumber = `TUE-${String(Date.now()).slice(-6)}`;
    const balanceMessage = loyaltyApplied
      ? ` Usaste ${formatPrice(loyaltyApplied)} de tu tarjeta.`
      : '';
    setOrderConfirmation(
      `¡Pedido ${orderNumber} recibido! Sumaste ${formatPrice(rewardEarned)} a tu tarjeta.${balanceMessage}`
    );
    setCart({});
  };

  const handleSignOut = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <main className="customer-page">
      <header className="customer-header">
        <a className="customer-brand" href="#inicio" aria-label="Tueste, inicio">
          <span className="customer-brand-mark"><Coffee size={20} /></span>
          <span>
            <strong>tueste</strong>
            <small>CAFÉ DE ESPECIALIDAD</small>
          </span>
        </a>
        <nav className="customer-nav" aria-label="Navegación de cliente">
          <a href="#menu-cliente">Menú</a>
          <a href="#direccion">Mi dirección</a>
          <a href="#membresia">Mi tarjeta</a>
        </nav>
        <div className="customer-header-actions">
          <a className="customer-cart-link" href="#carrito" aria-label={`Carrito, ${cartCount} productos`}>
            <ShoppingBag size={16} />
            <span>Mi carrito</span>
            <b>{cartCount}</b>
          </a>
          <button className="customer-logout" onClick={handleSignOut} type="button">
            Salir
          </button>
        </div>
      </header>

      <div className="customer-content" id="inicio">
        <section className="customer-welcome">
          <div className="customer-welcome-copy">
            <span className="customer-eyebrow">
              <span className="customer-eyebrow-dot" />
              TU RINCÓN EN TUESTE
            </span>
            <h1>¡Hola, {firstName}!<br /><em>Qué bueno tenerte.</em></h1>
            <p>
              Tu café favorito está a un pedido de distancia. Elige algo rico y
              nosotros nos encargamos del resto.
            </p>
            <a className="customer-primary-button" href="#menu-cliente">
              Explorar el menú <ArrowRight size={16} />
            </a>
          </div>
          <div className="customer-welcome-visual">
            <div className="customer-welcome-image" />
            <div className="customer-welcome-note">
              <span><Coffee size={15} /> HECHO AL MOMENTO</span>
              <strong>Tu pausa favorita.</strong>
            </div>
          </div>
        </section>

        <div className="customer-dashboard-grid">
          <div className="customer-main-column">
            <section className="customer-section" id="menu-cliente">
              <div className="customer-section-heading">
                <div>
                  <span className="customer-section-kicker">DE LA BARRA A TU MESA</span>
                  <h2>¿Qué se te antoja?</h2>
                </div>
                <span className="customer-section-aside">PREPARADO CON CARIÑO</span>
              </div>
              <div className="customer-menu-grid">
                {menuItems.map((item) => (
                  <article className="customer-menu-card" key={item.id}>
                    <div className="customer-menu-image-wrap">
                      <img src={item.image} alt={item.imageAlt} loading="lazy" />
                      <span className="customer-menu-badge">{item.category.split(' · ')[0]}</span>
                    </div>
                    <div className="customer-menu-details">
                      <span className="customer-menu-category">{item.category}</span>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <div className="customer-menu-card-bottom">
                        <strong>{formatPrice(item.price)}</strong>
                        <button
                          aria-label={`Añadir ${item.name} al carrito`}
                          className="customer-add-button"
                          onClick={() => updateQuantity(item.id, 1)}
                          type="button"
                        >
                          <Plus size={16} /> Añadir
                        </button>
                      </div>
                      {cart[item.id] > 0 && (
                        <span className="customer-added-note">
                          <Check size={13} /> {cart[item.id]} en tu carrito
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="customer-section customer-address-section" id="direccion">
              <div className="customer-section-heading">
                <div>
                  <span className="customer-section-kicker">A DONDE LLEVAMOS TU PEDIDO</span>
                  <h2>Tu dirección de entrega</h2>
                </div>
                <span className="customer-section-icon"><MapPin size={19} /></span>
              </div>
              <div className="customer-location-picker">
                <button
                  aria-expanded={locationPickerOpen}
                  className="customer-location-toggle"
                  onClick={() => {
                    setLocationPickerOpen((open) => !open);
                    setLocationError('');
                  }}
                  type="button"
                >
                  <MapPinned size={17} />
                  <span>
                    <strong>Elegir ubicación en el mapa</strong>
                    <small>Busca una dirección o usa el GPS de tu dispositivo</small>
                  </span>
                  <ArrowDownRight className={locationPickerOpen ? 'customer-location-chevron-open' : ''} size={16} />
                </button>
                {locationPickerOpen && (
                  <div className="customer-location-dropdown">
                    <button
                      className="customer-gps-button"
                      disabled={isLocating}
                      onClick={handleUseCurrentLocation}
                      type="button"
                    >
                      {isLocating
                        ? <LoaderCircle className="customer-location-spinner" size={16} />
                        : <LocateFixed size={16} />}
                      {isLocating ? 'Buscando tu ubicación...' : 'Usar mi ubicación GPS'}
                    </button>
                    <div className="customer-location-search">
                      <Search size={16} />
                      <input
                        aria-label="Buscar dirección"
                        autoComplete="off"
                        onChange={(event) => {
                          setLocationQuery(event.target.value);
                          setLocationResults([]);
                          setSelectedLocation(null);
                          setLocationError('');
                        }}
                        placeholder="Escribe calle, ciudad o ZIP"
                        role="combobox"
                        aria-expanded={locationResults.length > 0}
                        value={locationQuery}
                      />
                      {isSearchingLocation && (
                        <LoaderCircle className="customer-location-spinner" size={15} />
                      )}
                    </div>
                    {locationResults.length > 0 && (
                      <ul className="customer-location-results" role="listbox" aria-label="Resultados de ubicación">
                        {locationResults.map((feature) => (
                          <li key={`${feature.properties.osm_type}-${feature.properties.osm_id}`}>
                            <button
                              onClick={() => applyLocation(feature)}
                              role="option"
                              type="button"
                            >
                              <MapPin size={15} />
                              <span>{getFeatureLabel(feature)}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {locationQuery.trim().length >= 3
                      && !isSearchingLocation
                      && !locationResults.length
                      && !locationError && (
                        <p className="customer-location-status">No encontramos direcciones. Prueba con otra búsqueda.</p>
                    )}
                    {locationError && (
                      <p className="customer-location-error" role="alert">{locationError}</p>
                    )}
                    {selectedLocation && (
                      <a
                        className="customer-selected-location"
                        href={selectedLocation.mapUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Check size={14} />
                        <span>{selectedLocation.label}</span>
                        <ArrowUpRight size={14} />
                      </a>
                    )}
                    <p className="customer-location-attribution">
                      Búsqueda por <a href="https://photon.komoot.io/" rel="noreferrer" target="_blank">Photon</a>,
                      con datos de <a href="https://www.openstreetmap.org/copyright" rel="noreferrer" target="_blank">OpenStreetMap</a>.
                      El punto elegido abre Google Maps.
                    </p>
                  </div>
                )}
                {!locationPickerOpen && selectedLocation && (
                  <a
                    className="customer-picked-address"
                    href={selectedLocation.mapUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Check size={14} />
                    <span>{selectedLocation.label}</span>
                    <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
              {savedAddress && (
                <div className="customer-address-saved" role="status">
                  <Check size={16} />
                  <span>
                    <strong>Dirección guardada</strong>
                    {`${savedAddress.street}, ${savedAddress.neighborhood}, ${savedAddress.city}, ${savedAddress.state} ${savedAddress.postalCode}`}
                  </span>
                  {savedAddress.mapUrl && (
                    <a
                      className="customer-saved-map-link"
                      href={savedAddress.mapUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Ver mapa
                    </a>
                  )}
                  <button
                    aria-label="Editar dirección"
                    onClick={() => {
                      setAddress(savedAddress);
                      setSavedAddress(null);
                      setAddressMessage('');
                    }}
                    type="button"
                  >
                    Editar
                  </button>
                </div>
              )}
              <form className="customer-address-form" onSubmit={handleAddressSubmit}>
                <label className="customer-field customer-field-wide">
                  Dirección (calle y número)
                  <input
                    autoComplete="street-address"
                    name="street"
                    onChange={(event) => handleAddressChange('street', event.target.value)}
                    placeholder="Ej. 123 Brewster Ave, Apt 2"
                    required
                    value={address.street}
                  />
                </label>
                <label className="customer-field">
                  Vecindario
                  <input
                    autoComplete="address-level3"
                    name="neighborhood"
                    onChange={(event) => handleAddressChange('neighborhood', event.target.value)}
                    placeholder="Capitol Hill"
                    required
                    value={address.neighborhood}
                  />
                </label>
                <label className="customer-field">
                  Ciudad
                  <input
                    autoComplete="address-level2"
                    name="city"
                    onChange={(event) => handleAddressChange('city', event.target.value)}
                    placeholder="Seattle"
                    required
                    value={address.city}
                  />
                </label>
                <label className="customer-field">
                  Estado
                  <input
                    autoComplete="address-level1"
                    maxLength={2}
                    name="state"
                    onChange={(event) => handleAddressChange('state', event.target.value.toUpperCase())}
                    placeholder="WA"
                    pattern="[A-Za-z]{2}"
                    required
                    value={address.state}
                  />
                </label>
                <label className="customer-field">
                  Código postal (ZIP) <span>(opcional)</span>
                  <input
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={5}
                    name="postalCode"
                    onChange={(event) => handleAddressChange('postalCode', event.target.value)}
                    pattern="[0-9]{5}"
                    placeholder="98102"
                    value={address.postalCode}
                  />
                </label>
                <label className="customer-field">
                  Instrucciones de entrega <span>(opcional)</span>
                  <input
                    name="instructions"
                    onChange={(event) => handleAddressChange('instructions', event.target.value)}
                    placeholder="Gate code, building entrance..."
                    value={address.instructions}
                  />
                </label>
                <div className="customer-address-actions">
                  <span className="customer-address-message" role="status">{addressMessage}</span>
                  <button className="customer-secondary-button" type="submit">
                    <MapPin size={15} /> Guardar dirección
                  </button>
                </div>
              </form>
            </section>

            <section className="customer-member-card" id="membresia">
              <div className="customer-member-top">
                <div>
                  <span className="customer-member-kicker">TUESTE · TARJETA DE SOCIO</span>
                  <h2>Saldo Tueste</h2>
                </div>
                <span className="customer-member-logo"><Coffee size={21} /></span>
              </div>
              <div className="customer-wallet-balance">
                <span>SALDO DISPONIBLE</span>
                <strong>{formatPrice(loyaltyBalance)}</strong>
                <p><CircleDollarSign size={14} /> Acumulas 3% del total de cada pedido, incluido envío.</p>
              </div>
              <div className="customer-member-details">
                <div>
                  <span>TITULAR</span>
                  <strong>{firstName}</strong>
                </div>
                <div>
                  <span>NÚMERO DE SOCIA</span>
                  <strong>TUE-00428-ANA</strong>
                </div>
              </div>
              <span className="customer-member-disclaimer">Saldo de demostración · se guarda en este navegador</span>
            </section>

            {hasOrdered && (
              <section className="customer-referral-section">
                <button
                  aria-expanded={showReferralProgress}
                  aria-controls="customer-referral-progress"
                  className="customer-referral-toggle"
                  onClick={() => {
                    setReferralStatus(getReferralStatus(currentUser?.username || ''));
                    setShowReferralProgress((visible) => !visible);
                  }}
                  type="button"
                >
                  <Gift size={16} />
                  {showReferralProgress ? 'Ocultar progreso de invitaciones' : 'Ver progreso de invitaciones'}
                  <ArrowDownRight className={showReferralProgress ? 'customer-referral-chevron-open' : ''} size={15} />
                </button>
                {showReferralProgress && (
                  <div className="customer-referral-progress" id="customer-referral-progress">
                    <span className="customer-referral-kicker">INVITA Y GANA</span>
                    <h2>Tu progreso, {firstName}</h2>
                    <p>
                      Sube de nivel y gana hasta <strong>$15</strong> en tu tarjeta. Al completar los tres,
                      comienzas un nuevo ciclo.
                    </p>
                    <div className="customer-referral-current-level">
                      <span>NIVEL {referralStatus.currentLevel.number}</span>
                      <strong>{referralStatus.currentLevel.name}</strong>
                      <small>Próxima recompensa: {formatPrice(referralStatus.nextRewardAmount)}</small>
                    </div>
                    <div className="customer-referral-progress-heading">
                      <span>Progreso del nivel</span>
                      <strong>{referralStatus.progressInLevel}/{referralStatus.referralsForCurrentLevel}</strong>
                    </div>
                    <div
                      aria-label={`${referralStatus.progressInLevel} de ${referralStatus.referralsForCurrentLevel} registros para completar el nivel ${referralStatus.currentLevel.number}`}
                      className="customer-referral-progress-track"
                    >
                      <span style={{ width: `${(referralStatus.progressInLevel * 100) / referralStatus.referralsForCurrentLevel}%` }} />
                    </div>
                    <div className="customer-referral-summary">
                      <span>{referralStatus.count} {referralStatus.count === 1 ? 'persona registrada' : 'personas registradas'} en total</span>
                      <strong>{referralStatus.earnedRewards} {referralStatus.earnedRewards === 1 ? 'nivel completado' : 'niveles completados'}</strong>
                    </div>
                    <div className="customer-referral-level-list">
                      {REFERRAL_LEVELS.map((level) => (
                        <div
                          className={level.number === referralStatus.currentLevel.number ? 'customer-referral-level-current' : ''}
                          key={level.number}
                        >
                          <span>Nivel {level.number} · {level.name}</span>
                          <strong>{level.referrals} invitaciones · {formatPrice(level.rewardUsd)}</strong>
                        </div>
                      ))}
                    </div>
                    <a className="customer-referral-share" href={invitationPageLink}>
                      <Gift size={14} /> Compartir mi enlace de invitación <ArrowRight size={14} />
                    </a>
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="customer-cart-panel" id="carrito">
            <div className="customer-cart-heading">
              <div>
                <span className="customer-section-kicker">ALGO RICO VIENE EN CAMINO</span>
                <h2>Tu carrito <span>({cartCount})</span></h2>
              </div>
              <span className="customer-section-icon"><ShoppingCart size={18} /></span>
            </div>

            {orderConfirmation && (
              <div className="customer-order-success" role="status">
                <PackageCheck size={20} />
                <div className="customer-order-success-copy">
                  <span>{orderConfirmation}</span>
                  <a href={invitationEmailLink}>
                    <Mail size={13} /> Preparar correo de invitación
                  </a>
                  <small>Se abrirá un borrador en tu app de correo; tendrás que enviarlo.</small>
                </div>
                <button aria-label="Cerrar confirmación" onClick={() => setOrderConfirmation('')} type="button">
                  <X size={15} />
                </button>
              </div>
            )}

            {cartItems.length === 0 ? (
              <div className="customer-cart-empty">
                <span><ShoppingBag size={21} /></span>
                <strong>Tu carrito está esperando.</strong>
                <p>Agrega un café o algo de pan para empezar tu pedido.</p>
                <a href="#menu-cliente">Ver el menú <ArrowDownRight size={14} /></a>
              </div>
            ) : (
              <div className="customer-cart-items">
                {cartItems.map((item) => (
                  <div className="customer-cart-item" key={item.id}>
                    <img src={item.image} alt="" />
                    <div className="customer-cart-item-info">
                      <strong>{item.name}</strong>
                      <span>{formatPrice(item.price)}</span>
                      <div className="customer-quantity-control">
                        <button
                          aria-label={`Quitar una unidad de ${item.name}`}
                          onClick={() => updateQuantity(item.id, -1)}
                          type="button"
                        >
                          <Minus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          aria-label={`Añadir una unidad de ${item.name}`}
                          onClick={() => updateQuantity(item.id, 1)}
                          type="button"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <strong className="customer-cart-item-total">
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>
            )}

            <div className="customer-cart-totals">
              <div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
              <div><span>Envío</span><strong>{deliveryFee ? formatPrice(deliveryFee) : '—'}</strong></div>
              <div className="customer-cart-reward">
                <span>Acumulas (3%)</span>
                <strong>+{formatPrice(rewardEarned)}</strong>
              </div>
              {loyaltyApplied > 0 && (
                <div className="customer-cart-credit">
                  <span>Saldo de socio aplicado</span>
                  <strong>−{formatPrice(loyaltyApplied)}</strong>
                </div>
              )}
              <div className="customer-cart-total">
                <span>{loyaltyApplied ? 'Total a pagar' : 'Total'}</span>
                <strong>{formatPrice(amountDue)}</strong>
              </div>
            </div>
            <label className={`customer-wallet-payment${!loyaltyBalance || !cartCount ? ' customer-wallet-disabled' : ''}`}>
              <input
                checked={useLoyaltyBalance}
                disabled={!loyaltyBalance || !cartCount}
                onChange={(event) => setUseLoyaltyBalance(event.target.checked)}
                type="checkbox"
              />
              <span className="customer-wallet-checkbox"><Check size={12} /></span>
              <span className="customer-wallet-option">
                <strong>Usar saldo de socio</strong>
                <small>Disponible: {formatPrice(loyaltyBalance)}</small>
              </span>
              <CreditCard size={17} />
            </label>
            {!savedAddress && cartCount > 0 && (
              <a className="customer-address-hint" href="#direccion">
                <MapPin size={14} /> Añade tu dirección para continuar
              </a>
            )}
            <button
              className="customer-checkout-button"
              disabled={!cartCount || !savedAddress}
              onClick={handleOrder}
              type="button"
            >
              Confirmar pedido <ArrowRight size={16} />
            </button>
            <p className="customer-demo-note">
              <CreditCard size={13} /> Saldo aplicado como pago · pedido de demostración.
            </p>
          </aside>
        </div>
      </div>

      <footer className="customer-footer">
        <span><Coffee size={15} /> Tueste · Café de especialidad</span>
        <a href="#inicio">Volver arriba <ArrowUpRight size={14} /></a>
        <span className="customer-footer-user"><UserRound size={14} /> Sesión de {firstName}</span>
      </footer>
    </main>
  );
};
