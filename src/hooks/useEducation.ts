import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export interface EducationContent {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  content?: string | null;
  thumbnail_url?: string | null;
  video_url?: string | null;
  quiz_data?: unknown;
  category: string;
  difficulty: string;
  duration_minutes?: number | null;
  is_premium: boolean;
  order_index: number;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface QuizResult {
  id: string;
  user_id: string;
  content_id: string;
  score: number;
  max_score: number;
  answers: Record<string, number>;
  completed_at: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category?: string;
  related_terms?: string[];
  created_at: string;
}

export const DIFFICULTY_INFO: Record<EducationContent['difficulty'], { label: string; color: string }> = {
  beginner: { label: 'Iniciante', color: 'bg-green-500' },
  intermediate: { label: 'Intermediário', color: 'bg-yellow-500' },
  advanced: { label: 'Avançado', color: 'bg-red-500' },
};

export const CONTENT_TYPE_INFO: Record<EducationContent['type'], { label: string; icon: string }> = {
  article: { label: 'Artigo', icon: '📄' },
  video: { label: 'Vídeo', icon: '🎬' },
  quiz: { label: 'Quiz', icon: '❓' },
};

// Calculators
export function calculateCompoundInterest(
  principal: number,
  monthlyDeposit: number,
  annualRate: number,
  years: number
): { total: number; invested: number; interest: number; monthlyData: { month: number; total: number; invested: number }[] } {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  let total = principal;
  let invested = principal;
  const monthlyData: { month: number; total: number; invested: number }[] = [];

  for (let i = 1; i <= months; i++) {
    total = total * (1 + monthlyRate) + monthlyDeposit;
    invested += monthlyDeposit;
    if (i % 12 === 0 || i === months) {
      monthlyData.push({ month: i, total, invested });
    }
  }

  return {
    total,
    invested,
    interest: total - invested,
    monthlyData,
  };
}

export function calculateFinancing(
  loanAmount: number,
  annualRate: number,
  months: number
): { monthlyPayment: number; totalPaid: number; totalInterest: number } {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPaid = monthlyPayment * months;
  const totalInterest = totalPaid - loanAmount;

  return {
    monthlyPayment,
    totalPaid,
    totalInterest,
  };
}

export function calculateInvestmentGoal(
  targetAmount: number,
  currentAmount: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  const futureValueOfCurrent = currentAmount * Math.pow(1 + monthlyRate, months);
  const remainingAmount = targetAmount - futureValueOfCurrent;
  
  if (remainingAmount <= 0) return 0;
  
  const monthlyDeposit = remainingAmount * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
  return monthlyDeposit;
}

export function useEducation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: contents = [], isLoading: loadingContents } = useQuery({
    queryKey: ["education-contents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education_content")
        .select("*")
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data as EducationContent[];
    },
  });

  const { data: glossary = [], isLoading: loadingGlossary } = useQuery({
    queryKey: ["glossary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("glossary_terms")
        .select("*")
        .order("term", { ascending: true });
      
      if (error) throw error;
      return data as GlossaryTerm[];
    },
  });

  const { data: quizResults = [], isLoading: loadingResults } = useQuery({
    queryKey: ["quiz-results", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });
      
      if (error) throw error;
      return data as QuizResult[];
    },
    enabled: !!user,
  });

  const submitQuizMutation = useMutation({
    mutationFn: async ({ contentId, answers, score, maxScore }: { contentId: string; answers: Record<string, number>; score: number; maxScore: number }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("quiz_results")
        .insert({
          user_id: user.id,
          content_id: contentId,
          score,
          max_score: maxScore,
          answers,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-results"] });
      const percentage = Math.round((data.score / data.max_score) * 100);
      toast({
        title: `Quiz concluído! ${percentage}%`,
        description: `Você acertou ${data.score} de ${data.max_score} questões.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar resultado",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const articles = contents.filter(c => c.type === 'article');
  const videos = contents.filter(c => c.type === 'video');
  const quizzes = contents.filter(c => c.type === 'quiz');

  const categories = [...new Set(contents.map(c => c.category))];

  return {
    contents,
    loadingContents,
    articles,
    videos,
    quizzes,
    categories,
    glossary,
    loadingGlossary,
    quizResults,
    loadingResults,
    submitQuiz: submitQuizMutation.mutate,
    submittingQuiz: submitQuizMutation.isPending,
    calculateCompoundInterest,
    calculateFinancing,
    calculateInvestmentGoal,
  };
}
