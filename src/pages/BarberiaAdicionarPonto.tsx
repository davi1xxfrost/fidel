import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ArrowLeft, Plus, Users, User, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface Cliente {
  id: string;
  nome_completo: string;
  pontos_acumulados: number;
  nivel_fidelidade: string;
  celular_whatsapp: string;
}

const BarberiaAdicionarPonto = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pontos, setPontos] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleAddPontos = async () => {
    if (!selectedCliente) return;

    try {
      setSubmitting(true);
      const barbeariaId = await fetchBarbeariaId();
      if (!barbeariaId) return;

      const { error } = await supabase
        .from('transacoes_pontos')
        .insert({
          cliente_id: selectedCliente.id,
          barbearia_id: barbeariaId,
          valor_pontos: pontos,
          tipo: 'adicao',
          descricao: `Pontos adicionados manualmente`
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${pontos} pontos adicionados com sucesso!`,
        status: "success"
      });

      setSelectedCliente(null);
      setPontos(1);
      fetchClientes();
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar pontos",
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
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Adicionar Pontos</h1>
              <p className="text-xs text-gray-500">Recompense seus clientes</p>
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

          {/* Configuração de Pontos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="w-4 h-4 text-green-600" />
                Configurar Pontos
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
                        <p className="text-xs text-gray-500">pontos atuais</p>
                      </div>
                    </div>
                  </div>

                  {/* Quantidade de Pontos */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Quantidade de Pontos</label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPontos(Math.max(1, pontos - 1))}
                        disabled={pontos <= 1}
                        className="w-10 h-10 p-0"
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        value={pontos}
                        onChange={(e) => setPontos(Math.max(1, parseInt(e.target.value) || 1))}
                        className="text-center text-lg font-bold h-12"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPontos(pontos + 1)}
                        className="w-10 h-10 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-gray-900 text-sm mb-3">Resumo da Operação</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Novos pontos:</span>
                        <span className="text-lg font-bold text-green-600">+{pontos}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Total após adição:</span>
                        <span className="text-xl font-bold text-green-600">{selectedCliente.pontos_acumulados + pontos}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botão Adicionar */}
                  <Button
                    onClick={handleAddPontos}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar {pontos} Pontos
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecione um Cliente</h3>
                  <p className="text-sm text-gray-600">
                    Escolha um cliente da lista para adicionar pontos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card Compacto */}
        <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Dica</h4>
                <p className="text-xs text-gray-600">
                  Adicione pontos para recompensar seus clientes e aumentar a fidelidade.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BarberiaAdicionarPonto;