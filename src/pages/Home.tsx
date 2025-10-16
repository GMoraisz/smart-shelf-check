import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 
import { Scan, Star, Clock, User, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import axios from 'axios';

interface RecommendedProduct {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  barcode: string;
}

interface RecentScan {
  created_at: string;
  products: {
    name: string;
    price: number;
  } | null;
}

const AI_API_URL = 'http://127.0.0.1:8001/recommendations/';

const Home = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [scanCount, setScanCount] = useState<number>(0);
  const [recentScan, setRecentScan] = useState<RecentScan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchRecommendations();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const { count, error: countError } = await supabase
        .from('scan_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;
      setScanCount(count || 0);

      const { data: recentData, error: recentError } = await supabase
        .from('scan_history')
        .select(`created_at, products (name, price)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (recentError && recentError.code !== 'PGRST116') {
        throw recentError;
      }
      if (recentData) setRecentScan(recentData as RecentScan);

    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(`${AI_API_URL}${user.id}`);
      setRecommendedProducts(response.data.recommendations || []);
    } catch (error) {
      console.error("Erro ao buscar recomendações da IA:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      id: 'scanner',
      title: 'Scanner QR',
      description: 'Escaneie códigos para ver preços',
      icon: Scan,
      color: 'bg-gradient-primary',
      route: '/scanner'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 sm:p-6 rounded-b-3xl shadow-medium">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}! 👋
            </h1>
            <p className="text-white/80">Pronto para economizar hoje?</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-6">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center space-x-2">
              <Scan className="w-5 h-5" />
              <span className="text-sm font-medium">Produtos Escaneados</span>
            </div>
            <p className="text-2xl font-bold mt-1">{scanCount}</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Card
                key={action.id}
                className="border-0 shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer"
                onClick={() => navigate(action.route)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center shadow-soft`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recommended Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Recomendados pela IA</h2>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/perfil')}>
              Ver todos
            </Button>
          </div>
          
          {loading ? (
            <p>A carregar recomendações...</p>
          ) : recommendedProducts.length > 0 ? (
            <div className="space-y-4">
              {recommendedProducts.slice(0, 3).map((product) => (
                <Card 
                  key={product.id}
                  className="border-0 shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={product.image_url || "/placeholder.svg"} 
                        alt={product.name}
                        className="w-16 h-16 bg-muted rounded-2xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{product.barcode}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary">
                          R$ {product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Ainda não há recomendações. Use o scanner!</p>
          )}
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Atividade Recente</h2>
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4">
              {recentScan && recentScan.products ? (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Último escaneamento</p>
                    <p className="text-sm text-muted-foreground">{recentScan.products.name} - R$ {recentScan.products.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(recentScan.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma atividade recente encontrada.</p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Home;