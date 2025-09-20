import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Flashlight, RotateCcw, CheckCircle, AlertCircle, Star, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ScanResult {
  productName: string;
  price: number;
  originalPrice?: number;
  store: string;
  rating: number;
  description: string;
  image: string;
  ean: string;
  discount?: number;
  availability: 'in-stock' | 'limited' | 'out-of-stock';
}

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const mockScanResults: ScanResult[] = [
    {
      productName: 'Coca-Cola Original 2L',
      price: 8.99,
      originalPrice: 11.50,
      store: 'Supermercado Pão de Açúcar',
      rating: 4.7,
      description: 'Refrigerante Coca-Cola Original 2 Litros - Embalagem Retornável',
      image: '🥤',
      ean: '7894900011517',
      discount: 22,
      availability: 'in-stock'
    },
    {
      productName: 'Smartphone Samsung Galaxy A54',
      price: 1299.99,
      originalPrice: 1599.99,
      store: 'Magazine Luiza',
      rating: 4.5,
      description: 'Smartphone Samsung Galaxy A54 5G 128GB 6GB RAM Câmera Tripla',
      image: '📱',
      ean: '8806094544325',
      discount: 19,
      availability: 'limited'
    },
    {
      productName: 'Fone de Ouvido JBL Tune 510BT',
      price: 89.90,
      store: 'Americanas',
      rating: 4.8,
      description: 'Fone de Ouvido Bluetooth JBL Tune 510BT Dobrável com Microfone',
      image: '🎧',
      ean: '6925281972836',
      availability: 'in-stock'
    }
  ];

  const startScanning = () => {
    setIsScanning(true);
    setIsLoading(true);
    setScanResult(null);

    // Simular processo de escaneamento
    setTimeout(async () => {
      try {
        // Simular leitura de código de barras
        const scannedBarcode = generateRandomBarcode();
        
        // Buscar produto no Supabase
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('barcode', scannedBarcode)
          .single();

        if (error || !product) {
          // Se produto não encontrado, usar um dos mock results
          const randomResult = mockScanResults[Math.floor(Math.random() * mockScanResults.length)];
          setScanResult(randomResult);
          
          toast({
            title: "Produto encontrado!",
            description: `${randomResult.productName} - R$ ${randomResult.price.toFixed(2)}`
          });
        } else {
          // Produto encontrado na base de dados
          const result: ScanResult = {
            productName: product.name,
            price: parseFloat(product.price?.toString() || '0'),
            store: 'Loja Online',
            rating: 4.5,
            description: product.description || product.name,
            image: '📦',
            ean: product.barcode || '',
            availability: 'in-stock' as const
          };
          
          setScanResult(result);
          
          // Salvar no histórico de scans
          if (user) {
            await supabase
              .from('scan_history')
              .insert({
                user_id: user.id,
                product_id: product.id
              });
          }
          
          toast({
            title: "Produto encontrado!",
            description: `${result.productName} - R$ ${result.price.toFixed(2)}`
          });
        }
      } catch (error) {
        toast({
          title: "Erro no escaneamento",
          description: "Tente novamente",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setIsScanning(false);
      }
    }, 3000);
  };

  const generateRandomBarcode = () => {
    // Gerar código de barras aleatório para simulação
    return Math.random().toString().substring(2, 15);
  };

  const stopScanning = () => {
    setIsScanning(false);
    setIsLoading(false);
  };

  const getAvailabilityInfo = (availability: string) => {
    switch (availability) {
      case 'in-stock':
        return { 
          icon: CheckCircle, 
          text: 'Disponível', 
          color: 'text-success bg-success/10' 
        };
      case 'limited':
        return { 
          icon: AlertCircle, 
          text: 'Estoque limitado', 
          color: 'text-warning bg-warning/10' 
        };
      case 'out-of-stock':
        return { 
          icon: AlertCircle, 
          text: 'Fora de estoque', 
          color: 'text-destructive bg-destructive/10' 
        };
      default:
        return { 
          icon: CheckCircle, 
          text: 'Verificando...', 
          color: 'text-muted-foreground bg-muted' 
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-6 rounded-b-3xl shadow-medium">
        <h1 className="text-2xl font-bold mb-2">Scanner QR</h1>
        <p className="text-white/80">Aponte a câmera para o código QR do produto</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Scanner Interface */}
        <Card className="border-0 shadow-medium overflow-hidden">
          <CardContent className="p-0">
            <div className="relative bg-black aspect-square rounded-2xl overflow-hidden">
              {/* Camera Viewfinder */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/60 flex items-center justify-center">
                {isLoading ? (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-medium">Escaneando...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-white/60 mb-4 mx-auto" />
                    <p className="text-white/80 text-sm">
                      {isScanning ? 'Aponte para o código QR' : 'Toque para iniciar'}
                    </p>
                  </div>
                )}
              </div>

              {/* Scanning Animation */}
              {isScanning && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-scan"></div>
                </div>
              )}

              {/* Scanner Frame */}
              <div className="absolute inset-0 p-8">
                <div className="w-full h-full border-2 border-white/30 rounded-3xl relative">
                  {/* Corner indicators */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFlashEnabled(!flashEnabled)}
                  className={`text-white hover:bg-white/20 ${flashEnabled ? 'bg-white/20' : ''}`}
                >
                  <Flashlight className="w-5 h-5" />
                </Button>
                
                <Button
                  onClick={isScanning ? stopScanning : startScanning}
                  className={`${
                    isScanning 
                      ? 'bg-destructive hover:bg-destructive/90' 
                      : 'bg-primary hover:bg-primary/90'
                  } text-white shadow-soft`}
                  disabled={isLoading}
                >
                  {isScanning ? 'Parar' : 'Escanear'}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setScanResult(null)}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scan Result */}
        {scanResult && (
          <Card className="border-0 shadow-medium animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>Produto Encontrado</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Info */}
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center text-3xl">
                  {scanResult.image}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-1">
                    {scanResult.productName}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {scanResult.description}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="text-sm font-medium">{scanResult.rating}</span>
                    <span className="text-xs text-muted-foreground">(245 avaliações)</span>
                  </div>
                </div>
              </div>

              {/* Price and Store */}
              <div className="bg-muted/50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{scanResult.store}</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary">
                        R$ {scanResult.price.toFixed(2)}
                      </span>
                      {scanResult.discount && (
                        <Badge variant="secondary" className="bg-success text-success-foreground">
                          -{scanResult.discount}%
                        </Badge>
                      )}
                    </div>
                    {scanResult.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        R$ {scanResult.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {/* Availability */}
                  <div className="text-right">
                    {(() => {
                      const availability = getAvailabilityInfo(scanResult.availability);
                      const Icon = availability.icon;
                      return (
                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${availability.color}`}>
                          <Icon className="w-3 h-3" />
                          <span>{availability.text}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>EAN: {scanResult.ean}</p>
                <p>Escaneado em {new Date().toLocaleString('pt-BR')}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button className="flex-1 bg-gradient-primary border-0 shadow-soft">
                  Ver na Loja
                </Button>
                <Button variant="outline" className="flex-1">
                  Salvar Produto
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        {!scanResult && !isScanning && (
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3">Dicas para um melhor escaneamento:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Mantenha o código QR bem iluminado</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Posicione a câmera a uma distância de 15-20cm</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Certifique-se que o código esteja nítido</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Scanner;