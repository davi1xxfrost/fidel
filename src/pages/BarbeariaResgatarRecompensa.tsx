import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Gift, Users, User, CheckCircle, Loader2, Star, Zap, Diamond } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface Cliente {
  id: string;
  nome_completo: string;
  pontos_acumulados: number;
  nivel_fidelidade: string;
  celular_whatsapp: string;
}

interface Recompensa {
  id: string;
  nome: string;
  descricao: string;
  pontos_necessarios: number;
  tipo: string;
  ativa: boolean;
}

const BarbeariaResgatarRecompensa = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedRecompensa, setSelectedRecompensa] = useState<Recompensa | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data para recompensas
  const recompensas: Recompensa[] = [
    {
      id: "1",
      nome: "Corte Gratuito",
      descricao: "Corte de cabelo gratuito",
      pontos_necessarios: 50,
      tipo: "servico",
      ativa: true
    },
    {
      id: "2",
      nome: "Desconto 20%",
      descricao: "20% de desconto em qualquer serviço",
      pontos_necessarios: 30,
      tipo: "desconto",
      ativa: true
    },
    {
      id: "3",
      nome: "Produto Gratuito",
      descricao: "Produto de sua escolha",
      pontos_necessarios: 100,
      tipo: "produto",
      ativa: true
    }
  ];

  const fetchBarbeariaId = async () => {
    try {
      const { data: barbearia, error } = await supabase
        .from('barbearias')
        .select('id')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return barbearia.id;
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da barbearia",
        status: "error"
      });
      return null;
    }
  };

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

  const handleResgatarRecompensa = async () => {
    if (!selectedCliente || !selectedRecompensa) return;

    if (selectedCliente.pontos_acumulados < selectedRecompensa.pontos_necessarios) {
      toast({
        title: "Erro",
        description: "Cliente não possui pontos suficientes",
        status: "error"
      });
      return;
    }

    try {
      setSubmitting(true);
      const barbeariaId = await fetchBarbeariaId();
      if (!barbeariaId) return;

      const { error } = await supabase
        .from('transacoes_pontos')
        .insert({
          cliente_id: selectedCliente.id,
          barbearia_id: barbeariaId,
          valor_pontos: -selectedRecompensa.pontos_necessarios,
          tipo: 'resgate',
          descricao: `Resgate: ${selectedRecompensa.nome}`
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Recompensa "${selectedRecompensa.nome}" resgatada com sucesso!`,
        status: "success"
      });

      setSelectedCliente(null);
      setSelectedRecompensa(null);
      fetchClientes();
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao resgatar recompensa",
        status: "error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.celular_whatsapp.includes(searchTerm)
  );

  const recompensasDisponiveis = selectedCliente 
    ? recompensas.filter(r => r.ativa && selectedCliente.pontos_acumulados >= r.pontos_necessarios)
    : [];

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'servico': return <Star className="w-4 h-4" />;
      case 'desconto': return <Zap className="w-4 h-4" />;
      case 'produto': return <Diamond className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'servico': return 'bg-blue-100 text-blue-600';
      case 'desconto': return 'bg-green-100 text-green-600';
      case 'produto': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Compacto */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
              onClick={() => navigate(`/${slug}/dashboard`)}
              className="p-2 hover:bg-gray-100"
          >
              <ArrowLeft className="w-4 h-4" />
          </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
          <div>
              <h1 className="text-lg font-semibold text-gray-900">Resgatar Recompensa</h1>
              <p className="text-xs text-gray-500">Permita que seus clientes resgatem benefícios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Seleção de Cliente */}
        <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4 text-blue-600" />
                Selecionar Cliente
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
              <Input
                type="text"
                  placeholder="Buscar cliente por nome ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10"
              />
            </div>

              {/* Lista de Clientes */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : filteredClientes.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                    </p>
                  </div>
                ) : (
                  filteredClientes.map((cliente) => (
                    <div
                      key={cliente.id}
                      onClick={() => setSelectedCliente(cliente)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedCliente?.id === cliente.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
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
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">
                            {cliente.pontos_acumulados}
                          </p>
                          <p className="text-xs text-gray-500">pontos</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Recompensa */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Gift className="w-4 h-4 text-red-600" />
                Selecionar Recompensa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCliente ? (
                <>
                  {/* Cliente Selecionado */}
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {selectedCliente.nome_completo}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {selectedCliente.celular_whatsapp}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {selectedCliente.pontos_acumulados}
                        </p>
                        <p className="text-xs text-gray-500">pontos disponíveis</p>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Recompensas */}
                  <div className="space-y-2">
                    {recompensasDisponiveis.length === 0 ? (
                      <div className="text-center py-8">
                        <Gift className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Cliente não possui pontos suficientes para nenhuma recompensa
                        </p>
                      </div>
                    ) : (
                      recompensasDisponiveis.map((recompensa) => (
                        <div
                          key={recompensa.id}
                          onClick={() => setSelectedRecompensa(recompensa)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedRecompensa?.id === recompensa.id
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                              {getTipoIcon(recompensa.tipo)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-sm">
                                {recompensa.nome}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {recompensa.descricao}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={`text-xs ${getTipoColor(recompensa.tipo)}`}>
                                {recompensa.pontos_necessarios} pts
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
            </div>

                  {/* Botão Resgatar */}
                  {selectedRecompensa && (
            <Button
                      onClick={handleResgatarRecompensa}
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white h-12"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Resgatando...
                        </>
              ) : (
                <>
                          <Gift className="w-4 h-4 mr-2" />
                          Resgatar {selectedRecompensa.nome}
                        </>
                      )}
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecione um Cliente</h3>
                  <p className="text-sm text-gray-600">
                    Escolha um cliente para ver as recompensas disponíveis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card Compacto */}
        <Card className="mt-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Dica</h4>
                <p className="text-xs text-gray-600">
                  Permita que seus clientes resgatem recompensas para aumentar a fidelidade.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BarbeariaResgatarRecompensa;