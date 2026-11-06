const AUTH_STORAGE_KEY = 'tueste-demo-user';
const DEMO_USERNAME = 'ana';
const DEMO_PASSWORD = 'anasolution';

export const isAuthenticated = () =>
  sessionStorage.getItem(AUTH_STORAGE_KEY) === DEMO_USERNAME;

export const signIn = (username, password) => {
  const isValid =
    username.trim().toLowerCase() === DEMO_USERNAME &&
    password === DEMO_PASSWORD;

  if (isValid) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, DEMO_USERNAME);
  }

  return isValid;
};

export const signOut = () => {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
};
