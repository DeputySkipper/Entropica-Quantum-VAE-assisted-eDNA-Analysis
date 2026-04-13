import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tooltip } from "./ui/tooltip";
import { Target } from "lucide-react";

interface SimilarityData {
  clusterA: string;
  clusterB: string;
  similarity: number;
}

interface SimilarityHeatmapProps {
  data: SimilarityData[];
  clusterIds: string[];
  isLoading: boolean;
}

export function SimilarityHeatmap({ data, clusterIds, isLoading }: SimilarityHeatmapProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Sequence Similarity Matrix
          </CardTitle>
          <CardDescription>
            Pairwise genetic similarity between taxa clusters (%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted/20 rounded animate-pulse flex items-center justify-center">
            <div className="text-muted-foreground">Loading similarity matrix...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSimilarity = (clusterA: string, clusterB: string) => {
    if (clusterA === clusterB) return 100;
    const similarity = data.find(
      (item) => 
        (item.clusterA === clusterA && item.clusterB === clusterB) ||
        (item.clusterA === clusterB && item.clusterB === clusterA)
    );
    return similarity ? similarity.similarity : 0;
  };

  const getColorIntensity = (similarity: number) => {
    const intensity = similarity / 100;
    return `rgba(16, 185, 129, ${intensity})`;
  };

  const displayClusters = clusterIds.slice(0, 8); // Show first 8 for better visibility

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          Sequence Similarity Matrix
        </CardTitle>
        <CardDescription>
          Pairwise genetic similarity between taxa clusters (%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <div className="grid grid-cols-9 gap-1 min-w-max">
            {/* Header row */}
            <div className="w-16 h-8"></div>
            {displayClusters.map((clusterId) => (
              <div 
                key={clusterId} 
                className="w-16 h-8 text-xs text-emerald-400 flex items-center justify-center transform -rotate-45 origin-center"
              >
                {clusterId.slice(-3)}
              </div>
            ))}
            
            {/* Data rows */}
            {displayClusters.map((clusterA) => (
              <div key={clusterA} className="contents">
                <div className="w-16 h-8 text-xs text-emerald-400 flex items-center justify-center">
                  {clusterA.slice(-3)}
                </div>
                {displayClusters.map((clusterB) => {
                  const similarity = getSimilarity(clusterA, clusterB);
                  return (
                    <div
                      key={`${clusterA}-${clusterB}`}
                      className="w-16 h-8 flex items-center justify-center text-xs text-white border border-border/20 cursor-pointer hover:border-emerald-400/50 transition-colors"
                      style={{ backgroundColor: getColorIntensity(similarity) }}
                      title={`${clusterA} vs ${clusterB}: ${similarity}% similarity`}
                    >
                      {similarity.toFixed(0)}%
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Similarity:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">0%</span>
              <div className="w-20 h-4 rounded" style={{
                background: 'linear-gradient(to right, rgba(16, 185, 129, 0), rgba(16, 185, 129, 1))'
              }}></div>
              <span className="text-xs text-muted-foreground">100%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}