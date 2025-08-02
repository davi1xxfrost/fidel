import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Transacao {
  id: string;
  tipo: string;
  valor_pontos: number;
  descricao: string | null;
  data_transacao: string;
}

interface Cliente {
  id: string;
  pontos_acumulados: number;
  nome_completo: string;
}

const ClienteHistorico = () => {
  const navigate = useNavigate();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDadosCliente = async () => {
      try {
        // Verificar se o usuário está logado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/");
          return;
        }

        // Buscar dados do cliente
        const { data: clienteData, error: clienteError } = await supabase
          .from("clientes")
          .select("id, pontos_acumulados, nome_completo, barbearia_id")
          .eq("usuario_auth_id", user.id)
          .single();

        if (clienteError || !clienteData) {
          setError("Cliente não encontrado");
          setLoading(false);
          return;
        }

        setCliente(clienteData);

        // Buscar transações do cliente
        const { data: transacoesData, error: transacoesError } = await supabase
          .from("transacoes_pontos")
          .select("*")
          .eq("cliente_id", clienteData.id)
          .eq("barbearia_id", clienteData.barbearia_id)
          .order("data_transacao", { ascending: false });

        if (transacoesError) {
          setError("Erro ao carregar histórico");
        } else {
          setTransacoes(transacoesData || []);
        }

      } catch (_err) {
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchDadosCliente();
  }, [navigate]);

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR");
  };

  const formatarHora = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-barber-cream to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando histórico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-barber-cream to-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate("/cliente-meu-cartao")}>
            Voltar ao Cartão
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-barber-cream to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-barber-brown-light text-primary-foreground p-4 shadow-elegant">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/cliente-meu-cartao")}
            className="text-primary-foreground hover:bg-white/20 p-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Histórico de Pontos</h1>
            <p className="text-primary-foreground/80 text-xs">Suas atividades no cartão</p>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-6 space-y-4">
        {/* Resumo total */}
        <Card className="bg-gradient-to-r from-barber-gold/10 to-barber-gold-dark/10 border-barber-gold/30">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-barber-gold-dark">
                {cliente?.pontos_acumulados || 0} Pontos
              </div>
              <p className="text-sm text-muted-foreground">Total acumulado desde o início</p>
            </div>
          </CardContent>
        </Card>

        {/* Lista do histórico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transacoes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Suas atividades aparecerão aqui quando você ganhar ou resgatar pontos
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transacoes.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.tipo === "GANHO" 
                          ? "bg-green-100 text-green-600" 
                          : "bg-red-100 text-red-600"
                      }`}>
                        {item.tipo === "GANHO" ? (
                          <Plus className="w-5 h-5" />
                        ) : (
                          <Minus className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.descricao || "Transação"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatarData(item.data_transacao)} às {formatarHora(item.data_transacao)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        item.tipo === "GANHO" ? "text-green-600" : "text-red-600"
                      }`}>
                        {item.tipo === "GANHO" ? "+" : "-"}{Math.abs(item.valor_pontos)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.abs(item.valor_pontos) === 1 ? "ponto" : "pontos"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-foreground">Sobre seu histórico</h3>
              <p className="text-sm text-muted-foreground">
                Aqui você pode acompanhar todos os pontos ganhos e recompensas resgatadas
              </p>
              <div className="flex justify-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 bg-green-100 rounded-full"></div>
                  <span>Pontos ganhos</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 bg-red-100 rounded-full"></div>
                  <span>Pontos resgatados</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClienteHistorico;