import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import NotFound from './NotFound';
import ClienteAuth from './ClienteAuth';
import ClienteMeuCartao from './ClienteMeuCartao';
import type { Session } from '@supabase/supabase-js';

const BarbeariaRouter = () => {
  const { nomeBarbearia } = useParams();
  const [barbeariaId, setBarbeariaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchBarbeariaAndSession = async () => {
      if (!nomeBarbearia) {
        setLoading(false);
        setError(true);
        return;
      }

      // Fetch barbearia ID
      const { data: barbeariaData, error: barbeariaError } = await supabase.rpc('get_barbearia_by_slug', { p_slug: nomeBarbearia });

      if (barbeariaError) {
        setError(true);
        setLoading(false);
        return;
      }
      
      if (barbeariaData && barbeariaData.length > 0) {
        if (Array.isArray(barbeariaData)) {
          setBarbeariaId(barbeariaData[0].id);
        } else {
          setError(true);
          setLoading(false);
          return;
        }
      } else {
        setError(true);
        setLoading(false);
        return;
      }

      // Check session
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);
      setLoading(false);
    };

    fetchBarbeariaAndSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [nomeBarbearia]);

  if (loading) {
    return <div>Carregando...</div>; // Ou um componente de loading mais sofisticado
  }

  if (error || !barbeariaId) {
    return <NotFound />;
  }

  // Se houver sessão, mostra o cartão, senão, a autenticação
  return session ? <ClienteMeuCartao /> : <ClienteAuth barbeariaId={barbeariaId} />;
};

export default BarbeariaRouter;