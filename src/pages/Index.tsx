import { useEffect, useRef } from 'react';
import { APP_CONFIG } from '@/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Star, 
  Users, 
  TrendingUp, 
  Award, 
  QrCode, 
  CheckCircle,
  ArrowRight,
  Download,
  Shield,
  Zap,
  Crown,
  Gem,
  Sparkles,
  Trophy
} from 'lucide-react';

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const levelsRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleDownloadApp = () => {
    // Simular download do app
    window.open('https://play.google.com/store/apps/details?id=com.fideliza.app', '_blank');
  };

  const handleDemoClick = () => {
    // Scroll para seção de funcionalidades
    scrollToSection('features');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer" onClick={() => scrollToSection('hero')}>
                {APP_CONFIG.name}
              </h1>
            </div>
            <div className="hidden sm:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Funcionalidades
              </button>
              <button 
                onClick={() => scrollToSection('levels')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Níveis
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Preços
              </button>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleDownloadApp}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar App
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" ref={heroRef} className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-sm font-medium mb-8 animate-fade-in">
              <Star className="w-4 h-4 mr-2" />
              Novo • Baixe o App Fideliza
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in">
              Fidelidade Digital
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Inteligente</span>
          </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 animate-fade-in">
              Sistema completo de gestão de clientes, pontos e recompensas. 
              Transforme sua fidelidade em resultados.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
                onClick={handleDownloadApp}
              >
                <Play className="w-5 h-5 mr-2" />
                Baixar na Play Store
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-4 text-lg"
                onClick={handleDemoClick}
              >
                Ver Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm animate-fade-in">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Gratuito
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-500" />
                Sem anúncios
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2 text-purple-500" />
                Atualizações automáticas
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Disponível na Google Play Store
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Baixe o app Fideliza e gerencie sua fidelidade de qualquer lugar
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              {/* Phone Mockup */}
              <div className="relative w-64 h-96 bg-gray-900 rounded-[3rem] p-2 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-[2.5rem] p-4">
                  {/* App Screen */}
                  <div className="w-full h-full bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                      <h3 className="text-white font-bold text-center">Fideliza</h3>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Pontos</span>
                            <span className="text-lg font-bold text-blue-600">1,250</span>
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Nível</span>
                            <span className="text-lg font-bold text-purple-600">GOLD</span>
                          </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Recompensas</span>
                            <span className="text-lg font-bold text-green-600">5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-80 animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-80 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Sistema completo com funcionalidades avançadas para gestão de fidelidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Dashboard Inteligente",
                description: "Métricas em tempo real com visualizações avançadas"
              },
              {
                icon: Users,
                title: "Gestão de Clientes",
                description: "Cadastro e histórico completo de todos os clientes"
              },
              {
                icon: Award,
                title: "Sistema de Pontos",
                description: "Acumulação automática baseada em serviços"
              },
              {
                icon: QrCode,
                title: "QR Code",
                description: "Identificação rápida e segura de clientes"
              },
              {
                icon: Shield,
                title: "Relatórios",
                description: "Análises detalhadas e insights valiosos"
              },
              {
                icon: Star,
                title: "Recompensas",
                description: "Benefícios personalizados para engajamento"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 animate-on-scroll">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section id="levels" ref={levelsRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Sistema Exclusivo
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Sistema de Níveis que Engaja
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Quatro níveis de fidelidade para seus clientes com benefícios exclusivos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                name: "PRATA", 
                points: 0, 
                color: "from-gray-400 to-gray-500", 
                bgColor: "from-gray-100 to-gray-200",
                icon: Shield,
                benefits: ["Acesso básico", "Pontos por serviço", "QR Code simples"],
                description: "Nível inicial"
              },
              { 
                name: "GOLD", 
                points: 100, 
                color: "from-yellow-400 to-yellow-600", 
                bgColor: "from-yellow-100 to-yellow-200",
                icon: Star,
                benefits: ["Descontos especiais", "Prioridade no atendimento", "Recompensas exclusivas"],
                description: "Experiência premium"
              },
              { 
                name: "BLACK", 
                points: 250, 
                color: "from-gray-800 to-gray-900", 
                bgColor: "from-gray-100 to-gray-200",
                icon: Crown,
                benefits: ["Atendimento VIP", "Recompensas especiais", "Descontos exclusivos"],
                description: "Elite do sistema"
              },
              { 
                name: "DIAMOND", 
                points: 400, 
                color: "from-blue-400 via-purple-500 to-pink-500", 
                bgColor: "from-blue-100 via-purple-100 to-pink-100",
                icon: Gem,
                benefits: ["Todos os benefícios", "Atendimento premium", "Recompensas únicas"],
                description: "Máximo nível"
              }
            ].map((level, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 animate-on-scroll relative overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${level.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${level.color} rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                
                <CardContent className="p-6 text-center relative z-10">
                  {/* Icon Container */}
                  <div className={`w-20 h-20 bg-gradient-to-r ${level.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <level.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Level Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700 transition-all duration-300">
                    {level.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 italic">{level.description}</p>
                  
                  {/* Points */}
                  <div className="mb-4">
                    <span className="text-lg font-bold text-gray-700">{level.points}</span>
                    <span className="text-sm text-gray-500"> pontos</span>
                  </div>
                  
                  {/* Benefits */}
                  <ul className="text-sm text-gray-600 space-y-2">
                    {level.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                        <span className="text-center">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 bg-gradient-to-r ${level.color} rounded-full transition-all duration-1000`}
                        style={{ 
                          width: `${Math.min((level.points / 400) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {level.points === 0 ? 'Nível inicial' : `${Math.round((level.points / 400) * 100)}% do progresso`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Implemente o sistema de fidelidade e aumente a retenção dos seus clientes
            </p>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              onClick={handleDownloadApp}
            >
              <Trophy className="w-5 h-5 mr-2" />
              Começar Agora
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricingRef} className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para o tamanho do seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plano Gratuito */}
            <Card className="relative group hover:shadow-xl transition-all duration-300 animate-on-scroll">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratuito</h3>
                  <p className="text-gray-600 mb-6">Perfeito para começar</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">R$ 0</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Até 50 clientes</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Sistema de pontos básico</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>QR Code para clientes</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Relatórios básicos</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Suporte por email</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200"
                    onClick={handleDownloadApp}
                  >
                    Começar Grátis
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Plano Premium */}
            <Card className="relative group hover:shadow-xl transition-all duration-300 animate-on-scroll border-2 border-blue-500">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </span>
              </div>
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                  <p className="text-gray-600 mb-6">Para negócios em crescimento</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">R$ 49</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Até 500 clientes</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Sistema de pontos avançado</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>QR Code personalizado</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Relatórios detalhados</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Recompensas personalizadas</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Suporte prioritário</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Integração com WhatsApp</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    onClick={handleDownloadApp}
                  >
                    Começar Premium
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Plano Enterprise */}
            <Card className="relative group hover:shadow-xl transition-all duration-300 animate-on-scroll">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                  <p className="text-gray-600 mb-6">Para grandes operações</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">R$ 149</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Clientes ilimitados</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Sistema completo de fidelidade</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>QR Code com branding</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Analytics avançados</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Recompensas exclusivas</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Suporte 24/7</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>API personalizada</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Treinamento da equipe</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200"
                    onClick={() => {
                      // Simular contato com vendas
                      // toast({
        //   title: "Contato",
        //   description: "Entre em contato conosco: contato@fideliza.com",
        //   status: "info"
        // });
                    }}
                  >
                    Falar com Vendas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Perguntas Frequentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Posso mudar de plano?</h4>
                <p className="text-gray-600">Sim! Você pode fazer upgrade ou downgrade a qualquer momento.</p>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Há taxa de cancelamento?</h4>
                <p className="text-gray-600">Não, você pode cancelar a qualquer momento sem taxas.</p>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Os dados são seguros?</h4>
                <p className="text-gray-600">Sim, utilizamos criptografia de ponta a ponta.</p>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Oferecem teste gratuito?</h4>
                <p className="text-gray-600">Sim, 14 dias de teste gratuito em todos os planos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronto para revolucionar sua fidelidade?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Baixe o app Fideliza e comece a transformar seus clientes em fãs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
              onClick={handleDownloadApp}
            >
              <Play className="w-5 h-5 mr-2" />
              Baixar na Play Store
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
              onClick={() => scrollToSection('pricing')}
            >
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 {APP_CONFIG.name}. Todos os direitos reservados.
          </p>
      </div>
      </footer>
    </div>
  );
};

export default Index;
