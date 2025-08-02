import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, User, Lock, Eye, EyeOff, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BarbeariaData = {
  id: string;
  nome_barbearia: string;
  email_contato: string;
  slug?: string;
}

const BarbeariaCadastro = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [barbearia, setBarbearia] = useState<BarbeariaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cadastroLoading, setCadastroLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const fetchBarbearia = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("barbearias")
          .select("id, nome_barbearia, email_contato, slug")
          .eq("slug", slug)
          .maybeSingle();
        
        if (error || !data) {
          navigate("/");
          return;
        }
        
        setBarbearia(data);
      } catch (_error) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchBarbearia();
  }, [slug, navigate]);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !nome || !telefone || !cpf) {
      setError("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Digite um email válido");
      return;
    }

    setCadastroLoading(true);
    setError("");

    try {
      // 1. Criar usuário no Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            tipo: "cliente",
            nome_completo: nome
          }
        }
      });

      if (authError || !data.user) {
        setError("Erro ao criar conta. Verifique os dados e tente novamente.");
        return;
      }

      // 2. Gerar QR Code ID
      const { data: qrCodeData, error: qrError } = await supabase.rpc('generate_qr_code_id');
      if (qrError || !qrCodeData) {
        setError("Erro ao gerar QR Code");
        return;
      }

      // 3. Criar registro na tabela clientes (SEM LOGIN AUTOMÁTICO)
      
      const clienteData = {
        nome_completo: nome,
        celular_whatsapp: telefone,
        usuario_auth_id: data.user.id,
        barbearia_id: barbearia?.id,
        cpf_id: cpf.replace(/\D/g, ''), // Remove máscara e usa apenas números
        qr_code_id: qrCodeData,
        pontos_acumulados: 0,
        nivel_fidelidade: 'BRONZE',
        email
      };

      const { data: _clienteInserted, error: clienteError } = await supabase
        .from("clientes")
        .insert(clienteData)
        .select()
        .single();

      if (clienteError) {
        setError(`Erro ao salvar dados do cliente: ${clienteError.message}`);
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Conta criada com sucesso! Faça login para acessar seu cartão.",
        status: "success"
      });

      // Redirecionar para login
      setTimeout(() => {
        navigate(`/${barbearia?.slug}/login`);
      }, 2000);

    } catch (_error) {
      setError("Erro ao fazer cadastro");
    } finally {
      setCadastroLoading(false);
    }
  };

  const backgroundStyle = {
    backgroundImage: `
      radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 50%),
      linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.1) 70%, transparent 70%),
      linear-gradient(-45deg, transparent 30%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.1) 70%, transparent 70%)
    `
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
      </div>
    );
  }

  if (!barbearia) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 font-inter">Barbearia não encontrada</h1>
          <p className="text-gray-600 font-inter">Verifique o endereço ou entre em contato com o administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden" 
      style={backgroundStyle}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full blur-lg"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm xl:max-w-md mb-8">
        <div className="flex items-center justify-between px-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/${barbearia.slug}/login`)}
            className="text-slate-600 hover:text-slate-900 font-inter -ml-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <span className="text-sm font-medium text-slate-600 font-inter -ml-32">
            {barbearia.nome_barbearia}
          </span>
        </div>
      </div>

      {/* Cadastro Form */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm xl:max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 md:p-6 shadow-2xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2 font-inter">Criar conta</h1>
          <p className="text-slate-600 font-inter">Cadastre-se para acessar seu cartão de fidelidade</p>
        </div>

        <form onSubmit={handleCadastro} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600 font-inter">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="nome" className="block text-sm font-medium text-slate-700 font-inter">
              Nome completo
            </label>
            <div className="relative">
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome completo"
                maxLength={100}
                className="w-full pl-10 pr-4 py-3 border-slate-200 focus:border-slate-800 focus:ring-slate-800 font-inter"
                required
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="telefone" className="block text-sm font-medium text-slate-700 font-inter">
              Telefone
            </label>
            <div className="relative">
              <Input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(aplicarMascaraTelefone(e.target.value))}
                placeholder="Digite seu telefone"
                maxLength={15}
                className="w-full pl-10 pr-4 py-3 border-slate-200 focus:border-slate-800 focus:ring-slate-800 font-inter"
                required
              />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="cpf" className="block text-sm font-medium text-slate-700 font-inter">
              CPF
            </label>
            <div className="relative">
              <Input
                id="cpf"
                type="text"
                value={cpf}
                onChange={(e) => setCpf(aplicarMascaraCPF(e.target.value))}
                placeholder="000.000.000-00"
                className="w-full pl-10 pr-4 py-3 border-slate-200 focus:border-slate-800 focus:ring-slate-800 font-inter"
                required
                maxLength={14}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 font-inter">
              E-mail
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                className="w-full pl-10 pr-4 py-3 border-slate-200 focus:border-slate-800 focus:ring-slate-800 font-inter"
                required
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 font-inter">
              Senha
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                maxLength={50}
                className="w-full pl-10 pr-12 py-3 border-slate-200 focus:border-slate-800 focus:ring-slate-800 font-inter"
                required
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 font-inter">
              Confirmar senha
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                maxLength={50}
                className="w-full pl-10 pr-12 py-3 border-slate-200 focus:border-slate-800 focus:ring-slate-800 font-inter"
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={cadastroLoading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 rounded-2xl font-medium transition-all duration-200 transform hover:scale-105 font-inter"
            size="lg"
          >
            {cadastroLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 font-inter">
            Já tem uma conta?{" "}
            <button
              onClick={() => navigate(`/${barbearia.slug}/login`)}
              className="text-slate-800 hover:text-slate-900 font-medium font-inter"
            >
              Faça login aqui
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarbeariaCadastro; 