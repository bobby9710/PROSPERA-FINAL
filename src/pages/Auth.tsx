import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Sparkles, Loader2, ChevronRight, TrendingUp, Zap, Home, Utensils, Theater, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";

const chartData = [
  { name: '1', value: 30 },
  { name: '2', value: 35 },
  { name: '3', value: 25 },
  { name: '4', value: 45 },
  { name: '5', value: 55 },
  { name: '6', value: 70 },
  { name: '7', value: 85 },
  { name: '8', value: 100 },
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
        toast({
          title: "Conta criada!",
          description: "Verifique seu e-mail para confirmar o cadastro.",
        });
      }
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na autenticação",
        description: error.message || "Verifique suas credenciais.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f6f5f8] dark:bg-[#0a0812] font-display text-slate-900 dark:text-slate-100 overflow-x-hidden transition-colors duration-500">
      
      {/* Lado Esquerdo - Formulário (45%) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-8 lg:p-20 bg-[#f6f5f8] dark:bg-[#0a0812] relative z-10">
        <div className="w-full max-w-md">
          
          {/* Logo da Marca */}
          <div className="flex items-center gap-3 mb-12 animate-fade-in">
            <div className="bg-primary rounded-xl p-2 glow-violet shadow-[0_0_20px_rgba(var(--primary),0.3)]">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Prospera</h1>
          </div>

          <div className="mb-10 animate-fade-in stagger-1">
            <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-white">
              {isLogin ? "Bem vindo de volta" : "Criar sua conta"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {isLogin ? "Insira suas credenciais para acessar." : "Comece sua jornada financeira hoje."}
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in stagger-2">
            {!isLogin && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Nome completo</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Sparkles className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-12 pr-4 py-7 bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl focus:border-primary focus:ring-0 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">E-mail</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-7 bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl focus:border-primary focus:ring-0 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Senha</Label>
                {isLogin && (
                  <button type="button" className="text-xs text-primary font-semibold hover:underline">
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-7 bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl focus:border-primary focus:ring-0 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-7 gradient-button text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] border-none"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? "Entrar" : "Criar Conta")}
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#f6f5f8] dark:bg-[#0a0812] text-slate-500 uppercase tracking-widest text-[10px] font-bold">OU CONTINUE COM</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => signInWithGoogle()}
              className="w-full py-7 flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors group"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" />
              <span className="text-sm font-medium">Google</span>
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-12 flex justify-center items-center gap-6 opacity-60 animate-fade-in stagger-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="text-[18px]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">CONEXÃO SEGURA SSL</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-400"></div>
            <div className="flex items-center gap-1.5">
              <Lock className="text-[18px]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">CRIPTOGRAFIA DE PONTA A PONTA</span>
            </div>
          </div>

          <p className="mt-10 text-center text-slate-500 dark:text-slate-400 font-medium animate-fade-in stagger-4">
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"} {" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-bold hover:underline ml-1"
            >
              {isLogin ? "Comece agora" : "Fazer login"}
            </button>
          </p>
        </div>
      </div>

      {/* Lado Direito - Preview Imersivo (55%) */}
      <div className="hidden lg:flex w-[55%] bg-[#1a1625] relative items-center justify-center overflow-hidden p-12">
        
        {/* Gradientes Decorativos */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#895af6]/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        
        {/* Dashboard Mockup Container */}
        <div className="relative w-full max-w-2xl glass rounded-3xl p-8 shadow-2xl border border-white/5 animate-scale-in">
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-slate-400 text-sm font-medium">Saldo Total</p>
              <h3 className="text-4xl font-bold mt-1 text-white">R$ 124,592.00</h3>
              <div className="inline-flex items-center gap-1 text-emerald-400 text-sm mt-2 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5% este mês</span>
              </div>
            </div>

            {/* Cartão Virtual */}
            <div className="w-64 h-40 rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-white/10 p-5 flex flex-col justify-between shadow-2xl rotate-3 transform hover:rotate-0 transition-transform duration-500 group cursor-default">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold tracking-widest text-primary">PROSPERA</span>
                <Zap className="text-white/40 group-hover:text-white transition-colors w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-mono tracking-widest text-white/90">•••• •••• •••• 8824</p>
                <div className="flex justify-between items-end">
                  <p className="text-[10px] text-white/40 uppercase">Alex Silva</p>
                  <p className="text-[10px] text-white/40">12/28</p>
                </div>
              </div>
            </div>
          </div>

          {/* Área do Gráfico */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-slate-300">Evolução Patrimonial</h4>
              <div className="flex gap-2">
                <span className="text-[10px] px-2 py-1 rounded bg-white/5 text-slate-400">1S</span>
                <span className="text-[10px] px-2 py-1 rounded bg-primary text-white">1M</span>
                <span className="text-[10px] px-2 py-1 rounded bg-white/5 text-slate-400">1A</span>
              </div>
            </div>
            <div className="h-40 w-full relative">
              <div className="absolute top-4 right-10 flex items-center gap-2 glass px-3 py-1.5 rounded-lg border-white/10 shadow-xl z-10">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-xs font-bold text-white">R$ 124,592</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5}/>
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#chartGradient)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Categorias de Gastos */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Home className="w-4 h-4 text-tertiary" />, name: 'Aluguel', color: 'bg-tertiary', w: 'w-[65%]' },
              { icon: <Utensils className="w-4 h-4 text-emerald-400" />, name: 'Alimentação', color: 'bg-emerald-400', w: 'w-[42%]' },
              { icon: <Theater className="w-4 h-4 text-primary" />, name: 'Lazer', color: 'bg-primary', w: 'w-[28%]' },
            ].map((cat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-2 mb-2">
                  {cat.icon}
                  <span className="text-[11px] font-medium text-slate-400">{cat.name}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-1000", cat.color, cat.w)}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Chips */}
          <div className="absolute -top-6 -right-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border-white/10 shadow-xl transition-transform hover:scale-105">
              <Sparkles className="text-primary w-4 h-4" />
              <span className="text-xs font-bold text-white">Auto-Investimento ATIVO</span>
            </div>
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border-white/10 shadow-xl self-end transition-transform hover:scale-105">
              <TrendingUp className="text-emerald-400 w-4 h-4" />
              <span className="text-xs font-bold text-white">Insight: +5% de Crescimento</span>
            </div>
          </div>
          
          <div className="absolute -bottom-4 -left-6 flex items-center gap-2 glass px-4 py-2 rounded-full border-white/10 shadow-xl transition-transform hover:scale-105">
            <Target className="text-tertiary w-4 h-4" />
            <span className="text-xs font-bold text-white">Meta de Gastos: R$ 4.500</span>
          </div>
        </div>
      </div>
    </div>
  );
}
