import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  Edit, 
  Scan, 
  ShoppingBag, 
  Heart, 
  Settings, 
  Bell, 
  HelpCircle, 
  LogOut,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditName(parsedUser.name);
    }
  }, []);

  const handleSaveName = () => {
    if (!editName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome válido",
        variant: "destructive"
      });
      return;
    }

    const updatedUser = { ...user, name: editName };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsEditing(false);
    
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso"
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso"
    });
    navigate('/login');
  };

  const stats = [
    { label: 'Produtos escaneados', value: '24', icon: Scan, color: 'text-primary' },
    { label: 'Economizado', value: 'R$ 152', icon: TrendingUp, color: 'text-success' },
    { label: 'Favoritos', value: '8', icon: Heart, color: 'text-red-500' },
  ];

  const menuItems = [
    { 
      icon: Settings, 
      label: 'Configurações', 
      description: 'Preferências do app',
      action: () => toast({ title: "Em breve!", description: "Funcionalidade será disponibilizada" })
    },
    { 
      icon: Bell, 
      label: 'Notificações', 
      description: 'Alertas de preços',
      action: () => toast({ title: "Em breve!", description: "Funcionalidade será disponibilizada" })
    },
    { 
      icon: HelpCircle, 
      label: 'Ajuda', 
      description: 'Suporte e FAQ',
      action: () => toast({ title: "Em breve!", description: "Funcionalidade será disponibilizada" })
    },
  ];

  const recentActivity = [
    {
      id: '1',
      action: 'Escaneou',
      product: 'iPhone 15 Pro Max',
      price: 'R$ 8.999,99',
      time: 'Há 2 horas',
      store: 'Apple Store'
    },
    {
      id: '2',
      action: 'Favoritou',
      product: 'Coca-Cola 2L',
      price: 'R$ 8,99',
      time: 'Há 1 dia',
      store: 'Pão de Açúcar'
    },
    {
      id: '3',
      action: 'Escaneou',
      product: 'Smart TV LG 55"',
      price: 'R$ 2.399,99',
      time: 'Há 2 dias',
      store: 'Magazine Luiza'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <Card className="border-0 shadow-medium p-6">
          <CardContent className="text-center">
            <h3 className="text-lg font-semibold mb-2">Acesso negado</h3>
            <p className="text-muted-foreground mb-4">Você precisa estar logado para ver o perfil</p>
            <Button onClick={() => navigate('/login')}>
              Fazer login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 sm:p-6 rounded-b-3xl shadow-medium">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center">
            <User className="w-10 h-10" />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  placeholder="Seu nome"
                />
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={handleSaveName}
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    Salvar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(user.name);
                    }}
                    className="text-white hover:bg-white/10"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <div className="flex items-center space-x-2 text-white/80">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
              </>
            )}
          </div>
          {!isEditing && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-white hover:bg-white/10"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Stats */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Suas estatísticas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-0 shadow-soft">
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Atividade recente</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver tudo
            </Button>
          </div>
          
          <Card className="border-0 shadow-soft">
            <CardContent className="p-0">
              {recentActivity.map((activity, index) => (
                <div key={activity.id}>
                  <div className="p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.action} <span className="font-semibold">{activity.product}</span>
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{activity.store}</span>
                        <span>•</span>
                        <span className="font-medium text-primary">{activity.price}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                  {index < recentActivity.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Menu Options */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Configurações</h2>
          <Card className="border-0 shadow-soft">
            <CardContent className="p-0">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index}>
                    <button
                      onClick={item.action}
                      className="w-full p-4 flex items-center space-x-3 hover:bg-muted/50 transition-colors duration-200"
                    >
                      <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </button>
                    {index < menuItems.length - 1 && <Separator />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        {/* Achievements */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Conquistas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card className="border-0 shadow-soft">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-sm font-medium text-foreground">Primeiro Scan</p>
                <Badge variant="secondary" className="mt-2">Desbloqueado</Badge>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-soft">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <ShoppingBag className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-foreground">Economizador</p>
                <Badge variant="outline" className="mt-2">Progresso: 24/50</Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Logout */}
        <section>
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair da conta
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Profile;