import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
// import { Button } from "../components/ui/button"; // Not needed in layout version
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Users, Search, Star, Zap, Diamond, Trophy, User } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import BarbeariaLayout from "@/components/BarbeariaLayout";

interface Cliente {
  id: string;
  nome_completo: string;
  pontos_acumulados: number;
  nivel_fidelidade: string;
  celular_whatsapp: string;
  created_at: string;
}

const BarbeariaListaClientes = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [_toast] = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: barbearia } = await supabase
        .from('barbearias')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!barbearia) return;

      const { data: clientesData } = await supabase
        .from('clientes')
        .select('*')
        .eq('barbearia_id', barbearia.id)
        .order('nome_completo');

      setClientes(clientesData || []);
    } catch (_error) {
      // Erro ao carregar clientes
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const getStatusColor = (pontos: number) => {
    if (pontos >= 100) return "text-purple-600 bg-purple-100";
    if (pontos >= 50) return "text-blue-600 bg-blue-100";
    if (pontos >= 20) return "text-green-600 bg-green-100";
    return "text-gray-600 bg-gray-100";
  };

  const getStatusIcon = (pontos: number) => {
    if (pontos >= 100) return <Diamond className="w-4 h-4" />;
    if (pontos >= 50) return <Trophy className="w-4 h-4" />;
    if (pontos >= 20) return <Star className="w-4 h-4" />;
    return <User className="w-4 h-4" />;
  };

  const getNivelIcon = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'diamond': return <Diamond className="w-4 h-4" />;
      case 'gold': return <Trophy className="w-4 h-4" />;
      case 'silver': return <Star className="w-4 h-4" />;
      case 'bronze': return <Zap className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.celular_whatsapp.includes(searchTerm)
  );

  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter(c => c.pontos_acumulados > 0).length;
  const mediaPontos = clientes.length > 0 ? Math.round(clientes.reduce((acc, c) => acc + c.pontos_acumulados, 0) / clientes.length) : 0;

  return (
    <BarbeariaLayout
      title="Clientes"
      subtitle={`${totalClientes} clientes cadastrados`}
      icon={Users}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Total</p>
                  <p className="text-xl font-bold text-blue-900">{totalClientes}</p>
                </div>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium">Ativos</p>
                  <p className="text-xl font-bold text-green-900">{clientesAtivos}</p>
                </div>
                <Star className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 font-medium">Média Pontos</p>
                  <p className="text-xl font-bold text-purple-900">{mediaPontos}</p>
                </div>
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar cliente por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredClientes.map((cliente) => (
              <Card 
                key={cliente.id} 
                className="hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(`/${slug}/detalhes-cliente/${cliente.id}`)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">
                          {cliente.nome_completo}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {cliente.celular_whatsapp}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(cliente.pontos_acumulados)}`}>
                      {getStatusIcon(cliente.pontos_acumulados)}
                      <span className="text-xs font-medium">{cliente.pontos_acumulados}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      <div className="flex items-center gap-1">
                        {getNivelIcon(cliente.nivel_fidelidade)}
                        {cliente.nivel_fidelidade}
                      </div>
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </BarbeariaLayout>
  );
};

export default BarbeariaListaClientes;