import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription, useIsPremium, useCreateCheckout, useManageSubscription, useCheckSubscription } from "@/hooks/useSubscription";
import { 
  Crown, 
  Check, 
  X, 
  Zap, 
  TrendingUp, 
  FileText, 
  Building2, 
  Camera, 
  BookOpen,
  BarChart3,
  Shield,
  Clock,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

// Price ID from Stripe
const PREMIUM_PRICE_ID = "price_1SovylDFeKUEOYJGcXwjARjI";

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Para começar a organizar suas finanças",
    features: [
      { name: "Dashboard básico", included: true },
      { name: "Até 50 transações/mês", included: true },
      { name: "3 metas financeiras", included: true },
      { name: "Categorias padrão", included: true },
      { name: "Assistente IA (limitado)", included: true },
      { name: "Scanner de notas", included: false },
      { name: "Open Finance", included: false },
      { name: "Insights avançados", included: false },
      { name: "Relatórios personalizados", included: false },
      { name: "Automações", included: false },
      { name: "Educação financeira", included: false },
    ],
    cta: "Plano Atual",
    popular: false,
    priceId: null,
  },
  {
    name: "Premium",
    price: "R$ 19,90",
    period: "/mês",
    description: "Tudo que você precisa para dominar suas finanças",
    features: [
      { name: "Dashboard completo", included: true },
      { name: "Transações ilimitadas", included: true },
      { name: "Metas ilimitadas", included: true },
      { name: "Categorias personalizadas", included: true },
      { name: "Assistente IA ilimitado", included: true },
      { name: "Scanner de notas", included: true },
      { name: "Open Finance", included: true },
      { name: "Insights avançados", included: true },
      { name: "Relatórios personalizados", included: true },
      { name: "Automações", included: true },
      { name: "Educação financeira", included: true },
    ],
    cta: "Assinar Agora",
    popular: true,
    priceId: PREMIUM_PRICE_ID,
  },
];

const premiumFeatures = [
  {
    icon: Camera,
    title: "Scanner de Notas",
    description: "Digitalize recibos e notas fiscais automaticamente com IA",
  },
  {
    icon: Building2,
    title: "Open Finance",
    description: "Conecte suas contas bancárias e importe transações",
  },
  {
    icon: BarChart3,
    title: "Insights Avançados",
    description: "Análises detalhadas e previsões inteligentes",
  },
  {
    icon: FileText,
    title: "Relatórios",
    description: "Relatórios personalizados em PDF e Excel",
  },
  {
    icon: Zap,
    title: "Automações",
    description: "Regras automáticas para categorização e alertas",
  },
  {
    icon: BookOpen,
    title: "Educação Financeira",
    description: "Cursos, vídeos e quizzes para aprender a investir",
  },
];

export default function Premium() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { data: subscription, isLoading } = useSubscription();
  const isPremium = useIsPremium();
  const createCheckout = useCreateCheckout();
  const manageSubscription = useManageSubscription();
  const checkSubscription = useCheckSubscription();

  // Check subscription status on mount and after successful payment
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast({
        title: "Pagamento realizado!",
        description: "Sua assinatura Premium está sendo ativada...",
      });
      // Check subscription status after successful payment
      checkSubscription.mutate();
    } else if (canceled === "true") {
      toast({
        title: "Pagamento cancelado",
        description: "O checkout foi cancelado. Você pode tentar novamente.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  // Check subscription status periodically
  useEffect(() => {
    checkSubscription.mutate();
    
    const interval = setInterval(() => {
      checkSubscription.mutate();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (priceId: string | null) => {
    if (priceId) {
      createCheckout.mutate(priceId);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-yellow-600">Premium</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Desbloqueie todo o potencial do{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Prospera
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tenha acesso a recursos avançados de inteligência artificial, análises detalhadas,
            automações e muito mais para dominar suas finanças.
          </p>
        </div>

        {/* Current Subscription Status */}
        {isPremium && subscription && (
          <Card className="border-yellow-500/50 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Você é Premium!</h3>
                    <p className="text-sm text-muted-foreground">
                      {subscription.current_period_end && (
                        <>
                          Próxima renovação:{" "}
                          {format(new Date(subscription.current_period_end), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => manageSubscription.mutate()}
                  disabled={manageSubscription.isPending}
                >
                  {manageSubscription.isPending ? "Carregando..." : "Gerenciar Assinatura"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Comparison */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/20 scale-105"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground/50"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.popular ? "" : "variant-outline"}`}
                  variant={plan.popular ? "default" : "outline"}
                  disabled={
                    !plan.priceId ||
                    (isPremium && plan.name !== "Gratuito") ||
                    createCheckout.isPending
                  }
                  onClick={() => handleSubscribe(plan.priceId)}
                >
                  {createCheckout.isPending ? "Processando..." : plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Premium Features Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Recursos exclusivos do Premium
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumFeatures.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ or Trust Badges */}
        <div className="flex flex-wrap justify-center gap-8 py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-5 h-5" />
            <span>Pagamento Seguro</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-5 h-5" />
            <span>Cancele quando quiser</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-5 h-5" />
            <span>Garantia de 7 dias</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
