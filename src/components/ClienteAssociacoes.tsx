import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Star, 
  Plus, 
  Trash2, 
  RefreshCw,
  Calendar,
  Award
} from 'lucide-react';
import { ClienteBarbeariaAssociacao } from '@/types/associacoes';

interface ClienteAssociacoesProps {
  clienteId: string;
  clienteNome: string;
}

const ClienteAssociacoes = ({ clienteId, clienteNome }: ClienteAssociacoesProps) => {
  const [associacoes, setAssociacoes] = useState<ClienteBarbeariaAssociacao[]>([]);
  const [loading, setLoading] = useState(false);

  // Função para buscar associações (será implementada quando a migração for aplicada)
  const fetchAssociacoes = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Implementar quando a migração for aplicada
      // const associacoesData = await getAssociacoesCliente(clienteId);
      // setAssociacoes(associacoesData);
      
      // Placeholder para demonstração
      setAssociacoes([
        {
          id: '1',
          cliente_id: clienteId,
          barbearia_id: 'barbearia-1',
          barbearia_nome: 'Barbearia do João',
          pontos_acumulados: 150,
          nivel_fidelidade: 'SILVER',
          data_associacao: '2024-01-15T10:00:00Z',
          ativo: true
        },
        {
          id: '2',
          cliente_id: clienteId,
          barbearia_id: 'barbearia-2',
          barbearia_nome: 'Barbearia da Maria',
          pontos_acumulados: 75,
          nivel_fidelidade: 'BRONZE',
          data_associacao: '2024-02-20T14:30:00Z',
          ativo: true
        }
      ]);
    } catch (_error) {
      // console.error('Erro ao buscar associações:', error);
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    fetchAssociacoes();
  }, [clienteId, fetchAssociacoes]);

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'PLATINUM': return 'bg-purple-100 text-purple-800';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800';
      case 'SILVER': return 'bg-gray-100 text-gray-800';
      case 'BRONZE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNivelIcon = (nivel: string) => {
    switch (nivel) {
      case 'PLATINUM': return '💎';
      case 'GOLD': return '🥇';
      case 'SILVER': return '🥈';
      case 'BRONZE': return '🥉';
      default: return '⭐';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cartões de Fidelidade</h3>
        <Button 
          size="sm" 
          variant="outline"
          onClick={fetchAssociacoes}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando cartões...</p>
        </div>
      ) : associacoes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum cartão encontrado
            </h4>
            <p className="text-gray-600 mb-4">
              {clienteNome} ainda não possui cartões de fidelidade em outras barbearias.
            </p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Cartão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {associacoes.map((associacao) => (
            <Card key={associacao.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-base">{associacao.barbearia_nome}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Desde {new Date(associacao.data_associacao).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getNivelColor(associacao.nivel_fidelidade)}>
                      <span className="mr-1">{getNivelIcon(associacao.nivel_fidelidade)}</span>
                      {associacao.nivel_fidelidade}
                    </Badge>
                    {!associacao.ativo && (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Pontos</p>
                      <p className="font-semibold">{associacao.pontos_acumulados}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Última Atualização</p>
                      <p className="font-semibold text-sm">
                        {new Date(associacao.data_associacao).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Star className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClienteAssociacoes; 