import { useState, useEffect } from 'react';
import { ArrowLeft, User, CheckCircle, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QRCodeScanner } from '@/components/QRCodeScanner';
import { calcularNivelFidelidade } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Cliente {
  id: string;
  nome_completo: string;
  pontos_acumulados: number;
  nivel_fidelidade: string;
  qr_code_id: string;
}

interface Atividade {
  id: string;
  nome: string;
  pontos: number;
  valor: number;
}

const BarbeariaScanQRCode = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { toast } = useToast();
  const [clienteEncontrado, setClienteEncontrado] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);
  const [_scanning, setScanning] = useState(false);
  const [barbeariaId, setBarbeariaId] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [_selectedAtividade, _setSelectedAtividade] = useState<string>("");
  const [manualPontos, setManualPontos] = useState<number>(0);
  const [manualValor, setManualValor] = useState<number>(0);
  const [manualDescricao, setManualDescricao] = useState<string>("");

  // Estado para atividades da barbearia
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loadingAtividades, setLoadingAtividades] = useState(true);

  // Buscar ID da barbearia pelo slug
  useEffect(() => {
    const fetchBarbeariaId = async () => {
      if (!slug) return;
      
      try {
        const { data: barbearia, error } = await supabase
          .from('barbearias')
          .select('id')
          .eq('slug', slug)
          .single();

        if (error || !barbearia) {
          toast({
            title: "Erro",
            description: "Barbearia não encontrada",
            status: "error"
          });
          navigate('/');
          return;
        }

        setBarbeariaId(barbearia.id);
      } catch (_error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar barbearia",
          status: "error"
        });
        navigate('/');
      }
    };

    fetchBarbeariaId();
  }, [slug, navigate, toast]);

  // Buscar atividades da barbearia
  useEffect(() => {
    const fetchAtividades = async () => {
      if (!barbeariaId) return;
      
      try {
        setLoadingAtividades(true);
        // Usar atividades padrão já que a tabela atividades_barbearia pode não estar disponível
        const atividadesPadrao: Atividade[] = [
          { id: "1", nome: "Corte de Cabelo", pontos: 5, valor: 25.00 },
          { id: "2", nome: "Barba", pontos: 3, valor: 15.00 },
          { id: "3", nome: "Corte + Barba", pontos: 8, valor: 35.00 }
        ];
        setAtividades(atividadesPadrao);
      } catch (_error) {
        // Atividades padrão em caso de erro
        const atividadesPadrao: Atividade[] = [
          { id: "1", nome: "Corte de Cabelo", pontos: 5, valor: 25.00 },
          { id: "2", nome: "Barba", pontos: 3, valor: 15.00 },
          { id: "3", nome: "Corte + Barba", pontos: 8, valor: 35.00 }
        ];
        setAtividades(atividadesPadrao);
      } finally {
        setLoadingAtividades(false);
      }
    };

    fetchAtividades();
  }, [barbeariaId]);

  const handleQRCodeScanned = async (qrCodeId: string) => {
    if (!barbeariaId) {
      toast({
        title: "Erro",
        description: "Barbearia não identificada",
        status: "error"
      });
      return;
    }

    setLoading(true);
    try {
      // Buscar cliente pelo QR Code ID
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('qr_code_id', qrCodeId)
        .eq('barbearia_id', barbeariaId)
        .single();

      if (error || !cliente) {
        toast({
          title: "Cliente não encontrado",
          description: "QR Code inválido ou cliente não cadastrado nesta barbearia",
          status: "error"
        });
        setClienteEncontrado(null);
        return;
      }

      setClienteEncontrado(cliente);
      toast({
        title: "Cliente encontrado!",
        description: `${cliente.nome_completo} - ${cliente.pontos_acumulados} pontos`,
        status: "success"
      });

    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar cliente",
        status: "error"
      });
      setClienteEncontrado(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarPontos = async (atividade: Atividade) => {
    if (!clienteEncontrado || !barbeariaId) return;

    setLoading(true);
    try {
      // Calcular novos pontos e nível
      const novosPontos = clienteEncontrado.pontos_acumulados + atividade.pontos;
      const novoNivel = calcularNivelFidelidade(novosPontos);
      
      // Atualizar pontos e nível do cliente
      const { error: errorUpdate } = await supabase
        .from('clientes')
        .update({ 
          pontos_acumulados: novosPontos,
          nivel_fidelidade: novoNivel
        })
        .eq('id', clienteEncontrado.id);
      
      if (errorUpdate) throw errorUpdate;

      // Registrar transação
      const { error: transacaoError } = await supabase
        .from('transacoes_pontos')
        .insert({
          cliente_id: clienteEncontrado.id,
          barbearia_id: barbeariaId,
          tipo: 'GANHO',
          valor_pontos: atividade.pontos,
          descricao: atividade.nome,
          valor_monetario_associado: atividade.valor
        });

      if (transacaoError) {
        throw transacaoError;
      }

      // Atualizar cliente local com novos pontos e nível
      setClienteEncontrado(prev => (prev ? {
        ...prev,
        pontos_acumulados: novosPontos,
        nivel_fidelidade: novoNivel
      } : null));

      toast({
        title: "Sucesso!",
        description: `${atividade.pontos} pontos adicionados para ${clienteEncontrado.nome_completo}`,
        status: "success"
      });

    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar pontos",
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarPontosManual = async () => {
    if (!clienteEncontrado || !barbeariaId || !manualDescricao || manualPontos <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos corretamente",
        status: "error"
      });
      return;
    }

    setLoading(true);
    try {
      // Calcular novos pontos e nível
      const novosPontos = clienteEncontrado.pontos_acumulados + manualPontos;
      const novoNivel = calcularNivelFidelidade(novosPontos);
      
      // Atualizar pontos e nível do cliente
      const { error: errorUpdate } = await supabase
        .from('clientes')
        .update({ 
          pontos_acumulados: novosPontos,
          nivel_fidelidade: novoNivel
        })
        .eq('id', clienteEncontrado.id);
      
      if (errorUpdate) throw errorUpdate;

      // Registrar transação
      const { error: transacaoError } = await supabase
        .from('transacoes_pontos')
        .insert({
          cliente_id: clienteEncontrado.id,
          barbearia_id: barbeariaId,
          tipo: 'GANHO',
          valor_pontos: manualPontos,
          descricao: manualDescricao,
          valor_monetario_associado: manualValor
        });

      if (transacaoError) {
        throw transacaoError;
      }

      // Atualizar cliente local com novos pontos e nível
      setClienteEncontrado(prev => (prev ? {
        ...prev,
        pontos_acumulados: novosPontos,
        nivel_fidelidade: novoNivel
      } : null));

      // Limpar campos manuais
      setManualDescricao("");
      setManualPontos(0);
      setManualValor(0);
      setShowManualInput(false);

      toast({
        title: "Sucesso!",
        description: `${manualPontos} pontos adicionados para ${clienteEncontrado.nome_completo}`,
        status: "success"
      });

    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar pontos",
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNovoScan = () => {
    setClienteEncontrado(null);
    setScanning(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/${slug}/dashboard`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Escanear QR Code</h1>
            <p className="text-gray-600">Escaneie o QR Code do cliente para adicionar pontos</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {!clienteEncontrado ? (
          /* Scanner */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Scanner QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QRCodeScanner
                onScan={handleQRCodeScanned}
                onError={(error) => {
                  toast({
                    title: "Erro no Scanner",
                    description: error,
                    status: "error"
                  });
                }}
                className="w-full"
              />
            </CardContent>
          </Card>
        ) : (
          /* Cliente Encontrado */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Cliente Encontrado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações do Cliente */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">{clienteEncontrado.nome_completo}</h3>
                    <p className="text-sm text-green-700">ID: {clienteEncontrado.qr_code_id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-600">Pontos Atuais</p>
                    <p className="text-2xl font-bold text-green-900">{clienteEncontrado.pontos_acumulados}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Nível</p>
                    <p className="text-lg font-semibold text-green-900">{clienteEncontrado.nivel_fidelidade}</p>
                  </div>
                </div>
              </div>

              {/* Seleção de Atividade */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Selecionar Atividade:</h4>
                {loadingAtividades ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Carregando atividades...</p>
                  </div>
                ) : atividades.length === 0 ? (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Nenhuma atividade cadastrada</p>
                    <p className="text-xs text-gray-500">Use o botão manual para adicionar pontos</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {atividades.map((atividade) => (
                      <Button
                        key={atividade.id}
                        onClick={() => handleAdicionarPontos(atividade)}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 h-auto p-4 flex flex-col items-center"
                      >
                        <span className="font-semibold">{atividade.nome}</span>
                        <span className="text-sm opacity-90">{atividade.pontos} pontos</span>
                        <span className="text-xs opacity-75">R$ {atividade.valor.toFixed(2)}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input Manual */}
              {showManualInput && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Adicionar Pontos Manualmente:</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição da Atividade
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: Corte de Cabelo"
                        value={manualDescricao}
                        onChange={(e) => setManualDescricao(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pontos
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={manualPontos}
                          onChange={(e) => setManualPontos(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valor (R$)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={manualValor}
                          onChange={(e) => setManualValor(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAdicionarPontosManual}
                      disabled={loading || !manualDescricao || manualPontos <= 0}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {loading ? "Adicionando..." : "Adicionar Pontos"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-3">
                <Button
                  onClick={handleNovoScan}
                  variant="outline"
                  className="flex-1"
                >
                  <User className="w-4 h-4 mr-2" />
                  Novo Scan
                </Button>
                <Button
                  onClick={() => setShowManualInput(!showManualInput)}
                  variant="outline"
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Pontos Manualmente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-900 mb-2">Como usar:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Peça ao cliente para mostrar o QR Code no app</li>
              <li>• Escaneie o código com a câmera</li>
              <li>• Adicione os pontos conforme o serviço</li>
              <li>• O cliente receberá os pontos automaticamente</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BarbeariaScanQRCode;