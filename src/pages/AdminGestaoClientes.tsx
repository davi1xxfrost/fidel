import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, User, MapPin, Calendar, Phone, ArrowLeft, Trash2, Users, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Cliente {
  id: string;
  nome_completo: string;
  celular_whatsapp: string;
  pontos_acumulados: number;
  nivel_fidelidade: string;
  data_cadastro: string;
  barbearia_id: string;
  barbearia_nome?: string;
  qr_code_id: string;
}

interface Barbearia {
  id: string;
  nome_barbearia: string;
}

const AdminGestaoClientes = () => {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [barbearias, setBarbearias] = useState<Barbearia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBarbearia, setSelectedBarbearia] = useState<string>("");
  const [showMigrateModal, setShowMigrateModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedTargetBarbearia, setSelectedTargetBarbearia] = useState<string>("");

  const navigate = useNavigate();

  // Buscar todos os clientes com dados da barbearia
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select(`
          *,
          barbearias!inner(nome_barbearia)
        `)
        .order("data_cadastro", { ascending: false });

      if (error) {
        throw error;
      }

      const clientesFormatados = data?.map(cliente => ({
        ...cliente,
        barbearia_nome: cliente.barbearias?.nome_barbearia
      })) || [];

      setClientes(clientesFormatados);
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar clientes",
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar barbearias para migração
  const fetchBarbearias = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("barbearias")
        .select("id, nome_barbearia")
        .order("nome_barbearia");

      if (error) {
        throw error;
      }

      setBarbearias(data || []);
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar barbearias",
        status: "error"
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchClientes();
    fetchBarbearias();
  }, [fetchClientes, fetchBarbearias]);

  // Filtrar clientes
  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = 
      cliente.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.celular_whatsapp.includes(searchTerm) ||
      cliente.qr_code_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBarbearia = !selectedBarbearia || cliente.barbearia_id === selectedBarbearia;
    
    return matchesSearch && matchesBarbearia;
  });

  // Migrar cliente entre barbearias
  const migrarCliente = async () => {
    if (!selectedCliente || !selectedTargetBarbearia) {
      toast({
        title: "Erro",
        description: "Selecione o cliente e a barbearia de destino",
        status: "error"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("clientes")
        .update({ barbearia_id: selectedTargetBarbearia })
        .eq("id", selectedCliente.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Cliente migrado com sucesso",
        status: "success"
      });

      setShowMigrateModal(false);
      setSelectedCliente(null);
      setSelectedTargetBarbearia("");
      await fetchClientes();
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao migrar cliente",
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Excluir cliente
  const excluirCliente = async (clienteId: string) => {
    // eslint-disable-next-line no-alert
    if (!confirm("Tem certeza que deseja excluir este cliente?")) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", clienteId);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Cliente excluído com sucesso",
        status: "success"
      });

      await fetchClientes();
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente",
        status: "error"
      });
    } finally {
      setLoading(false);
    }
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestão de Clientes</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Gerencie todos os clientes do sistema</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{clientes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Barbearias Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">{barbearias.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clientes VIP</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clientes.filter(c => c.nivel_fidelidade === 'GOLD' || c.nivel_fidelidade === 'PLATINUM').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Novos (30 dias)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clientes.filter(c => {
                      const dataCadastro = new Date(c.data_cadastro);
                      const trintaDiasAtras = new Date();
                      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
                      return dataCadastro >= trintaDiasAtras;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email, telefone ou QR Code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedBarbearia}
                onChange={(e) => setSelectedBarbearia(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as barbearias</option>
                {barbearias.map(barbearia => (
                  <option key={barbearia.id} value={barbearia.id}>
                    {barbearia.nome_barbearia}
                  </option>
                ))}
              </select>

              <div className="text-sm text-gray-600 flex items-center justify-center">
                {filteredClientes.length} de {clientes.length} clientes
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando clientes...</p>
              </div>
            ) : filteredClientes.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedBarbearia ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || selectedBarbearia 
                    ? "Tente ajustar os filtros de busca." 
                    : "Os clientes aparecerão aqui quando forem cadastrados."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClientes.map((cliente) => (
                  <div key={cliente.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {cliente.nome_completo.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {cliente.nome_completo}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                cliente.nivel_fidelidade === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                                cliente.nivel_fidelidade === 'PLATINUM' ? 'bg-purple-100 text-purple-800' :
                                cliente.nivel_fidelidade === 'SILVER' ? 'bg-gray-100 text-gray-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {cliente.nivel_fidelidade}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                <span>{cliente.celular_whatsapp}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{cliente.barbearia_nome}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(cliente.data_cadastro).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-xs text-gray-500">
                              <span className="font-medium">QR Code:</span> {cliente.qr_code_id} | 
                              <span className="font-medium ml-2">Pontos:</span> {cliente.pontos_acumulados}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCliente(cliente);
                            setShowMigrateModal(true);
                          }}
                          disabled={loading}
                        >
                          Migrar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => excluirCliente(cliente.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Migração */}
      {showMigrateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Migrar Cliente</h3>
            
            {selectedCliente && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedCliente.nome_completo}</p>
                <p className="text-sm text-gray-600">De: {selectedCliente.barbearia_nome}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para qual barbearia?
              </label>
              <select
                value={selectedTargetBarbearia}
                onChange={(e) => setSelectedTargetBarbearia(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma barbearia</option>
                {barbearias
                  .filter(b => b.id !== selectedCliente?.barbearia_id)
                  .map(barbearia => (
                    <option key={barbearia.id} value={barbearia.id}>
                      {barbearia.nome_barbearia}
                    </option>
                  ))}
              </select>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={migrarCliente}
                disabled={loading || !selectedTargetBarbearia}
                className="flex-1"
              >
                {loading ? "Migrando..." : "Confirmar Migração"}
              </Button>
              <Button
                onClick={() => {
                  setShowMigrateModal(false);
                  setSelectedCliente(null);
                  setSelectedTargetBarbearia("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGestaoClientes; 