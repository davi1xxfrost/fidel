import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Users, Building, BarChart3, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RelatorioBarbearia {
  id: string;
  nome_barbearia: string;
  total_clientes: number;
  clientes_novos_30dias: number;
  clientes_vip: number;
  media_pontos: number;
}

interface RelatorioCrescimento {
  mes: string;
  barbearias_novas: number;
  clientes_novos: number;
  crescimento_percentual: number;
}

interface RelatorioCliente {
  id: string;
  nome_completo: string;
  barbearia_nome: string;
  pontos_acumulados: number;
  nivel_fidelidade: string;
  data_cadastro: string;
}

const AdminRelatorios = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("30"); // 30, 60, 90 dias
  const [relatorioBarbearias, setRelatorioBarbearias] = useState<RelatorioBarbearia[]>([]);
  const [relatorioCrescimento, setRelatorioCrescimento] = useState<RelatorioCrescimento[]>([]);
  const [topClientes, setTopClientes] = useState<RelatorioCliente[]>([]);
  const [estatisticasGerais, setEstatisticasGerais] = useState({
    totalBarbearias: 0,
    totalClientes: 0,
    mediaClientesPorBarbearia: 0,
    barbeariaMaisAtiva: "",
    clienteMaisEngajado: ""
  });

  // Buscar relatório de barbearias
  const fetchRelatorioBarbearias = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("barbearias")
        .select(`
          id,
          nome_barbearia,
          clientes!inner(
            id,
            pontos_acumulados,
            nivel_fidelidade,
            data_cadastro
          )
        `);

      if (error) throw error;

      const relatorio = data?.map(barbearia => {
        const clientes = barbearia.clientes || [];
        const clientesNovos30Dias = clientes.filter((cliente: Record<string, unknown>) => {
          const dataCadastro = new Date(cliente.data_cadastro as string);
          const trintaDiasAtras = new Date();
          trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
          return dataCadastro >= trintaDiasAtras;
        }).length;

        const clientesVip = clientes.filter((cliente: Record<string, unknown>) => 
          cliente.nivel_fidelidade === 'GOLD' || cliente.nivel_fidelidade === 'PLATINUM'
        ).length;

        const mediaPontos = clientes.length > 0 
          ? clientes.reduce((acc: number, cliente: Record<string, unknown>) => acc + (cliente.pontos_acumulados as number), 0) / clientes.length
          : 0;

        return {
          id: barbearia.id,
          nome_barbearia: barbearia.nome_barbearia,
          total_clientes: clientes.length,
          clientes_novos_30dias: clientesNovos30Dias,
          clientes_vip: clientesVip,
          media_pontos: Math.round(mediaPontos * 100) / 100
        };
      }) || [];

      setRelatorioBarbearias(relatorio.sort((a, b) => b.total_clientes - a.total_clientes));
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar relatório de barbearias",
        status: "error"
      });
    }
  }, [toast]);

  // Buscar relatório de crescimento
  const fetchRelatorioCrescimento = useCallback(async () => {
    try {
      const meses = [];
      const hoje = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        meses.push({
          mes: data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          barbearias_novas: Math.floor(Math.random() * 10) + 1, // Simulado
          clientes_novos: Math.floor(Math.random() * 50) + 10, // Simulado
          crescimento_percentual: Math.floor(Math.random() * 30) + 5 // Simulado
        });
      }

      setRelatorioCrescimento(meses);
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar relatório de crescimento",
        status: "error"
      });
    }
  }, [toast]);

  // Buscar top clientes
  const fetchTopClientes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select(`
          id,
          nome_completo,
          pontos_acumulados,
          nivel_fidelidade,
          data_cadastro,
          barbearias!inner(nome_barbearia)
        `)
        .order("pontos_acumulados", { ascending: false })
        .limit(10);

      if (error) throw error;

      const clientesFormatados = data?.map(cliente => ({
        id: cliente.id,
        nome_completo: cliente.nome_completo,
        barbearia_nome: cliente.barbearias?.nome_barbearia,
        pontos_acumulados: cliente.pontos_acumulados,
        nivel_fidelidade: cliente.nivel_fidelidade,
        data_cadastro: cliente.data_cadastro
      })) || [];

      setTopClientes(clientesFormatados);
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar top clientes",
        status: "error"
      });
    }
  }, [toast]);

  // Buscar estatísticas gerais
  const fetchEstatisticasGerais = useCallback(async () => {
    try {
      const { data: barbearias, error: errorBarbearias } = await supabase
        .from("barbearias")
        .select("id, nome_barbearia");

      const { data: clientes, error: errorClientes } = await supabase
        .from("clientes")
        .select("id, barbearia_id, barbearias!inner(nome_barbearia)");

      if (errorBarbearias || errorClientes) throw errorBarbearias || errorClientes;

      const totalBarbearias = barbearias?.length || 0;
      const totalClientes = clientes?.length || 0;
      const mediaClientesPorBarbearia = totalBarbearias > 0 ? Math.round(totalClientes / totalBarbearias) : 0;

      // Barbearia mais ativa (com mais clientes)
      const barbeariasComClientes = barbearias?.map(barbearia => ({
        ...barbearia,
        total_clientes: clientes?.filter(cliente => cliente.barbearia_id === barbearia.id).length || 0
      })) || [];

      const barbeariaMaisAtiva = barbeariasComClientes
        .sort((a, b) => b.total_clientes - a.total_clientes)[0]?.nome_barbearia || "";

      setEstatisticasGerais({
        totalBarbearias,
        totalClientes,
        mediaClientesPorBarbearia,
        barbeariaMaisAtiva,
        clienteMaisEngajado: topClientes[0]?.nome_completo || ""
      });
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar estatísticas gerais",
        status: "error"
      });
    }
  }, [toast, topClientes]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchRelatorioBarbearias(),
        fetchRelatorioCrescimento(),
        fetchTopClientes()
      ]);
      await fetchEstatisticasGerais();
      setLoading(false);
    };

    fetchData();
  }, [fetchRelatorioBarbearias, fetchRelatorioCrescimento, fetchTopClientes, fetchEstatisticasGerais]);

  // Exportar relatório
  const exportarRelatorio = () => {
    const dados = {
      periodo,
      relatorioBarbearias,
      relatorioCrescimento,
      topClientes,
      estatisticasGerais,
      dataExportacao: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-admin-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Sucesso!",
      description: "Relatório exportado com sucesso",
      status: "success"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin-dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Relatórios Avançados</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Análises e métricas do sistema</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="30">Últimos 30 dias</option>
                <option value="60">Últimos 60 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
              
              <Button onClick={exportarRelatorio} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando relatórios...</p>
          </div>
        ) : (
          <>
            {/* Estatísticas Gerais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total de Barbearias</p>
                      <p className="text-2xl font-bold text-gray-900">{estatisticasGerais.totalBarbearias}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                      <p className="text-2xl font-bold text-gray-900">{estatisticasGerais.totalClientes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Média por Barbearia</p>
                      <p className="text-2xl font-bold text-gray-900">{estatisticasGerais.mediaClientesPorBarbearia}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Crescimento</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {relatorioCrescimento[relatorioCrescimento.length - 1]?.crescimento_percentual || 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Relatório de Barbearias */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Ranking de Barbearias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatorioBarbearias.map((barbearia, index) => (
                    <div key={barbearia.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{barbearia.nome_barbearia}</h3>
                          <p className="text-sm text-gray-600">
                            {barbearia.total_clientes} clientes • {barbearia.clientes_vip} VIP • {barbearia.media_pontos} pts média
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">+{barbearia.clientes_novos_30dias} este mês</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Relatório de Crescimento */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Crescimento Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatorioCrescimento.map((mes, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{mes.mes}</h3>
                        <p className="text-sm text-gray-600">
                          {mes.barbearias_novas} barbearias • {mes.clientes_novos} clientes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          mes.crescimento_percentual > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {mes.crescimento_percentual > 0 ? '+' : ''}{mes.crescimento_percentual}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Clientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Top 10 Clientes Mais Engajados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topClientes.map((cliente, index) => (
                    <div key={cliente.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{cliente.nome_completo}</h3>
                          <p className="text-sm text-gray-600">
                            {cliente.barbearia_nome} • {cliente.nivel_fidelidade}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{cliente.pontos_acumulados} pontos</p>
                        <p className="text-sm text-gray-600">
                          {new Date(cliente.data_cadastro).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRelatorios; 