import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type AppRole = 'admin' | 'warehouse_manager' | 'delivery_partner' | 'customer';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  sendOtp: (phone: string, fullName: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  resendOtp: (phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readableAuthError(): string {
  return 'We could not complete that request. Please check your number and try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRole = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle();
    if (error) {
      console.error('Could not load account role', error);
      setRole(null);
      return;
    }
    setRole((data?.role as AppRole | undefined) ?? 'customer');
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) void loadRole(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession?.user) {
        void (async () => { await loadRole(nextSession.user.id); })();
      } else {
        setRole(null);
      }
      if (event === 'SIGNED_OUT') setLoading(false);
    });

    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [loadRole]);

  const sendOtp = useCallback(async (phone: string, fullName: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone, options: { data: { full_name: fullName.trim() } } });
    return { error: error ? readableAuthError() : null };
  }, []);

  const resendOtp = useCallback(async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
    return { error: error ? readableAuthError() : null };
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    return { error: error ? readableAuthError() : null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
  }, []);

  const value = useMemo(() => ({ session, user: session?.user ?? null, role, loading, sendOtp, verifyOtp, resendOtp, signOut }), [session, role, loading, sendOtp, verifyOtp, resendOtp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
