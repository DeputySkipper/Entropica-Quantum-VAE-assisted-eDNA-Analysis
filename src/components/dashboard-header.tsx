import { Dna } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="bg-card border-b border-border p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Dna className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-emerald-400 tracking-wider">ENTROPICA</h1>
              <p className="text-xs text-muted-foreground">Biotech Solutions</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-right">Genomic Sequence Analysis Dashboard</h2>
          <p className="text-sm text-muted-foreground text-right">eDNA Analysis & Visualization Platform</p>
        </div>
      </div>
    </header>
  );
}