import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAudit } from "@/hooks/useAudit";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building, Settings, Shield, BarChart3, ArrowRight } from "lucide-react";

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logAction } = useAudit();
  
  // Formulário barbearia
  const [barbEmail, setBarbEmail] = useState("");
  const [barbPassword, setBarbPassword] = useState("");
  const [barbNome, setBarbNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Função para gerar slug
  const generateSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };
  
  interface Barbearia {
    id: string;
    nome_barbearia: string;
    email_contato: string;
    slug?: string;
  }

  const [barbearias, setBarbearias] = useState<Barbearia[]>([]);
  const [clientesAtivos, setClientesAtivos] = useState(0);

  // Filtrar barbearias por busca
  const filteredBarbearias = barbearias.filter(barbearia =>
    barbearia.nome_barbearia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Buscar todas as barbearias cadastradas
  const fetchBarbearias = useCallback(async () => {
    const { data, error } = await supabase
      .from("barbearias")
      .select("id, nome_barbearia, email_contato, slug");
    // Log removido para produção
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar barbearias",
        status: "error"
      });
    } else {
      setBarbearias((data as unknown as Barbearia[]) || []);
    }
  }, [toast]);

  // Buscar clientes ativos
  const fetchClientesAtivos = useCallback(async () => {
    const { count, error } = await supabase
      .from("clientes")
      .select("*", { count: "exact", head: true });
    
    if (error) {
      // Erro ao buscar clientes ativos
    } else {
      setClientesAtivos(count || 0);
    }
  }, []);

  useEffect(() => {
    fetchBarbearias();
    fetchClientesAtivos();
  }, [fetchBarbearias, fetchClientesAtivos]);

  const cadastrarBarbearia = async () => {
    if (!barbEmail || !barbPassword || !barbNome) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, e-mail e senha são obrigatórios",
        status: "warning"
      });
      return;
    }
    setLoading(true);
    try {
      // 1. Criar usuário no Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: barbEmail,
        password: barbPassword,
        options: {
          data: { tipo: "barbearia" }
        }
      });
      if (authError || !data.user) {
        throw new Error(authError?.message || "Erro ao criar usuário");
      }
      // 2. Criar registro na tabela barbearias
      const { error: barbError } = await supabase.from("barbearias").insert({
        email_contato: barbEmail,
        nome_barbearia: barbNome,
        usuario_auth_id: data.user.id,
        senha_hash: "**********", // Não armazenamos a senha real, apenas um placeholder
        slug: generateSlug(barbNome) // Gerar slug automaticamente
      });
      if (barbError) {
        throw new Error(barbError.message);
      }
      
      // Log da ação
      await logAction("CREATE", "barbearias", data.user.id, null, {
        email_contato: barbEmail,
        nome_barbearia: barbNome,
        slug: generateSlug(barbNome)
      });
      
      toast({
        title: "Sucesso!",
        description: "Barbearia cadastrada com sucesso",
        status: "success"
      });
      
      setBarbEmail("");
      setBarbPassword("");
      setBarbNome("");
      // Atualizar lista de barbearias
      await fetchBarbearias();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar barbearia";
      toast({
        title: "Erro",
        description: message,
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const editarBarbearia = async (id: string) => {
    if (!barbNome) {
      toast({
        title: "Nome obrigatório",
        description: "O nome da barbearia é obrigatório",
        status: "warning"
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("barbearias")
        .update({
          nome_barbearia: barbNome,
          email_contato: barbEmail,
          slug: generateSlug(barbNome)
        })
        .eq("id", id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Log da ação
      await logAction("UPDATE", "barbearias", id, null, {
        nome_barbearia: barbNome,
        email_contato: barbEmail,
        slug: generateSlug(barbNome)
      });
      
      toast({
        title: "Sucesso!",
        description: "Barbearia editada com sucesso",
        status: "success"
      });
      
      setBarbEmail("");
      setBarbPassword("");
      setBarbNome("");
      setEditingId(null);
      setShowForm(false);
      
      // Atualizar lista imediatamente
      await fetchBarbearias();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao editar barbearia";
      toast({
        title: "Erro",
        description: message,
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const excluirBarbearia = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("barbearias")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Log da ação
      await logAction("DELETE", "barbearias", id, null, null, "WARNING");
      
      toast({
        title: "Sucesso!",
        description: "Barbearia excluída com sucesso",
        status: "success"
      });
      
      // Atualizar lista imediatamente
      await fetchBarbearias();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir barbearia";
      toast({
        title: "Erro",
        description: message,
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicao = (barbearia: Barbearia) => {
    setEditingId(barbearia.id);
    setBarbNome(barbearia.nome_barbearia);
    setBarbEmail(barbearia.email_contato);
    setBarbPassword("");
  };

  const cancelarEdicao = () => {
    setEditingId(null);
    setBarbNome("");
    setBarbEmail("");
    setBarbPassword("");
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-4 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm">Gerencie suas barbearias</p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              + Nova Barbearia
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Barbearias</p>
                <p className="text-2xl font-bold text-gray-900">{barbearias.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{clientesAtivos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Crescimento</p>
                <p className="text-2xl font-bold text-gray-900">+12%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin-gestao-clientes')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Gestão de Clientes</h3>
                    <p className="text-sm text-gray-600">Buscar, migrar e gerenciar clientes</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin-relatorios')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Relatórios Avançados</h3>
                    <p className="text-sm text-gray-600">Métricas e análises detalhadas</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin-configuracoes')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Configurações</h3>
                    <p className="text-sm text-gray-600">Personalizar sistema</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin-auditoria')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Auditoria e Logs</h3>
                    <p className="text-sm text-gray-600">Monitoramento e segurança</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin-reset-senha')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Building className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Resetar Senha</h3>
                    <p className="text-sm text-gray-600">Redefinir senha de barbearia</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Users className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Backup de Dados</h3>
                    <p className="text-sm text-gray-600">Exportar dados do sistema</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {editingId ? "Editar Barbearia" : "Nova Barbearia"}
                </h3>
                <button 
                  onClick={() => {
                    setShowForm(false);
                    cancelarEdicao();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Barbearia</label>
                  <Input 
                    placeholder="Digite o nome da barbearia" 
                    value={barbNome} 
                    onChange={e => setBarbNome(e.target.value)} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <Input 
                    type="email" 
                    placeholder="Digite o e-mail" 
                    value={barbEmail} 
                    onChange={e => setBarbEmail(e.target.value)} 
                  />
                </div>
                
                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <Input 
                      type="password" 
                      placeholder="Digite a senha" 
                      value={barbPassword} 
                      onChange={e => setBarbPassword(e.target.value)} 
                    />
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={editingId ? () => editarBarbearia(editingId) : cadastrarBarbearia} 
                    disabled={loading} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Salvando..." : (editingId ? "Salvar" : "Cadastrar")}
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowForm(false);
                      cancelarEdicao();
                    }} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barbearias List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Barbearias Cadastradas</h2>
              <div className="relative w-full sm:w-auto">
                <Input
                  placeholder="Buscar barbearias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredBarbearias.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm ? "Nenhuma barbearia encontrada" : "Nenhuma barbearia cadastrada"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? "Tente ajustar os termos de busca." : "Comece cadastrando sua primeira barbearia."}
                </p>
              </div>
            ) : (
              filteredBarbearias.map((b, idx) => (
                <div key={b.id || idx} className="px-4 sm:px-6 py-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs sm:text-sm font-medium text-blue-600">
                              {b.nome_barbearia.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <h3 className="text-sm font-medium text-gray-900">{b.nome_barbearia}</h3>
                          <p className="text-xs sm:text-sm text-gray-500">{b.email_contato}</p>
                          {b.slug && (
                            <p className="text-xs text-blue-600 mt-1">
                              slug: {b.slug}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          iniciarEdicao(b);
                          setShowForm(true);
                        }}
                        disabled={loading}
                        className="text-xs px-2 py-1"
                      >
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => excluirBarbearia(b.id)}
                        disabled={loading}
                        className="text-xs px-2 py-1"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;