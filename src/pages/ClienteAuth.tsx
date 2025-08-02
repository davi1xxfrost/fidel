import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ClienteAuthProps {
  barbeariaId: string;
}

const ClienteAuth = ({ barbeariaId }: ClienteAuthProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  // Cadastro de cliente
  const handleCadastro = async () => {
    setLoading(true);
    if (!barbeariaId) {
      setLoading(false);
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido",
        status: "error"
      });
      setLoading(false);
      return;
    }

    // 1. Cria usuário no Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { tipo: "cliente" } }
    });
    if (error || !data.user) {
      toast({
        title: "Erro ao cadastrar",
        description: "Verifique os dados e tente novamente",
        status: "error"
      });
      setLoading(false);
      return;
    }

    // 2. Cria registro em clientes (SEM LOGIN AUTOMÁTICO)
    const { data: qrCodeData, error: qrError } = await supabase.rpc('generate_qr_code_id');
    if (qrError || !qrCodeData) {
      toast({
        title: "Erro",
        description: "Erro ao gerar QR Code",
        status: "error"
      });
      setLoading(false);
      return;
    }
    const { error: errCliente } = await supabase.from("clientes").insert({
      nome_completo: nome,
      celular_whatsapp: telefone,
      usuario_auth_id: data.user.id,
      barbearia_id: barbeariaId,
      cpf_id: '000.000.000-00', // CPF padrão para este formulário (não tem campo CPF)
      qr_code_id: qrCodeData,
      email
    });
    setLoading(false);
    if (errCliente) {
      toast({
        title: "Erro",
        description: "Erro ao salvar cliente. Tente novamente mais tarde.",
        status: "error"
      });
      return;
    }
    
    toast({
      title: "Sucesso!",
      description: "Conta criada! Faça login.",
      status: "success"
    });
    setIsLogin(true);
  };

  // Login de cliente
  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });
    setLoading(false);
    if (error) {
      toast({
        title: "Erro ao logar",
        description: "Verifique seu e-mail e senha",
        status: "error"
      });
      return;
    }
    // Busca o cliente logado filtrando pelo barbearia_id
    if (!barbeariaId) return;
    const { data: userData } = await supabase.auth.getUser();
    const { user } = userData;
    if (!user) return;
    const { data: cliente } = await supabase
      .from("clientes")
      .select()
      .eq("usuario_auth_id", user.id)
      .eq("barbearia_id", barbeariaId)
      .single();
    if (!cliente) {
      toast({
        title: "Cliente não encontrado",
        description: "Cliente não encontrado para esta barbearia",
        status: "error"
      });
      // Limpa a sessão se o cliente não pertencer à barbearia
      await supabase.auth.signOut(); 
      return;
    }
    navigate(`/cliente-meu-cartao`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-sm p-6 bg-white rounded shadow space-y-4">
        <h2 className="text-2xl font-bold text-center">
          {isLogin ? "Login do Cliente" : "Cadastro do Cliente"}
        </h2>
        {!isLogin && (
          <>
            <Input id="nome" name="nome" placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} />
            <Input id="telefone" name="telefone" placeholder="Telefone (opcional)" value={telefone} onChange={e => setTelefone(e.target.value)} />
          </>
        )}
        <Input id="email" name="email" type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
        <Input id="password" name="password" type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />
        <Button onClick={isLogin ? handleLogin : handleCadastro} disabled={loading} className="w-full">
          {isLogin ? "Entrar" : "Cadastrar"}
        </Button>
        <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="w-full">
          {isLogin ? "Criar nova conta" : "Já tenho conta"}
        </Button>
      </div>
    </div>
  );
};

export default ClienteAuth;