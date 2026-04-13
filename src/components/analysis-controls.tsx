import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Upload, Play } from "lucide-react";

interface AnalysisControlsProps {
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export function AnalysisControls({ onRunAnalysis, isAnalyzing }: AnalysisControlsProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-400" />
          Analysis Controls
        </CardTitle>
        <CardDescription>
          Upload your eDNA sample data to begin genomic sequence analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Sample Data File</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".fasta,.fastq,.fa,.fq"
            onChange={handleFileChange}
            className="file:bg-emerald-500/10 file:text-emerald-400 file:border-emerald-400/30"
          />
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
        
        <Button 
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Analyzing Sequences...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run eDNA Analysis
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}