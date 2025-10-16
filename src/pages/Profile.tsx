import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios'; // Importar axios

// Tipo para os produtos que virão da nossa API de IA
type RecommendedProduct = {
  id: number;
  name: string;
  image_url: string | null;
  barcode: string; // A API de IA retorna o barcode
};

// URL da nossa API de IA
const AI_API_URL = "https://pricechecker-ai.onrender.com";

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
      // **A LÓGICA AGORA BATE NA API DE IA**
      const response = await axios.get(`${AI_API_URL}${user.id}`);
      
      setRecommendations(response.data.recommendations || []);

    } catch (error: any) {
      console.error("Erro ao buscar recomendações da API de IA:", error);
      toast({
        title: "Erro de IA",
        description: "Não foi possível carregar as recomendações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
              <span>Recomendações da IA para Si</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>A carregar recomendações da nossa IA...</p>
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
                    <p className="text-xs text-muted-foreground font-mono">
                      {product.barcode}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <p>Ainda não há recomendações.</p>
                <p className="text-sm">Use o scanner para que a nossa IA possa aprender os seus gostos!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;