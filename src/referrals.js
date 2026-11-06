import { getAccountByUsername } from './auth';

const REFERRALS_STORAGE_KEY = 'tueste-demo-referrals';
const REWARDS_STORAGE_KEY = 'tueste-demo-referral-rewards';
const INVITEE_WELCOME_REWARD_USD = 3;
const REFERRAL_CYCLE_SIZE = 10;

export const REFERRAL_LEVELS = [
  { number: 1, name: 'Degustador', referrals: 3, rewardUsd: 8 },
  { number: 2, name: 'Explorador', referrals: 6, rewardUsd: 12 },
  { number: 3, name: 'Maestro tostador', referrals: 10, rewardUsd: 15 }
];

const readStoredValue = (key, fallback) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : fallback;
};

const getReferralRecords = () => readStoredValue(REFERRALS_STORAGE_KEY, []);
const getRewardRecords = () => readStoredValue(REWARDS_STORAGE_KEY, []);

export const getReferralStatus = (username) => {
  const normalizedUsername = username.trim().toLowerCase();
  const referrals = getReferralRecords().filter((record) => record.referrer === normalizedUsername);
  const earnedRewards = getRewardRecords().filter((record) => record.username === normalizedUsername).length;
  const count = referrals.length;
  const countInCycle = count % REFERRAL_CYCLE_SIZE;
  const currentLevelIndex = countInCycle < REFERRAL_LEVELS[0].referrals
    ? 0
    : countInCycle < REFERRAL_LEVELS[1].referrals
      ? 1
      : 2;
  const currentLevel = REFERRAL_LEVELS[currentLevelIndex];
  const previousLevelThreshold = currentLevelIndex === 0
    ? 0
    : REFERRAL_LEVELS[currentLevelIndex - 1].referrals;
  const referralsForCurrentLevel = currentLevel.referrals - previousLevelThreshold;
  const progressInLevel = countInCycle - previousLevelThreshold;

  return {
    count,
    countInCycle,
    completedCycles: Math.floor(count / REFERRAL_CYCLE_SIZE),
    currentLevel,
    progressInLevel,
    referralsForCurrentLevel,
    countToNextReward: currentLevel.referrals - countInCycle,
    nextRewardAmount: currentLevel.rewardUsd,
    earnedRewards,
  };
};

export const recordReferral = (referrer, referredUser) => {
  const normalizedReferrer = referrer.trim().toLowerCase();
  const normalizedReferred = referredUser.trim().toLowerCase();
  const inviter = getAccountByUsername(normalizedReferrer);

  if (!inviter || inviter.role !== 'customer' || normalizedReferrer === normalizedReferred) {
    return { recorded: false, rewarded: false, ...getReferralStatus(normalizedReferrer) };
  }

  const referrals = getReferralRecords();
  if (referrals.some((record) => record.referred === normalizedReferred)) {
    return { recorded: false, rewarded: false, ...getReferralStatus(normalizedReferrer) };
  }

  const referredBalanceKey = `tueste-loyalty-balance-usd-${normalizedReferred}`;
  const referredBalance = Number(localStorage.getItem(referredBalanceKey) || 0);
  if (!Number.isFinite(referredBalance) || referredBalance < 0) {
    throw new Error('No se pudo agregar el bono de bienvenida a la tarjeta de socio.');
  }

  referrals.push({
    referrer: normalizedReferrer,
    referred: normalizedReferred,
    welcomeRewardUsd: INVITEE_WELCOME_REWARD_USD,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem(REFERRALS_STORAGE_KEY, JSON.stringify(referrals));
  localStorage.setItem(
    referredBalanceKey,
    String(Math.round((referredBalance + INVITEE_WELCOME_REWARD_USD) * 100) / 100)
  );

  const referralCount = referrals.filter((record) => record.referrer === normalizedReferrer).length;
  const countInCycle = referralCount % REFERRAL_CYCLE_SIZE;
  const cycle = Math.floor((referralCount - 1) / REFERRAL_CYCLE_SIZE);
  const reachedLevel = countInCycle === 0 && referralCount > 0
    ? REFERRAL_LEVELS[REFERRAL_LEVELS.length - 1]
    : REFERRAL_LEVELS.find((level) => level.referrals === countInCycle);
  const rewards = getRewardRecords();
  const alreadyRewarded = reachedLevel && rewards.some(
    (record) => record.username === normalizedReferrer
      && record.cycle === cycle
      && record.level === reachedLevel.number
  );
  let rewarded = false;

  if (reachedLevel && !alreadyRewarded) {
    const balanceKey = `tueste-loyalty-balance-usd-${normalizedReferrer}`;
    const currentBalance = Number(localStorage.getItem(balanceKey) || 0);
    if (!Number.isFinite(currentBalance) || currentBalance < 0) {
      throw new Error('No se pudo actualizar el saldo de invitaciones.');
    }

    rewards.push({
      username: normalizedReferrer,
      cycle,
      level: reachedLevel.number,
      amountUsd: reachedLevel.rewardUsd,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(rewards));
    localStorage.setItem(
      balanceKey,
      String(Math.round((currentBalance + reachedLevel.rewardUsd) * 100) / 100)
    );
    rewarded = true;
  }

  return { recorded: true, rewarded, ...getReferralStatus(normalizedReferrer) };
};

export const createReferralLink = (username) => {
  const url = new URL('/invitacion', window.location.origin);
  url.searchParams.set('ref', username.trim().toLowerCase());
  return url.toString();
};

export const createInvitationEmailLink = (username) => {
  const url = new URL('/invitaciones', window.location.origin);
  url.searchParams.set('ref', username.trim().toLowerCase());
  return url.toString();
};
