import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  signUp as cognitoSignUp,
  confirmSignUp as cognitoConfirm,
  resendCode as cognitoResend,
  authenticate,
  getUserAttributes,
  signOut as cognitoSignOut,
  getCachedUser,
  getSession,
} from '../utils/cognito.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pendingRef = useRef(null);

  useEffect(() => {
    const cached = getCachedUser();
    if (!cached) { setLoading(false); return; }

    getSession(cached)
      .then((session) => {
        if (!session.isValid()) throw new Error('Session invalid');
        return getUserAttributes(cached);
      })
      .then((attrs) => setUser({ name: attrs.given_name || attrs.email, email: attrs.email }))
      .catch(() => {
        const u = getCachedUser();
        if (u) cognitoSignOut(u);
      })
      .finally(() => setLoading(false));
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const normalEmail = email.toLowerCase().trim();
    await cognitoSignUp(name, normalEmail, password);
    pendingRef.current = { email: normalEmail, password };
    return normalEmail;
  }, []);

  const resendCode = useCallback(async () => {
    if (!pendingRef.current) throw new Error('No pending signup');
    await cognitoResend(pendingRef.current.email);
  }, []);

  const confirmSignUp = useCallback(async (code) => {
    const pending = pendingRef.current;
    if (!pending) throw new Error('No pending signup. Please start again.');
    await cognitoConfirm(pending.email, code.trim());
    const data = await authenticate(pending.email, pending.password);
    pendingRef.current = null;
    const attrs = await getUserAttributes(data.user);
    setUser({ name: attrs.given_name || attrs.email, email: attrs.email });
  }, []);

  const login = useCallback(async (email, password) => {
    const normalEmail = email.toLowerCase().trim();
    const data = await authenticate(normalEmail, password);
    const attrs = await getUserAttributes(data.user);
    setUser({ name: attrs.given_name || attrs.email, email: attrs.email });
  }, []);

  const logout = useCallback(() => {
    const cached = getCachedUser();
    if (cached) cognitoSignOut(cached);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signup, confirmSignUp, resendCode, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
