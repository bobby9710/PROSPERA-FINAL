import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

interface PremiumBadgeProps {
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function PremiumBadge({ size = "sm", showTooltip = true }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const badge = (
    <Badge 
      className={`bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 ${sizeClasses[size]} cursor-pointer hover:from-yellow-600 hover:to-orange-600 transition-all`}
    >
      <Crown className={`${iconSizes[size]} mr-1`} />
      PRO
    </Badge>
  );

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/premium">
            {badge}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Recurso Premium - Clique para ver os planos</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return <Link to="/premium">{badge}</Link>;
}
