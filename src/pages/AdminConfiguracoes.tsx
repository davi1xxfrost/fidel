import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Settings, Save, RefreshCw, Users, Gift, Mail, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConfiguracaoSistema {
  niveis_fidelidade: {
    BRONZE: { pontos_necessarios: number; beneficios: string[] };
    SILVER: { pontos_necessarios: number; beneficios: string[] };
    GOLD: { pontos_necessarios: number; beneficios: string[] };
    PLATINUM: { pontos_necessarios: number; beneficios: string[] };
  };
  pontos_por_servico: {
    corte: number;
    barba: number;
    combo: number;
    outros: number;
  };
  recompensas_padrao: {
    corte_gratis: { pontos_necessarios: number; descricao: string };
    desconto_50: { pontos_necessarios: number; descricao: string };
    desconto_25: { pontos_necessarios: number; descricao: string };
  };
  configuracoes_gerais: {
    pontos_minimos_resgate: number;
    dias_vencimento_pontos: number;
    taxa_sistema_percentual: number;
    limite_clientes_por_barbearia: number;
  };
}

const AdminConfiguracoes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema>({
    niveis_fidelidade: {
      BRONZE: { pontos_necessarios: 0, beneficios: ["Acesso básico ao sistema"] },
      SILVER: { pontos_necessarios: 10, beneficios: ["Descontos especiais", "Prioridade no atendimento"] },
      GOLD: { pontos_necessarios: 25, beneficios: ["Descontos exclusivos", "Atendimento VIP", "Recompensas especiais"] },
      PLATINUM: { pontos_necessarios: 50, beneficios: ["Todos os benefícios", "Atendimento premium", "Recompensas exclusivas"] }
    },
    pontos_por_servico: {
      corte: 5,
      barba: 3,
      combo: 8,
      outros: 2
    },
    recompensas_padrao: {
      corte_gratis: { pontos_necessarios: 20, descricao: "Corte grátis" },
      desconto_50: { pontos_necessarios: 15, descricao: "50% de desconto" },
      desconto_25: { pontos_necessarios: 10, descricao: "25% de desconto" }
    },
    configuracoes_gerais: {
      pontos_minimos_resgate: 5,
      dias_vencimento_pontos: 365,
      taxa_sistema_percentual: 5,
      limite_clientes_por_barbearia: 1000
    }
  });

  // Carregar configurações
  const carregarConfiguracoes = useCallback(async () => {
    setLoading(true);
    try {
      // Aqui você pode carregar as configurações do banco de dados
      // Por enquanto, vamos usar as configurações padrão
      setConfiguracoes(configuracoes);
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  }, [configuracoes, toast]);

  // Salvar configurações
  const salvarConfiguracoes = async () => {
    setSaving(true);
    try {
      // Aqui você pode salvar as configurações no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular salvamento
      
      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso",
        status: "success"
      });
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        status: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  // Resetar configurações
  const resetarConfiguracoes = () => {
    // eslint-disable-next-line no-alert
    if (confirm("Tem certeza que deseja resetar todas as configurações para os valores padrão?")) {
      carregarConfiguracoes();
      toast({
        title: "Sucesso!",
        description: "Configurações resetadas para os valores padrão",
        status: "success"
      });
    }
  };

  useEffect(() => {
    carregarConfiguracoes();
  }, [carregarConfiguracoes]);

  const handleNivelChange = (nivel: string, campo: string, valor: string | number) => {
    setConfiguracoes(prev => ({
      ...prev,
      niveis_fidelidade: {
        ...prev.niveis_fidelidade,
        [nivel]: {
          ...prev.niveis_fidelidade[nivel as keyof typeof prev.niveis_fidelidade],
          [campo]: campo === 'beneficios' ? valor.toString().split(',').map(b => b.trim()) : valor
        }
      }
    }));
  };

  const handlePontosChange = (servico: string, valor: number) => {
    setConfiguracoes(prev => ({
      ...prev,
      pontos_por_servico: {
        ...prev.pontos_por_servico,
        [servico]: valor
      }
    }));
  };

  const handleRecompensaChange = (recompensa: string, campo: string, valor: string | number) => {
    setConfiguracoes(prev => ({
      ...prev,
      recompensas_padrao: {
        ...prev.recompensas_padrao,
        [recompensa]: {
          ...prev.recompensas_padrao[recompensa as keyof typeof prev.recompensas_padrao],
          [campo]: valor
        }
      }
    }));
  };

  const handleGeralChange = (campo: string, valor: number) => {
    setConfiguracoes(prev => ({
      ...prev,
      configuracoes_gerais: {
        ...prev.configuracoes_gerais,
        [campo]: valor
      }
    }));
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Personalize o comportamento do sistema</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={resetarConfiguracoes}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Resetar
              </Button>
              <Button
                onClick={salvarConfiguracoes}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando configurações...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Níveis de Fidelidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Níveis de Fidelidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(configuracoes.niveis_fidelidade).map(([nivel, config]) => (
                    <div key={nivel} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">{nivel}</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pontos Necessários
                          </label>
                          <Input
                            type="number"
                            value={config.pontos_necessarios}
                            onChange={(e) => handleNivelChange(nivel, 'pontos_necessarios', parseInt(e.target.value) || 0)}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Benefícios (separados por vírgula)
                          </label>
                          <Input
                            type="text"
                            value={config.beneficios.join(', ')}
                            onChange={(e) => handleNivelChange(nivel, 'beneficios', e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pontos por Serviço */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Pontos por Serviço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(configuracoes.pontos_por_servico).map(([servico, pontos]) => (
                    <div key={servico} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2 capitalize">{servico}</h3>
                      <Input
                        type="number"
                        value={pontos}
                        onChange={(e) => handlePontosChange(servico, parseInt(e.target.value) || 0)}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recompensas Padrão */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Recompensas Padrão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(configuracoes.recompensas_padrao).map(([recompensa, config]) => (
                    <div key={recompensa} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3 capitalize">
                        {recompensa.replace('_', ' ')}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pontos Necessários
                          </label>
                          <Input
                            type="number"
                            value={config.pontos_necessarios}
                            onChange={(e) => handleRecompensaChange(recompensa, 'pontos_necessarios', parseInt(e.target.value) || 0)}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                          </label>
                          <Input
                            type="text"
                            value={config.descricao}
                            onChange={(e) => handleRecompensaChange(recompensa, 'descricao', e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configurações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pontos Mínimos para Resgate
                    </label>
                    <Input
                      type="number"
                      value={configuracoes.configuracoes_gerais.pontos_minimos_resgate}
                      onChange={(e) => handleGeralChange('pontos_minimos_resgate', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dias para Vencimento dos Pontos
                    </label>
                    <Input
                      type="number"
                      value={configuracoes.configuracoes_gerais.dias_vencimento_pontos}
                      onChange={(e) => handleGeralChange('dias_vencimento_pontos', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taxa do Sistema (%)
                    </label>
                    <Input
                      type="number"
                      value={configuracoes.configuracoes_gerais.taxa_sistema_percentual}
                      onChange={(e) => handleGeralChange('taxa_sistema_percentual', parseFloat(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Limite de Clientes por Barbearia
                    </label>
                    <Input
                      type="number"
                      value={configuracoes.configuracoes_gerais.limite_clientes_por_barbearia}
                      onChange={(e) => handleGeralChange('limite_clientes_por_barbearia', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Configurações de Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email de Suporte
                    </label>
                    <Input
                      type="email"
                      placeholder="suporte@sistema.com"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assunto Padrão de Emails
                    </label>
                    <Input
                      type="text"
                      placeholder="Sistema de Fidelidade - Barbearia"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template de Boas-vindas
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Olá {nome}, bem-vindo ao sistema de fidelidade da {barbearia}!"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Configurações de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chave Pública do Stripe
                    </label>
                    <Input
                      type="text"
                      placeholder="pk_test_..."
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chave Secreta do Stripe
                    </label>
                    <Input
                      type="password"
                      placeholder="sk_test_..."
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Webhook Secret
                    </label>
                    <Input
                      type="password"
                      placeholder="whsec_..."
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modo de Pagamento
                    </label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="test">Teste</option>
                      <option value="live">Produção</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConfiguracoes; 