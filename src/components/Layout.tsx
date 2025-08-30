import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Scan, User, ShoppingBag, History } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const tabs = [
    { id: '/', icon: Home, label: 'Início' },
    { id: '/scanner', icon: Scan, label: 'Scanner' },
    { id: '/produtos', icon: ShoppingBag, label: 'Produtos' },
    { id: '/historico', icon: History, label: 'Histórico' },
    { id: '/perfil', icon: User, label: 'Perfil' },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    navigate(tabId);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <main className="pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
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
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${isActive ? 'scale-110' : ''}`} />
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