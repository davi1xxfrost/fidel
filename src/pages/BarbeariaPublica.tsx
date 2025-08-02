import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type BarbeariaData = {
  id: string;
  nome_barbearia: string;
  email_contato: string;
  slug?: string;
}

type Reward = {
  title: string;
  points: string;
  icon: string;
  color: string;
  badge: string;
}

const BarbeariaPublica = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [barbearia, setBarbearia] = useState<BarbeariaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentReward, setCurrentReward] = useState(0);

  const rewards: Reward[] = [
    {
      title: "Corte Grátis",
      points: "500 pontos",
      icon: "🎁",
      color: "from-yellow-400 to-orange-500",
      badge: "⭐ Recompensa Premium"
    },
    {
      title: "Produto VIP",
      points: "300 pontos",
      icon: "💎",
      color: "from-purple-400 to-pink-500",
      badge: "💎 Produto Exclusivo"
    },
    {
      title: "Barba Perfeita",
      points: "200 pontos",
      icon: "✂️",
      color: "from-blue-400 to-indigo-500",
      badge: "✨ Serviço Premium"
    }
  ];

  // Auto flip effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setIsFlipped(!isFlipped);
        setTimeout(() => setIsAnimating(false), 1000);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isFlipped, isAnimating]);

  // Auto reward rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReward((prev) => (prev + 1) % rewards.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [rewards.length]);

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

  const handleFlip = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setIsFlipped(!isFlipped);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
      </div>
    );
  }

  if (!barbearia) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 relative overflow-hidden animate-subtle-gradient" style={{ paddingTop: '30px' }}>
      <style>{`
        @keyframes fade-in-slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-slide-up {
          animation: fade-in-slide-up 0.3s ease-out forwards;
        }
        
        .animate-fade-in-slide-up-delay-1 {
          animation: fade-in-slide-up 0.3s ease-out 0.15s forwards;
        }
        
        .animate-fade-in-slide-up-delay-2 {
          animation: fade-in-slide-up 0.3s ease-out 0.3s forwards;
        }
        
        .animate-fade-in-slide-up-delay-3 {
          animation: fade-in-slide-up 0.4s ease-out 0.45s forwards;
        }
        
        .animate-fade-in-slide-up-delay-4 {
          animation: fade-in-slide-up 0.3s ease-out 0.6s forwards;
        }
        
        @keyframes subtle-gradient {
          0% {
            background: linear-gradient(135deg, #ffffff 0%, #fefefe 25%, #fdfdfd 50%, #fefefe 75%, #ffffff 100%);
          }
          50% {
            background: linear-gradient(135deg, #fefefe 0%, #fdfdfd 25%, #fefefe 50%, #ffffff 75%, #fefefe 100%);
          }
          100% {
            background: linear-gradient(135deg, #ffffff 0%, #fefefe 25%, #fdfdfd 50%, #fefefe 75%, #ffffff 100%);
          }
        }
        
        .animate-subtle-gradient {
          animation: subtle-gradient 30s ease-in-out infinite;
        }
        
        .button-hover {
          transform: scale(1);
          transition: transform 0.3s ease-out;
        }
        
        .button-hover:hover {
          transform: scale(1.1);
        }
        
        .shadow-professional {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>

      {/* Logo */}
      <div className="relative z-10 mb-4 opacity-0 animate-fade-in-slide-up">
        <img 
          src="/imagens/logo.png" 
          alt="Logo da barbearia"
          className="w-28 h-28 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain"
        />
      </div>

      {/* Nome da Barbearia */}
      <h1 className="relative z-10 text-4xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 text-center tracking-tight font-inter opacity-0 animate-fade-in-slide-up-delay-1">
        {barbearia.nome_barbearia}
      </h1>

      {/* Subtítulo */}
      <p className="relative z-10 text-base sm:text-lg font-medium text-gray-600 mb-4 text-center font-inter opacity-0 animate-fade-in-slide-up-delay-2">
        Acumule Pontos • Ganhe Recompensas
      </p>

      {/* Card Principal */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm xl:max-w-md rounded-3xl p-4 sm:p-6 md:p-6 mb-8 sm:mb-8 shadow-professional border border-slate-200 opacity-0 animate-fade-in-slide-up-delay-3 overflow-visible" style={{ backgroundColor: '#ffffff' }}>
        <div className="text-center">
          {/* Flip Card 3D */}
          <div className="mb-8 sm:mb-8">
            <div 
              className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg mx-auto rounded-2xl cursor-pointer"
              style={{ 
                perspective: '1000px',
                aspectRatio: '1080/1350'
              }}
              onClick={handleFlip}
            >
              <div 
                className="relative w-full h-full"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 1s ease-in-out'
                }}
              >
                <div 
                  className="absolute inset-0 w-full h-full flex items-center justify-center"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <img 
                    src="/imagens/capa.jpg"
                    alt="Barbearia moderna com ambiente elegante"
                    className="max-w-full max-h-full object-contain rounded-2xl"
                  />
                </div>
                <div 
                  className="absolute inset-0 w-full h-full flex items-center justify-center"
                  style={{ 
                    transform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <img 
                    src="/imagens/foto.jpg"
                    alt="Foto da barbearia"
                    className="max-w-full max-h-full object-contain rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botão ENTRAR */}
          <Button
            onClick={() => navigate(`/${barbearia.slug}/login`)}
            className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white px-12 sm:px-16 md:px-16 lg:px-20 py-4 sm:py-4 md:py-5 text-lg sm:text-lg md:text-xl font-bold tracking-wide rounded-2xl shadow-xl border border-slate-600 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm font-inter opacity-0 animate-fade-in-slide-up-delay-4 active:scale-95 relative z-20 button-hover"
            size="lg"
          >
            ENTRAR
          </Button>
        </div>
      </div>

      {/* Carrossel de Recompensas */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm xl:max-w-md mt-0 opacity-0 animate-fade-in-slide-up-delay-4">
        <div className="bg-white rounded-xl p-3 shadow-professional border border-slate-200 transition-all duration-500">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 bg-gradient-to-br ${rewards[currentReward].color} rounded-full flex items-center justify-center flex-shrink-0`}>
              <span className="text-white font-bold text-sm">{rewards[currentReward].icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-800 font-inter">{rewards[currentReward].title}</h3>
              <p className="text-xs text-slate-600 font-inter">Troque por {rewards[currentReward].points}</p>
            </div>
            <div className="flex-shrink-0">
              <span className="text-xs text-slate-500 font-inter">{rewards[currentReward].badge}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarbeariaPublica;
