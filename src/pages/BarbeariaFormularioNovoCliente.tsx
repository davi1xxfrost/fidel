import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, CheckCircle, QrCode } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BarbeariaLayout from "@/components/BarbeariaLayout";

const BarbeariaFormularioNovoCliente = () => {
  const { id: barbeariaId } = useParams(); // Pega o ID da barbearia da URL
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    telefone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Função para aplicar máscara no CPF
  const aplicarMascaraCPF = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 3) {
      return apenasNumeros;
    } else if (apenasNumeros.length <= 6) {
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3)}`;
    } else if (apenasNumeros.length <= 9) {
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6)}`;
    } else {
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6, 9)}-${apenasNumeros.slice(9, 11)}`;
    }
  };

  // Função para aplicar máscara no telefone
  const aplicarMascaraTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    } else if (apenasNumeros.length <= 6) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    } else {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6, 10)}`;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let valorProcessado = value;
    
    // Aplicar máscaras específicas
    if (field === 'cpf') {
      valorProcessado = aplicarMascaraCPF(value);
    } else if (field === 'telefone') {
      valorProcessado = aplicarMascaraTelefone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: valorProcessado }));
  };

  const handleSalvarCliente = async () => {
    if (!formData.nome.trim() || !formData.cpf.trim() || !formData.telefone.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    
    try {
      if (!barbeariaId) {
        toast.error("Barbearia não identificada!");
        setIsLoading(false);
        return;
      }

      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error("Usuário não autenticado. Faça login novamente.");
        setIsLoading(false);
        return;
      }

      // Verificar se a barbearia existe e pertence ao usuário
      const { data: barbearia, error: barbeariaError } = await supabase
        .from('barbearias')
        .select('id, nome_barbearia')
        .eq('id', barbeariaId)
        .eq('usuario_auth_id', user.id)
        .single();

      if (barbeariaError || !barbearia) {
        toast.error("Barbearia não encontrada ou você não tem permissão para acessá-la.");
        setIsLoading(false);
        return;
      }

      // Verificar se o CPF já existe na barbearia
      const { data: clienteExistente, error: _checkError } = await supabase
        .from('clientes')
        .select('id, nome_completo')
        .eq('barbearia_id', barbeariaId)
        .eq('cpf_id', formData.cpf.trim())
        .single();

      if (clienteExistente) {
        toast.error(`CPF já cadastrado para o cliente: ${clienteExistente.nome_completo}`);
        setIsLoading(false);
        return;
      }

      // Gerar QR Code ID único
      const { data: qrCodeId, error: qrError } = await supabase
        .rpc('generate_qr_code_id');

      if (qrError) {
        throw new Error(`Erro ao gerar QR Code: ${qrError.message}`);
      }

      // Preparar dados do cliente
      const clienteData = {
        barbearia_id: barbeariaId,
        nome_completo: formData.nome.trim(),
        cpf_id: formData.cpf.trim(),
        celular_whatsapp: formData.telefone.trim(),
        qr_code_id: qrCodeId,
        pontos_acumulados: 0,
        total_gasto: 0.00,
        nivel_fidelidade: 'BRONZE'
      };

      // Inserir cliente no banco de dados
      const { data: _cliente, error: clienteError } = await supabase
        .from('clientes')
        .insert(clienteData)
        .select()
        .single();

      if (clienteError) {
        // Verificar se é erro de CPF duplicado
        if (clienteError.code === '23505' && clienteError.message.includes('cpf_id')) {
          toast.error("CPF já cadastrado para outro cliente nesta barbearia!");
        } else {
          throw new Error(`Erro ao salvar cliente: ${clienteError.message} (Código: ${clienteError.code})`);
        }
        return;
      }

      toast.success(`Cliente ${formData.nome} cadastrado com sucesso!`, {
        icon: <CheckCircle className="w-4 h-4" />,
        description: `QR Code ID: ${qrCodeId}`,
      });
      
      // Resetar formulário
      setFormData({ nome: "", cpf: "", telefone: "" });
      
      // Navegar de volta após 1 segundo
      setTimeout(() => {
        navigate(`/barbearia/${barbeariaId}/clientes`);
      }, 1000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error("Erro ao cadastrar cliente", {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BarbeariaLayout
      title="Adicionar Novo Cliente"
      subtitle="Cadastro de cliente"
      icon={UserPlus}
    >
      <div className="max-w-lg mx-auto">
        <Card className="max-w-sm mx-auto">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5 text-barber-gold-dark" />
              Novo Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Nome Completo *
                </label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Digite o nome completo"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  maxLength={100}
                  className="h-12 text-lg"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  CPF/ID *
                </label>
                <Input
                  id="cpf"
                  name="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", e.target.value)}
                  className="h-12 text-lg"
                  disabled={isLoading}
                  maxLength={14}
                />
                <p className="text-xs text-muted-foreground">
                  Digite apenas números, a máscara será aplicada automaticamente
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Celular (WhatsApp) *
                </label>
                <Input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                  className="h-12 text-lg"
                  disabled={isLoading}
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">
                  Digite apenas números, a máscara será aplicada automaticamente
                </p>
              </div>
            </div>

            <Button
              onClick={handleSalvarCliente}
              disabled={isLoading}
              variant="mobile"
              className="w-full"
            >
              {isLoading ? (
                "Salvando..."
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Salvar Cliente
                </>
              )}
            </Button>

            {/* Informação adicional */}
            <div className="bg-barber-cream p-4 rounded-lg">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <QrCode className="w-4 h-4 text-barber-gold-dark" />
                  <p className="text-sm text-muted-foreground font-medium">
                    QR Code gerado automaticamente
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  O cliente começará com 0 pontos no cartão fidelidade
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BarbeariaLayout>
  );
};

export default BarbeariaFormularioNovoCliente;