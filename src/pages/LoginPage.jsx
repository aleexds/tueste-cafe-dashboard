import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Coffee,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserPlus,
  UserRound
} from 'lucide-react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { getAccountByUsername, getCurrentUser, registerCustomer, signIn } from '../auth';
import { recordReferral } from '../referrals';
import './LoginPage.css';

export const LoginPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isRegistering = searchParams.get('mode') === 'register';
  const referrer = searchParams.get('ref')?.trim().toLowerCase() || '';
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  if (currentUser && !isRegistering) {
    return <Navigate to={currentUser.role === 'admin' ? '/dashboard' : '/cliente'} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        if (referrer && getAccountByUsername(referrer)?.role !== 'customer') {
          setError('El enlace de invitación no es válido. Pide uno nuevo a tu contacto.');
          return;
        }

        const user = await registerCustomer({ username, email, password });
        if (referrer) recordReferral(referrer, user.username);
        setError('');
        navigate('/cliente', { replace: true });
        return;
      }

      const user = await signIn(username, email, password);
      if (!user) {
        setError('Revisa tu usuario, correo y contraseña. El correo debe coincidir con el de la cuenta.');
        return;
      }

      setError('');
      navigate(user.role === 'admin' ? '/dashboard' : '/cliente', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'No se pudo completar el acceso. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeMode = (register) => {
    const nextParams = new URLSearchParams(searchParams);
    if (register) nextParams.set('mode', 'register');
    else nextParams.delete('mode');
    setSearchParams(nextParams);
    setError('');
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
              {isRegistering ? 'ÚNETE A TUESTE' : 'TU ESPACIO EN TUESTE'}
            </span>
            <h1>{isRegistering ? 'Tu mesa te espera.' : 'Qué gusto verte.'}</h1>
            <p>
              {isRegistering
                ? referrer
                  ? 'Crea tu cuenta con este enlace de invitación y acompaña a alguien por un buen café.'
                  : 'Crea tu cuenta para pedir tus favoritos y acumular recompensas.'
                : 'Inicia sesión para continuar a tu espacio personal.'}
            </p>
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
                  const nextUsername = event.target.value;
                  setUsername(nextUsername);
                  if (nextUsername.trim().toLowerCase() === 'admin') {
                    setEmail('admin@gmail.com');
                  }
                  setError('');
                }}
                placeholder="Escribe tu usuario"
                minLength={isRegistering ? 3 : undefined}
                maxLength={isRegistering ? 24 : undefined}
                pattern={isRegistering ? '[A-Za-z0-9._\\-]{3,24}' : undefined}
                required
                type="text"
                value={username}
              />
            </div>

            <label className="login-email-label" htmlFor="login-email">Correo electrónico</label>
            <div className={`login-input-wrap${error ? ' login-input-error' : ''}`}>
              <Mail size={17} aria-hidden="true" />
              <input
                autoComplete="email"
                id="login-email"
                name="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError('');
                }}
                placeholder={username.trim().toLowerCase() === 'admin' ? 'admin@gmail.com' : 'tu@correo.com'}
                required
                type="email"
                value={email}
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
                minLength={isRegistering ? 8 : undefined}
                placeholder={isRegistering ? 'Mínimo 8 caracteres' : 'Escribe tu contraseña'}
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

            <button className="login-submit" disabled={isSubmitting} type="submit">
              {isSubmitting
                ? 'Un momento...'
                : isRegistering
                  ? <><UserPlus size={16} /> Crear cuenta</>
                  : <>Iniciar sesión <ArrowRight size={17} /></>}
            </button>
          </form>

          <div className="login-mode-switch">
            {isRegistering ? '¿Ya tienes una cuenta?' : '¿Primera vez en Tueste?'}
            <button onClick={() => changeMode(!isRegistering)} type="button">
              {isRegistering ? 'Inicia sesión' : 'Crear cuenta'}
            </button>
          </div>

          <div className="login-demo-note">
            <ShieldCheck size={17} />
            <p>
              <strong>Acceso de demostración</strong>
              <span>Cliente: ana / anasolution · Admin: admin / adminsolution. Las cuentas nuevas se guardan en este navegador.</span>
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
          <span>SEATTLE, WA · SINCE 2024</span>
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
