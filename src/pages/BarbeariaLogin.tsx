import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BarbeariaData = {
  id: string;
  nome_barbearia: string;
  email_contato: string;
  slug?: string;
}

const BarbeariaLogin = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [barbearia, setBarbearia] = useState<BarbeariaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showClientForm, setShowClientForm] = useState(false);
  const [user, setUser] = useState(null);
  
  // Estados para o formulário de cliente
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

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

  // Verificar se o usuário já está logado
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && barbearia) {
          setUser(user);
          
          try {
            // Verificar se é um cliente da barbearia correta
            const { data: clienteData, error: clienteError } = await supabase
              .from("clientes")
              .select("id, barbearia_id")
              .eq("usuario_auth_id", user.id)
              .eq("barbearia_id", barbearia.id)
              .single();
            
            if (!clienteError && clienteData) {
              // Cliente logado e autorizado - redirecionar
              navigate(`/cliente-meu-cartao`);
            } else {
              // Usuário logado mas não é cliente desta barbearia
              // Verificar se já é cliente de outra barbearia
              const { data: clienteOutraBarbearia, error: _outraError } = await supabase
                .from("clientes")
                .select("id, barbearia_id, nome_completo")
                .eq("usuario_auth_id", user.id)
                .single();
              
              if (clienteOutraBarbearia) {
                // Cliente existe em outra barbearia - permitir cadastro nesta
                setNomeCompleto(clienteOutraBarbearia.nome_completo || "");
                setShowClientForm(true);
              } else {
                // Usuário não é cliente de nenhuma barbearia - mostrar formulário
                setShowClientForm(true);
              }
            }
          } catch (_err) {
            // Em caso de erro, mostrar formulário para permitir cadastro
            setShowClientForm(true);
          }
        }
      } catch (_error) {
        // Erro ao verificar usuário
      }
    };
    
    if (barbearia) {
      checkUser();
    }
  }, [barbearia, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    setLoginLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Mensagens específicas para diferentes tipos de erro
        if (error.message.includes('Email not confirmed')) {
          setError("Email não confirmado. Verifique sua caixa de entrada e confirme o email.");
        } else if (error.message.includes('Invalid login credentials')) {
          setError("E-mail ou senha incorretos");
        } else if (error.message.includes('406') || error.message.includes('Failed to fetch')) {
          setError("Erro de conexão. Verifique sua internet e tente novamente.");
        } else {
          setError(`Erro no login: ${error.message}`);
        }
        return;
      }

      if (data.user) {
        try {
          // Verificar se o usuário é CLIENTE da barbearia correta
          const { data: clienteData, error: clienteError } = await supabase
            .from("clientes")
            .select("id, barbearia_id")
            .eq("usuario_auth_id", data.user.id)
            .eq("barbearia_id", barbearia?.id)
            .single();
          
          if (!clienteError && clienteData) {
            // Cliente logado e autorizado - redirecionar
            navigate(`/cliente-meu-cartao`);
          } else {
            // Usuário logado mas não é cliente desta barbearia
            // Verificar se já é cliente de outra barbearia
            const { data: clienteOutraBarbearia, error: _outraError } = await supabase
              .from("clientes")
              .select("id, barbearia_id, nome_completo")
              .eq("usuario_auth_id", data.user.id)
              .single();
            
            if (clienteOutraBarbearia) {
              // Cliente existe em outra barbearia - permitir cadastro nesta
              setNomeCompleto(clienteOutraBarbearia.nome_completo || "");
              setUser(data.user);
              setShowClientForm(true);
            } else {
              // Usuário não é cliente de nenhuma barbearia - mostrar formulário
              setUser(data.user);
              setShowClientForm(true);
            }
          }
        } catch (_dbError) {
          setError("Erro ao verificar dados do cliente. Tente novamente.");
        }
      }
    } catch (_error) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    setError("");
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/${barbearia?.slug}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        setError("Erro ao fazer login com Google");
      }
    } catch (_err) {
      setError("Erro ao fazer login");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleClientRegistration = async () => {
    if (!nomeCompleto.trim() || !whatsapp.trim() || !cpf.trim() || !senha.trim() || !confirmarSenha.trim()) {
      setError("Preencha todos os campos");
      return;
    }

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem");
      return;
    }

    if (senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoginLoading(true);
    setError("");

    try {
      // Verificar se CPF já existe nesta barbearia
      const { data: existingClient } = await supabase
        .from("clientes")
        .select("id")
        .eq("cpf_id", cpf.replace(/\D/g, ""))
        .eq("barbearia_id", barbearia?.id)
        .single();

      if (existingClient) {
        setError("CPF já cadastrado nesta barbearia");
        setLoginLoading(false);
        return;
      }

      // Gerar QR Code ID
      const { data: qrCodeData, error: qrError } = await supabase.rpc('generate_qr_code_id');
      if (qrError || !qrCodeData) {
        setError("Erro ao gerar QR Code");
        setLoginLoading(false);
        return;
      }

      // Inserir cliente
      const { error: insertError } = await supabase
        .from("clientes")
        .insert({
          barbearia_id: barbearia?.id,
          nome_completo: nomeCompleto,
          cpf_id: cpf.replace(/\D/g, ""),
          celular_whatsapp: whatsapp,
          usuario_auth_id: user?.id,
          qr_code_id: qrCodeData,
          email: user?.email
        });

      if (insertError) {
        setError("Erro ao cadastrar cliente");
        setLoginLoading(false);
        return;
      }

      // Redirecionar para área do cliente
      navigate(`/cliente-meu-cartao`);
      
    } catch (_error) {
      setError("Erro ao cadastrar cliente");
    } finally {
      setLoginLoading(false);
    }
  };

  const formatCPF = (value) => {
    const v = value.replace(/\D/g, "");
    if (v.length > 11) return value.slice(0, 15); // Limita a 11 dígitos + formatação
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatWhatsApp = (value) => {
    const v = value.replace(/\D/g, "");
    if (v.length > 11) return value.slice(0, 15); // Limita a 11 dígitos + formatação
    return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
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
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-inter">Login do Cliente</h1>
            <p className="text-gray-600 font-inter mt-2">Acesse seu cartão de fidelidade</p>
          </div>
        </div>
      </div>
    );
  }

  // Se está mostrando o formulário de cadastro de cliente
  if (showClientForm && user && barbearia) {
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
              onClick={() => navigate(`/${barbearia.slug}`)}
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

        {/* Formulário de Cadastro */}
        <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm xl:max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 md:p-6 shadow-2xl border border-slate-200">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2 font-inter">Cadastro na Barbearia</h1>
            <p className="text-slate-600 font-inter">Complete seu cadastro para esta barbearia</p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 font-inter">{error}</p>
                {error.includes("conexão") && (
                  <Button
                    onClick={() => {
                      setError("");
                      setLoginLoading(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Tentar Novamente
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 font-inter">
                Nome Completo
              </label>
              <Input
                type="text"
                placeholder="Digite seu nome completo"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                maxLength={100}
                className="w-full py-3 border-slate-200 focus:border-slate-800 focus:ring-slate-800 font-inter"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 font-inter">
                WhatsApp
              </label>
              <Input
                type="tel"
                placeholder="(11) 99999-9999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                maxLength={15}
                className="w-full py-3 border-slate-200 focus:border-slate-800 focus:ring-slate-800 font-inter"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 font-inter">
                CPF
              </label>
              <Input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                maxLength={14}
                className="w-full py-3 border-slate-200 focus:border-slate-800 focus:ring-slate-800 font-inter"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 font-inter">
                Senha
              </label>
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                maxLength={50}
                className="w-full py-3 border-slate-200 focus:border-slate-800 focus:ring-slate-800 font-inter"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 font-inter">
                Confirmar Senha
              </label>
              <Input
                type="password"
                placeholder="Confirme sua senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                maxLength={50}
                className="w-full py-3 border-slate-200 focus:border-slate-800 focus:ring-slate-800 font-inter"
              />
            </div>

            <Button
              onClick={handleClientRegistration}
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white py-3 rounded-2xl font-medium transition-all duration-200 transform hover:scale-105 font-inter mt-6"
              size="lg"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Completar Cadastro"
              )}
            </Button>
          </div>
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
            onClick={() => navigate(`/${barbearia.slug}`)}
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

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm xl:max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 md:p-6 shadow-2xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2 font-inter">Acesse sua conta</h1>
          <p className="text-slate-600 font-inter">Entre com seus dados para acessar seu cartão de fidelidade</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600 font-inter">{error}</p>
            </div>
          )}

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
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
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

          <Button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white py-3 rounded-2xl font-medium transition-all duration-200 transform hover:scale-105 font-inter"
            size="lg"
          >
            {loginLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          {/* Separador */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 font-inter">ou</span>
            </div>
          </div>

          {/* Botão Google */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loginLoading}
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl shadow-lg border border-gray-200 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            {loginLoading ? (
              <div className="w-6 h-6 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continuar com Google</span>
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 font-inter">
            Não tem uma conta?{" "}
            <button
              onClick={() => navigate(`/${barbearia.slug}/cadastro`)}
              className="text-slate-800 hover:text-slate-900 font-medium font-inter"
            >
              Cadastre-se aqui
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarbeariaLogin; 