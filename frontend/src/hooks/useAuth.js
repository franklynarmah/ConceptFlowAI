import { useState, useCallback } from 'react';

const KEY = 'cf_user';

function loadUser() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}

export function useAuth() {
  const [user, setUser] = useState(loadUser);

  const login = useCallback((email, password) => {
    if (!email || !password) throw new Error('All fields are required');
    const stored = JSON.parse(localStorage.getItem('cf_accounts') || '{}');
    const account = stored[email];
    if (!account) throw new Error('No account found. Please sign up.');
    if (account.password !== password) throw new Error('Incorrect password');
    const u = { name: account.name, email, plan: account.plan || 'starter' };
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const signup = useCallback((name, email, password) => {
    if (!name || !email || !password) throw new Error('All fields are required');
    const accounts = JSON.parse(localStorage.getItem('cf_accounts') || '{}');
    if (accounts[email]) throw new Error('An account with this email already exists');
    accounts[email] = { name, password, plan: 'starter' };
    localStorage.setItem('cf_accounts', JSON.stringify(accounts));
    const u = { name, email, plan: 'starter' };
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  return { user, login, signup, logout };
}
