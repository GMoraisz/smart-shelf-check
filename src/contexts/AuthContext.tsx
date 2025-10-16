// src/contexts/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Definir um tipo para os dados do perfil
interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

// Atualizar o tipo do contexto para incluir o perfil
interface AuthContextType {
  user: User | null;
  profile: Profile | null; // Adicionado
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // Adicionado
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para buscar o perfil do utilizador
    const fetchProfile = async (currentUser: User) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', currentUser.id)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do utilizador:", error);
      }
    };
    
    // Configura o listener de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // Se houver um utilizador, busca o perfil. Se não (logout), limpa o perfil.
        if (currentUser) {
          await fetchProfile(currentUser);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Verifica a sessão inicial ao carregar a aplicação
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      }
      setLoading(false);
    };

    getInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
  const value = { user, profile, session, loading, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};