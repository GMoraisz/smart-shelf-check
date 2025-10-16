import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface ScanHistory {
  id: number;
  created_at: string;
  product_id: number;
  product_name?: string;
  product_price?: number;
  product_image_url?: string;
}

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    if (user) {
      fetchScans();
    }
  }, [user, location.pathname]);

  const fetchScans = async () => {
    try {
      setLoading(true);

      // 1️⃣ Buscar histórico de escaneamentos
      const { data: history, error: historyError } = await supabase
        .from("scan_history")
        .select("id, created_at, product_id")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (historyError) throw historyError;
      if (!history || history.length === 0) {
        setScans([]);
        return;
      }

      // 2️⃣ Obter todos os product_ids únicos
      const productIds = [...new Set(history.map((h) => h.product_id))];

      // 3️⃣ Buscar produtos correspondentes (com nome, preço e imagem)
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, price, image_url")
        .in("id", productIds);

      if (productsError) throw productsError;

      // 4️⃣ Combinar as informações
      const enriched = history.map((scan) => {
        const product = products?.find((p) => p.id === scan.product_id);
        return {
          ...scan,
          product_name: product?.name || "Produto desconhecido",
          product_price: product?.price ?? 0,
          product_image_url: product?.image_url || null,
        };
      });

      setScans(enriched);
    } catch (error) {
      console.error("Erro ao buscar escaneamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">
          Histórico de Escaneamentos
        </h1>

        {loading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : scans.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhum escaneamento encontrado.
          </p>
        ) : (
          <div className="space-y-3">
            {scans.map((scan) => (
              <Card
                key={scan.id}
                className="shadow-soft hover:shadow-medium transition-all"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        scan.product_image_url ||
                        "https://via.placeholder.com/60?text=Sem+Imagem"
                      }
                      alt={scan.product_name}
                      className="w-14 h-14 object-cover rounded-lg border border-border"
                    />
                    <div>
                      <p className="font-medium">{scan.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {scan.product_price?.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scan.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <a href="/" className="text-primary font-medium hover:underline">
            ← Voltar para Início
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
