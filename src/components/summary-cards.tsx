import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Activity, GitBranch, Sparkles } from "lucide-react";

interface SummaryData {
  totalSequences: number;
  taxaClusters: number;
  novelTaxa: number;
}

interface SummaryCardsProps {
  data: SummaryData;
  isLoading: boolean;
}

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Sequences Analyzed",
      value: data.totalSequences.toLocaleString(),
      icon: Activity,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Number of Taxa Clusters",
      value: data.taxaClusters.toString(),
      icon: GitBranch,
      color: "text-teal-400",
      bgColor: "bg-teal-500/10"
    },
    {
      title: "Potential Novel Taxa",
      value: data.novelTaxa.toString(),
      icon: Sparkles,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 bg-muted/50 rounded animate-pulse" />
            ) : (
              <div className={`text-2xl ${card.color}`}>
                {card.value}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}