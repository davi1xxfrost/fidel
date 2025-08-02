import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAudit } from "@/hooks/useAudit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import type { Database } from "@/types/supabase-types";

// type Admin = Database['public']['Tables']['admins']['Row'];

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logLogin, logUnauthorizedAccess } = useAudit();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        status: "error"
      });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        await logLogin(email, false);
        toast({
          title: "Erro",
          description: `Erro no login: ${error.message}`,
          status: "error"
        });
        return;
      }
      // Checa se o user.id está na tabela admins
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('usuario_auth_id', data.user.id)
        .single();
      if (!adminData) {
        await logUnauthorizedAccess("/admin-dashboard", email);
        toast({
          title: "Erro",
          description: "Usuário não é administrador",
          status: "error"
        });
        return;
      }
      await logLogin(email, true);
      navigate("/admin-dashboard");
    } catch (error) {
      await logLogin(email, false);
      toast({
        title: "Erro",
        description: `Erro no login: ${error}`,
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-sm p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Login Admin</h2>
        <Input id="email" name="email" type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="mb-2" />
        <Input id="password" name="password" type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="mb-4" />
        <Button onClick={handleLogin} disabled={loading} className="w-full">Entrar</Button>
      </div>
    </div>
  );
};

export default AdminLogin;