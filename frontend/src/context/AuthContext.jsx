import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { connectSocket, disconnectSocket } from "../lib/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore existing session on mount — refresh if needed
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) console.error('❌ Session error:', error);

      // If session exists but token expires soon, refresh it now
      if (session) {
        const expiresAt = session.expires_at * 1000;
        if (expiresAt - Date.now() < 5 * 60_000) {
          console.log('🔄 Token expiring soon — refreshing...');
          const { data } = await supabase.auth.refreshSession();
          if (data?.session) {
            setSession(data.session);
            setUser(data.session.user);
            connectSocket(data.session.access_token);
            setLoading(false);
            return;
          }
        }
        console.log('✅ Session valid until:', new Date(expiresAt).toISOString());
      }

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) connectSocket(session.access_token);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        connectSocket(session.access_token);
      } else {
        disconnectSocket();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email, password, fullName) => {
    console.log('🔐 Attempting signup...', { email, fullName });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      },
    });
    
    if (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }
    
    console.log('✅ Signup successful:', data);
    
    // Check if email confirmation is required
    if (data?.user && !data?.session) {
      throw new Error('Please check your email to confirm your account');
    }
    
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
