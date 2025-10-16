import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

type RecommendedProduct = {
  id: number;
  name: string;
  image_url: string | null;
  scan_count: number;
};

const Profile = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 1. Usar uma RPC (Remote Procedure Call) no Supabase para buscar e contar os produtos
      // Esta é uma forma mais avançada e eficiente de fazer a contagem diretamente no banco de dados.
      // Primeiro, precisamos criar esta função no Supabase (ver passo extra abaixo).
      const { data, error } = await supabase.rpc('get_user_recommendations', {
        p_user_id: user.id
      });

      if (error) {
        throw error;
      }

      setRecommendations(data);

    } catch (error: any) {
      console.error("Erro ao buscar recomendações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as suas recomendações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Extrai as iniciais do email para o Avatar
  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : '??';
  };

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.email}`} />
                <AvatarFallback>{user ? getInitials(user.email!) : '...'}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">Meu Perfil</CardTitle>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Produtos Recomendados para Si</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>A carregar recomendações...</p>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {recommendations.map((product) => (
                  <div key={product.id} className="border rounded-lg p-3 text-center space-y-2">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-md mx-auto"
                    />
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Escaneado {product.scan_count} vezes</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <p>Ainda não há recomendações.</p>
                <p className="text-sm">Use o scanner para começar a criar o seu histórico!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;