import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Grid, List, Star, Heart, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Local type definitions to handle Supabase type issues
interface DatabaseProduct {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  barcode: string | null;
  image_url: string | null;
  stock: number | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  store: string;
  category: string;
  discount?: number;
  isPopular?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categories: Category[] = [
    { id: 'all', name: 'Todos', icon: '🔥', count: 1247 },
    { id: 'electronics', name: 'Eletrônicos', icon: '📱', count: 324 },
    { id: 'food', name: 'Alimentação', icon: '🍕', count: 456 },
    { id: 'beauty', name: 'Beleza', icon: '💄', count: 189 },
    { id: 'home', name: 'Casa', icon: '🏠', count: 278 },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products' as any)
        .select('*') as { data: DatabaseProduct[] | null; error: any };

      if (error) {
        toast({
          title: "Erro ao carregar produtos",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Map database products to component format
      const mappedProducts: Product[] = (data || []).map(product => ({
        id: product.id.toString(),
        name: product.name,
        price: parseFloat(product.price?.toString() || '0'),
        image: '📦', // Default emoji for products
        rating: 4.5, // Default rating
        store: 'Loja Online',
        category: 'all'
      }));

      setProducts(mappedProducts);
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os produtos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-6 rounded-b-3xl shadow-medium">
        <h1 className="text-2xl font-bold mb-4">Produtos</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-white/60" />
          <Input
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Categories */}
        <section>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 ${
                  selectedCategory === category.id 
                    ? 'bg-primary text-primary-foreground shadow-soft' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </section>

        {/* View Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {filteredProducts.length} produtos encontrados
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
            <div className="flex border border-border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none border-l"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <section>
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-0 shadow-soft">
                  <CardContent className="p-4">
                    <div className="w-full h-24 bg-muted rounded-2xl mb-3 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-muted rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 gap-4' 
                : 'space-y-4'
            }>
              {filteredProducts.map((product) => (
              <Card 
                key={product.id}
                className="border-0 shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer relative"
              >
                <CardContent className={`p-4 ${viewMode === 'list' ? 'flex items-center space-x-4' : ''}`}>
                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className={`absolute top-2 right-2 w-8 h-8 p-0 z-10 ${
                      favorites.has(product.id) 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-current' : ''}`} />
                  </Button>

                  {/* Product Image */}
                  <div className={`${
                    viewMode === 'grid' 
                      ? 'w-full h-24 mb-3' 
                      : 'w-16 h-16 flex-shrink-0'
                  } bg-muted rounded-2xl flex items-center justify-center text-2xl relative`}>
                    {product.image}
                    {product.isPopular && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-warning rounded-full flex items-center justify-center">
                        <TrendingUp className="w-3 h-3 text-warning-foreground" />
                      </div>
                    )}
                  </div>

                  <div className={`${viewMode === 'grid' ? '' : 'flex-1'}`}>
                    {/* Product Info */}
                    <div className={`${viewMode === 'list' ? 'flex items-start justify-between' : ''}`}>
                      <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <h3 className={`font-semibold text-foreground ${
                          viewMode === 'grid' ? 'text-sm line-clamp-2 mb-1' : 'text-base mb-1'
                        }`}>
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">{product.store}</p>
                        
                        {/* Rating */}
                        <div className="flex items-center space-x-1 mb-2">
                          <Star className="w-3 h-3 fill-warning text-warning" />
                          <span className="text-xs font-medium">{product.rating}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className={`${viewMode === 'list' ? 'text-right ml-4' : ''}`}>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold text-primary ${
                            viewMode === 'grid' ? 'text-sm' : 'text-lg'
                          }`}>
                            R$ {product.price.toFixed(2)}
                          </span>
                          {product.discount && (
                            <Badge variant="secondary" className="bg-success text-success-foreground text-xs">
                              -{product.discount}%
                            </Badge>
                          )}
                        </div>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            R$ {product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </section>

        {/* Load More */}
        {filteredProducts.length > 0 && (
          <div className="text-center">
            <Button variant="outline" className="w-full">
              Carregar mais produtos
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar sua busca ou filtros
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}>
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;