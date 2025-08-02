import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Crown, 
  Star, 
  User, 
  QrCode, 
  Share2, 
  Menu, 
  Settings, 
  LogOut,
  Gift,
  History,
  MessageSquare,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { calcularProgressoNivel } from "@/constants";

interface Cliente {
  id: string;
  nome_completo: string;
  pontos_acumulados: number;
  nivel_fidelidade: string;
  qr_code_id: string;
  barbearia_id: string;
}

interface Barbearia {
  id: string;
  nome_barbearia: string;
  slug: string;
}

const ClienteMeuCartao = () => {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [barbearia, setBarbearia] = useState<Barbearia | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/");
          return;
        }

        // Buscar dados do cliente
        const { data: clienteData, error: clienteError } = await supabase
          .from("clientes")
          .select("id, nome_completo, pontos_acumulados, nivel_fidelidade, qr_code_id, barbearia_id")
          .eq("usuario_auth_id", user.id)
          .single();

        if (clienteError || !clienteData) {
          navigate("/");
          return;
        }

        setCliente(clienteData);

        // Buscar dados da barbearia
        const { data: barbeariaData, error: barbeariaError } = await supabase
          .from("barbearias")
          .select("id, nome_barbearia, slug")
          .eq("id", clienteData.barbearia_id)
          .single();

        if (!barbeariaError && barbeariaData) {
          setBarbearia(barbeariaData);
        }

      } catch (_err) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [navigate]);

  const getNivelInfo = (nivel: string) => {
    const niveis = {
      'PRATA': { nome: 'PRATA', cor: 'from-gray-400 to-gray-500', proximo: 'GOLD', pontosParaProximo: 100 },
      'GOLD': { nome: 'GOLD', cor: 'from-yellow-500 to-yellow-600', proximo: 'BLACK', pontosParaProximo: 150 },
      'BLACK': { nome: 'BLACK', cor: 'from-gray-800 to-gray-900', proximo: 'DIAMOND', pontosParaProximo: 150 },
      'DIAMOND': { nome: 'DIAMOND', cor: 'from-blue-400 to-purple-600', proximo: 'DIAMOND', pontosParaProximo: 0 }
    };
    return niveis[nivel as keyof typeof niveis] || niveis.PRATA;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu cartão...</p>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dados</p>
          <Button onClick={() => navigate("/")}>Voltar para login</Button>
        </div>
      </div>
    );
  }

  const nivelInfo = getNivelInfo(cliente.nivel_fidelidade);
  const { progresso, pontosParaProximo } = calcularProgressoNivel(cliente.pontos_acumulados);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Meu Cartão</h1>
              <p className="text-xs text-gray-500">{barbearia?.nome_barbearia || 'Barbearia'}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>

                 {/* Menu Dropdown */}
         {showMenu && (
           <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[200px]">
             <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
               <User className="w-4 h-4" />
               Perfil
             </button>
             <button 
               onClick={() => navigate("/cliente-feedback")}
               className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
             >
               <MessageSquare className="w-4 h-4" />
               Ajuda
             </button>
             <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
               <Settings className="w-4 h-4" />
               Configurações
             </button>
             <div className="border-t border-gray-200 my-1"></div>
             <button 
               onClick={handleLogout}
               className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-red-600"
             >
               <LogOut className="w-4 h-4" />
               Sair
             </button>
           </div>
         )}
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
                 {/* Card Principal - Cartão de Fidelidade Metálico 3D */}
         <Card className="relative overflow-hidden border-0 shadow-2xl">
           {/* Degradê Metálico */}
           <div className="absolute inset-0 bg-gradient-to-br from-silver-400 via-silver-300 to-silver-500 opacity-90"></div>
           <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20"></div>
           
           {/* Efeito 3D - Sombra Interna */}
           <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-transparent"></div>
           
           {/* Efeito 3D - Brilho Superior */}
           <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 via-white/10 to-transparent"></div>
           
           {/* Efeito 3D - Bordas Elevadas */}
           <div className="absolute inset-0 rounded-xl border border-white/30 shadow-inner"></div>
           
           <CardContent className="p-6 relative z-10">
             <div className="text-gray-800 space-y-6">
               {/* Cabeçalho do Cartão */}
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center shadow-lg">
                     <Crown className="w-6 h-6 text-white drop-shadow-sm" />
                   </div>
                   <div>
                     <h2 className="text-lg font-bold text-gray-900">{barbearia?.nome_barbearia || 'Barbearia'}</h2>
                     <div className="flex items-center gap-1">
                       <Star className="w-3 h-3 text-gray-700 fill-current" />
                       <span className="text-xs font-medium text-gray-700">CARTÃO FIDELIDADE</span>
                       <Star className="w-3 h-3 text-gray-700 fill-current" />
                     </div>
                   </div>
                 </div>
                 
                 {/* Botão de Compartilhar */}
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="p-1 text-gray-800 hover:bg-gray-200/50"
                   onClick={() => {
                     if (navigator.share) {
                       navigator.share({
                         title: `${barbearia?.nome_barbearia || 'Barbearia'} - Cartão Fidelidade`,
                         text: `Meu cartão de fidelidade: ${cliente.qr_code_id}`,
                         url: window.location.origin
                       });
                     } else {
                       navigator.clipboard.writeText(cliente.qr_code_id);
                     }
                   }}
                 >
                   <Share2 className="w-4 h-4" />
                 </Button>
               </div>

               {/* Informações do Cliente */}
               <div className="space-y-3">
                 <div>
                   <p className="text-xs text-gray-700 uppercase tracking-wider font-semibold">Cliente</p>
                   <h3 className="text-xl font-bold text-gray-900">{cliente.nome_completo}</h3>
                 </div>
                 
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs text-gray-700 uppercase tracking-wider font-semibold">Nível</p>
                     <div className="flex items-center gap-2">
                       <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                         <User className="w-3 h-3 text-white drop-shadow-sm" />
                       </div>
                       <span className="text-sm font-semibold text-gray-900 drop-shadow-sm">{nivelInfo.nome.toUpperCase()}</span>
                     </div>
                   </div>
                   
                   <div className="text-right">
                     <p className="text-xs text-gray-700 uppercase tracking-wider font-semibold">Pontos</p>
                     <p className="text-2xl font-bold text-gray-800 drop-shadow-sm">{cliente.pontos_acumulados}</p>
                   </div>
                 </div>
               </div>

               {/* Barra de Progresso */}
               <div className="space-y-2">
                 <div className="flex justify-between text-xs text-gray-700 font-semibold">
                   <span>{nivelInfo.nome}</span>
                   <span>{nivelInfo.proximo}</span>
                 </div>
                 <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                   <div 
                     className="h-2 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full transition-all duration-500 shadow-sm"
                     style={{width: `${progresso}%`}}
                   ></div>
                 </div>
                 <p className="text-xs text-gray-700 text-center font-medium">
                   Faltam {pontosParaProximo} pontos para {nivelInfo.proximo}
                 </p>
               </div>

               {/* QR Code */}
               <div className="flex justify-center">
                 <div className="drop-shadow-lg">
                   <QRCodeDisplay 
                     value={cliente.qr_code_id} 
                     size={120}
                     className="!rounded-none"
                   />
                 </div>
               </div>

               {/* Rodapé do Cartão */}
               <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                 <div className="flex items-center gap-2">
                   <QrCode className="w-4 h-4 text-gray-700" />
                   <span className="text-xs text-gray-700 font-mono font-semibold">{cliente.qr_code_id}</span>
                 </div>
                 <div className="text-right">
                   <p className="text-xs text-gray-700 font-semibold">Válido até</p>
                   <p className="text-xs text-gray-900 font-semibold">12/25</p>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>

        

                 {/* Ações Rápidas */}
         <div className="space-y-3">
           <Card 
             className="bg-white border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
             onClick={() => navigate("/cliente-recompensas")}
           >
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                   <Gift className="w-5 h-5 text-white" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-sm font-semibold text-gray-900">Recompensas</h3>
                   <p className="text-xs text-gray-600">Resgate seus pontos</p>
                 </div>
                 <ChevronRight className="w-4 h-4 text-gray-400" />
               </div>
             </CardContent>
           </Card>

           <Card 
             className="bg-white border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
             onClick={() => navigate("/cliente-historico")}
           >
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                   <History className="w-5 h-5 text-white" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-sm font-semibold text-gray-900">Histórico</h3>
                   <p className="text-xs text-gray-600">Veja suas atividades</p>
                 </div>
                 <ChevronRight className="w-4 h-4 text-gray-400" />
               </div>
             </CardContent>
           </Card>
         </div>

        

        
      </div>
    </div>
  );
};

export default ClienteMeuCartao;