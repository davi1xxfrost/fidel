import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scissors, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast: _toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showBarbeariaForm, setShowBarbeariaForm] = useState(false);
  const [nomeBarbearia, setNomeBarbearia] = useState("");
  const [telefone, setTelefone] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const checkUserType = useCallback(async (user) => {
    try {
      // Verificar se é admin
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('usuario_auth_id', user.id)
        .single();

      if (adminData) {
        navigate('/admin-dashboard');
        return;
      }

      // Verificar se é barbearia
      const { data: barbeariaData } = await supabase
        .from('barbearias')
        .select('*')
        .eq('usuario_auth_id', user.id)
        .single();

      if (barbeariaData) {
        navigate(`/${barbeariaData.slug}/dashboard`);
        return;
      }

      // Verificar se é cliente
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('*')
        .eq('usuario_auth_id', user.id)
        .single();

      if (clienteData) {
        navigate('/cliente-meu-cartao');
        return;
      }

      // Se não é nenhum dos três, mostrar formulário de barbearia
      setShowBarbeariaForm(true);
    } catch (_err) {
      setShowBarbeariaForm(true);
    }
  }, [navigate]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          await checkUserType(user);
        }
      } catch (_err) {
        // Erro ao verificar usuário
      }
    };
    checkUser();
  }, [checkUserType]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
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
      setLoading(false);
    }
  };

  const handleBarbeariaRegistration = async () => {
    if (!nomeBarbearia.trim() || !telefone.trim()) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Verificar se email já existe
      const { data: existingBarbeariaEmail } = await supabase
        .from("barbearias")
        .select("id")
        .eq("email_contato", user.email)
        .single();

      if (existingBarbeariaEmail) {
        setError("Email já cadastrado no sistema");
        setLoading(false);
        return;
      }

      // Verificar se nome da barbearia já existe
      const { data: existingBarbeariaNome } = await supabase
        .from("barbearias")
        .select("id")
        .eq("nome_barbearia", nomeBarbearia)
        .single();

      if (existingBarbeariaNome) {
        setError("Nome da barbearia já cadastrado no sistema");
        setLoading(false);
        return;
      }

      // Gerar slug único
      const slug = nomeBarbearia
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Verificar se slug já existe
      const { data: existingSlug } = await supabase
        .from("barbearias")
        .select("id")
        .eq("slug", slug)
        .single();

      if (existingSlug) {
        setError("Nome da barbearia já cadastrado no sistema");
        setLoading(false);
        return;
      }

      // Inserir barbearia
      const { error: insertError } = await supabase
        .from("barbearias")
        .insert({
          usuario_auth_id: user.id,
          nome_barbearia: nomeBarbearia,
          email_contato: user.email,
          telefone,
          senha_hash: "google_auth", // Placeholder para Google Auth
          slug
        });

      if (insertError) {
        setError("Erro ao cadastrar barbearia");
        setLoading(false);
        return;
      }

      // Redirecionar para dashboard da barbearia
      navigate(`/${slug}/dashboard`);
      
    } catch (_err) {
      setError("Erro ao cadastrar barbearia");
    } finally {
      setLoading(false);
    }
  };



  // Se está mostrando o formulário de barbearia
  if (showBarbeariaForm && user) {
    return (
      <div className="min-h-screen bg-[var(--gradient-dark)] relative overflow-hidden">
        {/* Subtle animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-silver to-ash rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-40 right-16 w-24 h-24 bg-gradient-to-br from-ash to-pearl rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Header */}
        <div className="relative text-center pt-16 pb-12 slide-in-up">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-[var(--gradient-elegant)] border-2 border-ash rounded-full mb-6 shadow-[var(--shadow-elevated)] animate-bounce-in">
            <Scissors className="w-12 h-12 text-snow" />
          </div>
          <h1 className="text-4xl font-playfair font-bold text-snow mb-3">Cadastre sua Barbearia</h1>
          <p className="text-pearl font-inter">Precisamos de algumas informações para configurar seu sistema</p>
        </div>

        {/* Formulário de cadastro */}
        <div className="relative px-6 pb-16 fade-in-delayed">
          <div className="max-w-sm mx-auto">
            <div className="mono-card-elevated space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-medium text-snow block font-inter">
                  Nome da Barbearia
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Barbearia Estilo Clássico"
                  value={nomeBarbearia}
                  onChange={(e) => setNomeBarbearia(e.target.value)}
                  maxLength={50}
                  className="h-14 text-lg bg-input border-ash rounded-xl focus:border-silver transition-colors text-snow placeholder:text-ash hover:border-silver"
                />

                <label className="text-sm font-medium text-snow block font-inter">
                  Telefone
                </label>
                <Input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  maxLength={15}
                  className="h-14 text-lg bg-input border-ash rounded-xl focus:border-silver transition-colors text-snow placeholder:text-ash hover:border-silver"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 font-inter">{error}</p>
                </div>
              )}

              <Button
                onClick={handleBarbeariaRegistration}
                disabled={loading}
                variant="mobile"
                className="w-full group"
              >
                {loading ? "Cadastrando..." : "Cadastrar Barbearia"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--gradient-dark)] relative overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-silver to-ash rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-40 right-16 w-24 h-24 bg-gradient-to-br from-ash to-pearl rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header com logo */}
      <div className="relative text-center pt-16 pb-12 slide-in-up">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-[var(--gradient-elegant)] border-2 border-ash rounded-full mb-6 shadow-[var(--shadow-elevated)] animate-bounce-in">
          <Scissors className="w-12 h-12 text-snow" />
        </div>
        <h1 className="text-4xl font-playfair font-bold text-snow mb-3">Barbearia</h1>
        <h2 className="text-2xl text-pearl font-playfair font-semibold mb-2">Estilo Clássico</h2>
        <div className="flex items-center justify-center gap-2 text-silver">
          <Sparkles className="w-4 h-4" />
          <p className="font-inter">Sistema de Fidelidade Digital</p>
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Formulário central */}
      <div className="relative px-6 pb-16 fade-in-delayed">
        <div className="max-w-sm mx-auto">
          <div className="mono-card-elevated space-y-8">
            {/* Botão de login com Google */}
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 font-inter">{error}</p>
                </div>
              )}
              
              {/* Botão Google Elegante */}
              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-14 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl shadow-lg border border-gray-200 transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Cadastrar Barbearia com Google</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Informações adicionais */}
            <div className="text-center pt-4 border-t border-ash">
              <p className="text-xs text-silver font-inter">
                Faça login com sua conta Google para cadastrar sua barbearia
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;