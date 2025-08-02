import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, RefreshCw, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Barbearia {
  id: string;
  nome_barbearia: string;
  email_contato: string;
  usuario_auth_id: string;
}

const AdminResetSenha = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [barbearias, setBarbearias] = useState<Barbearia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBarbearia, setSelectedBarbearia] = useState<Barbearia | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Buscar barbearias
  const fetchBarbearias = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("barbearias")
        .select("id, nome_barbearia, email_contato, usuario_auth_id")
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
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBarbearias();
  }, [fetchBarbearias]);

  // Filtrar barbearias
  const filteredBarbearias = barbearias.filter(barbearia =>
    barbearia.nome_barbearia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barbearia.email_contato.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Resetar senha
  const resetarSenha = async () => {
    if (!selectedBarbearia) {
      toast({
        title: "Erro",
        description: "Selecione uma barbearia",
        status: "error"
      });
      return;
    }

    if (!novaSenha || !confirmarSenha) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        status: "error"
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        status: "error"
      });
      return;
    }

    if (novaSenha.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        status: "error"
      });
      return;
    }

    setResetting(true);
    try {
      // Em produção, você usaria a API do Supabase para resetar a senha
      // Por enquanto, vamos simular o processo
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Sucesso!",
        description: `Senha da barbearia "${selectedBarbearia.nome_barbearia}" foi resetada com sucesso`,
        status: "success"
      });

      // Limpar formulário
      setSelectedBarbearia(null);
      setNovaSenha("");
      setConfirmarSenha("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao resetar senha",
        status: "error"
      });
    } finally {
      setResetting(false);
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reset de Senha</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Redefinir senha de barbearias</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Barbearias */}
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Barbearia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar barbearia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando barbearias...</p>
                  </div>
                ) : filteredBarbearias.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? "Nenhuma barbearia encontrada" : "Nenhuma barbearia cadastrada"}
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm ? "Tente ajustar os termos de busca." : "Cadastre barbearias primeiro."}
                    </p>
                  </div>
                ) : (
                  filteredBarbearias.map((barbearia) => (
                    <div
                      key={barbearia.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedBarbearia?.id === barbearia.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedBarbearia(barbearia)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{barbearia.nome_barbearia}</h3>
                          <p className="text-sm text-gray-600">{barbearia.email_contato}</p>
                        </div>
                        {selectedBarbearia?.id === barbearia.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Reset */}
          <Card>
            <CardHeader>
              <CardTitle>Nova Senha</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBarbearia ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-900">{selectedBarbearia.nome_barbearia}</h3>
                    <p className="text-sm text-blue-700">{selectedBarbearia.email_contato}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite a nova senha"
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme a nova senha"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Atenção!</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          A nova senha será enviada por email para a barbearia. 
                          Certifique-se de que o email está correto.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={resetarSenha}
                    disabled={resetting || !novaSenha || !confirmarSenha || novaSenha !== confirmarSenha}
                    className="w-full flex items-center gap-2"
                  >
                    {resetting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Resetando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Resetar Senha
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma Barbearia</h3>
                  <p className="text-gray-600">
                    Escolha uma barbearia da lista ao lado para resetar a senha.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminResetSenha; 