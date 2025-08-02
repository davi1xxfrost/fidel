import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, Star, Award, TrendingUp, DollarSign, Activity, Heart, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BarbeariaLayout from "@/components/BarbeariaLayout";

type BarbeariaData = {
  id: string;
  nome_barbearia: string;
  email_contato: string;
  slug?: string;
}

interface Cliente {
  id: string;
  nome_completo: string;
  pontos_acumulados: number;
  nivel_fidelidade: string;
  data_cadastro?: string;
}

interface Metricas {
  totalClientes: number;
  clientesNovosMes: number;
  pontosDistribuidos: number;
  recompensasResgatadas: number;
  faturamentoEstimado: number;
  engajamento: number;
}

const BarbeariaDashboard = () => {
  const [_barbearia, setBarbearia] = useState<BarbeariaData | null>(null);
  const [_loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState<Metricas>({
    totalClientes: 0,
    clientesNovosMes: 0,
    pontosDistribuidos: 0,
    recompensasResgatadas: 0,
    faturamentoEstimado: 0,
    engajamento: 0
  });
  const [melhoresClientes, setMelhoresClientes] = useState<Cliente[]>([]);
  const [clientesRecentes, setClientesRecentes] = useState<Cliente[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const { slug } = useParams();

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

  useEffect(() => {
    const fetchBarbearia = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('barbearias')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          setLoading(false);
          return;
        }

        setBarbearia(data);
        const barbeariaId = data.id;

        // 1. Métricas principais
        const [
          { count: totalClientes },
          { count: clientesNovosMes },
          { data: transacoesData },
          { count: recompensasCount },
          { data: clientesData }
        ] = await Promise.all([
          // Total de clientes
          supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true })
            .eq('barbearia_id', barbeariaId),
          
                  // Clientes novos este mês
        supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true })
          .eq('barbearia_id', barbeariaId)
          .gte('data_cadastro', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
          
          // Transações de pontos
          supabase
            .from('transacoes_pontos')
            .select('valor_pontos')
            .eq('barbearia_id', barbeariaId),
          
          // Recompensas resgatadas
          supabase
            .from('transacoes_pontos')
            .select('*', { count: 'exact', head: true })
            .eq('barbearia_id', barbeariaId)
            .eq('tipo', 'resgate'),
          
          // Clientes para ranking
          supabase
            .from('clientes')
            .select('*')
            .eq('barbearia_id', barbeariaId)
            .order('pontos_acumulados', { ascending: false })
            .limit(5)
        ]);

        // Calcular métricas
        const pontosDistribuidos = transacoesData?.reduce((acc, trans) => acc + (trans.valor_pontos || 0), 0) || 0;
        const faturamentoEstimado = (totalClientes || 0) * 50; // Estimativa simples
        const engajamento = totalClientes ? Math.round(((clientesNovosMes || 0) / totalClientes) * 100) : 0;

        setMetricas({
          totalClientes: totalClientes || 0,
          clientesNovosMes: clientesNovosMes || 0,
          pontosDistribuidos,
          recompensasResgatadas: recompensasCount || 0,
          faturamentoEstimado,
          engajamento
        });

        // Top clientes
        setMelhoresClientes(clientesData?.slice(0, 3) || []);
        
        // Clientes recentes
        const { data: clientesRecentesData } = await supabase
          .from('clientes')
          .select('id, nome_completo, pontos_acumulados, nivel_fidelidade, data_cadastro')
          .eq('barbearia_id', barbeariaId)
          .order('data_cadastro', { ascending: false })
          .limit(3);
        
        setClientesRecentes(clientesRecentesData || []);

      } catch (_error) {
        // Erro ao carregar dados da barbearia
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBarbearia();
    }
  }, [slug]);

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <BarbeariaLayout 
      title="Dashboard" 
      subtitle="Painel de Controle"
      icon={BarChart3}
    >
      {/* Layout Mobile Original */}
      <div className="lg:hidden">
        {/* Métricas Principais - Grid 2x2 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Total de Clientes */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Total Clientes</p>
                  <p className="text-xl font-bold text-blue-900">{metricas.totalClientes}</p>
                </div>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Novos Clientes */}
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium">Novos</p>
                  <p className="text-xl font-bold text-green-900">{metricas.clientesNovosMes}</p>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Pontos Distribuídos */}
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 font-medium">Pontos</p>
                  <p className="text-xl font-bold text-purple-900">{metricas.pontosDistribuidos}</p>
                </div>
                <Star className="w-5 h-5 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          {/* Faturamento Estimado */}
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 font-medium">Faturamento</p>
                  <p className="text-lg font-bold text-orange-900">{formatarMoeda(metricas.faturamentoEstimado)}</p>
                </div>
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="space-y-3 mb-6">
          <Button
            onClick={() => navigate(`/${slug}/scan-qrcode`)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
          >
            <Plus className="w-5 h-5 mr-3" />
            Adicionar Ponto
          </Button>

          <Button
            onClick={() => navigate(`/${slug}/clientes/novo`)}
            variant="outline"
            className="w-full border-2 border-purple-300 text-purple-600 hover:bg-purple-50 h-12"
          >
            <Plus className="w-5 h-5 mr-3" />
            Novo Cliente
          </Button>
        </div>

        {/* Melhores Clientes */}
        <div className="space-y-3 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Top Clientes
          </h2>
          
          <div className="space-y-3">
            {melhoresClientes.length === 0 ? (
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhum cliente ainda</p>
                </CardContent>
              </Card>
            ) : (
              melhoresClientes.map((cliente, index) => (
                <Card key={cliente.id} className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-100 text-yellow-600' :
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          <span className="text-xs font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{cliente.nome_completo}</p>
                          <p className="text-xs text-gray-500">{cliente.pontos_acumulados} pontos</p>
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                        {cliente.nivel_fidelidade}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Clientes Recentes */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Clientes Recentes
          </h2>
          
          <div className="space-y-3">
            {clientesRecentes.length === 0 ? (
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-4 text-center">
                  <Heart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhum cliente cadastrado</p>
                </CardContent>
              </Card>
            ) : (
              clientesRecentes.map((cliente, index) => (
                <Card key={cliente.id} className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{cliente.nome_completo}</p>
                          <p className="text-xs text-gray-500">
                            {cliente.data_cadastro && formatarData(cliente.data_cadastro)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {cliente.pontos_acumulados} pts
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Layout Desktop */}
      <div className="hidden lg:block">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Clientes */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Clientes</p>
                  <p className="text-2xl font-bold text-blue-900">{metricas.totalClientes}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Novos Clientes */}
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Novos</p>
                  <p className="text-2xl font-bold text-green-900">{metricas.clientesNovosMes}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Pontos Distribuídos */}
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Pontos</p>
                  <p className="text-2xl font-bold text-purple-900">{metricas.pontosDistribuidos}</p>
                </div>
                <Star className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          {/* Faturamento Estimado */}
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Faturamento</p>
                  <p className="text-xl font-bold text-orange-900">{formatarMoeda(metricas.faturamentoEstimado)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo em Grid para Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Melhores Clientes */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Top Clientes
            </h2>
            
            <div className="space-y-3">
              {melhoresClientes.length === 0 ? (
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Nenhum cliente ainda</p>
                  </CardContent>
                </Card>
              ) : (
                melhoresClientes.map((cliente, index) => (
                  <Card key={cliente.id} className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-100 text-yellow-600' :
                            index === 1 ? 'bg-gray-100 text-gray-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{cliente.nome_completo}</p>
                            <p className="text-sm text-gray-500">{cliente.pontos_acumulados} pontos</p>
                          </div>
                        </div>
                        <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                          {cliente.nivel_fidelidade}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Clientes Recentes */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Clientes Recentes
            </h2>
            
            <div className="space-y-3">
              {clientesRecentes.length === 0 ? (
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6 text-center">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Nenhum cliente cadastrado</p>
                  </CardContent>
                </Card>
              ) : (
                clientesRecentes.map((cliente, index) => (
                  <Card key={cliente.id} className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{cliente.nome_completo}</p>
                            <p className="text-sm text-gray-500">
                              {cliente.data_cadastro && formatarData(cliente.data_cadastro)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                          {cliente.pontos_acumulados} pts
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </BarbeariaLayout>
  );
};

export default BarbeariaDashboard;