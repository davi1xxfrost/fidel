import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  Menu, 
  X, 
  Gift, 
  Users, 
  MessageCircle, 
  Settings, 
  Home,
  Scan,
  Plus,
  LogOut
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BarbeariaLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  showBackButton?: boolean;
}

interface BarbeariaData {
  id: string;
  nome_barbearia: string;
  email_contato: string;
  slug?: string;
}

const BarbeariaLayout = ({ 
  children, 
  title, 
  subtitle, 
  icon: IconComponent
}: BarbeariaLayoutProps) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [barbearia, setBarbearia] = useState<BarbeariaData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchBarbearia = async () => {
      if (!slug) return;
      
      const { data, error } = await supabase
        .from('barbearias')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        setBarbearia(data);
      }
    };

    fetchBarbearia();
  }, [slug]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(`/${slug}/login`);
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      path: `/${slug}/dashboard`,
      active: location.pathname === `/${slug}/dashboard`
    },
    {
      title: "Clientes",
      icon: Users,
      path: `/${slug}/clientes`,
      active: location.pathname.includes(`/${slug}/clientes`)
    },
    {
      title: "Adicionar Ponto",
      icon: Scan,
      path: `/${slug}/scan-qrcode`,
      active: location.pathname === `/${slug}/scan-qrcode`
    },
    {
      title: "Resgatar Recompensa",
      icon: Gift,
      path: `/${slug}/resgatar-recompensa`,
      active: location.pathname === `/${slug}/resgatar-recompensa`
    },
    {
      title: "Comunicação",
      icon: MessageCircle,
      path: `/${slug}/comunicacao`,
      active: location.pathname === `/${slug}/comunicacao`
    },
    {
      title: "Níveis de Fidelidade",
      icon: Settings,
      path: `/${slug}/gerenciar-niveis`,
      active: location.pathname === `/${slug}/gerenciar-niveis`
    }
  ];

  // Se for mobile, renderiza o layout original
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Mobile Original */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{barbearia ? barbearia.nome_barbearia : 'Barbearia'}</h1>
                <p className="text-xs text-gray-500">Painel de Controle</p>
              </div>
            </div>
            
            {/* Menu Hambúrguer */}
            <div className="relative menu-container">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100"
              >
                <Menu className="w-4 h-4" />
              </Button>
              
              {/* Menu Dropdown */}
              {showMenu && (
                <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="p-2 space-y-1">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate(`/${slug}/resgatar-recompensa`);
                        setShowMenu(false);
                      }}
                      className="w-full justify-start text-gray-900 hover:bg-gray-100"
                    >
                      <Gift className="w-4 h-4 mr-3" />
                      Resgatar Recompensa
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate(`/${slug}/clientes`);
                        setShowMenu(false);
                      }}
                      className="w-full justify-start text-gray-900 hover:bg-gray-100"
                    >
                      <Users className="w-4 h-4 mr-3" />
                      Ver Meus Clientes
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate(`/${slug}/comunicacao`);
                        setShowMenu(false);
                      }}
                      className="w-full justify-start text-gray-900 hover:bg-gray-100"
                    >
                      <MessageCircle className="w-4 h-4 mr-3" />
                      Central de Comunicação
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate(`/${slug}/gerenciar-niveis`);
                        setShowMenu(false);
                      }}
                      className="w-full justify-start text-gray-900 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Gerenciar Níveis de Fidelidade
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo Mobile */}
        <div className="p-4 max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    );
  }

  // Layout Desktop com Sidebar
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Header da Sidebar */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">{barbearia?.nome_barbearia || 'Barbearia'}</h2>
                <p className="text-xs text-gray-500">Painel de Controle</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Menu da Sidebar */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={item.active ? "default" : "ghost"}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full justify-start h-12 ${
                    item.active 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.title}
                </Button>
              );
            })}
          </nav>

          {/* Footer da Sidebar */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header Desktop */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                {IconComponent && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                  {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/${slug}/scan-qrcode`)}
                className="hidden md:flex"
              >
                <Scan className="w-4 h-4 mr-2" />
                Adicionar Ponto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/${slug}/clientes/novo`)}
                className="hidden md:flex"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </div>
        </header>

        {/* Conteúdo da Página */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BarbeariaLayout; 