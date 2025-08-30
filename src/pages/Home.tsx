import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scan, ShoppingBag, TrendingUp, Star, Clock, Tag, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  store: string;
  discount?: number;
}

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Mock de produtos recomendados
    setRecommendedProducts([
      {
        id: '1',
        name: 'Smartphone Galaxy A54',
        price: 1299.99,
        originalPrice: 1599.99,
        image: '📱',
        rating: 4.5,
        store: 'Magazine Luiza',
        discount: 19
      },
      {
        id: '2',
        name: 'Fone Bluetooth JBL',
        price: 89.90,
        originalPrice: 129.90,
        image: '🎧',
        rating: 4.8,
        store: 'Americanas',
        discount: 31
      },
      {
        id: '3',
        name: 'Notebook Lenovo i5',
        price: 2599.99,
        image: '💻',
        rating: 4.3,
        store: 'Casas Bahia'
      }
    ]);
  }, []);

  const quickActions = [
    {
      id: 'scanner',
      title: 'Scanner QR',
      description: 'Escaneie códigos para ver preços',
      icon: Scan,
      color: 'bg-gradient-primary',
      route: '/scanner'
    },
    {
      id: 'products',
      title: 'Produtos',
      description: 'Navegue por categorias',
      icon: ShoppingBag,
      color: 'bg-gradient-secondary',
      route: '/produtos'
    },
    {
      id: 'trending',
      title: 'Em Alta',
      description: 'Produtos mais buscados',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-accent to-success',
      route: '/trending'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 sm:p-6 rounded-b-3xl shadow-medium">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              Olá, {user?.name || 'Usuário'}! 👋
            </h1>
            <p className="text-white/80">Pronto para economizar hoje?</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center space-x-2">
              <Scan className="w-5 h-5" />
              <span className="text-sm font-medium">Escaneados</span>
            </div>
            <p className="text-2xl font-bold mt-1">24</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5" />
              <span className="text-sm font-medium">Economizado</span>
            </div>
            <p className="text-2xl font-bold mt-1">R$ 152</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={action.id}
                  className="border-0 shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(action.route)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center shadow-soft`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Recommended Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Recomendados para Você</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todos
            </Button>
          </div>
          
          <div className="space-y-4">
            {recommendedProducts.map((product) => (
              <Card 
                key={product.id}
                className="border-0 shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-2xl">
                      {product.image}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.store}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="w-4 h-4 fill-warning text-warning" />
                            <span className="text-sm font-medium">{product.rating}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-primary">
                              R$ {product.price.toFixed(2)}
                            </span>
                            {product.discount && (
                              <Badge variant="secondary" className="bg-success text-success-foreground">
                                -{product.discount}%
                              </Badge>
                            )}
                          </div>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              R$ {product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Atividade Recente</h2>
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Último escaneamento</p>
                  <p className="text-sm text-muted-foreground">Coca-Cola 2L - R$ 8,99</p>
                  <p className="text-xs text-muted-foreground">Há 2 horas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Home;