import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Scan, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scanCount, setScanCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchScanCount();
    }
  }, [user]);

  const fetchScanCount = async () => {
    try {
      const { count, error } = await supabase
        .from('scan_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      if (error) throw error;
      setScanCount(count || 0);
    } catch (error) {
      console.error('Erro ao buscar quantidade de escaneamentos:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary text-white p-6 rounded-b-3xl shadow-medium">
        <div
          className="cursor-pointer"
          onClick={() => navigate('/perfil')}
        >
          <h1 className="text-2xl font-bold">
            Olá, {user?.email?.split('@')[0] || 'Usuário'} 👋
          </h1>
          <p className="text-white/80 mt-1">Pronto para economizar hoje?</p>
        </div>

        {/* Estatísticas */}
        <div className="mt-6 flex items-center justify-between bg-white/10 backdrop-blur rounded-2xl p-4 shadow-soft">
          <div className="flex items-center space-x-3">
            <Scan className="w-5 h-5" />
            <span className="text-sm font-medium">Escaneados</span>
          </div>
          <p className="text-3xl font-bold">{scanCount}</p>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 p-6 space-y-8">
        {/* Ação principal */}
        <section className="flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Comece escaneando agora
          </h2>
          <Button
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-lg px-10 py-6 rounded-2xl shadow-soft transition-all"
            onClick={() => navigate('/scanner')}
          >
            <Scan className="w-6 h-6 mr-2" />
            Abrir Scanner
          </Button>
        </section>

        {/* Histórico */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Atividade Recente
          </h2>
          <Card
            className="border-0 shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer"
            onClick={() => navigate('/historico')}
          >
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Ver histórico de escaneamentos</p>
                <p className="text-sm text-muted-foreground">
                  Toque para abrir
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Home;
