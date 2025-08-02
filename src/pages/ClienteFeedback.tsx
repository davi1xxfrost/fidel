import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Star, Send, Heart, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ClienteFeedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [avaliacao, setAvaliacao] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleEstrelaClick = (estrelas: number) => {
    setAvaliacao(estrelas);
  };

  const handleEnviarAvaliacao = () => {
    if (avaliacao === 0) {
      toast({
        title: "Avaliação obrigatória",
        description: "Por favor, selecione uma nota de 1 a 5 estrelas.",
        status: "error",
      });
      return;
    }

    setEnviado(true);
    toast({
      title: "Avaliação enviada!",
      description: "Obrigado pelo seu feedback! Sua opinião é muito importante para nós.",
      status: "success",
    });

    // Redirect after 3 seconds
    setTimeout(() => {
      navigate("/cliente-meu-cartao");
    }, 3000);
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="clean-card w-full max-w-md text-center">
          <CardContent className="p-8 space-y-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground font-inter">Obrigado pelo seu feedback!</h2>
              <p className="text-gray-dark font-inter">
                Sua avaliação nos ajuda a melhorar sempre nossos serviços.
              </p>
            </div>
            <div className="flex justify-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < avaliacao ? 'text-primary fill-current' : 'text-gray-light'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-medium font-inter">
              Redirecionando em instantes...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-gray-light p-6 fade-in">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/cliente-meu-cartao")}
            className="text-foreground hover:bg-gray-light p-2 transition-[var(--transition-smooth)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-inter">Avalie sua Experiência</h1>
            <p className="text-gray-dark text-sm font-inter">Barbearia Estilo Clássico</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6 fade-in-up">
        {/* Main Feedback Card */}
        <Card className="clean-card">
          <CardHeader>
            <CardTitle className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground font-inter">
                Como foi sua experiência na Barbearia Estilo Clássico?
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Rating Stars */}
            <div className="text-center space-y-4">
              <p className="text-gray-dark font-inter">Toque nas estrelas para avaliar:</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((estrela) => (
                  <button
                    key={estrela}
                    onClick={() => handleEstrelaClick(estrela)}
                    className="transition-transform duration-200 hover:scale-110"
                  >
                    <Star
                      className={`w-12 h-12 transition-colors duration-200 ${
                        estrela <= avaliacao
                          ? 'text-primary fill-current'
                          : 'text-gray-light hover:text-gray-medium'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {avaliacao > 0 && (
                <div className="space-y-2 fade-in">
                  <p className="text-lg font-semibold text-foreground font-inter">
                    {avaliacao === 1 && "Muito insatisfeito"}
                    {avaliacao === 2 && "Insatisfeito"}
                    {avaliacao === 3 && "Neutro"}
                    {avaliacao === 4 && "Satisfeito"}
                    {avaliacao === 5 && "Muito satisfeito"}
                  </p>
                  <div className="text-3xl">
                    {avaliacao === 1 && "😞"}
                    {avaliacao === 2 && "😐"}
                    {avaliacao === 3 && "😊"}
                    {avaliacao === 4 && "😁"}
                    {avaliacao === 5 && "🤩"}
                  </div>
                </div>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-dark font-inter">
                Deixe seu comentário (opcional)
              </label>
              <Textarea
                placeholder="Conte-nos sobre sua experiência, sugestões ou elogios..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="min-h-32 bg-background border-gray-medium text-foreground placeholder:text-gray-medium focus:border-primary font-inter resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleEnviarAvaliacao}
              variant="mobile"
              className="w-full group"
              disabled={avaliacao === 0}
            >
              <Send className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
              Enviar Avaliação
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="clean-card fade-in" style={{animationDelay: '0.1s'}}>
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <Heart className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-semibold text-foreground font-inter">Sua opinião é muito importante!</h3>
              <p className="text-sm text-gray-dark font-inter">
                Seus comentários nos ajudam a melhorar continuamente nossos serviços e proporcionar 
                a melhor experiência possível para todos os nossos clientes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClienteFeedback;