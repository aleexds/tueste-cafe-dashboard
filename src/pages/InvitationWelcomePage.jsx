import { ArrowRight, Coffee, Gift, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAccountByUsername } from '../auth';
import './InvitationPage.css';

export const InvitationWelcomePage = () => {
  const [searchParams] = useSearchParams();
  const username = (searchParams.get('ref') || '').trim().toLowerCase();
  const inviter = username ? getAccountByUsername(username) : null;
  const isValidInvitation = inviter?.role === 'customer';
  const firstName = inviter?.username
    ? inviter.username.charAt(0).toUpperCase() + inviter.username.slice(1)
    : '';
  const registrationUrl = `/login?mode=register&ref=${encodeURIComponent(username)}`;

  return (
    <main className="invitation-page">
      <section aria-label="Aviso de invitación a Tueste" className="invitation-dialog invitation-welcome">
        <a className="invitation-brand" href="/" aria-label="Tueste, inicio">
          <span><Coffee size={18} /></span>
          <strong>tueste</strong>
        </a>

        {isValidInvitation ? (
          <>
            <div className="invitation-icon"><Gift size={22} /></div>
            <span className="invitation-kicker">TIENES UNA INVITACIÓN</span>
            <h1>{firstName} te invita<br /><em>a disfrutar Tueste.</em></h1>
            <p className="invitation-copy">
              Crea tu cuenta con esta invitación y recibe <strong>$3 de bienvenida</strong> en tu tarjeta
              de socio para usar en tus pedidos.
            </p>
            <div className="invitation-welcome-benefit">
              <span><UserRound size={17} /></span>
              <p>
                <strong>Tu primera recompensa te espera</strong>
                <small>El bono se agrega a tu saldo al completar el registro con este enlace.</small>
              </p>
            </div>
            <Link className="invitation-welcome-continue" to={registrationUrl}>
              Continuar y crear mi cuenta <ArrowRight size={16} />
            </Link>
            <p className="invitation-welcome-login">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </>
        ) : (
          <div className="invitation-invalid">
            <h1>Esta invitación no es válida.</h1>
            <p>Pide a tu contacto que te comparta un enlace de invitación nuevo.</p>
            <Link className="invitation-welcome-continue" to="/login">
              Ir al inicio de sesión <ArrowRight size={15} />
            </Link>
          </div>
        )}

        <small className="invitation-demo-note">
          <ShieldCheck size={12} /> Programa de demostración · el bono se guarda en este navegador
        </small>
      </section>
    </main>
  );
};
