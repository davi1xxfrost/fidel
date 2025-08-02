import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAudit } from "@/hooks/useAudit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Download, 
  AlertTriangle, 
  Shield, 
  CheckCircle,
  Clock,
  User,
  ArrowLeft,
  Info,
  QrCode,
  RefreshCw,
  Eye,
  Copy
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { useNavigate } from "react-router-dom";

interface Cliente {
  id: string;
  nome_completo: string;
  qr_code_id: string;
  barbearia_id: string;
  pontos_acumulados: number;
  nivel_fidelidade: string;
}

interface Barbearia {
  id: string;
  nome_barbearia: string;
  slug: string;
}

interface Log {
  id: string;
  usuario_id: string;
  usuario_email: string;
  acao: string;
  tabela: string;
  registro_id: string;
  dados_anteriores: unknown;
  dados_novos: unknown;
  ip_address: string;
  user_agent: string;
  nivel: string;
  metadata: unknown;
  created_at: string;
}

interface Alerta {
  id: string;
  tipo: string;
  descricao: string;
  nivel: string;
  ip_address: string;
  resolvido?: boolean;
  timestamp: string;
}

const AdminAuditoria = () => {
  const { toast } = useToast();
  const { fetchAuditLogs, fetchSecurityAlerts } = useAudit();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Log[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroNivel, setFiltroNivel] = useState<string>("");
  const [filtroAcao, setFiltroAcao] = useState<string>("");
  const [filtroTabela, setFiltroTabela] = useState<string>("");
  const [periodo, setPeriodo] = useState("7"); // 7, 30, 90 dias

  // Estados para geração de QR Code
  const [searchCliente, setSearchCliente] = useState("");
  const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [barbeariaCliente, setBarbeariaCliente] = useState<Barbearia | null>(null);
  const [loadingQRCode, setLoadingQRCode] = useState(false);
  const [novoQRCode, setNovoQRCode] = useState<string | null>(null);

  const navigate = useNavigate();

  // Buscar logs de auditoria reais
  const buscarLogsReais = useCallback(async () => {
    setLoading(true);
    try {
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));
      
      const logsData = await fetchAuditLogs({
        data_inicio: dataInicio.toISOString(),
        limit: 100
      });

      const alertasData = await fetchSecurityAlerts({
        limit: 50
      });

      setLogs(logsData || []);
      setAlertas(
        (alertasData || []).map((log) => ({
          id: log.id,
          tipo: log.registro_id || '',
          descricao: '',
          nivel: log.nivel,
          ip_address: log.ip_address || '',
          resolvido: false,
          timestamp: log.created_at
        }))
      );
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar logs de auditoria",
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  }, [periodo, fetchAuditLogs, fetchSecurityAlerts, toast]);

  useEffect(() => {
    buscarLogsReais();
  }, [buscarLogsReais]);

  // Buscar clientes para geração de QR Code
  const buscarClientes = async () => {
    if (!searchCliente.trim()) {
      setClientesEncontrados([]);
      return;
    }

    setLoadingClientes(true);
    try {
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select(`
          id,
          nome_completo,
          qr_code_id,
          barbearia_id,
          pontos_acumulados,
          nivel_fidelidade
        `)
        .or(`nome_completo.ilike.%${searchCliente}%,qr_code_id.ilike.%${searchCliente}%`)
        .limit(10);

      if (error) throw error;
      setClientesEncontrados(clientes || []);
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar clientes",
        status: "error"
      });
    } finally {
      setLoadingClientes(false);
    }
  };

  // Buscar dados da barbearia do cliente
  const buscarBarbearia = async (barbeariaId: string) => {
    try {
      const { data: barbearia, error } = await supabase
        .from('barbearias')
        .select('id, nome_barbearia, slug')
        .eq('id', barbeariaId)
        .single();

      if (error) throw error;
      setBarbeariaCliente(barbearia);
    } catch (_error) {
      // Erro ao buscar barbearia
    }
  };

  // Gerar novo QR Code
  const gerarNovoQRCode = async () => {
    if (!clienteSelecionado) return;

    setLoadingQRCode(true);
    try {
      // Gerar novo QR Code ID
      const { data: novoQRCodeId, error: qrError } = await supabase.rpc('generate_qr_code_id');
      if (qrError || !novoQRCodeId) {
        throw new Error('Erro ao gerar QR Code');
      }

      // Atualizar cliente com novo QR Code
      const { error: updateError } = await supabase
        .from('clientes')
        .update({ qr_code_id: novoQRCodeId })
        .eq('id', clienteSelecionado.id);

      if (updateError) throw updateError;

      // Atualizar cliente local
      setClienteSelecionado(prev => (prev ? { ...prev, qr_code_id: novoQRCodeId } : null));
      setNovoQRCode(novoQRCodeId);

      toast({
        title: "Sucesso!",
        description: "Novo QR Code gerado com sucesso",
        status: "success"
      });

    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar novo QR Code",
        status: "error"
      });
    } finally {
      setLoadingQRCode(false);
    }
  };

  // Selecionar cliente
  const selecionarCliente = async (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setNovoQRCode(null);
    await buscarBarbearia(cliente.barbearia_id);
  };

  // Copiar QR Code ID
  const copiarQRCodeId = (qrCodeId: string) => {
    navigator.clipboard.writeText(qrCodeId);
    toast({
      title: "Copiado!",
      description: "QR Code ID copiado para a área de transferência",
      status: "success"
    });
  };

  // Filtrar logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.usuario_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tabela.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address.includes(searchTerm);
    
    const matchesNivel = !filtroNivel || log.nivel === filtroNivel;
    const matchesAcao = !filtroAcao || log.acao === filtroAcao;
    const matchesTabela = !filtroTabela || log.tabela === filtroTabela;
    
    return matchesSearch && matchesNivel && matchesAcao && matchesTabela;
  });

  // Filtro de alertas
  const filteredAlertas = alertas.filter(alerta => {
    const matchesSearch =
      alerta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alerta.nivel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alerta.ip_address && alerta.ip_address.includes(searchTerm));
    return matchesSearch;
  });

  // Resolver alerta
  const resolverAlerta = (alertaId: string) => {
    setAlertas((prev) => prev.map((alerta) => {
      return alerta.id === alertaId ? { ...alerta, resolvido: true } : alerta;
    }));
    
    toast({
      title: "Sucesso!",
      description: "Alerta marcado como resolvido",
      status: "success"
    });
  };

  // Exportar logs
  const exportarLogs = () => {
    const dados = {
      logs: filteredLogs,
      alertas: filteredAlertas,
      filtros: { searchTerm, filtroNivel, filtroAcao, filtroTabela, periodo },
      dataExportacao: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Sucesso!",
      description: "Logs exportados com sucesso",
      status: "success"
    });
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'ERROR': return 'text-orange-600 bg-orange-100';
      case 'WARNING': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getNivelIcon = (nivel: string) => {
    switch (nivel) {
      case 'CRITICAL': return <AlertTriangle className="w-4 h-4" />;
      case 'ERROR': return <AlertTriangle className="w-4 h-4" />;
      case 'WARNING': return <Info className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Auditoria e Logs</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Monitoramento de atividades e segurança</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
              
              <Button onClick={exportarLogs} className="flex items-center gap-2">
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
            <p className="mt-2 text-gray-600">Carregando logs...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Geração de QR Code - NOVA SEÇÃO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Geração de QR Code
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Admin Master
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Busca de Clientes */}
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                 <Input
                           placeholder="Buscar cliente por nome ou QR Code ID..."
                          value={searchCliente}
                          onChange={(e) => setSearchCliente(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && buscarClientes()}
                          className="pl-10"
                        />
                      </div>
                      <Button onClick={buscarClientes} disabled={loadingClientes}>
                        {loadingClientes ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Lista de Clientes Encontrados */}
                    {clientesEncontrados.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Clientes encontrados:</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {clientesEncontrados.map((cliente) => (
                            <div
                              key={cliente.id}
                              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => selecionarCliente(cliente)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{cliente.nome_completo}</h5>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>QR: {cliente.qr_code_id}</span>
                                    <span>Pontos: {cliente.pontos_acumulados}</span>
                                    <span>Nível: {cliente.nivel_fidelidade}</span>
                                  </div>
                                </div>
                                <Eye className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cliente Selecionado */}
                  {clienteSelecionado && (
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-blue-900">{clienteSelecionado.nome_completo}</h4>
                          <p className="text-sm text-blue-700">
                            {barbeariaCliente?.nome_barbearia}
                          </p>
                        </div>
                        <Button
                          onClick={gerarNovoQRCode}
                          disabled={loadingQRCode}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {loadingQRCode ? (
                            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <QrCode className="w-4 h-4 mr-2" />
                          )}
                          Gerar Novo QR Code
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* QR Code Atual */}
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-blue-900">QR Code Atual:</h5>
                          <div className="flex items-center gap-3">
                            <QRCodeDisplay 
                              value={clienteSelecionado.qr_code_id} 
                              size={80}
                            />
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono text-blue-700">
                                  {clienteSelecionado.qr_code_id}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copiarQRCodeId(clienteSelecionado.qr_code_id)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="text-xs text-blue-600">
                                Pontos: {clienteSelecionado.pontos_acumulados} • 
                                Nível: {clienteSelecionado.nivel_fidelidade}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Novo QR Code (se gerado) */}
                        {novoQRCode && (
                          <div className="space-y-3">
                            <h5 className="text-sm font-medium text-green-900">Novo QR Code:</h5>
                            <div className="flex items-center gap-3">
                              <QRCodeDisplay 
                                value={novoQRCode} 
                                size={80}
                              />
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono text-green-700">
                                    {novoQRCode}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copiarQRCodeId(novoQRCode)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="text-xs text-green-600">
                                  ✅ QR Code atualizado com sucesso
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Instruções */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Como usar:</h4>
                                         <ul className="text-sm text-gray-600 space-y-1">
                       <li>• Digite o nome ou QR Code ID do cliente</li>
                       <li>• Clique em "Buscar" para encontrar o cliente</li>
                       <li>• Clique no cliente para selecioná-lo</li>
                       <li>• Clique em "Gerar Novo QR Code" para criar um novo</li>
                       <li>• O novo QR Code substituirá o anterior automaticamente</li>
                     </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alertas de Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Alertas de Segurança
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    {alertas.filter(a => !a.resolvido).length} ativos
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAlertas.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum alerta encontrado</h3>
                      <p className="text-gray-600">Todos os alertas estão resolvidos ou não há alertas no período.</p>
                    </div>
                  ) : (
                    filteredAlertas.map((alerta) => (
                      <div key={alerta.id} className={`border rounded-lg p-4 ${
                        alerta.resolvido ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className={`w-4 h-4 ${
                                alerta.resolvido ? 'text-gray-400' : 'text-red-500'
                              }`} />
                              <span className={`text-sm font-medium ${
                                alerta.resolvido ? 'text-gray-500' : 'text-red-700'
                              }`}>
                                {alerta.tipo.replace('_', ' ')}
                              </span>
                              {alerta.resolvido && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  Resolvido
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${
                              alerta.resolvido ? 'text-gray-600' : 'text-red-600'
                            }`}>
                              {alerta.descricao}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>IP: {alerta.ip_address}</span>
                              <span>{new Date(alerta.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          {!alerta.resolvido && (
                            <Button
                              size="sm"
                              onClick={() => resolverAlerta(alerta.id)}
                              className="ml-4"
                            >
                              Resolver
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <select
                    value={filtroNivel}
                    onChange={(e) => setFiltroNivel(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os níveis</option>
                    <option value="INFO">INFO</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ERROR">ERROR</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                  
                  <select
                    value={filtroAcao}
                    onChange={(e) => setFiltroAcao(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as ações</option>
                    <option value="CREATE">CREATE</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="DELETE">DELETE</option>
                    <option value="LOGIN">LOGIN</option>
                    <option value="LOGOUT">LOGOUT</option>
                    <option value="EXPORT">EXPORT</option>
                  </select>
                  
                  <select
                    value={filtroTabela}
                    onChange={(e) => setFiltroTabela(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as tabelas</option>
                    <option value="barbearias">Barbearias</option>
                    <option value="clientes">Clientes</option>
                    <option value="transacoes_pontos">Transações</option>
                    <option value="admins">Admins</option>
                  </select>
                  
                  <div className="text-sm text-gray-600 flex items-center justify-center">
                    {filteredLogs.length} logs encontrados
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logs de Auditoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Logs de Auditoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum log encontrado</h3>
                      <p className="text-gray-600">Tente ajustar os filtros de busca.</p>
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getNivelColor(log.nivel)}`}>
                                {getNivelIcon(log.nivel)}
                                {log.nivel}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{log.acao}</span>
                              <span className="text-sm text-gray-600">em</span>
                              <span className="text-sm font-medium text-blue-600">{log.tabela}</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span className="truncate">{log.usuario_email}</span>
                              </div>
                              <div>
                                <span className="font-medium">IP:</span> {log.ip_address}
                              </div>
                              <div>
                                <span className="font-medium">ID:</span> {log.registro_id}
                              </div>
                              <div>
                                <span className="font-medium">Hora:</span> {new Date(log.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditoria; 