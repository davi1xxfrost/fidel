import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Scissors, Sparkles, Gift, CheckCircle, Lock, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Recompensa {
  id: string;
  descricao: string | null;
  valor_pontos: number | null;
  barbearia_id: string | null;
  cliente_id: string | null;
  data_resgate: string | null;
}

interface Cliente {
  id: string;
  pontos_acumulados: number;
  nome_completo: string;
  barbearia_id: string;
}

const ClienteRecompensas = () => {
  const navigate = useNavigate();
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDados = async () => {
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

        // Buscar recompensas disponíveis para a barbearia
        const { data: recompensasData, error: recompensasError } = await supabase
          .from("recompensas")
          .select("*")
          .eq("barbearia_id", clienteData.barbearia_id)
          .is("cliente_id", null)
          .order("valor_pontos", { ascending: true });

        if (recompensasError) {
          setError("Erro ao carregar recompensas");
        } else {
          setRecompensas(recompensasData || []);
        }

      } catch (_err) {
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [navigate]);

  const getStatusRecompensa = (valorPontos: number) => {
    if (!cliente) return { status: "indisponivel", texto: "Carregando...", cor: "text-muted-foreground", icone: Lock };
    
    if (cliente.pontos_acumulados >= valorPontos) {
      return { 
        status: "disponivel", 
        texto: "Disponível para resgate!", 
        cor: "text-green-600",
        icone: CheckCircle 
      };
    } else {
      const faltam = valorPontos - cliente.pontos_acumulados;
      return { 
        status: "indisponivel", 
        texto: `Faltam ${faltam} ${faltam === 1 ? 'ponto' : 'pontos'}`, 
        cor: "text-muted-foreground",
        icone: Lock 
      };
    }
  };

  const getIconeRecompensa = (descricao: string) => {
    const descricaoLower = descricao.toLowerCase();
    if (descricaoLower.includes("corte")) return Scissors;
    if (descricaoLower.includes("barba")) return Sparkles;
    if (descricaoLower.includes("hidratação") || descricaoLower.includes("tratamento")) return Gift;
    if (descricaoLower.includes("combo") || descricaoLower.includes("completo")) return Crown;
    return Gift;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-barber-cream to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando recompensas...</p>
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
            <h1 className="text-lg font-bold">Recompensas Disponíveis</h1>
            <p className="text-primary-foreground/80 text-xs">Suas recompensas disponíveis</p>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-6 space-y-4">
        {/* Status atual dos pontos */}
        <Card className="bg-gradient-to-r from-barber-gold/10 to-barber-gold-dark/10 border-barber-gold/30">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-barber-gold-dark">
                {cliente?.pontos_acumulados || 0} Pontos
              </div>
              <p className="text-sm text-muted-foreground">Seus pontos atuais</p>
            </div>
          </CardContent>
        </Card>

        {/* Lista de recompensas */}
        {recompensas.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Recompensas ainda não foram cadastradas</h3>
              <p className="text-muted-foreground">
                Sua barbearia ainda não configurou recompensas. Entre em contato para mais informações.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recompensas.map((recompensa) => {
              const status = getStatusRecompensa(recompensa.valor_pontos || 0);
              const Icon = getIconeRecompensa(recompensa.descricao || "");
              const StatusIcon = status.icone;

              return (
                <Card key={recompensa.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-barber-gold to-barber-gold-dark rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">
                              {recompensa.descricao || "Recompensa"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {recompensa.descricao || "Recompensa disponível"}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-barber-gold-dark">
                              {recompensa.valor_pontos || 0} pts
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {(recompensa.valor_pontos || 0) === 1 ? "ponto" : "pontos"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${status.cor}`} />
                            <span className={`text-sm ${status.cor}`}>
                              {status.texto}
                            </span>
                          </div>
                          
                          {status.status === "disponivel" && (
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-barber-gold to-barber-gold-dark hover:from-barber-gold-dark hover:to-barber-gold text-white"
                            >
                              Resgatar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Informações adicionais */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-foreground">Sobre as recompensas</h3>
              <p className="text-sm text-muted-foreground">
                Acumule pontos fazendo serviços na barbearia e resgate recompensas exclusivas
              </p>
              <div className="flex justify-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span>Disponível</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 text-muted-foreground" />
                  <span>Indisponível</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClienteRecompensas;