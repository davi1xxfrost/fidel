import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Users, Bell, Mail, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BarbeariaLayout from "@/components/BarbeariaLayout";

interface Cliente {
  id: string;
  nome_completo: string;
  email?: string;
  telefone?: string;
  nivel_fidelidade: string;
  pontos_acumulados: number;
}

const BarbeariaComunicacao = () => {
  const [_slug] = useParams();
  const [_navigate] = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [_loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [tipoComunicacao, setTipoComunicacao] = useState<"todos" | "nivel" | "pontos">("todos");
  const [nivelSelecionado, setNivelSelecionado] = useState("");
  const [pontosMinimos, setPontosMinimos] = useState(0);
  const [_setOpcaoSelecionada] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const fetchClientes = async () => {
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
    };

    fetchClientes();
  }, []);

  const getClientesFiltrados = () => {
    switch (tipoComunicacao) {
      case "nivel":
        return clientes.filter(cliente => cliente.nivel_fidelidade === nivelSelecionado);
      case "pontos":
        return clientes.filter(cliente => cliente.pontos_acumulados >= pontosMinimos);
      default:
        return clientes;
    }
  };

  const handleEnviarMensagem = async () => {
    if (!mensagem.trim()) return;

    setEnviando(true);
    const _clientesFiltrados = getClientesFiltrados();
    
    try {
      // Aqui você implementaria a lógica de envio
      // Por enquanto, apenas simula o envio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMensagem("");
      setTipoComunicacao("todos");
      setNivelSelecionado("");
      setPontosMinimos(0);
      
      // Usar toast em vez de alert
      // toast({
      //   title: "Sucesso",
      //   description: `Mensagem enviada para ${_clientesFiltrados.length} clientes!`,
      //   status: "success"
      // });
    } catch (_error) {
      // Usar toast em vez de alert
      // toast({
      //   title: "Erro",
      //   description: "Erro ao enviar mensagem. Tente novamente.",
      //   status: "error"
      // });
    } finally {
      setEnviando(false);
    }
  };

  const niveisFidelidade = [...new Set(clientes.map(c => c.nivel_fidelidade))];

  return (
    <BarbeariaLayout 
      title="Central de Comunicação" 
      subtitle="Comunique-se com seus clientes"
      icon={MessageCircle}
    >
      {/* Layout Mobile */}
      <div className="lg:hidden">
        <div className="space-y-6">
          {/* Seleção de Tipo */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Tipo de Comunicação</h3>
              <div className="space-y-3">
                <Button
                  variant={tipoComunicacao === "todos" ? "default" : "outline"}
                  onClick={() => setTipoComunicacao("todos")}
                  className="w-full justify-start"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Todos os Clientes
                </Button>
                
                <Button
                  variant={tipoComunicacao === "nivel" ? "default" : "outline"}
                  onClick={() => setTipoComunicacao("nivel")}
                  className="w-full justify-start"
                >
                  <Badge className="w-4 h-4 mr-2" />
                  Por Nível de Fidelidade
                </Button>
                
                <Button
                  variant={tipoComunicacao === "pontos" ? "default" : "outline"}
                  onClick={() => setTipoComunicacao("pontos")}
                  className="w-full justify-start"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Por Pontos Mínimos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filtros */}
          {tipoComunicacao === "nivel" && (
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nível de Fidelidade
                </Label>
                <select
                  value={nivelSelecionado}
                  onChange={(e) => setNivelSelecionado(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um nível</option>
                  {niveisFidelidade.map(nivel => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                  ))}
                </select>
              </CardContent>
            </Card>
          )}

          {tipoComunicacao === "pontos" && (
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Pontos Mínimos
                </Label>
                <input
                  type="number"
                  value={pontosMinimos}
                  onChange={(e) => setPontosMinimos(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 100"
                />
              </CardContent>
            </Card>
          )}

          {/* Mensagem */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Mensagem
              </Label>
              <Textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite sua mensagem aqui..."
                className="min-h-[120px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Preview</h3>
                <Badge variant="secondary">
                  {getClientesFiltrados().length} clientes
                </Badge>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {getClientesFiltrados().slice(0, 5).map(cliente => (
                  <div key={cliente.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{cliente.nome_completo}</span>
                    <Badge variant="outline" className="text-xs">
                      {cliente.pontos_acumulados} pts
                    </Badge>
                  </div>
                ))}
                {getClientesFiltrados().length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{getClientesFiltrados().length - 5} mais...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botão Enviar */}
          <Button
            onClick={handleEnviarMensagem}
            disabled={!mensagem.trim() || enviando}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
          >
            {enviando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Layout Desktop */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Controle */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tipo de Comunicação */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tipo de Comunicação</h3>
                <div className="space-y-3">
                  <Button
                    variant={tipoComunicacao === "todos" ? "default" : "outline"}
                    onClick={() => setTipoComunicacao("todos")}
                    className="w-full justify-start h-12"
                  >
                    <Users className="w-4 h-4 mr-3" />
                    Todos os Clientes
                  </Button>
                  
                  <Button
                    variant={tipoComunicacao === "nivel" ? "default" : "outline"}
                    onClick={() => setTipoComunicacao("nivel")}
                    className="w-full justify-start h-12"
                  >
                    <Badge className="w-4 h-4 mr-3" />
                    Por Nível de Fidelidade
                  </Button>
                  
                  <Button
                    variant={tipoComunicacao === "pontos" ? "default" : "outline"}
                    onClick={() => setTipoComunicacao("pontos")}
                    className="w-full justify-start h-12"
                  >
                    <MessageCircle className="w-4 h-4 mr-3" />
                    Por Pontos Mínimos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            {tipoComunicacao === "nivel" && (
              <Card>
                <CardContent className="p-6">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Nível de Fidelidade
                  </Label>
                  <select
                    value={nivelSelecionado}
                    onChange={(e) => setNivelSelecionado(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um nível</option>
                    {niveisFidelidade.map(nivel => (
                      <option key={nivel} value={nivel}>{nivel}</option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            )}

            {tipoComunicacao === "pontos" && (
              <Card>
                <CardContent className="p-6">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Pontos Mínimos
                  </Label>
                  <input
                    type="number"
                    value={pontosMinimos}
                    onChange={(e) => setPontosMinimos(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 100"
                  />
                </CardContent>
              </Card>
            )}

            {/* Estatísticas */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Estatísticas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total de Clientes</span>
                    <Badge variant="secondary">{clientes.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Clientes Selecionados</span>
                    <Badge variant="default">{getClientesFiltrados().length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Com Email</span>
                    <Badge variant="outline">
                      {getClientesFiltrados().filter(c => c.email).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Com Telefone</span>
                    <Badge variant="outline">
                      {getClientesFiltrados().filter(c => c.telefone).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área de Mensagem */}
          <div className="lg:col-span-2 space-y-6">
            {/* Editor de Mensagem */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Composição da Mensagem</h3>
                  <Badge variant="secondary">
                    {getClientesFiltrados().length} destinatários
                  </Badge>
                </div>
                
                <Textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Digite sua mensagem aqui... Você pode usar variáveis como {nome} para personalizar."
                  className="min-h-[200px] resize-none text-base"
                />
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </span>
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-4 h-4" />
                      SMS
                    </span>
                    <span className="flex items-center gap-1">
                      <Bell className="w-4 h-4" />
                      Push
                    </span>
                  </div>
                  
                  <Button
                    onClick={handleEnviarMensagem}
                    disabled={!mensagem.trim() || enviando}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {enviando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview dos Clientes */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Preview dos Destinatários</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {getClientesFiltrados().map(cliente => (
                    <div key={cliente.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{cliente.nome_completo}</p>
                        <p className="text-xs text-gray-500">{cliente.email || 'Sem email'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {cliente.pontos_acumulados} pts
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {cliente.nivel_fidelidade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {getClientesFiltrados().length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum cliente encontrado com os filtros selecionados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </BarbeariaLayout>
  );
};

export default BarbeariaComunicacao;