import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEducation, DIFFICULTY_INFO, CONTENT_TYPE_INFO, EducationContent, QuizQuestion } from "@/hooks/useEducation";
import { BookOpen, Video, HelpCircle, Calculator, BookMarked, Search, Clock, Crown, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Education() {
  const { 
    articles, 
    videos, 
    quizzes, 
    glossary, 
    quizResults,
    loadingContents, 
    loadingGlossary,
    submitQuiz,
    submittingQuiz,
    calculateCompoundInterest,
    calculateFinancing,
    calculateInvestmentGoal,
  } = useEducation();

  const [selectedContent, setSelectedContent] = useState<EducationContent | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [glossarySearch, setGlossarySearch] = useState("");

  // Calculator states
  const [compoundCalc, setCompoundCalc] = useState({ principal: 1000, monthly: 500, rate: 12, years: 10 });
  const [financingCalc, setFinancingCalc] = useState({ amount: 100000, rate: 12, months: 360 });
  const [goalCalc, setGoalCalc] = useState({ target: 100000, current: 10000, rate: 10, years: 5 });

  const compoundResult = calculateCompoundInterest(compoundCalc.principal, compoundCalc.monthly, compoundCalc.rate, compoundCalc.years);
  const financingResult = calculateFinancing(financingCalc.amount, financingCalc.rate, financingCalc.months);
  const goalResult = calculateInvestmentGoal(goalCalc.target, goalCalc.current, goalCalc.rate, goalCalc.years);

  const filteredGlossary = glossary.filter(term =>
    term.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
    term.definition.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const handleQuizSubmit = () => {
    if (!selectedContent?.quiz_data) return;
    
    let score = 0;
    const quizData = selectedContent.quiz_data as QuizQuestion[];
    quizData.forEach((q, index) => {
      if (quizAnswers[index] === q.correct) score++;
    });

    submitQuiz({
      contentId: selectedContent.id,
      answers: quizAnswers as Record<string, number>,
      score,
      maxScore: quizData.length,
    });
    setQuizSubmitted(true);
  };

  const getQuizScore = (contentId: string) => {
    const result = quizResults.find(r => r.content_id === contentId);
    return result ? Math.round((result.score / result.max_score) * 100) : null;
  };

  const renderContentCard = (content: EducationContent) => (
    <Card 
      key={content.id} 
      className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
      onClick={() => {
        setSelectedContent(content);
        setQuizAnswers({});
        setQuizSubmitted(false);
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{CONTENT_TYPE_INFO[content.type].icon}</span>
            <Badge variant="outline" className={DIFFICULTY_INFO[content.difficulty].color + " text-white"}>
              {DIFFICULTY_INFO[content.difficulty].label}
            </Badge>
          </div>
          {content.is_premium && <Crown className="h-5 w-5 text-yellow-500" />}
        </div>
        <CardTitle className="text-lg mt-2">{content.title}</CardTitle>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{content.duration_minutes} min</span>
          </div>
          {content.type === 'quiz' && getQuizScore(content.id) !== null && (
            <Badge variant="secondary">{getQuizScore(content.id)}% concluído</Badge>
          )}
          <ChevronRight className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Educação Financeira
          </h1>
          <p className="text-muted-foreground">Aprenda a gerenciar melhor suas finanças</p>
        </div>

        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Artigos</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Vídeos</span>
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Quizzes</span>
            </TabsTrigger>
            <TabsTrigger value="calculators" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Calculadoras</span>
            </TabsTrigger>
            <TabsTrigger value="glossary" className="flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              <span className="hidden sm:inline">Glossário</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="mt-6">
            {loadingContents ? (
              <p>Carregando...</p>
            ) : articles.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum artigo disponível ainda.</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {articles.map(renderContentCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            {videos.length === 0 ? (
              <Card className="p-8 text-center">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum vídeo disponível ainda.</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {videos.map(renderContentCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quizzes" className="mt-6">
            {quizzes.length === 0 ? (
              <Card className="p-8 text-center">
                <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum quiz disponível ainda.</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map(renderContentCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="calculators" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Compound Interest Calculator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    Juros Compostos
                  </CardTitle>
                  <CardDescription>Simule o crescimento do seu investimento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valor inicial</Label>
                      <Input
                        type="number"
                        value={compoundCalc.principal}
                        onChange={(e) => setCompoundCalc({ ...compoundCalc, principal: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Aporte mensal</Label>
                      <Input
                        type="number"
                        value={compoundCalc.monthly}
                        onChange={(e) => setCompoundCalc({ ...compoundCalc, monthly: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Taxa anual (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={compoundCalc.rate}
                        onChange={(e) => setCompoundCalc({ ...compoundCalc, rate: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Anos</Label>
                      <Input
                        type="number"
                        value={compoundCalc.years}
                        onChange={(e) => setCompoundCalc({ ...compoundCalc, years: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-primary/10 space-y-2">
                    <div className="flex justify-between">
                      <span>Total investido:</span>
                      <span className="font-semibold">{formatCurrency(compoundResult.invested)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Juros ganhos:</span>
                      <span className="font-semibold text-green-500">{formatCurrency(compoundResult.interest)}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span>Montante final:</span>
                      <span className="font-bold text-primary">{formatCurrency(compoundResult.total)}</span>
                    </div>
                  </div>

                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={compoundResult.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tickFormatter={(v) => `${v/12}a`} />
                        <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Line type="monotone" dataKey="invested" stroke="hsl(var(--muted-foreground))" name="Investido" />
                        <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" name="Total" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Financing Calculator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🏠</span>
                    Financiamento
                  </CardTitle>
                  <CardDescription>Calcule as parcelas do seu financiamento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Valor do empréstimo</Label>
                      <Input
                        type="number"
                        value={financingCalc.amount}
                        onChange={(e) => setFinancingCalc({ ...financingCalc, amount: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Taxa anual (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={financingCalc.rate}
                        onChange={(e) => setFinancingCalc({ ...financingCalc, rate: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Meses</Label>
                      <Input
                        type="number"
                        value={financingCalc.months}
                        onChange={(e) => setFinancingCalc({ ...financingCalc, months: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-primary/10 space-y-2">
                    <div className="flex justify-between text-lg">
                      <span>Parcela mensal:</span>
                      <span className="font-bold text-primary">{formatCurrency(financingResult.monthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total pago:</span>
                      <span className="font-semibold">{formatCurrency(financingResult.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de juros:</span>
                      <span className="font-semibold text-red-500">{formatCurrency(financingResult.totalInterest)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Goal Calculator */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Calculadora de Meta
                  </CardTitle>
                  <CardDescription>Quanto você precisa investir por mês para atingir sua meta?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Meta</Label>
                      <Input
                        type="number"
                        value={goalCalc.target}
                        onChange={(e) => setGoalCalc({ ...goalCalc, target: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor atual</Label>
                      <Input
                        type="number"
                        value={goalCalc.current}
                        onChange={(e) => setGoalCalc({ ...goalCalc, current: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Taxa anual (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={goalCalc.rate}
                        onChange={(e) => setGoalCalc({ ...goalCalc, rate: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Anos</Label>
                      <Input
                        type="number"
                        value={goalCalc.years}
                        onChange={(e) => setGoalCalc({ ...goalCalc, years: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-lg bg-gradient-to-r from-primary/20 to-primary/5 text-center">
                    <p className="text-muted-foreground mb-2">Você precisa investir mensalmente:</p>
                    <p className="text-4xl font-bold text-primary">{formatCurrency(goalResult)}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Para atingir {formatCurrency(goalCalc.target)} em {goalCalc.years} anos
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="glossary" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5" />
                  Glossário Financeiro
                </CardTitle>
                <CardDescription>Termos e conceitos importantes</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar termo..."
                    value={glossarySearch}
                    onChange={(e) => setGlossarySearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loadingGlossary ? (
                  <p>Carregando...</p>
                ) : filteredGlossary.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum termo encontrado.</p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredGlossary.map((term) => (
                      <AccordionItem key={term.id} value={term.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{term.term}</span>
                            {term.category && (
                              <Badge variant="outline" className="text-xs">
                                {term.category}
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground mb-2">{term.definition}</p>
                          {term.related_terms && term.related_terms.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-muted-foreground">Relacionados:</span>
                              {term.related_terms.map((related, i) => (
                                <Badge 
                                  key={i} 
                                  variant="secondary" 
                                  className="cursor-pointer"
                                  onClick={() => setGlossarySearch(related)}
                                >
                                  {related}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Content Dialog */}
        <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedContent && CONTENT_TYPE_INFO[selectedContent.type].icon}</span>
                {selectedContent?.is_premium && <Crown className="h-5 w-5 text-yellow-500" />}
              </div>
              <DialogTitle>{selectedContent?.title}</DialogTitle>
              <DialogDescription>{selectedContent?.description}</DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh] pr-4">
              {selectedContent?.type === 'article' && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{selectedContent.content}</p>
                </div>
              )}
              
              {selectedContent?.type === 'video' && (
                <div className="text-center py-8">
                  <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Vídeo em breve disponível</p>
                  {selectedContent.video_url && (
                    <Button asChild className="mt-4">
                      <a href={selectedContent.video_url} target="_blank" rel="noopener noreferrer">
                        Assistir Vídeo
                      </a>
                    </Button>
                  )}
                </div>
              )}
              
              {selectedContent?.type === 'quiz' && selectedContent.quiz_data && (
                <div className="space-y-6">
                  {(selectedContent.quiz_data as QuizQuestion[]).map((question, qIndex) => (
                    <div key={qIndex} className="space-y-3">
                      <p className="font-medium">{qIndex + 1}. {question.question}</p>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => {
                          const isSelected = quizAnswers[qIndex] === oIndex;
                          const isCorrect = oIndex === question.correct;
                          const showResult = quizSubmitted;
                          
                          return (
                            <Button
                              key={oIndex}
                              variant={isSelected ? "default" : "outline"}
                              className={`w-full justify-start ${
                                showResult && isCorrect ? "bg-green-500 hover:bg-green-600" :
                                showResult && isSelected && !isCorrect ? "bg-red-500 hover:bg-red-600" : ""
                              }`}
                              onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qIndex]: oIndex })}
                              disabled={quizSubmitted}
                            >
                              {option}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {!quizSubmitted ? (
                    <Button 
                      onClick={handleQuizSubmit} 
                      disabled={Object.keys(quizAnswers).length !== (selectedContent.quiz_data as QuizQuestion[]).length || submittingQuiz}
                      className="w-full"
                    >
                      Enviar Respostas
                    </Button>
                  ) : (
                    <div className="text-center p-4 rounded-lg bg-primary/10">
                      <p className="text-lg font-semibold">Quiz concluído!</p>
                      <p className="text-muted-foreground">
                        Você pode refazer o quiz fechando e abrindo novamente.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
