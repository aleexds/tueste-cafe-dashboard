import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Coffee,
  Copy,
  Gift,
  Mail,
  MessageCircle,
  Share2,
  Users,
  X
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAccountByUsername, getCurrentUser } from '../auth';
import { createReferralLink, getReferralStatus, REFERRAL_LEVELS } from '../referrals';
import './InvitationPage.css';

export const InvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const username = (searchParams.get('ref') || currentUser?.username || '').trim().toLowerCase();
  const inviter = username ? getAccountByUsername(username) : null;
  const referralLink = inviter?.role === 'customer' ? createReferralLink(username) : '';
  const shareMessage = '¡Vamos por un buen café! Regístrate con mi invitación a Tueste y recibe $3 en tu tarjeta de socio.';
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${referralLink}`)}`;
  const emailLink = `mailto:?subject=${encodeURIComponent('Una invitación a Tueste Café')}&body=${encodeURIComponent(`${shareMessage}\n\n${referralLink}`)}`;
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');
  const status = inviter?.role === 'customer' ? getReferralStatus(username) : null;
  const firstName = inviter?.username
    ? inviter.username.charAt(0).toUpperCase() + inviter.username.slice(1)
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setShareError('');
    } catch {
      setShareError('No se pudo copiar el enlace. Selecciónalo y cópialo manualmente.');
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      setShareError('Tu navegador no ofrece el menú para compartir. Usa WhatsApp, correo o copia el enlace.');
      return;
    }

    try {
      await navigator.share({ title: 'Invitación a Tueste Café', text: shareMessage, url: referralLink });
      setShareError('');
    } catch (error) {
      if (error.name !== 'AbortError') {
        setShareError('No se pudo abrir el menú para compartir. Prueba otra opción.');
      }
    }
  };

  const handleClose = () => {
    navigate(currentUser?.role === 'customer' ? '/cliente' : '/login', { replace: true });
  };

  return (
    <main className="invitation-page">
      <section aria-label="Invitación Tueste" aria-modal="true" className="invitation-dialog" role="dialog">
        <button aria-label="Cerrar invitación" className="invitation-close" onClick={handleClose} type="button">
          <X size={18} />
        </button>
        <a className="invitation-brand" href="/" aria-label="Tueste, inicio">
          <span><Coffee size={18} /></span>
          <strong>tueste</strong>
        </a>

        {referralLink ? (
          <>
            <div className="invitation-icon"><Gift size={22} /></div>
            <span className="invitation-kicker">INVITA A ALGUIEN A TUESTE</span>
            <h1>Un buen café<br /><em>se disfruta en compañía.</em></h1>
            <p className="invitation-copy">
              {firstName}, comparte tu enlace y sube tres niveles para ganar hasta
              <strong> $15 en tu tarjeta de socio.</strong> Cada invitado recibe $3 de bienvenida.
            </p>

            <div className="invitation-link-box">
              <span>{referralLink}</span>
              <button aria-label="Copiar enlace de invitación" onClick={handleCopy} type="button">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            <div className="invitation-share-actions">
              <a className="invitation-share-whatsapp" href={whatsappLink} rel="noreferrer" target="_blank">
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a className="invitation-share-email" href={emailLink}>
                <Mail size={16} /> Correo
              </a>
              <button className="invitation-share-native" onClick={handleNativeShare} type="button">
                <Share2 size={16} /> Otras apps
              </button>
            </div>

            {shareError && <p className="invitation-error" role="alert">{shareError}</p>}

            <div className="invitation-progress">
              <div className="invitation-current-level">
                <span>NIVEL {status.currentLevel.number}</span>
                <strong>{status.currentLevel.name}</strong>
                <small>Próxima recompensa: ${status.nextRewardAmount}</small>
              </div>
              <div className="invitation-progress-heading">
                <span><Users size={15} /> Progreso del nivel</span>
                <strong>{status.progressInLevel}/{status.referralsForCurrentLevel}</strong>
              </div>
              <div
                aria-label={`${status.progressInLevel} de ${status.referralsForCurrentLevel} registros para completar el nivel ${status.currentLevel.number}`}
                className="invitation-progress-track"
              >
                <span style={{ width: `${(status.progressInLevel * 100) / status.referralsForCurrentLevel}%` }} />
              </div>
              <p>
                {status.countToNextReward === 1
                  ? `¡Un registro más y ganas $${status.nextRewardAmount}!`
                  : `Te faltan ${status.countToNextReward} registros para ganar $${status.nextRewardAmount}.`}
                {status.completedCycles > 0 && ` Ciclos completados: ${status.completedCycles}.`}
                {status.earnedRewards > 0 && ` Niveles completados: ${status.earnedRewards}.`}
              </p>
              <div className="invitation-level-list">
                {REFERRAL_LEVELS.map((level) => (
                  <div
                    className={level.number === status.currentLevel.number ? 'invitation-level-current' : ''}
                    key={level.number}
                  >
                    <span>Nivel {level.number} · {level.name}</span>
                    <strong>{level.referrals} invitaciones · ${level.rewardUsd}</strong>
                  </div>
                ))}
              </div>
            </div>

            <a className="invitation-back-link" href="/cliente">
              Volver a Tueste <ArrowRight size={15} />
            </a>
          </>
        ) : (
          <div className="invitation-invalid">
            <h1>Este enlace no es válido.</h1>
            <p>Inicia sesión como cliente para crear tu enlace personal de invitación.</p>
            <button className="invitation-primary-button" onClick={() => navigate('/login')} type="button">
              Ir al inicio de sesión <ArrowRight size={15} />
            </button>
          </div>
        )}
        <small className="invitation-demo-note">Programa de demostración · recompensas guardadas en este navegador</small>
      </section>
    </main>
  );
};
