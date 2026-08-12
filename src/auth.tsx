import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type AppRole = 'admin' | 'warehouse_manager' | 'delivery_partner' | 'customer';

export interface ProfileData {
  id: string;
  personal_name: string | null;
  full_name: string;
  phone: string;
  business_name: string;
  avatar_url: string | null;
  registration_status: 'unregistered' | 'registered';
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  profile: ProfileData | null;
  loading: boolean;
  sendOtp: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  resendOtp: (phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readableAuthError(): string {
  return 'We could not complete that request. Please check your number and try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
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

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('id, personal_name, full_name, phone, business_name, avatar_url, registration_status').eq('id', userId).maybeSingle();
    if (error) {
      console.error('Could not load profile', error);
      setProfile(null);
      return;
    }
    if (data) {
      setProfile(data as ProfileData);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        void loadRole(data.session.user.id);
        void loadProfile(data.session.user.id);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession?.user) {
        void (async () => {
          await loadRole(nextSession.user.id);
          await loadProfile(nextSession.user.id);
        })();
      } else {
        setRole(null);
        setProfile(null);
      }
      if (event === 'SIGNED_OUT') setLoading(false);
    });

    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [loadRole, loadProfile]);

  const sendOtp = useCallback(async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
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
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const value = useMemo(() => ({ session, user: session?.user ?? null, role, profile, loading, sendOtp, verifyOtp, resendOtp, signOut, refreshProfile }), [session, role, profile, loading, sendOtp, verifyOtp, resendOtp, signOut, refreshProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
