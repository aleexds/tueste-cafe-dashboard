const AUTH_STORAGE_KEY = 'tueste-demo-user';
const REGISTERED_USERS_KEY = 'tueste-demo-registered-users';
const DEMO_EMAILS_KEY = 'tueste-demo-account-emails';
const PASSWORD_HASH_ITERATIONS = 120000;

const DEMO_ACCOUNTS = {
  ana: { password: 'anasolution', role: 'customer' },
  admin: { password: 'adminsolution', role: 'admin', email: 'admin@gmail.com' }
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const readStoredValue = (key, fallback) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : fallback;
};

const getRegisteredUsers = () => readStoredValue(REGISTERED_USERS_KEY, []);
const getDemoEmails = () => readStoredValue(DEMO_EMAILS_KEY, {});

const createPasswordHash = async (password, salt) => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Este navegador no permite crear cuentas de demostración seguras.');
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: PASSWORD_HASH_ITERATIONS,
    hash: 'SHA-256'
  }, key, 256);

  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const createSession = (user) => {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  return user;
};

export const getAccountByUsername = (username) => {
  const normalizedUsername = username.trim().toLowerCase();
  const demoAccount = DEMO_ACCOUNTS[normalizedUsername];

  if (demoAccount) {
    return {
      username: normalizedUsername,
      email: demoAccount.email || getDemoEmails()[normalizedUsername] || '',
      role: demoAccount.role
    };
  }

  return getRegisteredUsers().find((user) => user.username === normalizedUsername) || null;
};

export const getCurrentUser = () => {
  const storedUser = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!storedUser) return null;

  const user = JSON.parse(storedUser);
  const account = getAccountByUsername(user.username);
  const email = account?.email || user.email || '';

  return account && account.role === user.role && email
    ? { username: account.username, email, role: account.role }
    : null;
};

export const isAuthenticated = (role) => {
  const user = getCurrentUser();
  return Boolean(user && (!role || user.role === role));
};

export const signIn = async (username, email, password) => {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = normalizeEmail(email);
  const demoAccount = DEMO_ACCOUNTS[normalizedUsername];

  if (demoAccount) {
    if (demoAccount.email) {
      if (password !== demoAccount.password || normalizedEmail !== demoAccount.email) return null;
      return createSession({ username: normalizedUsername, email: demoAccount.email, role: demoAccount.role });
    }

    const demoEmails = getDemoEmails();
    const emailAlreadyUsed = Object.entries(demoEmails).some(
      ([accountUsername, accountEmail]) => accountUsername !== normalizedUsername && accountEmail === normalizedEmail
    );
    if (password !== demoAccount.password
      || emailAlreadyUsed
      || (demoEmails[normalizedUsername] && demoEmails[normalizedUsername] !== normalizedEmail)) {
      return null;
    }

    demoEmails[normalizedUsername] = normalizedEmail;
    localStorage.setItem(DEMO_EMAILS_KEY, JSON.stringify(demoEmails));
    return createSession({ username: normalizedUsername, email: normalizedEmail, role: demoAccount.role });
  }

  const account = getRegisteredUsers().find((user) => user.username === normalizedUsername);
  if (!account || account.email !== normalizedEmail) return null;

  const salt = Uint8Array.from(account.salt.match(/.{2}/g) || [], (byte) => Number.parseInt(byte, 16));
  const passwordHash = await createPasswordHash(password, salt);
  if (passwordHash !== account.passwordHash) return null;

  return createSession({ username: account.username, email: account.email, role: account.role });
};

export const registerCustomer = async ({ username, email, password }) => {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = normalizeEmail(email);

  if (!/^[a-z0-9._-]{3,24}$/.test(normalizedUsername)) {
    throw new Error('El nombre debe tener entre 3 y 24 caracteres: letras, números, punto, guion o guion bajo.');
  }
  if (DEMO_ACCOUNTS[normalizedUsername] || getRegisteredUsers().some((user) => user.username === normalizedUsername)) {
    throw new Error('Ese nombre de usuario ya está registrado.');
  }
  const demoEmailAlreadyUsed = Object.values(getDemoEmails()).includes(normalizedEmail);
  if (demoEmailAlreadyUsed || getRegisteredUsers().some((user) => user.email === normalizedEmail)) {
    throw new Error('Ese correo ya está vinculado a otra cuenta.');
  }
  if (password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres.');
  }
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Este navegador no permite crear cuentas de demostración seguras.');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await createPasswordHash(password, salt);
  const account = {
    username: normalizedUsername,
    email: normalizedEmail,
    role: 'customer',
    salt: Array.from(salt, (byte) => byte.toString(16).padStart(2, '0')).join(''),
    passwordHash
  };
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify([...getRegisteredUsers(), account]));
  return createSession({ username: account.username, email: account.email, role: account.role });
};

export const signOut = () => {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
};
