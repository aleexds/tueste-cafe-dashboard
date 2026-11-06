const AUTH_STORAGE_KEY = 'tueste-demo-user';
const DEMO_ACCOUNTS = {
  ana: { password: 'anasolution', role: 'customer' },
  admin: { password: 'adminsolution', role: 'admin' }
};

export const getCurrentUser = () => {
  const storedUser = sessionStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser);
    const account = DEMO_ACCOUNTS[user.username];

    return account?.role === user.role
      ? { username: user.username, role: user.role }
      : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = (role) => {
  const user = getCurrentUser();
  return Boolean(user && (!role || user.role === role));
};

export const signIn = (username, password) => {
  const normalizedUsername = username.trim().toLowerCase();
  const account = DEMO_ACCOUNTS[normalizedUsername];

  if (!account || password !== account.password) return null;

  const user = { username: normalizedUsername, role: account.role };
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  return user;
};

export const signOut = () => {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
};
