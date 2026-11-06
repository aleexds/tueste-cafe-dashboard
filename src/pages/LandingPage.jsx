import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Coffee,
  Mail,
  MapPin,
  Phone,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const products = [
  {
    name: 'Flat white de la casa',
    category: 'ESPRESSO · LECHE SEDOSA',
    description: 'Doble espresso de la casa con leche cremosa y un toque dulce.',
    price: '$68',
    badge: 'EL FAVORITO',
    image:
      'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Flat white recién preparado con arte latte'
  },
  {
    name: 'V60 de temporada',
    category: 'MÉTODOS · ORIGEN INVITADO',
    description: 'Café de origen, preparado al momento para disfrutar cada nota.',
    price: '$85',
    badge: 'DE ORIGEN',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Café de especialidad preparado con método de filtrado'
  },
  {
    name: 'Roll de canela',
    category: 'PANADERÍA · HORNEADO HOY',
    description: 'Masa suave, canela aromática y glaseado ligero.',
    price: '$58',
    badge: 'RECIÉN HORNEADO',
    image:
      'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Pan dulce recién horneado para acompañar el café'
  }
];

const reviews = [
  {
    quote: 'El flat white está buenísimo y el lugar invita a quedarte un rato más.',
    name: 'Mariana R.',
    detail: 'Vecina de la Roma'
  },
  {
    quote: 'Me recomendaron un café de Veracruz y ahora es mi parada de cada sábado.',
    name: 'Diego M.',
    detail: 'Viene por su V60'
  },
  {
    quote: 'Café rico, pan recién hecho y un equipo que te hace sentir en casa.',
    name: 'Sofía L.',
    detail: 'Visita frecuente'
  }
];

export const LandingPage = () => (
  <main className="landing">
    <header className="landing-header">
      <Link className="landing-brand" to="/" aria-label="Tueste, inicio">
        <span className="landing-brand-mark">
          <Coffee size={20} strokeWidth={1.8} />
        </span>
        <span>
          <strong>tueste</strong>
          <small>CAFÉ DE ESPECIALIDAD</small>
        </span>
      </Link>

      <nav className="landing-nav" aria-label="Navegación principal">
        <a href="#menu">Menú</a>
        <a href="#resenas">Reseñas</a>
        <a href="#visitanos">Encuéntranos</a>
      </nav>

      <a className="landing-nav-cta" href="#visitanos">
        Ven a visitarnos <ArrowUpRight size={16} />
      </a>
    </header>

    <section className="landing-hero">
      <div className="landing-hero-copy">
        <div className="landing-eyebrow">
          <span className="landing-eyebrow-dot" />
          CAFÉ DE ESPECIALIDAD · COLONIA ROMA
        </div>
        <h1>
          Un buen café
          <br />
          <em>hace el día.</em>
        </h1>
        <p>
          Café de origen, pan recién horneado y un lugarcito para bajar el
          ritmo. Pasa por tu taza favorita: aquí siempre hay lugar para una
          buena pausa.
        </p>
        <div className="landing-hero-actions">
          <a className="landing-button landing-button-primary" href="#menu">
            Descubre el menú <ArrowRight size={17} />
          </a>
          <a className="landing-text-link" href="#visitanos">
            Cómo llegar <ArrowDownRight size={16} />
          </a>
        </div>
        <div className="landing-proof">
          <span className="landing-proof-icon">
            <Clock3 size={17} />
          </span>
          <span>Todos los días · café servido con calma desde las 8:00.</span>
        </div>
      </div>

      <div className="landing-hero-visual" aria-label="Café recién preparado en Tueste">
        <div className="landing-photo-wash" />
        <div className="landing-photo-caption">
          <span>CAFÉ, PAN Y BUENA COMPAÑÍA</span>
          <span className="landing-caption-rule" />
          <span>ROMA NORTE · CDMX</span>
        </div>
        <div className="landing-insight-card">
          <div className="landing-insight-top">
            <span>HOY EN TUESTE</span>
            <span className="landing-insight-icon">
              <Coffee size={16} />
            </span>
          </div>
          <strong className="landing-card-title">Tu pausa<span> favorita</span></strong>
          <p>Un buen café, preparado al momento.</p>
          <div className="landing-insight-divider" />
          <div className="landing-insight-bottom">
            <span>ABRIMOS</span>
            <b>8:00 — 20:00</b>
          </div>
          <small>Te esperamos en la Roma Norte</small>
        </div>
        <div className="landing-photo-tag">
          <span className="landing-tag-dot" />
          HECHO AL MOMENTO, PARA DISFRUTAR SIN PRISA
        </div>
      </div>

      <div className="landing-hero-index" aria-hidden="true">
        <span>01</span>
        <span className="landing-index-line" />
        <span>03</span>
      </div>
    </section>

    <section className="landing-method landing-products-section" id="menu">
      <div className="landing-section-heading">
        <span className="landing-section-kicker">DE LA BARRA A TU MESA</span>
        <h2>Los favoritos de la casa.</h2>
        <p>
          Café de especialidad y algo rico para acompañarlo. Todo preparado con
          cariño, justo como te gusta.
        </p>
      </div>
      <div className="landing-products">
        {products.map((product) => (
          <article className="landing-product" key={product.name}>
            <div className="landing-product-image-wrap">
              <img
                className="landing-product-image"
                src={product.image}
                alt={product.imageAlt}
                loading="lazy"
              />
              <span className="landing-product-badge">{product.badge}</span>
            </div>
            <div className="landing-product-details">
              <span className="landing-product-category">{product.category}</span>
              <div className="landing-product-title-row">
                <h3>{product.name}</h3>
                <strong>{product.price}</strong>
              </div>
              <p>{product.description}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="landing-menu-note">
        Precios en MXN. Pregúntanos por el origen de la semana y las opciones de
        leche vegetal.
      </p>
    </section>

    <section className="landing-reviews" id="resenas">
      <div className="landing-section-heading">
        <span className="landing-section-kicker">PALABRAS QUE NOS ALEGRAN EL DÍA</span>
        <h2>Un café sabe mejor en buena compañía.</h2>
      </div>
      <div className="landing-review-grid">
        {reviews.map((review) => (
          <article className="landing-review" key={review.name}>
            <div className="landing-review-stars" aria-label="5 de 5 estrellas">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} size={14} fill="currentColor" strokeWidth={1.4} />
              ))}
            </div>
            <blockquote>“{review.quote}”</blockquote>
            <div className="landing-review-author">
              <span className="landing-review-avatar">
                {review.name.charAt(0)}
              </span>
              <span>
                <strong>{review.name}</strong>
                <small>{review.detail}</small>
              </span>
            </div>
          </article>
        ))}
      </div>
      <p className="landing-review-note">
        Reseñas de ejemplo para la maqueta de Tueste.
      </p>
    </section>

    <section className="landing-bottom-cta" id="visitanos">
      <div className="landing-contact-intro">
        <span className="landing-section-kicker">TU MESA TE ESPERA</span>
        <h2>Nos vemos para un cafecito.</h2>
        <p>Estamos en la Roma Norte. Pasa por tu bebida favorita o salúdanos.</p>
      </div>
      <div className="landing-contact-details">
        <a
          className="landing-contact-item"
          href="https://maps.google.com/?q=Colima+145%2C+Roma+Norte%2C+Ciudad+de+Mexico"
          target="_blank"
          rel="noreferrer"
        >
          <span className="landing-contact-icon"><MapPin size={18} /></span>
          <span>
            <small>ENCUÉNTRANOS</small>
            <strong>Colima 145, Roma Norte, CDMX</strong>
          </span>
          <ArrowUpRight className="landing-contact-arrow" size={15} />
        </a>
        <div className="landing-contact-hours">
          <span className="landing-contact-icon"><Clock3 size={18} /></span>
          <span>
            <small>HORARIO</small>
            <strong>Lun–Vie 8:00–20:00 · Sáb–Dom 9:00–21:00</strong>
          </span>
        </div>
        <a className="landing-contact-item" href="tel:+525541627083">
          <span className="landing-contact-icon"><Phone size={17} /></span>
          <span>
            <small>LLÁMANOS</small>
            <strong>+52 55 4162 7083</strong>
          </span>
        </a>
        <a className="landing-contact-item" href="mailto:hola@tuestecafe.mx">
          <span className="landing-contact-icon"><Mail size={17} /></span>
          <span>
            <small>ESCRÍBENOS</small>
            <strong>hola@tuestecafe.mx</strong>
          </span>
        </a>
      </div>
    </section>

    <footer className="landing-footer">
      <Link className="landing-brand landing-brand-footer" to="/" aria-label="Tueste, inicio">
        <span className="landing-brand-mark">
          <Coffee size={18} strokeWidth={1.8} />
        </span>
        <span>
          <strong>tueste</strong>
          <small>CAFÉ DE ESPECIALIDAD</small>
        </span>
      </Link>
      <span>Café rico, pausas bonitas y buena compañía.</span>
      <a href="#menu">
        Ver el menú <ArrowUpRight size={14} />
      </a>
    </footer>
  </main>
);
