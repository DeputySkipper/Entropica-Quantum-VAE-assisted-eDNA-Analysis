import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Circle } from "lucide-react";

interface VennData {
  sampleA: string[];
  sampleB: string[];
  sampleC: string[];
  sampleAName: string;
  sampleBName: string;
  sampleCName: string;
}

interface VennDiagramProps {
  data: VennData;
  isLoading: boolean;
}

export function VennDiagram({ data, isLoading }: VennDiagramProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Circle className="w-5 h-5 text-emerald-400" />
            Sample Overlap Analysis
          </CardTitle>
          <CardDescription>
            Shared and unique taxa across different sampling sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted/20 rounded animate-pulse flex items-center justify-center">
            <div className="text-muted-foreground">Loading Venn diagram...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate intersections
  const aOnly = data.sampleA.filter(x => !data.sampleB.includes(x) && !data.sampleC.includes(x));
  const bOnly = data.sampleB.filter(x => !data.sampleA.includes(x) && !data.sampleC.includes(x));
  const cOnly = data.sampleC.filter(x => !data.sampleA.includes(x) && !data.sampleB.includes(x));
  const aAndB = data.sampleA.filter(x => data.sampleB.includes(x) && !data.sampleC.includes(x));
  const aAndC = data.sampleA.filter(x => data.sampleC.includes(x) && !data.sampleB.includes(x));
  const bAndC = data.sampleB.filter(x => data.sampleC.includes(x) && !data.sampleA.includes(x));
  const allThree = data.sampleA.filter(x => data.sampleB.includes(x) && data.sampleC.includes(x));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Circle className="w-5 h-5 text-emerald-400" />
          Sample Overlap Analysis
        </CardTitle>
        <CardDescription>
          Shared and unique taxa across different sampling sites
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Venn Diagram Visual */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-80 h-80">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                {/* Circle A */}
                <circle
                  cx="150"
                  cy="120"
                  r="80"
                  fill="rgba(16, 185, 129, 0.3)"
                  stroke="#10b981"
                  strokeWidth="2"
                />
                <text x="100" y="80" className="fill-emerald-400 text-sm">
                  {data.sampleAName}
                </text>
                <text x="120" y="100" className="fill-white text-xs">
                  {aOnly.length}
                </text>

                {/* Circle B */}
                <circle
                  cx="250"
                  cy="120"
                  r="80"
                  fill="rgba(20, 184, 166, 0.3)"
                  stroke="#14b8a6"
                  strokeWidth="2"
                />
                <text x="280" y="80" className="fill-teal-400 text-sm">
                  {data.sampleBName}
                </text>
                <text x="270" y="100" className="fill-white text-xs">
                  {bOnly.length}
                </text>

                {/* Circle C */}
                <circle
                  cx="200"
                  cy="180"
                  r="80"
                  fill="rgba(6, 182, 212, 0.3)"
                  stroke="#06b6d4"
                  strokeWidth="2"
                />
                <text x="180" y="270" className="fill-cyan-400 text-sm">
                  {data.sampleCName}
                </text>
                <text x="190" y="230" className="fill-white text-xs">
                  {cOnly.length}
                </text>

                {/* Intersection A & B */}
                <text x="200" y="110" className="fill-white text-xs font-medium">
                  {aAndB.length}
                </text>

                {/* Intersection A & C */}
                <text x="155" y="160" className="fill-white text-xs font-medium">
                  {aAndC.length}
                </text>

                {/* Intersection B & C */}
                <text x="245" y="160" className="fill-white text-xs font-medium">
                  {bAndC.length}
                </text>

                {/* Center intersection */}
                <text x="200" y="140" className="fill-white text-sm font-bold">
                  {allThree.length}
                </text>
              </svg>
            </div>
          </div>

          {/* Statistics */}
          <div className="flex-1 space-y-6">
            <div>
              <h4 className="text-emerald-400 mb-3">Sample Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{data.sampleAName} Total:</span>
                  <Badge variant="outline" className="border-emerald-400/50 text-emerald-400">
                    {data.sampleA.length} taxa
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{data.sampleBName} Total:</span>
                  <Badge variant="outline" className="border-teal-400/50 text-teal-400">
                    {data.sampleB.length} taxa
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{data.sampleCName} Total:</span>
                  <Badge variant="outline" className="border-cyan-400/50 text-cyan-400">
                    {data.sampleC.length} taxa
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-emerald-400 mb-3">Overlap Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Shared by all samples:</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400">
                    {allThree.length} taxa
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Unique to {data.sampleAName}:</span>
                  <span className="text-sm text-muted-foreground">{aOnly.length} taxa</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Unique to {data.sampleBName}:</span>
                  <span className="text-sm text-muted-foreground">{bOnly.length} taxa</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Unique to {data.sampleCName}:</span>
                  <span className="text-sm text-muted-foreground">{cOnly.length} taxa</span>
                </div>
              </div>
            </div>

            {allThree.length > 0 && (
              <div>
                <h4 className="text-emerald-400 mb-3">Core Taxa (All Samples)</h4>
                <div className="flex flex-wrap gap-1">
                  {allThree.slice(0, 6).map((taxa) => (
                    <Badge key={taxa} variant="outline" className="text-xs">
                      {taxa}
                    </Badge>
                  ))}
                  {allThree.length > 6 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +{allThree.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}