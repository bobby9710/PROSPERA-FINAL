import { useEffect, useState } from "react";
import { Trophy, PartyPopper, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GoalCelebrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalName: string;
  targetAmount: number;
}

const confettiColors = ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];

export function GoalCelebration({ open, onOpenChange, goalName, targetAmount }: GoalCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (open) {
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        delay: Math.random() * 0.5,
      }));
      setConfetti(particles);
    }
  }, [open]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        {/* Confetti Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confetti.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-3 h-3 rounded-sm animate-confetti"
              style={{
                left: `${particle.x}%`,
                backgroundColor: particle.color,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center py-8">
          {/* Trophy Icon with Animation */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-warning/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-warning to-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            
            {/* Stars */}
            <Star 
              className="absolute -top-2 -left-2 w-6 h-6 text-warning fill-warning animate-pulse" 
              style={{ animationDelay: "0.2s" }}
            />
            <Star 
              className="absolute -top-1 -right-3 w-5 h-5 text-warning fill-warning animate-pulse" 
              style={{ animationDelay: "0.4s" }}
            />
            <Star 
              className="absolute -bottom-1 left-0 w-4 h-4 text-warning fill-warning animate-pulse" 
              style={{ animationDelay: "0.6s" }}
            />
          </div>

          {/* Title */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-center gap-2">
              <PartyPopper className="w-6 h-6 text-primary animate-bounce" />
              <h2 className="text-2xl font-bold text-foreground">Parabéns!</h2>
              <PartyPopper className="w-6 h-6 text-secondary animate-bounce" style={{ animationDelay: "0.1s" }} />
            </div>
            <p className="text-muted-foreground">
              Você atingiu sua meta!
            </p>
          </div>

          {/* Goal Details */}
          <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-2xl p-6 mb-6 border border-success/20">
            <p className="text-lg font-semibold text-foreground mb-2">{goalName}</p>
            <p className="text-3xl font-bold text-success">{formatCurrency(targetAmount)}</p>
            <p className="text-sm text-muted-foreground mt-2">Meta concluída! 🎉</p>
          </div>

          {/* Action Button */}
          <Button className="btn-gradient w-full" onClick={() => onOpenChange(false)}>
            Continuar
          </Button>
        </div>

        <style>{`
          @keyframes confetti-fall {
            0% {
              transform: translateY(-100px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(500px) rotate(720deg);
              opacity: 0;
            }
          }
          .animate-confetti {
            animation: confetti-fall 3s ease-out forwards;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
