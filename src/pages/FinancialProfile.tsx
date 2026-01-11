import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useFinancialProfile, RISK_PROFILE_INFO } from "@/hooks/useFinancialProfile";
import { User, Wallet, Home, Users, PiggyBank, TrendingUp, CreditCard, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function FinancialProfile() {
  const { profile, loadingProfile, suggestions, saveProfile, savingProfile } = useFinancialProfile();
  
  const [formData, setFormData] = useState({
    monthly_income: 0,
    fixed_expenses: 0,
    dependents: 0,
    emergency_fund: 0,
    investments: 0,
    debts: 0,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        monthly_income: profile.monthly_income,
        fixed_expenses: profile.fixed_expenses,
        dependents: profile.dependents,
        emergency_fund: profile.emergency_fund,
        investments: profile.investments,
        debts: profile.debts,
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(formData);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData({ ...formData, [field]: numValue });
  };

  // Calculate some metrics
  const freeIncome = formData.monthly_income - formData.fixed_expenses;
  const savingsRate = formData.monthly_income > 0 ? (freeIncome / formData.monthly_income) * 100 : 0;
  const emergencyMonths = formData.fixed_expenses > 0 ? formData.emergency_fund / formData.fixed_expenses : 0;
  const debtToIncomeRatio = formData.monthly_income > 0 ? (formData.debts / (formData.monthly_income * 12)) * 100 : 0;

  if (loadingProfile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const currentProfile = profile?.risk_profile || 'moderate';

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8 text-primary" />
            Perfil Financeiro
          </h1>
          <p className="text-muted-foreground">
            Conheça seu perfil e receba sugestões personalizadas
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Suas Informações Financeiras</CardTitle>
                <CardDescription>
                  Preencha os campos abaixo para descobrir seu perfil de investidor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Renda Mensal
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.monthly_income || ""}
                        onChange={(e) => handleInputChange("monthly_income", e.target.value)}
                        placeholder="Ex: 5000.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Gastos Fixos Mensais
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.fixed_expenses || ""}
                        onChange={(e) => handleInputChange("fixed_expenses", e.target.value)}
                        placeholder="Ex: 3000.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Número de Dependentes
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.dependents || ""}
                        onChange={(e) => handleInputChange("dependents", e.target.value)}
                        placeholder="Ex: 2"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <PiggyBank className="h-4 w-4" />
                        Fundo de Emergência
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.emergency_fund || ""}
                        onChange={(e) => handleInputChange("emergency_fund", e.target.value)}
                        placeholder="Ex: 15000.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Total em Investimentos
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.investments || ""}
                        onChange={(e) => handleInputChange("investments", e.target.value)}
                        placeholder="Ex: 50000.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Total de Dívidas
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.debts || ""}
                        onChange={(e) => handleInputChange("debts", e.target.value)}
                        placeholder="Ex: 10000.00"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={savingProfile}>
                    {savingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar e Analisar Perfil"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Metrics Cards */}
            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Economia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>
                  <Progress value={Math.min(savingsRate, 100)} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {savingsRate >= 30 ? "Excelente!" : savingsRate >= 20 ? "Bom!" : "Tente aumentar para 20%+"}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Fundo de Emergência</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emergencyMonths.toFixed(1)} meses</div>
                  <Progress value={Math.min((emergencyMonths / 6) * 100, 100)} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {emergencyMonths >= 6 ? "Seguro!" : `Objetivo: 6 meses (${formatCurrency(formData.fixed_expenses * 6)})`}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Renda Livre</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${freeIncome >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatCurrency(freeIncome)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Disponível após gastos fixos
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Relação Dívida/Renda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${debtToIncomeRatio < 30 ? "text-green-500" : debtToIncomeRatio < 50 ? "text-yellow-500" : "text-red-500"}`}>
                    {debtToIncomeRatio.toFixed(1)}%
                  </div>
                  <Progress value={Math.min(debtToIncomeRatio, 100)} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {debtToIncomeRatio < 30 ? "Saudável" : debtToIncomeRatio < 50 ? "Atenção" : "Crítico"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Profile & Suggestions Section */}
          <div className="space-y-6">
            {/* Risk Profile Card */}
            <Card className="overflow-hidden">
              <div className={`h-2 ${RISK_PROFILE_INFO[currentProfile].color}`} />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-3xl">{RISK_PROFILE_INFO[currentProfile].icon}</span>
                  Seu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{RISK_PROFILE_INFO[currentProfile].label}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {RISK_PROFILE_INFO[currentProfile].description}
                </p>

                {/* Profile Indicator */}
                <div className="relative pt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Conservador</span>
                    <span>Moderado</span>
                    <span>Agressivo</span>
                  </div>
                  <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500" />
                  <div 
                    className="absolute -bottom-1 w-4 h-4 bg-background border-2 border-primary rounded-full transform -translate-x-1/2"
                    style={{ 
                      left: currentProfile === 'conservative' ? '16.67%' : 
                            currentProfile === 'moderate' ? '50%' : '83.33%' 
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Suggestions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💡 Sugestões Personalizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {suggestions.length === 0 ? (
                  <div className="text-center py-4">
                    <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Preencha suas informações para receber sugestões personalizadas
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm p-3 rounded-lg bg-muted/50">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
