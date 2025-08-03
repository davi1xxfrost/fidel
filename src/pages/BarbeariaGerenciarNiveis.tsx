import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Plus, Edit, Trash2, Crown, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BarbeariaLayout from "@/components/BarbeariaLayout";

interface NivelFidelidade {
  id: string;
  nome: string;
  pontos_necessarios: number;
  beneficios: string[];
  cor: string;
  barbearia_id: string;
}

const BarbeariaGerenciarNiveis = () => {
  const { slug: _slug } = useParams();
  const [niveis, setNiveis] = useState<NivelFidelidade[]>([]);
  const [_loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [novoNivel, setNovoNivel] = useState({
    nome: "",
    pontos_necessarios: 0,
    beneficios: [""],
    cor: "#6366f1"
  });

  const fetchNiveis = useCallback(async () => {
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

      const { data: niveisData } = await supabase
        .from('niveis_fidelidade')
        .select('*')
        .eq('barbearia_id', barbearia.id)
        .order('pontos_necessarios');

      // Mapear os dados para o formato correto
      const niveisMapeados = (niveisData || []).map((nivel: Record<string, unknown>) => ({
        id: nivel.id as string,
        nome: (nivel.nome as string) || (nivel.nome_nivel as string) || 'Nível',
        pontos_necessarios: (nivel.pontos_necessarios as number) || (nivel.valor_pontos as number) || 0,
        beneficios: Array.isArray(nivel.beneficios) ? nivel.beneficios as string[] : [nivel.beneficios as string || ''],
        cor: (nivel.cor as string) || "#6366f1",
        barbearia_id: nivel.barbearia_id as string
      }));

      setNiveis(niveisMapeados);
    } catch (_error) {
      // Erro ao carregar níveis
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNiveis();
  }, [fetchNiveis]);

  const handleSalvarNivel = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: barbearia } = await supabase
        .from('barbearias')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!barbearia) return;

      const nivelData = {
        nome: novoNivel.nome,
        pontos_necessarios: novoNivel.pontos_necessarios,
        beneficios: novoNivel.beneficios.filter(b => b.trim()),
        cor: novoNivel.cor,
        barbearia_id: barbearia.id
      };

      if (editando) {
        await supabase
          .from('niveis_fidelidade')
          .update(nivelData)
          .eq('id', editando);
      } else {
        await supabase
          .from('niveis_fidelidade')
          .insert(nivelData);
      }

      setNovoNivel({
        nome: "",
        pontos_necessarios: 0,
        beneficios: [""],
        cor: "#6366f1"
      });
      setEditando(null);
      fetchNiveis();
    } catch (_error) {
      // Erro ao salvar nível
    }
  };

  const handleEditar = (nivel: NivelFidelidade) => {
    setEditando(nivel.id);
    setNovoNivel({
      nome: nivel.nome,
      pontos_necessarios: nivel.pontos_necessarios,
      beneficios: nivel.beneficios.length > 0 ? nivel.beneficios : [""],
      cor: nivel.cor
    });
  };

  const handleCancelar = () => {
    setEditando(null);
    setNovoNivel({
      nome: "",
      pontos_necessarios: 0,
      beneficios: [""],
      cor: "#6366f1"
    });
  };

  const handleDeletar = async (id: string) => {
    // Usar uma abordagem mais moderna em vez de confirm
    // const confirmed = await showConfirmDialog('Tem certeza que deseja deletar este nível?');
    // if (!confirmed) return;
    
    try {
      await supabase
        .from('niveis_fidelidade')
        .delete()
        .eq('id', id);
      
      fetchNiveis();
    } catch (_error) {
      // Erro ao deletar nível
    }
  };

  const adicionarBeneficio = () => {
    setNovoNivel(prev => ({
      ...prev,
      beneficios: [...prev.beneficios, ""]
    }));
  };

  const removerBeneficio = (index: number) => {
    setNovoNivel(prev => ({
      ...prev,
      beneficios: prev.beneficios.filter((_, i) => i !== index)
    }));
  };

  const atualizarBeneficio = (index: number, valor: string) => {
    setNovoNivel(prev => ({
      ...prev,
      beneficios: prev.beneficios.map((b, i) => (i === index ? valor : b))
    }));
  };

  const coresDisponiveis = [
    "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", 
    "#f97316", "#eab308", "#22c55e", "#06b6d4"
  ];

  return (
    <BarbeariaLayout 
      title="Gerenciar Níveis" 
      subtitle="Configure os níveis de fidelidade"
      icon={Settings}
    >
      {/* Layout Mobile */}
      <div className="lg:hidden">
        <div className="space-y-6">
          {/* Formulário */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                {editando ? "Editar Nível" : "Novo Nível"}
              </h3>
              
              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nome do Nível
                  </Label>
                  <Input
                    value={novoNivel.nome}
                    onChange={(e) => setNovoNivel(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Bronze, Prata, Ouro..."
                    className="w-full"
                  />
                </div>

                {/* Pontos Necessários */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Pontos Necessários
                  </Label>
                  <Input
                    type="number"
                    value={novoNivel.pontos_necessarios}
                    onChange={(e) => setNovoNivel(prev => ({ ...prev, pontos_necessarios: Number(e.target.value) }))}
                    placeholder="0"
                    className="w-full"
                  />
                </div>

                {/* Cor */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Cor do Nível
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {coresDisponiveis.map(cor => (
                      <button
                        key={cor}
                        onClick={() => setNovoNivel(prev => ({ ...prev, cor }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          novoNivel.cor === cor ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: cor }}
                      />
                    ))}
                  </div>
                </div>

                {/* Benefícios */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Benefícios
                  </Label>
                  <div className="space-y-2">
                    {novoNivel.beneficios.map((beneficio, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={beneficio}
                          onChange={(e) => atualizarBeneficio(index, e.target.value)}
                          placeholder="Ex: 10% de desconto"
                          className="flex-1"
                        />
                        {novoNivel.beneficios.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removerBeneficio(index)}
                            className="px-3"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={adicionarBeneficio}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Benefício
                    </Button>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSalvarNivel}
                    disabled={!novoNivel.nome.trim()}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {editando ? "Atualizar" : "Criar"} Nível
                  </Button>
                  {editando && (
                    <Button
                      variant="outline"
                      onClick={handleCancelar}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Níveis */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Níveis Existentes</h3>
            
            {niveis.map((nivel) => (
              <Card key={nivel.id} className="border-l-4" style={{ borderLeftColor: nivel.cor }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: nivel.cor }}
                      >
                        {nivel.nome.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{nivel.nome}</h4>
                        <p className="text-sm text-gray-500">{nivel.pontos_necessarios} pontos</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditar(nivel)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletar(nivel.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {nivel.beneficios.map((beneficio, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {beneficio}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {niveis.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Crown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum nível configurado</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Layout Desktop */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-6 text-lg">
                  {editando ? "Editar Nível de Fidelidade" : "Criar Novo Nível"}
                </h3>
                
                <div className="space-y-6">
                  {/* Nome */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Nome do Nível
                    </Label>
                    <Input
                      value={novoNivel.nome}
                      onChange={(e) => setNovoNivel(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Bronze, Prata, Ouro, Diamante..."
                      className="w-full h-12"
                    />
                  </div>

                  {/* Pontos Necessários */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Pontos Necessários
                    </Label>
                    <Input
                      type="number"
                      value={novoNivel.pontos_necessarios}
                      onChange={(e) => setNovoNivel(prev => ({ ...prev, pontos_necessarios: Number(e.target.value) }))}
                      placeholder="0"
                      className="w-full h-12"
                    />
                  </div>

                  {/* Cor */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Cor do Nível
                    </Label>
                    <div className="flex gap-3 flex-wrap">
                      {coresDisponiveis.map(cor => (
                        <button
                          key={cor}
                          onClick={() => setNovoNivel(prev => ({ ...prev, cor }))}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            novoNivel.cor === cor ? 'border-gray-900 scale-110' : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: cor }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Benefícios */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Benefícios
                    </Label>
                    <div className="space-y-3">
                      {novoNivel.beneficios.map((beneficio, index) => (
                        <div key={index} className="flex gap-3">
                          <Input
                            value={beneficio}
                            onChange={(e) => atualizarBeneficio(index, e.target.value)}
                            placeholder="Ex: 10% de desconto em todos os serviços"
                            className="flex-1"
                          />
                          {novoNivel.beneficios.length > 1 && (
                            <Button
                              variant="outline"
                              onClick={() => removerBeneficio(index)}
                              className="px-4"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={adicionarBeneficio}
                        className="w-full h-12"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Benefício
                      </Button>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSalvarNivel}
                      disabled={!novoNivel.nome.trim()}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
                    >
                      {editando ? "Atualizar" : "Criar"} Nível
                    </Button>
                    {editando && (
                      <Button
                        variant="outline"
                        onClick={handleCancelar}
                        className="flex-1 h-12"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Níveis */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">Níveis Configurados</h3>
            
            <div className="space-y-4">
              {niveis.map((nivel) => (
                <Card key={nivel.id} className="border-l-4 hover:shadow-md transition-all duration-200" style={{ borderLeftColor: nivel.cor }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: nivel.cor }}
                        >
                          {nivel.nome.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{nivel.nome}</h4>
                          <p className="text-sm text-gray-500">{nivel.pontos_necessarios} pontos necessários</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEditar(nivel)}
                          className="h-10"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDeletar(nivel.id)}
                          className="h-10 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700 mb-2">Benefícios:</h5>
                      {nivel.beneficios.map((beneficio, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm text-gray-600">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          {beneficio}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {niveis.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum nível configurado</h4>
                    <p className="text-gray-500">Crie seu primeiro nível de fidelidade para começar a recompensar seus clientes</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </BarbeariaLayout>
  );
};

export default BarbeariaGerenciarNiveis;