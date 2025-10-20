import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type RecommendedProduct = { id: number; name: string; price: number; image_url: string | null; barcode: string; };

const Profile = () => {
  const { user } = useAuth();
  const [profileName, setProfileName] = useState<string>(''); // Estado para o nome do perfil
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchRecommendations();
    }
  }, [user]);
  
  // Função para buscar o nome do utilizador na tabela 'profiles'
  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      if (data) setProfileName(data.full_name || user.email!);
      
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      setProfileName(user.email!); // Usa o email como fallback
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Buscar recomendações direto do Supabase
      const { data, error } = await supabase
        .rpc('get_user_recommendations', { p_user_id: user.id });
      
      if (error) throw error;
      setRecommendations(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar recomendações:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${profileName}`} />
                <AvatarFallback className="text-2xl bg-gradient-primary text-white">{getInitials(profileName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground">{profileName || 'A carregar...'}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Produtos Mais Escaneados</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Baseado no seu histórico de scans</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">A carregar recomendações...</p>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recommendations.map((product) => (
                  <Card key={product.id} className="border-0 shadow-soft hover:shadow-medium transition-all duration-200">
                    <CardContent className="p-4 space-y-3">
                      <div className="aspect-square w-full bg-muted rounded-2xl overflow-hidden">
                        <img 
                          src={product.image_url || "/placeholder.svg"} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground line-clamp-2">{product.name}</p>
                        <p className="text-lg font-bold text-primary mt-1">R$ {product.price.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">{product.barcode}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">Ainda não há recomendações</p>
                <p className="text-sm text-muted-foreground">Use o scanner para começar a escanear produtos!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;