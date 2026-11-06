import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Coffee,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signIn } from '../auth';
import './LoginPage.css';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const destination = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!signIn(username, password)) {
      setError('El usuario o la contraseña no son correctos. Inténtalo de nuevo.');
      return;
    }

    setError('');
    navigate(destination, { replace: true });
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <Link className="login-brand" to="/" aria-label="Volver al inicio">
          <span className="login-brand-mark">
            <Coffee size={20} strokeWidth={1.8} />
          </span>
          <span>
            <strong>tueste</strong>
            <small>CAFÉ DE ESPECIALIDAD</small>
          </span>
        </Link>

        <div className="login-content">
          <Link className="login-back-link" to="/">
            <ArrowLeft size={15} /> Volver a la cafetería
          </Link>

          <div className="login-heading">
            <span className="login-eyebrow">
              <span className="login-eyebrow-dot" />
              UN ESPACIO PARA EL EQUIPO
            </span>
            <h1>Qué gusto verte.</h1>
            <p>Inicia sesión para continuar a tu espacio de trabajo.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="login-username">Nombre de usuario</label>
            <div className={`login-input-wrap${error ? ' login-input-error' : ''}`}>
              <UserRound size={17} aria-hidden="true" />
              <input
                autoComplete="username"
                autoFocus
                id="login-username"
                name="username"
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError('');
                }}
                placeholder="Escribe tu usuario"
                required
                type="text"
                value={username}
              />
            </div>

            <div className="login-password-label">
              <label htmlFor="login-password">Contraseña</label>
            </div>
            <div className={`login-input-wrap${error ? ' login-input-error' : ''}`}>
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                autoComplete="current-password"
                id="login-password"
                name="password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
                placeholder="Escribe tu contraseña"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="login-toggle-password"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button className="login-submit" type="submit">
              Iniciar sesión <ArrowRight size={17} />
            </button>
          </form>

          <div className="login-demo-note">
            <ShieldCheck size={17} />
            <p>
              <strong>Acceso de demostración</strong>
              <span>Esta cuenta de prueba es solo para la maqueta.</span>
            </p>
          </div>
        </div>

        <footer className="login-footer">
          <span>Tueste · Un buen café hace el día.</span>
          <span>© 2026</span>
        </footer>
      </section>

      <aside className="login-visual" aria-label="Café recién preparado">
        <div className="login-visual-overlay" />
        <div className="login-visual-topline">
          <span>BUEN CAFÉ, BUENAS IDEAS</span>
          <span>CDMX · DESDE 2024</span>
        </div>
        <div className="login-visual-quote">
          <span className="login-quote-mark">“</span>
          <p>Las mejores ideas<br />empiezan con una pausa.</p>
          <span className="login-quote-rule" />
          <small>SIEMPRE HAY TIEMPO PARA UN BUEN CAFÉ.</small>
        </div>
        <div className="login-visual-caption">
          <Coffee size={16} />
          <span>Un espacio para hacer las cosas bien.</span>
        </div>
      </aside>
    </main>
  );
};
