import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, ArrowLeft } from 'lucide-react';

const CadastroCliente = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async () => {
    if (!email.trim() || !password.trim() || !nome.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nome,
          user_type: 'cliente'
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (user) {
       // Opcional: Inserir na tabela 'clientes' pública se houver uma
       // Por agora, o usuário está apenas no Auth
      setSuccess('Cadastro realizado com sucesso! Você será redirecionado para o login.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-dark)] text-snow p-6 flex flex-col justify-center relative">
       <Link to="/login" className="absolute top-6 left-6 text-pearl hover:text-snow transition-colors">
         <ArrowLeft className="w-6 h-6" />
       </Link>

      <div className="text-center mb-8">
         <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--gradient-elegant)] border-2 border-ash rounded-full mb-4">
           <Crown className="w-10 h-10 text-snow" />
         </div>
        <h1 className="text-3xl font-playfair font-bold">Cadastro de Cliente</h1>
        <p className="text-pearl font-inter">Crie sua conta para começar a juntar pontos!</p>
      </div>

      <div className="max-w-sm mx-auto w-full">
        <div className="mono-card-elevated space-y-6">
           <Input
             type="text"
             placeholder="Seu nome completo"
             value={nome}
             onChange={(e) => setNome(e.target.value)}
             className="h-14 text-lg bg-input border-ash rounded-xl focus:border-silver transition-colors text-snow placeholder:text-ash hover:border-silver"
           />
           <Input
             type="email"
             placeholder="Seu melhor e-mail"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             className="h-14 text-lg bg-input border-ash rounded-xl focus:border-silver transition-colors text-snow placeholder:text-ash hover:border-silver"
           />
           <Input
             type="password"
             placeholder="Crie uma senha forte"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             className="h-14 text-lg bg-input border-ash rounded-xl focus:border-silver transition-colors text-snow placeholder:text-ash hover:border-silver"
           />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}

          <Button onClick={handleCadastro} disabled={loading} variant="mobile" className="w-full">
            {loading ? 'Cadastrando...' : 'Criar minha conta'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CadastroCliente;