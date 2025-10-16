import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';
import { supabase } from '@/integrations/supabase/client'; // Importar o Supabase client

type RecommendedProduct = { id: number; name: string; image_url: string | null; barcode: string; };
const AI_API_URL = 'http://127.0.0.1:8001/recommendations/';

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
      const response = await axios.get(`${AI_API_URL}${user.id}`);
      setRecommendations(response.data.recommendations);
    } catch (error: any) {
      console.error("Erro ao buscar recomendações:", error);
      toast({ title: "Erro", description: "Não foi possível carregar as recomendações.", variant: "destructive", });
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
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${profileName}`} />
                <AvatarFallback>{getInitials(profileName)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profileName || 'A carregar...'}</CardTitle>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* O resto do componente de recomendações permanece igual... */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Recomendações da IA para Si</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>A carregar recomendações...</p>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {recommendations.map((product) => (
                  <div key={product.id} className="border rounded-lg p-3 text-center space-y-2">
                    <img src={product.image_url || "/placeholder.svg"} alt={product.name} className="w-full h-32 object-cover rounded-md mx-auto" />
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{product.barcode}</p>
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