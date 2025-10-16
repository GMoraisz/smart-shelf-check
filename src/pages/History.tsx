import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History as HistoryIcon, Package } from 'lucide-react';

type HistoryItem = {
  created_at: string;
  products: {
    id: number;
    name: string;
    image_url: string | null;
    price: number;
  } | null;
};

const History = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
   
      const { data, error } = await supabase
        .from('scan_history')
        .select(`
          created_at,
          products (
            id,
            name,
            image_url,
            price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setHistory(data as HistoryItem[]);
    } catch (error: any) {
      console.error("Erro ao buscar histórico:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o seu histórico de scans.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HistoryIcon className="h-5 w-5" />
            <span>Meu Histórico de Scans</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh]">
            {loading ? (
              <p className="text-center text-muted-foreground">A carregar histórico...</p>
            ) : history.length > 0 ? (
              <div className="space-y-4">
                {history.map((item, index) => (
                  item.products && (
                    <div key={index} className="flex items-center space-x-4 p-2 border-b">
                      <img
                        src={item.products.image_url || "/placeholder.svg"}
                        alt={item.products.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.products.name}</p>
                        <p className="text-sm text-green-600 font-bold">
                          R$ {Number(item.products.price).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <p>O seu histórico está vazio.</p>
                <p className="text-sm">Use o scanner para começar!</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;