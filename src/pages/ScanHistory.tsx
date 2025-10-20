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

const ScanHistory = () => {
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
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="bg-gradient-primary text-white p-6 rounded-3xl shadow-medium mb-6">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <HistoryIcon className="h-6 w-6" />
          <span>Histórico de Scans</span>
        </h1>
        <p className="text-white/80 mt-1">Todos os seus produtos escaneados</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <ScrollArea className="h-[calc(100vh-250px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">A carregar histórico...</p>
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item, index) => (
                item.products && (
                  <Card 
                    key={index} 
                    className="border-0 shadow-soft hover:shadow-medium transition-all duration-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.products.image_url || "/placeholder.svg"}
                          alt={item.products.name}
                          className="w-20 h-20 object-cover rounded-2xl bg-muted"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{item.products.name}</p>
                          <p className="text-2xl font-bold text-primary mt-1">
                            R$ {Number(item.products.price).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(item.created_at).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-2">Histórico vazio</p>
              <p className="text-sm text-muted-foreground">Use o scanner para começar a escanear produtos!</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default ScanHistory;