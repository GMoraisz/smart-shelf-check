import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Scan, User, History, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const tabs = [
    { id: '/', icon: Home, label: 'Início' },
    { id: '/scanner', icon: Scan, label: 'Scanner' },
    { id: '/historico', icon: History, label: 'Histórico' },
    { id: '/perfil', icon: User, label: 'Perfil' },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    navigate(tabId);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header com botão de logout (apenas na tela de perfil) */}
      {activeTab === '/perfil' && (
        <div className="bg-gradient-primary text-white p-4 rounded-b-3xl shadow-medium mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Meu Perfil</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      )}

      <main className="pb-20">{children}</main>

      {/* Navegação inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 sm:px-4 py-2 safe-area-pb">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center py-2 px-1 sm:px-3 rounded-xl transition-all duration-200 min-w-0 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                <span className="text-xs font-medium truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
