import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/api";

interface ProtectedRouteProps {
  children: JSX.Element;
  role: 'admin' | 'barbearia' | 'cliente';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAdminAuth = useCallback(async (userId: string) => {
    try {
      const { data: admin, error } = await supabase
        .from('admins')
        .select('usuario_auth_id')
        .eq('usuario_auth_id', userId)
        .single();
      
      if (error || !admin) {
        navigate('/admin');
        return;
      }
      
      setIsAuthorized(true);
    } catch (_error) {
      navigate('/admin');
    }
  }, [navigate]);

  const checkBarbeariaAuth = useCallback(async (userId: string, barbeariaSlug?: string) => {
    try {
      if (!barbeariaSlug) {
        navigate('/');
        return;
      }

      const { data: barbearia, error } = await supabase
        .from('barbearias')
        .select('usuario_auth_id')
        .eq('slug', barbeariaSlug)
        .single();

      if (error || !barbearia || barbearia.usuario_auth_id !== userId) {
        navigate(`/${barbeariaSlug}/login`);
        return;
      }
      
      setIsAuthorized(true);
    } catch (_error) {
      navigate('/login');
    }
  }, [navigate]);

  const checkClienteAuth = useCallback(async (userId: string) => {
    try {
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('usuario_auth_id')
        .eq('usuario_auth_id', userId)
        .single();
      
      if (error || !cliente) {
        navigate('/login');
        return;
      }
      
      setIsAuthorized(true);
    } catch (_error) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { session }, error: sessionError } = await authService.getSession();

        if (!session || sessionError) {
          if (role === 'admin') {
            navigate('/admin');
          } else if (role === 'barbearia' && slug) {
            navigate(`/${slug}/login`);
          } else {
            navigate('/login');
          }
          return;
        }

        const userId = session.user.id;

        if (role === 'admin') {
          await checkAdminAuth(userId);
        } else if (role === 'barbearia') {
          await checkBarbeariaAuth(userId, slug);
        } else if (role === 'cliente') {
          await checkClienteAuth(userId);
        }
      } catch (_error) {
        setError('Erro ao verificar autorização');
        navigate(role === 'admin' ? '/admin' : '/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [slug, navigate, role, checkAdminAuth, checkBarbeariaAuth, checkClienteAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 font-inter">Verificando autorização...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-red-600 font-inter mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 hover:text-blue-800 font-inter"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return isAuthorized ? children : null;
}