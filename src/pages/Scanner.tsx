// src/pages/Scanner.tsx

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scan, Search, Package, Camera, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const qrcodeRegionId = "html5qr-code-full-region";

const Scanner = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [manualCode, setManualCode] = useState("");
  const [foundProduct, setFoundProduct] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
  if (!isCameraOpen) return;

  const html5Qrcode = new Html5Qrcode(qrcodeRegionId);

  const startScanner = async () => {
  try {
    const cameras = await Html5Qrcode.getCameras();
    if (!cameras || cameras.length === 0) {
      toast({ title: "Erro", description: "Nenhuma câmera disponível.", variant: "destructive" });
      return;
    }

    // 1. Tenta encontrar pelo label "back" ou "traseira"
    let selectedCamera = cameras.find(cam =>
      cam.label.toLowerCase().includes("back") || cam.label.toLowerCase().includes("traseira")
    );

    // 2. Se não encontrar, pega a segunda câmera (geralmente traseira)
    if (!selectedCamera && cameras.length > 1) {
      selectedCamera = cameras[1];
    }

    // 3. Se ainda não tiver, pega a primeira
    if (!selectedCamera) selectedCamera = cameras[0];

    await html5Qrcode.start(
      selectedCamera.id,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        html5Qrcode.stop().catch(console.error);
        setIsCameraOpen(false);
        setManualCode(decodedText);
        handleBarcodeSearch(decodedText);
      },
      (errorMessage) => {
        console.warn("Erro de scan:", errorMessage);
      }
    );
  } catch (err) {
    console.error("Erro ao iniciar scanner:", err);
    toast({ title: "Erro", description: "Não foi possível acessar a câmera.", variant: "destructive" });
  }
};

  startScanner();

  return () => {
    const stopScanner = async () => {
      try {
        await html5Qrcode.stop();
        html5Qrcode.clear();
      } catch (err) {
        console.error("Falha ao parar/limpar scanner:", err);
      }
    };
    stopScanner();
  };
}, [isCameraOpen]);

  const handleBarcodeSearch = async (barcode: string) => {
    if (!barcode || !user) {
      toast({ title: "Erro", description: "É preciso estar logado para escanear.", variant: "destructive" });
      return;
    }

    setIsSearching(true);
    setFoundProduct(null);

    try {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("barcode", barcode)
        .single();

      if (productError || !productData) throw new Error("Produto não encontrado");

      setFoundProduct(productData);
      toast({ title: "Produto encontrado!", description: `${productData.name} - R$ ${productData.price}` });

      const { error: historyError } = await supabase
        .from("scan_history")
        .insert({ user_id: user.id, product_id: productData.id });

      if (historyError) console.error("Erro ao salvar histórico:", historyError.message);

    } catch (error) {
      toast({ title: "Produto não encontrado", description: `O código ${barcode} não corresponde a nenhum produto.`, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scan className="h-5 w-5" />
              <span>Verificador de Preços</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isCameraOpen && <div id={qrcodeRegionId} className="w-full" />}
            <div className="space-y-4">
              <div>
                <Label htmlFor="barcode">Código QR</Label>
                <div className="flex space-x-2">
                  <Input
                    id="barcode"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Digite o código manualmente"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleBarcodeSearch(manualCode)}
                    disabled={!manualCode || isSearching}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => setIsCameraOpen(!isCameraOpen)}
                  disabled={isSearching}
                  className="w-full max-w-xs"
                  size="lg"
                >
                  {isCameraOpen ? <X className="h-5 w-5 mr-2" /> : <Camera className="h-5 w-5 mr-2" />}
                  {isCameraOpen ? "Fechar Câmara" : "Escanear com a Câmara"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isSearching && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-2">A procurar produto...</p>
          </div>
        )}

        {foundProduct && (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <Package className="h-5 w-5" />
                <span>Produto Encontrado</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <img
                  src={foundProduct.image_url || "/placeholder.svg"}
                  alt={foundProduct.name}
                  className="w-32 h-32 object-cover rounded-md"
                />
                <div className="space-y-2">
                  <h3 className="font-semibold text-2xl">{foundProduct.name}</h3>
                  <p className="text-muted-foreground">{foundProduct.description}</p>
                  <p className="text-3xl font-bold text-green-600">R$ {Number(foundProduct.price).toFixed(2)}</p>
                  <p><span className="font-medium">Em estoque:</span> {foundProduct.stock} unidades</p>
                  <p className="font-mono text-sm text-muted-foreground">Código: {foundProduct.barcode}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Scanner;
